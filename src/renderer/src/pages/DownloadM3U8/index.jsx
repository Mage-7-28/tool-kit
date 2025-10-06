import { useState, useEffect } from 'react';
import { Form, Input, Button, Progress, Card } from 'antd';
import { DownloadOutlined } from '@ant-design/icons';
import toast from "react-hot-toast";
import {msgBoxStyle} from "../../style/Layout";

const DownloadM3U8 = () => {
  const [form] = Form.useForm();
  const [downloading, setDownloading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [downloadedFiles, setDownloadedFiles] = useState(0);
  const [totalFiles, setTotalFiles] = useState(0);

  // 组件卸载时清理下载状态
  useEffect(() => {
    return () => {
      setDownloading(false);
      setProgress(0);
      setDownloadedFiles(0);
      setTotalFiles(0);
    };
  }, []);

  // 解析M3U8文件获取所有ts片段链接
  const parseM3U8 = async (m3u8Url) => {
    try {
      const response = await fetch(m3u8Url);
      const content = await response.text();
      const lines = content.split('\n');
      const baseUrl = m3u8Url.substring(0, m3u8Url.lastIndexOf('/') + 1);

      const tsUrls = lines
        .filter(line => line.endsWith('.ts'))
        .map(line => {
          if (line.startsWith('http')) return line;
          return baseUrl + line;
        });

      return tsUrls;
    } catch (error) {
      throw new Error('解析M3U8文件失败');
    }
  };

  // 下载单个ts文件
  const downloadTsFile = async (url, index) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      return blob;
    } catch (error) {
      throw new Error(`下载片段 ${index} 失败`);
    }
  };

  // 合成MP4文件
  const combineToMP4 = (blobs, filename) => {
    // 这里简化处理，实际前端合成MP4比较复杂
    // 通常需要使用第三方库如 ffmpeg.js
    const combinedBlob = new Blob(blobs, { type: 'video/mp4' });
    const url = URL.createObjectURL(combinedBlob);

    const a = document.createElement('a');
    a.href = url;
    a.download = filename || 'video.mp4';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // 主下载逻辑
  const handleDownload = async (values) => {
    const { m3u8Url, filename } = values;

    if (!m3u8Url) {
      toast.error('请输入M3U8链接', { id: 'msgBoxGlobal', style: msgBoxStyle });
      return;
    }

    setDownloading(true);
    setProgress(0);
    setDownloadedFiles(0);

    try {
      // 解析M3U8获取所有ts片段
      const tsUrls = await parseM3U8(m3u8Url);
      setTotalFiles(tsUrls.length);

      if (tsUrls.length === 0) {
        toast.error('未找到视频片段', { id: 'msgBoxGlobal', style: msgBoxStyle });
        throw new Error('未找到视频片段');
      }

      // 逐个下载ts片段
      const blobs = [];
      for (let i = 0; i < tsUrls.length; i++) {
        // 检查是否仍在下载状态，避免组件卸载后继续执行
        if (!downloading) break;

        const blob = await downloadTsFile(tsUrls[i], i + 1);
        blobs.push(blob);
        setDownloadedFiles(i + 1);
        setProgress(Math.round(((i + 1) / tsUrls.length) * 100));
      }

      // 只有在下载未被中断的情况下才合成文件
      if (downloading) {
        combineToMP4(blobs, filename || 'video.mp4');
        toast.success('下载完成！', { id: 'msgBoxGlobal', style: msgBoxStyle });
      }
    } catch (error) {
      if (downloading) {
        toast.error(error.message || '下载失败', { id: 'msgBoxGlobal', style: msgBoxStyle });
      }
    } finally {
      setDownloading(false);
    }
  };

  // 处理组件卸载或页面切换时的清理工作
  const handleBeforeUnload = (e) => {
    if (downloading) {
      e.preventDefault();
      e.returnValue = '';
      return '下载正在进行中，确定要离开吗？';
    }
  };

  useEffect(() => {
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [downloading]);

  return (
    <div style={{ padding: '20px' }}>
      <Card title="M3U8视频下载器">
        <Form
          form={form}
          layout="vertical"
          onFinish={handleDownload}
        >
          <Form.Item
            label="M3U8链接"
            name="m3u8Url"
            rules={[{ required: true, message: '请输入M3U8链接' }]}
          >
            <Input placeholder="请输入M3U8链接地址" />
          </Form.Item>

          <Form.Item
            label="保存文件名"
            name="filename"
          >
            <Input placeholder="请输入保存的文件名，默认为video.mp4" />
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              loading={downloading}
              icon={<DownloadOutlined />}
              disabled={downloading}
            >
              {downloading ? '下载中...' : '开始下载'}
            </Button>
          </Form.Item>
        </Form>

        {downloading && (
          <div style={{ marginTop: '20px' }}>
            <Progress percent={progress} />
            <p>已下载: {downloadedFiles}/{totalFiles} 个片段</p>
          </div>
        )}
      </Card>
    </div>
  );
};

export default DownloadM3U8;
