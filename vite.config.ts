import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
// --- THIS IS THE FIX: Import the correct, separate package ---
import tailwindcss from '@tailwindcss/postcss'
import autoprefixer from 'autoprefixer'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
  ],
  css: {
    postcss: {
      // --- THIS IS THE FIX: Use the imported plugins directly ---
      plugins: [
        tailwindcss,
        autoprefixer,
      ],
    },
  },
  resolve: {
    // This alias configuration is correct and robust
    alias: [
      { find: '@', replacement: path.resolve(__dirname, 'src') },
      { find: '~', replacement: path.resolve(__dirname, '.') },
    ],
  },
  server: {
    port: 5173,
    host: true,
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
    // This manualChunks configuration is correct
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          'vendor-ui': ['lucide-react', '@radix-ui/react-dropdown-menu', '@radix-ui/react-dialog'],
          'vendor-three': ['three'],
          'vendor-ai': ['@google/genai'],
          'components-interaction': [
            path.resolve(__dirname, 'src/components/interaction/UnifiedInteractionPanel.tsx'),
            path.resolve(__dirname, 'src/components/interaction/ChatSidePanel.tsx'),
            path.resolve(__dirname, 'src/components/interaction/ExpandedMessageDisplay.tsx'),
          ],
          'components-pages': [
            path.resolve(__dirname, 'src/pages/HomePage.tsx'),
            path.resolve(__dirname, 'src/pages/AboutPage.tsx'),
            path.resolve(__dirname, 'src/pages/ServicesPage.tsx'),
            path.resolve(__dirname, 'src/pages/WorkshopPage.tsx'),
            path.resolve(__dirname, 'src/pages/ContactPage.tsx'),
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