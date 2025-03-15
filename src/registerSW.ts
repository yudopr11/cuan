import { registerSW } from 'virtual:pwa-register';

// This is the service worker registration and update flow
export function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    // Register the service worker
    const updateSW = registerSW({
      onNeedRefresh() {
        if (confirm('New content available. Reload?')) {
          updateSW(true);
        }
      },
      onOfflineReady() {
        console.log('App ready to work offline');
      },
    });
  }
} 