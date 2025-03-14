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
        strategies: 'injectManifest',
        injectManifest: {
          injectionPoint: undefined
        },
        srcDir: 'src',
        filename: 'sw.js',
        includeAssets: ['yudopr.svg'],
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
              src: 'icons/icon-72x72.png',
              sizes: '72x72',
              type: 'image/png'
            },
            {
              src: 'icons/icon-96x96.png',
              sizes: '96x96',
              type: 'image/png'
            },
            {
              src: 'icons/icon-128x128.png',
              sizes: '128x128',
              type: 'image/png'
            },
            {
              src: 'icons/icon-144x144.png',
              sizes: '144x144',
              type: 'image/png'
            },
            {
              src: 'icons/icon-152x152.png',
              sizes: '152x152',
              type: 'image/png'
            },
            {
              src: 'icons/icon-192x192.png',
              sizes: '192x192',
              type: 'image/png'
            },
            {
              src: 'icons/icon-384x384.png',
              sizes: '384x384',
              type: 'image/png'
            },
            {
              src: 'icons/icon-512x512.png',
              sizes: '512x512',
              type: 'image/png'
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
