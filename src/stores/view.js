import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useViewStore = defineStore('view', () => {
  // 当前地区
  const currentRegion = ref(localStorage.getItem('region') || 'oversea')
  
  // 当前视图
  const currentView = ref(localStorage.getItem('view') || 'calendar') // calendar | week | task
  
  // 当前选中日期
  const selectedDate = ref(new Date())
  
  // 方法：切换地区
  function setRegion(region) {
    currentRegion.value = region
    localStorage.setItem('region', region)
  }
  
  // 方法：切换视图
  function setView(view) {
    currentView.value = view
    localStorage.setItem('view', view)
  }
  
  // 方法：选择日期
  function selectDate(date) {
    selectedDate.value = new Date(date)
  }
  
  return {
    currentRegion,
    currentView,
    selectedDate,
    setRegion,
    setView,
    selectDate
  }
})