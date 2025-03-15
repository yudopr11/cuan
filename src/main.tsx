import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'
import { registerSW } from 'virtual:pwa-register'
import toast from 'react-hot-toast'

const updateSW = registerSW({
  onNeedRefresh() {
    toast(
      (t) => (
        <span style={{ color: 'white' }}>
          Versi baru aplikasi tersedia. 
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
            Perbarui
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
      duration: 4000, // Durasi 4 detik
    })
  }
})

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
) 