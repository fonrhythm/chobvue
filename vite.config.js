import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import devtools from 'vite-plugin-vue-devtools'

export default defineConfig({
  base: '/chobvue/',
  plugins: [
    vue(),
    devtools(),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  }
})