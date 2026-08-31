import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
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
    chunkSizeWarningLimit: 1500,
    minify: 'esbuild',
    sourcemap: false,
    cssCodeSplit: true,
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
