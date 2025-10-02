import './assets/style.css'

import ReactDOM from 'react-dom'
import App from './App'
import { HappyProvider } from '@ant-design/happy-work-theme'
import { HashRouter } from 'react-router-dom'

ReactDOM.render(
  // <React.StrictMode>
  <HashRouter>
    <HappyProvider>
      <App />
    </HappyProvider>
  </HashRouter>
  // </React.StrictMode>
  , document.getElementById('root')
)
