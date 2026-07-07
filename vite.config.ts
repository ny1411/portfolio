import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  define: {
    __BUILD_TIMESTAMP__: JSON.stringify(new Date().toISOString()),
  },
  plugins: [react(), tailwindcss()],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules/framer-motion')) return 'motion'
          if (
            id.includes('node_modules/three') ||
            id.includes('node_modules/@react-three/fiber') ||
            id.includes('node_modules/@react-three/drei')
          ) {
            return 'three'
          }
          if (
            id.includes('node_modules/gsap') ||
            id.includes('node_modules/lenis') ||
            id.includes('node_modules/zustand')
          ) {
            return 'scroll'
          }
          if (id.includes('node_modules/lottie-web')) return 'lottie'
          return undefined
        },
      },
    },
  },
})
