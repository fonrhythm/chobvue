/**
 * Events Store - 管理日历事件和任务
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useEventsStore = defineStore('events', () => {
  // ============ 状态 ============

  // 事件数据
  const events = ref([
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
      isofficial: true,
    },
    {
      id: '2',
      name: 'FAVIQ',
      activity: '演唱会',
      date: '2026-09-04',
      time: '18:30',
      type: '线下',
      category: 'band',
      venue: 'Impact Hall',
      city: '曼谷',
      price: '300฿',
      company: 'FAVIQ',
      isofficial: false,
    },
    {
      id: '3',
      name: 'Est Suppha',
      activity: '演唱会',
      date: '2026-09-08',
      time: '20:00',
      type: '线下',
      category: 'actor',
      venue: 'Gaysorn Hall',
      city: '曼谷',
      price: '600฿',
      company: 'Est',
      isofficial: false,
    },
    {
      id: '4',
      name: 'CopperFila',
      activity: '演唱会',
      date: '2026-09-11',
      time: '19:30',
      type: '线下',
      category: 'group',
      venue: 'Chang Arena',
      city: '曼谷',
      price: '800฿',
      company: 'GMM',
      isofficial: true,
    },
  ])

  // 任务数据
  const tasks = ref([
    {
      id: 'task-1',
      title: 'FAVIQ 抢票开始',
      category: '抢票',
      description: '新专辑演唱会门票开售',
      start_date: '2026-09-01',
      end_date: '2026-09-02',
      status: 'pending',
      contact_info: '微博@FAVIQ',
      contact_method: '微博私信',
      link: 'https://example.com/ticket',
      isofficial: false,
    },
    {
      id: 'task-2',
      title: 'Est 粉丝应援订桌',
      category: '订桌',
      description: '某酒吧演出订桌预定',
      start_date: '2026-09-10',
      end_date: null,
      status: 'pending',
      contact_info: '酒吧微信群',
      contact_method: '群管理员',
      link: null,
      isofficial: false,
    },
    {
      id: 'task-3',
      title: 'Beyer Top Spender 购买',
      category: '应援',
      description: '参与官方应援计划',
      start_date: '2026-09-15',
      end_date: '2026-09-30',
      status: 'in-progress',
      contact_info: '官方账号@Beyer',
      contact_method: '官网报名',
      link: 'https://example.com/topspender',
      isofficial: true,
    },
  ])

  // ============ 计算属性 ============

  /**
   * 获取指定日期的事件
   */
  const getEventsByDate = (dateStr) => {
    return events.value.filter((event) => event.date === dateStr)
  }

  /**
   * 获取指定月份的所有事件
   */
  const getEventsByMonth = (year, month) => {
    return events.value.filter((event) => {
      const eventDate = new Date(event.date)
      return eventDate.getFullYear() === year && eventDate.getMonth() === month
    })
  }

  /**
   * 获取指定类别的事件
   */
  const getEventsByCategory = (category) => {
    return events.value.filter((event) => event.category === category)
  }

  /**
   * 获取官方事件
   */
  const getOfficialEvents = () => {
    return events.value.filter((event) => event.isofficial)
  }

  /**
   * 获取粉丝事件
   */
  const getFanEvents = () => {
    return events.value.filter((event) => !event.isofficial)
  }

  /**
   * 获取指定日期的任务
   */
  const getTasksByDate = (dateStr) => {
    return tasks.value.filter((task) => {
      const startMatch = task.start_date === dateStr
      const endMatch = task.end_date && task.end_date === dateStr
      return startMatch || endMatch
    })
  }

  /**
   * 获取进行中的任务
   */
  const getActiveTasks = () => {
    return tasks.value.filter((task) => task.status !== 'completed')
  }

  /**
   * 获取已完成的任务
   */
  const getCompletedTasks = () => {
    return tasks.value.filter((task) => task.status === 'completed')
  }

  // ============ 方法 ============

  /**
   * 新增事件
   */
  const addEvent = (eventData) => {
    const event = {
      id: `event-${Date.now()}`,
      ...eventData,
      isofficial: eventData.isofficial || false,
    }
    events.value.push(event)
    return event
  }

  /**
   * 更新事件
   */
  const updateEvent = (eventId, eventData) => {
    const index = events.value.findIndex((e) => e.id === eventId)
    if (index !== -1) {
      events.value[index] = {
        ...events.value[index],
        ...eventData,
      }
      return events.value[index]
    }
    return null
  }

  /**
   * 删除事件
   */
  const deleteEvent = (eventId) => {
    const index = events.value.findIndex((e) => e.id === eventId)
    if (index !== -1) {
      events.value.splice(index, 1)
      return true
    }
    return false
  }

  /**
   * 标记事件为官方
   */
  const markAsOfficial = (eventId) => {
    const event = events.value.find((e) => e.id === eventId)
    if (event) {
      event.isofficial = true
    }
  }

  /**
   * 标记事件为粉丝
   */
  const markAsFan = (eventId) => {
    const event = events.value.find((e) => e.id === eventId)
    if (event) {
      event.isofficial = false
    }
  }

  /**
   * 新增任务
   */
  const addTask = (taskData) => {
    const task = {
      id: `task-${Date.now()}`,
      status: 'pending',
      isofficial: false,
      ...taskData,
    }
    tasks.value.push(task)
    return task
  }

  /**
   * 更新任务
   */
  const updateTask = (taskId, taskData) => {
    const index = tasks.value.findIndex((t) => t.id === taskId)
    if (index !== -1) {
      tasks.value[index] = {
        ...tasks.value[index],
        ...taskData,
      }
      return tasks.value[index]
    }
    return null
  }

  /**
   * 删除任务
   */
  const deleteTask = (taskId) => {
    const index = tasks.value.findIndex((t) => t.id === taskId)
    if (index !== -1) {
      tasks.value.splice(index, 1)
      return true
    }
    return false
  }

  /**
   * 更新任务状态
   */
  const updateTaskStatus = (taskId, status) => {
    const task = tasks.value.find((t) => t.id === taskId)
    if (task) {
      task.status = status
      return task
    }
    return null
  }

  /**
   * 搜索事件
   */
  const searchEvents = (query) => {
    const lowerQuery = query.toLowerCase()
    return events.value.filter(
      (event) =>
        event.name.toLowerCase().includes(lowerQuery) ||
        event.activity.toLowerCase().includes(lowerQuery) ||
        event.venue.toLowerCase().includes(lowerQuery) ||
        event.city.toLowerCase().includes(lowerQuery)
    )
  }

  /**
   * 搜索任务
   */
  const searchTasks = (query) => {
    const lowerQuery = query.toLowerCase()
    return tasks.value.filter(
      (task) =>
        task.title.toLowerCase().includes(lowerQuery) ||
        task.description.toLowerCase().includes(lowerQuery) ||
        task.contact_info.toLowerCase().includes(lowerQuery)
    )
  }

  /**
   * 导入事件（批量）
   */
  const importEvents = (eventList) => {
    eventList.forEach((eventData) => {
      addEvent(eventData)
    })
  }

  /**
   * 导出事件（用于备份）
   */
  const exportEvents = () => {
    return JSON.stringify(events.value, null, 2)
  }

  /**
   * 导出任务（用于备份）
   */
  const exportTasks = () => {
    return JSON.stringify(tasks.value, null, 2)
  }

  /**
   * 清空所有数据（谨慎使用）
   */
  const clearAll = () => {
    if (confirm('确定要清空所有数据吗？此操作不可撤销！')) {
      events.value = []
      tasks.value = []
      return true
    }
    return false
  }

  return {
    // 状态
    events,
    tasks,

    // 计算属性
    getEventsByDate,
    getEventsByMonth,
    getEventsByCategory,
    getOfficialEvents,
    getFanEvents,
    getTasksByDate,
    getActiveTasks,
    getCompletedTasks,

    // 事件方法
    addEvent,
    updateEvent,
    deleteEvent,
    markAsOfficial,
    markAsFan,

    // 任务方法
    addTask,
    updateTask,
    deleteTask,
    updateTaskStatus,

    // 搜索方法
    searchEvents,
    searchTasks,

    // 导入导出方法
    importEvents,
    exportEvents,
    exportTasks,

    // 数据管理
    clearAll,
  }
})