import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'

export default defineConfig({
  // ========== 插件配置 ==========
  plugins: [vue()],

  // ========== 路径别名 ==========
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },

  // ========== 开发服务器配置 ==========
  server: {
    // 监听端口
    port: 5173,
    // 自动打开浏览器
    open: false,
    // CORS代理（如果你有后端API）
    proxy: {
      '/api': {
        target: 'http://localhost:8000', // 你的后端地址
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
  },

  // ========== 构建配置 ==========
  build: {
    // 输出目录
    outDir: 'dist',
    // 静态资源目录
    assetsDir: 'assets',
    // 最小化
    minify: 'terser',
    // 生成sourcemap（调试用，生产可删除）
    sourcemap: false,
    // 大文件警告阈值
    chunkSizeWarningLimit: 1000,
    // Terser压缩选项
    terserOptions: {
      compress: {
        drop_console: true, // 删除console
      },
    },
  },

  // ========== 定义全局常量 ==========
  define: {
    __APP_VERSION__: JSON.stringify('1.0.0'),
    __BUILD_DATE__: JSON.stringify(new Date().toISOString()),
  },

  // ========== CSS配置 ==========
  css: {
    // 预处理器选项（如果使用SCSS）
    preprocessorOptions: {
      scss: {
        additionalData: `@import "src/styles/variables.scss";`,
      },
    },
  },

  // ========== 环境变量前缀 ==========
  envPrefix: 'VITE_',

  // ========== 日志配置 ==========
  logLevel: 'info',
})
