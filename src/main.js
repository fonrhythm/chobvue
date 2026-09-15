import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'

// 导入 Stores
import { useThemeStore } from './stores/theme'
import { useLanguageStore } from './stores/language'

const app = createApp(App)

// 创建 Pinia 实例
const pinia = createPinia()

// 使用插件
app.use(pinia)

// 初始化主题和语言
const themeStore = useThemeStore()
const languageStore = useLanguageStore()

themeStore.initTheme()
languageStore.initLanguage()

// 挂载应用
app.mount('#app')