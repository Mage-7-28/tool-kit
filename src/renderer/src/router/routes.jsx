import { Navigate } from 'react-router-dom'
import { lazy, Suspense } from 'react'
import Loading from '../components/Loading'

const DownloadM3U8 = lazy(() => import('../pages/DownloadM3U8'))
const VideoJx = lazy(() => import('../pages/VideoJx'))

const routes = [
  {
    path: '/home',
    element: <Suspense fallback={<Loading />}><VideoJx /></Suspense>
  },
  {
    path: '/',
    children: [
      {
        path: '',
        element: <Navigate to="home" />
      },
      {
        path: '/video_jx',
        element: <Suspense fallback={<Loading />}><div style={ { padding: 5, maxWidth: 1000, width: '100%' } }><VideoJx /></div></Suspense>
      },
      {
        path: '/download_m3u8',
        element: <Suspense fallback={<Loading />}><div style={ { padding: 5, maxWidth: 1000, width: '100%' } }><DownloadM3U8 /></div></Suspense>
      },
    ]
  }
]
export default routes
