import path from 'path'
import { fileURLToPath } from 'url'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const buildVersion = new Date().toISOString().replace(/[-:TZ.]/g, '').slice(0, 14)
const buildTime = new Date().toISOString()

// https://vitejs.dev/config/
export default defineConfig({
  define: {
    __BUILD_VERSION__: JSON.stringify(buildVersion),
    __BUILD_TIME__: JSON.stringify(buildTime),
  },
  plugins: [react()],
  esbuild: {
    legalComments: 'none',
    drop: ['debugger']
  },
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      'zustand',
      'ethers',
      'lucide-react'
    ]
  },
  build: {
    target: 'esnext',
    chunkSizeWarningLimit: 2500,
    minify: 'esbuild',
    cssMinify: 'esbuild',
    sourcemap: false,
    cssCodeSplit: true,
    reportCompressedSize: false, // Drastically accelerates build time by skipping slow gzip size recalculation
    emptyOutDir: true,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('react-dom') || id.includes('react-router-dom') || id.includes('/react/')) {
              return 'reactVendor';
            }
            if (id.includes('recharts') || id.includes('d3')) {
              return 'charts';
            }
            if (id.includes('framer-motion') || id.includes('gsap')) {
              return 'motion';
            }
            if (id.includes('lucide-react')) {
              return 'icons';
            }
            if (id.includes('ethers')) {
              return 'ethers';
            }
          }
        }
      }
    }
  },
  resolve: {
    alias: {
      'firebase/auth': path.resolve(__dirname, './src/firebase/auth.js'),
      'firebase/firestore': path.resolve(__dirname, './src/firebase/firestoreUtils.js'),
      'firebase/storage': path.resolve(__dirname, './src/firebase/storage.js'),
      'firebase/app': path.resolve(__dirname, './src/firebase/config.js'),
      'firebase/config': path.resolve(__dirname, './src/firebase/config.js'),
      'ipfs-core-utils/files/normalise-input-single':
        'ipfs-core-utils/files/normalise-input-single.browser',
      'ipfs-core-utils/files/normalise-input-multiple':
        'ipfs-core-utils/files/normalise-input-multiple.browser',
      'ipfs-core-utils/files/normalise-content':
        'ipfs-core-utils/files/normalise-content.browser',
    }
  },
  server: {
    headers: {
      'Cross-Origin-Opener-Policy': 'same-origin-allow-popups',
    },
    watch: {
      ignored: [
        '**/server/*.db',
        '**/server/*.db-journal',
        '**/server/*.db-wal',
        '**/healthcare.db*'
      ]
    },
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      }
    },
    fs: {
      strict: false,
    }
  }
})
