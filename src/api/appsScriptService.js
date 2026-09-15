// Apps Script 配置
const APPS_SCRIPT_CONFIG = {
  SECRET_KEY: 'thenorthremenbersandhighgardengrowingstrong',
  ORIGIN: window.location.origin,
  
  // 所有允许的 Sheet IDs
  SHEETS: {
    official: {
      '1a': '1zU7BdQQ2qvCR80ku3WT6YQhu8s9aTCSf3UHLWlhKahc', // current-thai-月度
      '1b': '1RSHC9A4T8OvT0XLFCdMbds9Z5ky2GsbLhtDqFhb4Pkw', // current-china&oversea-年度
      '1c': '1UvY0Fd5lmgRhPlSdIKn1Clfywo3yU7qcrLTwrRWosuU', // past-thai-月度
      '1d': '1HCaeRIunaianxgeyKQceselxyk1IxHzb5k9KBlfMsDA'  // past-china&oversea-年度
    },
    unofficial: {
      'a1': '1Irbm_DlW63XjhS54qbopw18WnpJpo_s3gbrDKqkmyvY', // thai-calendar-月度
      'b1': '10S-flnjUlbZzQVBXmHKe7y7tXVfYc3Gg2O6KmSGDjMQ', // china-calendar-年度
      'c1': '1H88jEc_anrOW63YsZsxdxb2sdH0mMV0Eemq0iW1Tr-Q', // oversea-calendar-年度
      'd1': '1umKIOnnCtnNHRQKQs-O3J9cHvamUZqtu8bY__SvgR3g', // thai-past-月度
      'e1': '1gEwDgp7F_ACqWCu7qShCJkhRtMPZusO0USgMdaBTFmo'  // china&oversea-past-年度
    }
  },
  
  // Apps Script 部署 URL
  DEPLOYMENT_URL: 'https://script.google.com/macros/s/1O2r3P-jbwkYVzld9YPEkHzUIaOauTvc_b7Ue-vZYqC-Ax5Z8kEmLfuIL/usercontent'
}

class AppsScriptService {
  constructor() {
    this.cache = new Map()
    this.cacheTimeout = 30 * 60 * 1000 // 30分钟缓存
  }

  /**
   * 获取所有 Sheet IDs
   */
  getAllSheetIds() {
    return {
      ...APPS_SCRIPT_CONFIG.SHEETS.official,
      ...APPS_SCRIPT_CONFIG.SHEETS.unofficial
    }
  }

  /**
   * 调用 Apps Script 获取数据
   * @param {string} sheetId - Sheet ID
   * @param {string} startDate - 开始日期 (YYYY-MM-DD)
   * @param {string} endDate - 结束日期 (YYYY-MM-DD)
   */
  async fetchEvents(sheetId, startDate = null, endDate = null) {
    try {
      // 构建缓存 key
      const cacheKey = `events_${sheetId}_${startDate || 'all'}_${endDate || 'all'}`
      
      // 检查缓存
      if (this.cache.has(cacheKey)) {
        const cached = this.cache.get(cacheKey)
        if (Date.now() - cached.timestamp < this.cacheTimeout) {
          return cached.data
        }
      }

      // 构建请求 URL
      const params = new URLSearchParams({
        id: sheetId,
        key: APPS_SCRIPT_CONFIG.SECRET_KEY,
        origin: APPS_SCRIPT_CONFIG.ORIGIN
      })

      if (startDate) params.append('start', startDate)
      if (endDate) params.append('end', endDate)

      const url = `${APPS_SCRIPT_CONFIG.DEPLOYMENT_URL}?${params.toString()}`

      // 发送请求
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      // 如果返回的是数组，直接使用
      // 如果返回的是对象，尝试获取 data 属性
      let data = await response.json()
      
      if (data.success === false) {
        throw new Error(data.message || 'Failed to fetch events')
      }

      // Apps Script 直接返回数组
      if (Array.isArray(data)) {
        data = data
      } else if (data.data && Array.isArray(data.data)) {
        data = data.data
      }

      // 缓存结果
      this.cache.set(cacheKey, {
        data: data,
        timestamp: Date.now()
      })

      return data
    } catch (error) {
      console.error('Error fetching events from Apps Script:', error)
      throw error
    }
  }

  /**
   * 同时从多个 Sheet 获取数据
   * @param {string[]} sheetIds - Sheet IDs 数组
   * @param {string} startDate - 开始日期
   * @param {string} endDate - 结束日期
   */
  async fetchMultipleEvents(sheetIds, startDate = null, endDate = null) {
    try {
      const promises = sheetIds.map(id => 
        this.fetchEvents(id, startDate, endDate)
      )
      
      const results = await Promise.all(promises)
      
      // 合并所有结果
      const allEvents = results.flat()
      
      // 按日期排序
      allEvents.sort((a, b) => {
        const dateA = new Date(a.date || a.sale_date || '9999-12-31')
        const dateB = new Date(b.date || b.sale_date || '9999-12-31')
        return dateA - dateB
      })
      
      return allEvents
    } catch (error) {
      console.error('Error fetching multiple events:', error)
      throw error
    }
  }

  /**
   * 获取特定日期范围的所有官方活动
   */
  async fetchOfficialEvents(startDate, endDate) {
    const sheetIds = Object.values(APPS_SCRIPT_CONFIG.SHEETS.official)
    return this.fetchMultipleEvents(sheetIds, startDate, endDate)
  }

  /**
   * 获取特定日期范围的所有非官方活动
   */
  async fetchUnofficialEvents(startDate, endDate) {
    const sheetIds = Object.values(APPS_SCRIPT_CONFIG.SHEETS.unofficial)
    return this.fetchMultipleEvents(sheetIds, startDate, endDate)
  }

  /**
   * 获取所有活动
   */
  async fetchAllEvents(startDate = null, endDate = null) {
    const allSheetIds = Object.values(this.getAllSheetIds())
    return this.fetchMultipleEvents(allSheetIds, startDate, endDate)
  }

  /**
   * 清除缓存
   */
  clearCache() {
    this.cache.clear()
  }

  /**
   * 清除特定缓存
   */
  clearCacheForSheet(sheetId) {
    for (const [key] of this.cache) {
      if (key.includes(sheetId)) {
        this.cache.delete(key)
      }
    }
  }
}

export default new AppsScriptService()