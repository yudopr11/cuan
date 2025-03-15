// Basic service worker that uses workbox
import { precacheAndRoute } from 'workbox-precaching';

// Precache all resources defined by the plugin
precacheAndRoute(self.__WB_MANIFEST);

// Default listeners
self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
}); 