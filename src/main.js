import { createApp } from 'vue'
import App from './App.vue'

// ⭐ 导入CHOB Calendar的全局样式
import '@/styles/calendar.css'

// 如果你有路由，导入它
// import router from './router'

const app = createApp(App)

// 如果有路由，使用它
// app.use(router)

app.mount('#app')

// 调试模式（开发时有用，可删除）
if (import.meta.env.DEV) {
  window.__CHOB_DEBUG__ = true
  console.log('🎉 CHOB Calendar 开发模式已启动')
  console.log('当前地区: 海外 (oversea)')
  console.log('切换地区: document.documentElement.setAttribute("data-region", "china")')
}
