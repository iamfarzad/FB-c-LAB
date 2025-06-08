import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import tailwindcss from '@tailwindcss/postcss'
import autoprefixer from 'autoprefixer'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
  ],
  css: {
    postcss: {
      plugins: [
        tailwindcss,
        autoprefixer,
      ],
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '~': path.resolve(__dirname, './')  // Point to project root
    },
  },
  define: {
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV),
  },
  server: {
    port: 5173,
    host: true,
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          'vendor-ui': ['lucide-react', '@radix-ui/react-dropdown-menu', '@radix-ui/react-dialog'],
          'vendor-three': ['three'],
          'vendor-ai': ['@google/genai'],
          'components-interaction': [
            './src/components/interaction/UnifiedInteractionPanel',
            './src/components/interaction/ChatSidePanel',
            './src/components/interaction/ExpandedMessageDisplay'
          ],
          'components-pages': [
            './pages/HomePage',
            './pages/AboutPage', 
            './pages/ServicesPage',
            './pages/WorkshopPage',
            './pages/ContactPage'
          ]
        }
      }
    },
    chunkSizeWarningLimit: 800,
  },
  optimizeDeps: {
    include: ['react', 'react-dom', '@google/genai'],
  },
})
