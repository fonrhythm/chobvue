import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import appsScriptService from '@/api/appsScriptService'

export const useEventsStore = defineStore('events', () => {
  // 状态
  const allEvents = ref([])
  const filteredEvents = ref([])
  const loading = ref(false)
  const error = ref(null)
  const selectedDate = ref(new Date())
  const dateRange = ref({ start: null, end: null })
  
  // 筛选选项
  const filters = ref({
    type: [], // 线上/线下
    category: [], // 演唱会/见面会等
    location: [], // 泰国/中国/海外
    isOfficial: null // 官方/非官方
  })

  // 计算属性：按日期分组的活动
  const eventsByDate = computed(() => {
    const grouped = {}
    filteredEvents.value.forEach(event => {
      const date = event.date || event.sale_date || '未知'
      if (!grouped[date]) {
        grouped[date] = []
      }
      grouped[date].push(event)
    })
    return grouped
  })

  // 计算属性：当月活动
  const currentMonthEvents = computed(() => {
    const year = selectedDate.value.getFullYear()
    const month = String(selectedDate.value.getMonth() + 1).padStart(2, '0')
    const yearMonth = `${year}-${month}`
    
    return filteredEvents.value.filter(event => {
      const eventDate = event.date || event.sale_date || ''
      return eventDate.startsWith(yearMonth)
    })
  })

  // 方法：获取所有活动
async function fetchAllEvents() {
  loading.value = true
  error.value = null
  
  try {
    // 临时使用模拟数据测试
    const mockEvents = [
      {
        id: '1',
        name: 'Beyer',
        activity: '演唱会',
        date: '2026-09-05',
        time: '19:00',
        type: '线上',
        category: 'singer',
        venue: '某场馆',
        city: '曼谷',
        price: '500฿',
        company: 'Beyer',
        isofficial: true
      },
      {
        id: '2',
        name: 'Gemini',
        activity: '见面会',
        date: '2026-09-10',
        time: '14:00',
        type: '线下',
        category: 'group',
        venue: '购物中心',
        city: '曼谷',
        price: '300฿',
        company: 'Gemini',
        isofficial: true
      },
      {
        id: '3',
        name: 'EST SUPPHA',
        activity: '演唱会',
        date: '2026-09-15',
        time: '20:00',
        type: '线下',
        category: 'singer',
        venue: '体育馆',
        city: '曼谷',
        price: '800฿',
        company: 'EST SUPPHA',
        isofficial: false
      },
      {
        id: '4',
        name: 'TOPTAP/MINLEE',
        activity: '粉丝见面',
        date: '2026-09-20',
        time: '15:00',
        type: '线下',
        category: 'group',
        venue: '酒店',
        city: '曼谷',
        price: '600฿',
        company: 'TOPTAP',
        isofficial: true
      }
    ]
    
    allEvents.value = mockEvents
    applyFilters()
  } catch (err) {
    error.value = err.message
    console.error('Error fetching events:', err)
  } finally {
    loading.value = false
  }
}

  // 方法：获取官方活动
  async function fetchOfficialEvents() {
    loading.value = true
    error.value = null
    
    try {
      const year = selectedDate.value.getFullYear()
      const month = selectedDate.value.getMonth()
      
      const startDate = new Date(year, month, 1)
      const endDate = new Date(year, month + 1, 0)
      
      const start = formatDate(startDate)
      const end = formatDate(endDate)
      
      const events = await appsScriptService.fetchOfficialEvents(start, end)
      allEvents.value = events
      applyFilters()
    } catch (err) {
      error.value = err.message
    } finally {
      loading.value = false
    }
  }

  // 方法：获取非官方活动
  async function fetchUnofficialEvents() {
    loading.value = true
    error.value = null
    
    try {
      const year = selectedDate.value.getFullYear()
      const month = selectedDate.value.getMonth()
      
      const startDate = new Date(year, month, 1)
      const endDate = new Date(year, month + 1, 0)
      
      const start = formatDate(startDate)
      const end = formatDate(endDate)
      
      const events = await appsScriptService.fetchUnofficialEvents(start, end)
      allEvents.value = events
      applyFilters()
    } catch (err) {
      error.value = err.message
    } finally {
      loading.value = false
    }
  }

  // 方法：应用筛选
  function applyFilters() {
    filteredEvents.value = allEvents.value.filter(event => {
      // 筛选类型
      if (filters.value.type.length > 0 && !filters.value.type.includes(event.type)) {
        return false
      }
      
      // 筛选分类
      if (filters.value.category.length > 0 && !filters.value.category.includes(event.category)) {
        return false
      }
      
      // 筛选地点
      if (filters.value.location.length > 0 && !filters.value.location.includes(event.city)) {
        return false
      }
      
      return true
    })
  }

  // 方法：更新筛选
  function updateFilters(newFilters) {
    filters.value = { ...filters.value, ...newFilters }
    applyFilters()
  }

  // 方法：清除筛选
  function clearFilters() {
    filters.value = {
      type: [],
      category: [],
      location: [],
      isOfficial: null
    }
    applyFilters()
  }

  // 方法：获取特定日期的活动
  function getEventsByDate(date) {
    const dateStr = formatDate(new Date(date))
    return filteredEvents.value.filter(event => 
      (event.date || event.sale_date) === dateStr
    )
  }

  // 方法：搜索活动
  function searchEvents(keyword) {
    if (!keyword) {
      applyFilters()
      return
    }
    
    const lowerKeyword = keyword.toLowerCase()
    filteredEvents.value = allEvents.value.filter(event => 
      event.name?.toLowerCase().includes(lowerKeyword) ||
      event.activity?.toLowerCase().includes(lowerKeyword) ||
      event.venue?.toLowerCase().includes(lowerKeyword) ||
      event.company?.toLowerCase().includes(lowerKeyword)
    )
  }

  // 方法：变更选中日期
  function setSelectedDate(date) {
    selectedDate.value = new Date(date)
  }

  // 方法：上一个月
  function previousMonth() {
    selectedDate.value = new Date(
      selectedDate.value.getFullYear(),
      selectedDate.value.getMonth() - 1
    )
    fetchAllEvents()
  }

  // 方法：下一个月
  function nextMonth() {
    selectedDate.value = new Date(
      selectedDate.value.getFullYear(),
      selectedDate.value.getMonth() + 1
    )
    fetchAllEvents()
  }

  return {
    // 状态
    allEvents,
    filteredEvents,
    loading,
    error,
    selectedDate,
    dateRange,
    filters,
    
    // 计算属性
    eventsByDate,
    currentMonthEvents,
    
    // 方法
    fetchAllEvents,
    fetchOfficialEvents,
    fetchUnofficialEvents,
    applyFilters,
    updateFilters,
    clearFilters,
    getEventsByDate,
    searchEvents,
    setSelectedDate,
    previousMonth,
    nextMonth
  }
})

// 辅助函数：格式化日期
function formatDate(date) {
  if (!date) return ''
  const yyyy = date.getFullYear()
  const mm = String(date.getMonth() + 1).padStart(2, '0')
  const dd = String(date.getDate()).padStart(2, '0')
  return `${yyyy}-${mm}-${dd}`
}