import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'
import { registerSW } from 'virtual:pwa-register'

// implementation of service worker with auto update
// with better auto update support
const updateSW = registerSW({
  // When new content is available
  onNeedRefresh() {
    if (confirm('New content available. Reload?')) {
      updateSW(true)
    }
  },
  // When app is ready to work offline
  onOfflineReady() {
    // Show message when app is ready to work offline
    const offlineReady = document.createElement('div')
    offlineReady.innerHTML = `
      <div style="
        position: fixed;
        bottom: 24px;
        right: 24px;
        padding: 16px 24px;
        background: #0f172a;
        color: white;
        font-weight: 500;
        border-radius: 4px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        z-index: 9999;
        transition: all 0.3s ease;
      ">
        App is ready to work offline ✅
      </div>
    `
    document.body.appendChild(offlineReady)
    
    // Remove notification after 3 seconds
    setTimeout(() => {
      document.body.removeChild(offlineReady)
    }, 3000)
  }
})

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
) 