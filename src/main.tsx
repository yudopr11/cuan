import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'
import { registerSW } from 'virtual:pwa-register'
import toast from 'react-hot-toast'

// Check every hour for service worker updates
const intervalMS = 60 * 60 * 1000

const updateSW = registerSW({
  onRegistered(registration: ServiceWorkerRegistration | undefined) {
    // Check for updates periodically
    if (registration) {
      setInterval(async () => {
        if (registration.installing) return
        
        if ('connection' in navigator && !navigator.onLine) return
          
        const resp = await fetch(self.location.href, {
          cache: 'no-store',
          headers: {
            'cache': 'no-store',
            'cache-control': 'no-cache',
          }
        })
        
        if (resp?.status === 200) {
          await registration.update()
        }
      }, intervalMS)
    }
  },
  onNeedRefresh() {
    toast(
      (t) => (
        <span style={{ color: 'white' }}>
          New version is available. 
          <button 
            onClick={() => { 
              updateSW(true)
              toast.dismiss(t.id)
            }} 
            style={{
              marginLeft: '8px',
              background: '#38bdf8',
              padding: '4px 8px',
              borderRadius: '4px',
              color: 'white',
              border: 'none',
              cursor: 'pointer'
            }}>
            Update
          </button>
        </span>
      ),
      {
        duration: Infinity, 
        style: {
          borderRadius: '10px',
          background: '#0f172a',
          color: '#fff',
          padding: '16px',
        },
      }
    )
  },
  onOfflineReady() {
    toast('Application is ready to work offline but still requires internet to get data from the server', {
      icon: '✅',
      style: {
        borderRadius: '10px',
        background: '#0f172a',
        color: '#fff',
        padding: '16px',
      },
      duration: 4000, 
    })
  }
})

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
) 