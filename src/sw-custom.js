// This is intentionally a .js file (not .ts) to avoid Typescript type conflicts
import { precacheAndRoute, createHandlerBoundToURL } from 'workbox-precaching';
import { registerRoute, NavigationRoute } from 'workbox-routing';

// Precache all assets generated by vite-plugin-pwa
precacheAndRoute(self.__WB_MANIFEST);

// Explicitly add index.html to precache
precacheAndRoute([
  { url: 'index.html', revision: `${new Date().getTime()}` }
]);

// Create a navigation route handler for index.html
const handler = createHandlerBoundToURL('index.html');
const navigationRoute = new NavigationRoute(handler, {
  denylist: [/^\/api/, /^\/_/]
});

// Register the navigation route
registerRoute(navigationRoute);

// Register other handlers as needed
self.addEventListener('activate', (event) => {
  // Clean up old caches and put this service worker in control
  event.waitUntil(self.clients.claim());
}); 