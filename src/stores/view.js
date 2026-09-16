/**
 * View Store - 管理视图状态、地区、主题和配色
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import {
  THAILAND_COLORS,
  CHINA_COLORS,
  OVERSEA_COLORS,
} from '@/utils/config'

export const useViewStore = defineStore('view', () => {
  // ============ 状态 ============

  // 当前视图类型：'calendar' | 'week' | 'task'
  const viewMode = ref('calendar')

  // 当前地区：'thailand' | 'china' | 'oversea' | 'chob'
  const currentRegion = ref('thailand')

  // 主题：'light' | 'dark'
  const theme = ref('light')

  // 当前年份
  const currentYear = ref(new Date().getFullYear())

  // 当前月份（0-11）
  const currentMonth = ref(new Date().getMonth())

  // 每个地区的地区颜色映射
  const regionColorMap = {
    thailand: THAILAND_COLORS,
    china: CHINA_COLORS,
    oversea: OVERSEA_COLORS,
    // chob 是特殊的综合地区，暂时使用泰国配色
    chob: THAILAND_COLORS,
  }

  // ============ 计算属性 ============

  /**
   * 获取当前地区的颜色配置
   */
  const currentColors = computed(() => {
    return regionColorMap[currentRegion.value] || THAILAND_COLORS
  })

  /**
   * 获取当前月份的显示文本
   */
  const monthDisplay = computed(() => {
    const date = new Date(currentYear.value, currentMonth.value)
    return date.toLocaleDateString('zh-CN', { year: 'numeric', month: 'long' })
  })

  /**
   * 获取当前年月字符串
   */
  const yearMonthStr = computed(() => {
    const year = currentYear.value
    const month = String(currentMonth.value + 1).padStart(2, '0')
    return `${year}-${month}`
  })

  /**
   * 判断是否是浅色主题
   */
  const isLightTheme = computed(() => {
    return theme.value === 'light'
  })

  /**
   * 判断是否是深色主题
   */
  const isDarkTheme = computed(() => {
    return theme.value === 'dark'
  })

  // ============ 方法 ============

  /**
   * 切换视图模式
   */
  const setViewMode = (mode) => {
    if (['calendar', 'week', 'task'].includes(mode)) {
      viewMode.value = mode
      return true
    }
    return false
  }

  /**
   * 设置地区
   */
  const setRegion = (region) => {
    if (Object.keys(regionColorMap).includes(region)) {
      currentRegion.value = region
      // 保存到本地存储
      localStorage.setItem('chob-calendar-region', region)
      return true
    }
    return false
  }

  /**
   * 获取所有可用地区
   */
  const getAvailableRegions = () => {
    return [
      { id: 'chob', name: 'CHOB' },
      { id: 'thailand', name: 'Thailand' },
      { id: 'china', name: 'China' },
      { id: 'oversea', name: 'Oversea' },
    ]
  }

  /**
   * 切换主题
   */
  const toggleTheme = () => {
    theme.value = theme.value === 'light' ? 'dark' : 'light'
    // 保存到本地存储
    localStorage.setItem('chob-calendar-theme', theme.value)
    // 更新 HTML class
    updateThemeClass()
  }

  /**
   * 设置主题
   */
  const setTheme = (newTheme) => {
    if (['light', 'dark'].includes(newTheme)) {
      theme.value = newTheme
      localStorage.setItem('chob-calendar-theme', newTheme)
      updateThemeClass()
      return true
    }
    return false
  }

  /**
   * 更新 DOM 的主题 class
   */
  const updateThemeClass = () => {
    const html = document.documentElement
    if (theme.value === 'dark') {
      html.classList.add('dark-theme')
    } else {
      html.classList.remove('dark-theme')
    }
  }

  /**
   * 上一个月
   */
  const previousMonth = () => {
    if (currentMonth.value === 0) {
      currentMonth.value = 11
      currentYear.value--
    } else {
      currentMonth.value--
    }
  }

  /**
   * 下一个月
   */
  const nextMonth = () => {
    if (currentMonth.value === 11) {
      currentMonth.value = 0
      currentYear.value++
    } else {
      currentMonth.value++
    }
  }

  /**
   * 跳转到指定月份
   */
  const goToMonth = (year, month) => {
    if (month >= 0 && month <= 11) {
      currentYear.value = year
      currentMonth.value = month
      return true
    }
    return false
  }

  /**
   * 回到今天
   */
  const goToToday = () => {
    const today = new Date()
    currentYear.value = today.getFullYear()
    currentMonth.value = today.getMonth()
  }

  /**
   * 初始化 - 从本地存储恢复设置
   */
  const initialize = () => {
    // 恢复主题
    const savedTheme = localStorage.getItem('chob-calendar-theme')
    if (savedTheme && ['light', 'dark'].includes(savedTheme)) {
      theme.value = savedTheme
    }

    // 恢复地区
    const savedRegion = localStorage.getItem('chob-calendar-region')
    if (savedRegion && Object.keys(regionColorMap).includes(savedRegion)) {
      currentRegion.value = savedRegion
    }

    // 更新主题 class
    updateThemeClass()
  }

  /**
   * 获取地区的本地化名称
   */
  const getRegionName = (region) => {
    const map = {
      chob: 'CHOB',
      thailand: 'Thailand (泰国)',
      china: 'China (中国)',
      oversea: 'Oversea (海外)',
    }
    return map[region] || region
  }

  /**
   * 获取视图模式的本地化名称
   */
  const getViewModeName = (mode) => {
    const map = {
      calendar: '日历视图',
      week: '周视图',
      task: '事项视图',
    }
    return map[mode] || mode
  }

  /**
   * 导出当前设置
   */
  const exportSettings = () => {
    return {
      region: currentRegion.value,
      theme: theme.value,
      viewMode: viewMode.value,
    }
  }

  /**
   * 导入设置
   */
  const importSettings = (settings) => {
    if (settings.region) setRegion(settings.region)
    if (settings.theme) setTheme(settings.theme)
    if (settings.viewMode) setViewMode(settings.viewMode)
  }

  return {
    // 状态
    viewMode,
    currentRegion,
    theme,
    currentYear,
    currentMonth,

    // 计算属性
    currentColors,
    monthDisplay,
    yearMonthStr,
    isLightTheme,
    isDarkTheme,

    // 方法
    setViewMode,
    setRegion,
    getAvailableRegions,
    toggleTheme,
    setTheme,
    updateThemeClass,
    previousMonth,
    nextMonth,
    goToMonth,
    goToToday,
    initialize,
    getRegionName,
    getViewModeName,
    exportSettings,
    importSettings,
  }
})