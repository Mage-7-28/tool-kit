import {Button, ConfigProvider, Layout, notification, theme, Tooltip} from "antd";
import Sider from "antd/es/layout/Sider";
import {Content} from "antd/es/layout/layout";
import zhCN from 'antd/locale/zh_CN'
import routes from './router/routes'
import {Toaster} from "react-hot-toast";
import {ArrowDownOutlined, VideoCameraOutlined} from "@ant-design/icons";
import {useEffect, useState} from "react";
import {useNavigate, useRoutes} from "react-router-dom";

function App() {
  const navigate = useNavigate()
  const elements = useRoutes(routes)
  const ipcHandle = () => window.electron.ipcRenderer.send('ping')
  const [routerPath, setRouterPath] = useState('/video_jx')
  const [api, contextHolder] = notification.useNotification()

  useEffect(() => {
    navigate(routerPath)
  }, [routerPath])

  return (
    <>
      <ConfigProvider theme={{
        token: {colorPrimary: '#595f65', borderRadius: 6},
        algorithm: [theme.darkAlgorithm, theme.compactAlgorithm],
        components: {
          Popover: {
            colorBgElevated: 'rgb(54,57,61)'
          },
          Card: {
            headerBg: 'rgb(54,57,61)',
            actionsBg: 'rgb(54,57,61)'
          }
        }
      }} locale={zhCN} componentSize={'small'}>
        <Layout>
          <Sider width={35} className={'hide-scrollbar'} style={{overflow: 'visible', background: 'rgb(43, 45, 48)', maxHeight: '100vh', height: '100vh'}}>
            <div style={{display: 'flex', flexDirection: 'column', gap: 5, padding: '8px 5px', alignItems: 'center', justifyContent: 'center'}}>
              <Tooltip placement="right" title={'视频解析'}>
                <Button style={{marginBottom: 5}} danger={routerPath === '/video_jx'} icon={<VideoCameraOutlined/>} type={'primary'} onClick={() => setRouterPath('/video_jx')}/>
              </Tooltip>
              <Tooltip placement="right" title={'M3U8视频下载'}>
                <Button danger={routerPath === '/download_m3u8'} icon={<ArrowDownOutlined/>} type={'primary'} onClick={() => setRouterPath('/download_m3u8')}/>
              </Tooltip>
            </div>
          </Sider>
          <Content className={'hide-scrollbar'} style={{background: 'rgb(30, 31, 34)', maxHeight: '100vh', height: '100vh', overflow: 'auto', display: 'flex', justifyContent: 'center'}}>
            {elements}
          </Content>
        </Layout>
        <Toaster/>
        {contextHolder}
      </ConfigProvider>
    </>
  )
}

export default App
