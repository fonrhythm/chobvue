import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useLanguageStore = defineStore('language', () => {
  // 支持的语言
  const SUPPORTED_LANGUAGES = ['zh', 'en', 'th']
  
  // 状态
  const currentLanguage = ref(localStorage.getItem('language') || 'zh')
  
  // 翻译文本
  const translations = {
    zh: {
      home: '首页',
      favorites: '收藏',
      calendar: '日历',
      events: '活动',
      noEvents: '没有活动',
      search: '搜索',
      loading: '加载中...',
      error: '错误',
      settings: '设置'
    },
    en: {
      home: 'Home',
      favorites: 'Favorites',
      calendar: 'Calendar',
      events: 'Events',
      noEvents: 'No events',
      search: 'Search',
      loading: 'Loading...',
      error: 'Error',
      settings: 'Settings'
    },
    th: {
      home: 'หน้าแรก',
      favorites: 'รายการโปรด',
      calendar: 'ปฏิทิน',
      events: 'กิจกรรม',
      noEvents: 'ไม่มีกิจกรรม',
      search: 'ค้นหา',
      loading: 'กำลังโหลด...',
      error: 'ข้อผิดพลาด',
      settings: 'การตั้งค่า'
    }
  }

  // 计算属性：当前语言的翻译
  const t = computed(() => translations[currentLanguage.value] || translations.zh)

  // 方法：改变语言
  function setLanguage(lang) {
    if (SUPPORTED_LANGUAGES.includes(lang)) {
      currentLanguage.value = lang
      localStorage.setItem('language', lang)
      document.documentElement.lang = lang
    }
  }

  // 方法：获取翻译
  function translate(key) {
    return t.value[key] || key
  }

  // 初始化语言
  function initLanguage() {
    document.documentElement.lang = currentLanguage.value
  }

  return {
    currentLanguage,
    SUPPORTED_LANGUAGES,
    t,
    setLanguage,
    translate,
    initLanguage
  }
})