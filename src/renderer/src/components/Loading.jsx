import { Result } from 'antd'
import { LoadingOutlined } from '@ant-design/icons'

/**
 * @description: 加载组件
 * @return {ReactElement}
 */
const Loading = () => {
  return (
    <>
      <Result
        icon={<LoadingOutlined />}
        subTitle="组件加载中，请稍后..."
      />
    </>
  )
}
export default Loading
