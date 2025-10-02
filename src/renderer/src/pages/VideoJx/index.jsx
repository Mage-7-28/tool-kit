import {Button, Select} from "antd";
import {AppleOutlined, CodeOutlined, ReloadOutlined} from "@ant-design/icons";
import {useState} from "react";

const VideoJx = () => {
  const [api, setApi] = useState('https://jx.playerjy.com/?url=')
  const [ videoPlayerKey, setVideoPlayerKey ] = useState(Math.random())
  const [ playerUrl, setPlayerUrl ] = useState('')

  return (
    <div>
      <div style={ { width: '100%', aspectRatio: '16/9' } }>
        { (api && api !== '#') && <iframe key={videoPlayerKey} src={ api + playerUrl } frameBorder="0" allowFullScreen width="100%" height="100%" /> }
        <div style={ { backgroundColor: 'rgba(41,43,45,0.5)', borderRadius: 8, marginTop: 5, border: '1px solid rgba(255,255,255,0.1)' } }>
          <Select
            key={api}
            defaultValue={ api }
            style={ { width: 100, margin: 3 } }
            onChange={ (value) => {
              setApi(value)
            } }
            options={ [
              {
                label: <span>常用接口</span>,
                title: '常用接口',
                options: [
                  { value: 'https://jx.playerjy.com/?url=', label: 'Player-JY' },
                  { value: 'https://jx.yparse.com/index.php?url=', label: 'Y-Parse' },
                  { value: 'https://jx.xymp4.cc/?url=', label: '咸鱼解析' },
                  { value: 'https://jx.xmflv.com/?url=', label: '虾米解析' },
                  { value: 'https://www.yemu.xyz/?url=', label: '夜幕解析' }
                ]
              },
              {
                label: <span>不常用接口</span>,
                title: '不常用接口',
                options: [
                  { value: 'https://www.pangujiexi.com/jiexi/?url=', label: '盘古解析' },
                  { value: 'https://jx.m3u8.tv/jiexi/?url=', label: 'M3U8解析' },
                  { value: 'https://www.8090g.cn/?url=', label: '8090解析' },
                  { value: 'https://jx.jsonplayer.com/player/?url=', label: 'JsonPlayer', disabled: true },
                  { value: 'https://jx.yangtu.top/?url=', label: '阳途解析', disabled: true }
                ]
              }
            ] }
          />
          { playerUrl && <Button type="primary" style={ { marginLeft: 2, float: 'right', margin: 3, borderColor: 'rgb(116,116,126)' } } icon={ <ReloadOutlined /> } onClick={ () => setVideoPlayerKey(Math.random()) }>刷新</Button> }
          { (api && api !== '#' && playerUrl) && <a href={ api + playerUrl } title={ '使用系统默认的浏览器播放' } target="_blank" rel="noreferrer"><Button type="primary" style={ { marginLeft: 2, float: 'right', margin: 3, borderColor: 'rgb(116,116,126)' } } icon={ <AppleOutlined /> }>系统播放</Button></a> }
          { <Button type="primary" style={ { marginLeft: 2, float: 'right', margin: 3, borderColor: 'rgb(116,116,126)' } } icon={ <CodeOutlined /> } onClick={ () => window.api.openDevTools() }>DevTools</Button> }
        </div>
      </div>
    </div>
  )
}

export default VideoJx
