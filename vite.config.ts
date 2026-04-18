import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const allowedHosts = [
    'localhost',
    '.railway.app'
  ];

  // Add custom hosts from env if exists (comma-separated list)
  if (env.VITE_ALLOWED_HOST) {
    const customHosts = env.VITE_ALLOWED_HOST.split(',').map(host => host.trim());
    allowedHosts.push(...customHosts);
  }

  return {
    plugins: [
      react(),
      VitePWA({
        registerType: 'autoUpdate',
        // null because we register manually via virtual:pwa-register in main.tsx
        injectRegister: null,
        strategies: 'generateSW',
        includeAssets: ['favicon.ico', 'favicon.svg', 'apple-touch-icon.png'],
        manifest: {
          name: 'Cuan - Money Manager',
          short_name: 'Cuan',
          description: 'Money Manager by yudopr',
          start_url: '/',
          scope: '/',
          display: 'standalone',
          display_override: ['window-controls-overlay', 'standalone'],
          background_color: '#0d1117',
          theme_color: '#0d1117',
          icons: [
            {
              src: '/pwa-192x192.png',
              sizes: '192x192',
              type: 'image/png',
              purpose: 'any',
            },
            {
              src: '/pwa-512x512.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'any',
            },
            {
              src: '/pwa-maskable-192x192.png',
              sizes: '192x192',
              type: 'image/png',
              purpose: 'maskable',
            },
            {
              src: '/pwa-maskable-512x512.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'maskable',
            },
          ],
        },
        workbox: {
          globPatterns: ['**/*.{js,css,html,ico,png,svg,webp,woff,woff2}'],
          navigateFallback: '/index.html',
          navigateFallbackDenylist: [/^\/api/, /^\/_/],
          skipWaiting: true,
          clientsClaim: true,
          cleanupOutdatedCaches: true,
          runtimeCaching: [
            {
              urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
              handler: 'CacheFirst',
              options: {
                cacheName: 'google-fonts-cache',
                expiration: {
                  maxEntries: 10,
                  maxAgeSeconds: 60 * 60 * 24 * 365, // 1 year
                },
                cacheableResponse: { statuses: [0, 200] },
              },
            },
            {
              urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp)$/,
              handler: 'CacheFirst',
              options: {
                cacheName: 'images-cache',
                expiration: {
                  maxEntries: 50,
                  maxAgeSeconds: 60 * 60 * 24 * 30, // 30 days
                },
              },
            },
          ],
        },
        devOptions: {
          enabled: false,
        },
      })
    ],
    server: {
      port: 3000
    },
    preview: {
      port: 3000,
      host: true,
      allowedHosts
    },
    build: {
      chunkSizeWarningLimit: 1000, // Increase chunk size limit to 1000kb
      rollupOptions: {
        output: {
          manualChunks: {
            'react-vendor': ['react', 'react-dom', 'react-router-dom', 'react-hot-toast'],
            'markdown-core': ['react-markdown'],
            'utils-vendor': ['axios', 'crypto-js']
          }
        }
      }
    },
    optimizeDeps: {
      include: ['react', 'react-dom', 'react-router-dom']
    }
  };
});
