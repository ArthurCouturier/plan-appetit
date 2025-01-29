import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import tailwindcss from "@tailwindcss/vite";
import * as path from 'path'

export default defineConfig({
  publicDir: 'public',
  plugins: [react(), tailwindcss()],
  assetsInclude: [
    "**/*.md",
    "**/*.png",
    "**/*.jpg",
    "**/*.jpeg",
    "**/*.ttf",
    "**/*.pdf"
  ],
  base: '/',
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
      '@assets': path.resolve(__dirname, 'src/assets'),
      '@components': path.resolve(__dirname, 'src/components'),
      '@pages': path.resolve(__dirname, 'src/pages'),
    },
  },
})
