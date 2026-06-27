import React from 'react'
import ReactDOM from 'react-dom/client'
import { AppProvider } from './app/providers'
import { Analytics } from '@vercel/analytics/react'
import { SpeedInsights } from '@vercel/speed-insights/react'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AppProvider />
    <Analytics />
    <SpeedInsights />
  </React.StrictMode>,
)
