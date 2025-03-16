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
        // Base configuration
        registerType: 'autoUpdate',
        includeAssets: ['**/*'],
        includeManifestIcons: true,
        // Workbox configuration for precaching
        workbox: {
          globPatterns: ['**/*.{js,css,html,ico,png,svg}', 'icons/*.png'],
          navigateFallback: 'index.html',
          navigateFallbackDenylist: [/^\/api/, /^\/_/],
          // Runtime caching configuration for resources from CDN or external API
          runtimeCaching: [
            {
              urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
              handler: 'CacheFirst',
              options: {
                cacheName: 'google-fonts-cache',
                expiration: {
                  maxEntries: 10,
                  maxAgeSeconds: 60 * 60 * 24 * 365 // 1 year
                },
                cacheableResponse: {
                  statuses: [0, 200]
                }
              }
            },
            {
              urlPattern: /\.(?:png|jpg|jpeg|svg|gif)$/,
              handler: 'CacheFirst',
              options: {
                cacheName: 'images-cache',
                expiration: {
                  maxEntries: 50,
                  maxAgeSeconds: 60 * 60 * 24 * 30 // 30 days
                }
              }
            },
            {
              urlPattern: ({ request }) => request.mode === 'navigate',
              handler: 'NetworkFirst',
              options: {
                cacheName: 'pages-cache',
                expiration: {
                  maxEntries: 50,
                  maxAgeSeconds: 60 * 60 * 24 // 1 day
                }
              }
            },
            {
              urlPattern: /\/icons\/.*\.png$/,
              handler: 'CacheFirst',
              options: {
                cacheName: 'icon-cache',
                expiration: {
                  maxEntries: 20,
                  maxAgeSeconds: 60 * 60 * 24 * 30 // 30 days
                },
                cacheableResponse: {
                  statuses: [0, 200]
                }
              }
            }
          ]
        },
        manifest: {
          name: 'Cuan - Money Manager',
          short_name: 'Cuan',
          description: 'Money Manager by yudopr',
          theme_color: '#0f172a',
          start_url: '/',
          display: 'standalone',
          background_color: '#0f172a',
          icons: [
            {
              src: '/icons/icon-72x72.png',
              sizes: '72x72',
              type: 'image/png',
              purpose: 'any maskable'
            },
            {
              src: '/icons/icon-96x96.png',
              sizes: '96x96',
              type: 'image/png',
              purpose: 'any maskable'
            },
            {
              src: '/icons/icon-128x128.png',
              sizes: '128x128',
              type: 'image/png',
              purpose: 'any maskable'
            },
            {
              src: '/icons/icon-144x144.png',
              sizes: '144x144',
              type: 'image/png',
              purpose: 'any maskable'
            },
            {
              src: '/icons/icon-152x152.png',
              sizes: '152x152',
              type: 'image/png',
              purpose: 'any maskable'
            },
            {
              src: '/icons/icon-192x192.png',
              sizes: '192x192',
              type: 'image/png',
              purpose: 'any maskable'
            },
            {
              src: '/icons/icon-384x384.png',
              sizes: '384x384',
              type: 'image/png',
              purpose: 'any maskable'
            },
            {
              src: '/icons/icon-512x512.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'any maskable'
            }
          ]
        }
      })
    ],
    server: {
      port: 3000,
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
            'utils-vendor': ['axios', 'crypto-js'],
            'ui-vendor': ['@heroicons/react']
          }
        }
      }
    },
    optimizeDeps: {
      include: ['react', 'react-dom', 'react-router-dom']
    }
  };
});
