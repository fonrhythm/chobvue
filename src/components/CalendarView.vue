<template>
  <div class="calendar-wrapper" :data-region="currentRegion">
    <!-- 页头 -->
    <div class="calendar-header">
      <div class="calendar-title">
        <span class="calendar-title__year">{{ currentYear }}</span>
        <span class="calendar-title__month">{{ monthCN }}</span>
        <span class="calendar-title__en">{{ monthEN }}</span>
      </div>
      <div class="calendar-nav">
        <button class="calendar-nav__btn" @click="prevMonth">‹</button>
        <button class="calendar-nav__btn" @click="nextMonth">›</button>
      </div>
    </div>

    <!-- 控制栏 -->
    <div class="controls">
      <div class="controls__group">
        <button
          class="control-btn"
          :class="{ active: viewType === 'calendar' }"
          @click="viewType = 'calendar'"
        >
          日历
        </button>
        <button
          class="control-btn"
          :class="{ active: viewType === 'task' }"
          @click="viewType = 'task'"
        >
          事项
        </button>
      </div>

      <div class="controls__group">
        <button
          class="control-btn"
          :class="{ active: calendarView === 'day' }"
          @click="calendarView = 'day'"
        >
          日
        </button>
        <button
          class="control-btn"
          :class="{ active: calendarView === 'week' }"
          @click="calendarView = 'week'"
        >
          周
        </button>
        <button
          class="control-btn"
          :class="{ active: calendarView === 'month' }"
          @click="calendarView = 'month'"
        >
          月
        </button>
      </div>

      <div class="controls__group">
        <select v-model="selectedCompany" class="control-btn">
          <option value="">公司 ▼</option>
          <option value="official">泰国官方</option>
          <option value="personal">个人</option>
        </select>
      </div>

      <div class="controls__group">
        <select v-model="selectedType" class="control-btn">
          <option value="">类型 ▼</option>
          <option value="band">乐队</option>
          <option value="singer">歌手</option>
          <option value="concert">演唱会</option>
        </select>
      </div>

      <div style="flex: 1"></div>

      <div class="region-label">{{ regionName }} {{ regionEmoji }}</div>
    </div>

    <!-- 统计信息（月视图） -->
    <div v-if="calendarView === 'month'" class="stats-grid">
      <div class="stat-card">
        <span class="stat-card__number">{{ stats.total }}</span>
        <span class="stat-card__label">总活动数</span>
      </div>
      <div class="stat-card">
        <span class="stat-card__number">{{ stats.band }}</span>
        <span class="stat-card__label">乐队演出</span>
      </div>
      <div class="stat-card">
        <span class="stat-card__number">{{ stats.singer }}</span>
        <span class="stat-card__label">歌手活动</span>
      </div>
      <div class="stat-card">
        <span class="stat-card__number">{{ stats.other }}</span>
        <span class="stat-card__label">其他活动</span>
      </div>
    </div>

    <!-- 月度日历视图 -->
    <template v-if="viewType === 'calendar' && calendarView === 'month'">
      <div class="week-header">
        <div class="week-header__day">日</div>
        <div class="week-header__day">一</div>
        <div class="week-header__day">二</div>
        <div class="week-header__day">三</div>
        <div class="week-header__day">四</div>
        <div class="week-header__day">五</div>
        <div class="week-header__day">六</div>
      </div>

      <div class="calendar-grid">
        <div
          v-for="day in calendarDays"
          :key="day.date"
          class="calendar-cell"
          :class="{
            'today': day.isToday,
            'other-month': !day.currentMonth,
            'overflow': day.events.length > 3
          }"
          @click="openDayModal(day)"
        >
          <span class="calendar-cell__date">{{ day.day }}</span>
          <div class="calendar-cell__chips">
            <span
              v-for="(event, idx) in day.events.slice(0, 3)"
              :key="idx"
              class="chip"
              :class="[event.type, { official: event.official }]"
            >
              {{ event.name }}
            </span>
          </div>
          <div v-if="day.events.length > 3" class="calendar-cell__more">
            +{{ day.events.length - 3 }} 更多
          </div>
        </div>
      </div>
    </template>

    <!-- 周视图 -->
    <template v-if="viewType === 'calendar' && calendarView === 'week'">
      <div class="week-selector">
        <button class="calendar-nav__btn" @click="prevWeek">‹</button>
        <div class="week-selector__header">
          <div
            v-for="day in weekDays"
            :key="day.date"
            class="week-day-selector"
            :class="{ active: day.isToday }"
            @click="selectedDate = day.date"
          >
            <span class="week-day-selector__name">{{ day.name }}</span>
            <span class="week-day-selector__date">{{ day.day }}</span>
          </div>
        </div>
        <button class="calendar-nav__btn" @click="nextWeek">›</button>
      </div>

      <div class="week-events">
        <div v-if="selectedDayEvents.length === 0" class="event-card">
          <p style="text-align: center; color: var(--muted)">这一天暂无事件</p>
        </div>
        <div
          v-for="event in selectedDayEvents"
          :key="event.id"
          class="event-card"
        >
          <div class="event-card__header">
            <div>
              <h3 class="event-card__title">{{ event.name }}</h3>
              <p class="event-card__subtitle">{{ event.activity }}</p>
              <p class="event-card__location" v-if="event.location">
                📍 {{ event.location }}
              </p>
            </div>
            <span class="event-card__type">{{ event.type }}</span>
          </div>
          <div class="event-card__time" v-if="event.time">
            <span class="event-card__time-icon"></span>
            <span>{{ event.time }}</span>
          </div>
        </div>
      </div>
    </template>

    <!-- 事项视图 -->
    <template v-if="viewType === 'task'">
      <div class="week-selector">
        <button class="calendar-nav__btn" @click="prevWeek">‹</button>
        <div class="week-selector__days">
          <div
            v-for="day in weekDays"
            :key="day.date"
            class="week-day-selector"
            :class="{ active: day.isToday }"
            @click="selectedDate = day.date"
          >
            <span class="week-day-selector__name">{{ day.name }}</span>
            <span class="week-day-selector__date">{{ day.day }}</span>
          </div>
        </div>
        <button class="calendar-nav__btn" @click="nextWeek">›</button>
      </div>

      <div class="category-filter">
        <button
          class="category-filter__btn"
          :class="{ active: selectedCategory === '' }"
          @click="selectedCategory = ''"
        >
          All
        </button>
        <button
          v-for="cat in categories"
          :key="cat"
          class="category-filter__btn"
          :class="{ active: selectedCategory === cat }"
          @click="selectedCategory = cat"
        >
          {{ cat }}
        </button>
      </div>

      <div class="tasks-container">
        <div v-if="filteredTasks.length === 0" style="text-align: center; padding: var(--space-xl); color: var(--muted);">
          暂无任务
        </div>
        <div
          v-for="task in filteredTasks"
          :key="task.id"
          class="task-card"
          :class="{ official: task.official }"
        >
          <div class="task-card__header">
            <div>
              <h3 class="task-card__title">{{ task.title }}</h3>
              <p class="task-card__note">{{ task.note }}</p>
            </div>
            <span class="task-card__type">{{ task.category }}</span>
          </div>

          <div class="task-card__meta">
            <div class="task-card__meta-item">
              <span class="task-card__meta-label">开始时间</span>
              <span class="task-card__meta-value">{{ task.startDate }}</span>
            </div>
            <div class="task-card__meta-item" v-if="task.contact">
              <span class="task-card__meta-label">联系方式</span>
              <span class="task-card__meta-value">{{ task.contact }}</span>
            </div>
          </div>

          <div v-if="task.endDate" class="task-card__meta">
            <div class="task-card__meta-item">
              <span class="task-card__meta-label">结束时间</span>
              <span class="task-card__meta-value">{{ task.endDate }}</span>
            </div>
          </div>

          <div v-if="task.description" class="task-card__description">
            {{ task.description }}
          </div>

          <div v-if="task.link" class="task-card__contact">
            🔗 {{ task.link }}
          </div>

          <div class="task-card__actions">
            <button class="task-card__action-btn" @click="editTask(task)">
              编辑
            </button>
            <button class="task-card__action-btn primary" @click="handleTaskAction(task)">
              {{ task.official ? '+ 我要参加' : '+ 操作' }}
            </button>
          </div>
        </div>
      </div>
    </template>

    <!-- 日期详情弹窗 -->
    <div v-if="showDayModal" class="modal-overlay" @click.self="showDayModal = false">
      <div class="modal">
        <div class="modal__header">
          <div>
            <h3 class="modal__title">{{ modalDate }}年{{ modalMonth }}月{{ modalDay }}日</h3>
            <p class="modal__subtitle">{{ modalDayName }} · 共 {{ modalEvents.length }} 项日程</p>
          </div>
          <button class="modal__close" @click="showDayModal = false">✕</button>
        </div>

        <div class="modal__body">
          <!-- 全天活动 -->
          <div v-if="allDayEvents.length > 0">
            <div style="font-size: 0.75rem; color: var(--muted); font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: var(--space-md);">
              全天 / 跨天
            </div>
            <div style="display: flex; flex-direction: column; gap: var(--space-md);">
              <div
                v-for="event in allDayEvents"
                :key="event.id"
                style="padding: var(--space-md); border-radius: var(--radius-lg); background-color: rgba(68, 45, 28, 0.08); border: 1px solid var(--border);"
              >
                <span style="color: var(--text); font-weight: 600;">{{ event.name }}</span>
              </div>
            </div>
          </div>

          <!-- 时间线 -->
          <div v-if="timedEvents.length > 0" style="margin-top: var(--space-lg);">
            <div style="font-size: 0.75rem; color: var(--muted); font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: var(--space-md);">
              时间轴日程
            </div>
            <div class="timeline">
              <div
                v-for="event in timedEvents"
                :key="event.id"
                class="timeline-item"
              >
                <div class="timeline-item__time">{{ event.time }}</div>
                <div class="timeline-item__content">{{ event.name }}</div>
              </div>
            </div>
          </div>
        </div>

        <div class="modal__footer">
          <button class="modal__btn modal__btn--secondary" @click="showDayModal = false">
            关闭
          </button>
          <button class="modal__btn modal__btn--primary" @click="addEventToDay">
            + 在这天新增
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { reactive, computed, ref } from 'vue'

export default {
  name: 'ChobCalendar',
  props: {
    initialRegion: {
      type: String,
      default: 'oversea', // 'thailand' | 'china' | 'oversea'
    },
    events: {
      type: Array,
      default: () => [],
    },
    tasks: {
      type: Array,
      default: () => [],
    },
  },
  setup(props) {
    // 状态
    const currentDate = reactive(new Date())
    const viewType = ref('calendar') // 'calendar' | 'task'
    const calendarView = ref('month') // 'day' | 'week' | 'month'
    const currentRegion = ref(props.initialRegion)
    const selectedCompany = ref('')
    const selectedType = ref('')
    const selectedDate = ref(new Date())
    const selectedCategory = ref('')
    const showDayModal = ref(false)

    // 常量
    const months = ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月']
    const monthsEN = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    const weekDaysEN = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
    const weekDaysCN = ['日', '一', '二', '三', '四', '五', '六']
    const categories = ['抢票', '订座', 'Top Spender', '活动开放']
    const regionNames = {
      thailand: '泰国',
      china: '中国',
      oversea: '海外',
    }
    const regionEmojis = {
      thailand: '🇹🇭',
      china: '🇨🇳',
      oversea: '🌏',
    }

    // 计算属性
    const currentYear = computed(() => currentDate.getFullYear())
    const currentMonth = computed(() => currentDate.getMonth())
    const monthCN = computed(() => months[currentMonth.value])
    const monthEN = computed(() => monthsEN[currentMonth.value])
    const regionName = computed(() => regionNames[currentRegion.value])
    const regionEmoji = computed(() => regionEmojis[currentRegion.value])

    // 生成日历天数
    const calendarDays = computed(() => {
      const year = currentDate.getFullYear()
      const month = currentDate.getMonth()
      const firstDay = new Date(year, month, 1)
      const lastDay = new Date(year, month + 1, 0)
      const prevLastDay = new Date(year, month, 0)

      const days = []

      // 前一月的日期
      const prevMonthDays = firstDay.getDay()
      for (let i = prevMonthDays - 1; i >= 0; i--) {
        const day = prevLastDay.getDate() - i
        days.push({
          date: new Date(year, month - 1, day),
          day: day,
          currentMonth: false,
          isToday: false,
          events: [],
        })
      }

      // 当月日期
      for (let i = 1; i <= lastDay.getDate(); i++) {
        const date = new Date(year, month, i)
        const isToday = isDateToday(date)
        days.push({
          date: date,
          day: i,
          currentMonth: true,
          isToday: isToday,
          events: getEventsForDate(date),
        })
      }

      // 下一月的日期
      const remainingDays = 42 - days.length
      for (let i = 1; i <= remainingDays; i++) {
        days.push({
          date: new Date(year, month + 1, i),
          day: i,
          currentMonth: false,
          isToday: false,
          events: [],
        })
      }

      return days
    })

    // 生成周视图的7天
    const weekDays = computed(() => {
      const days = []
      const startOfWeek = new Date(selectedDate.value)
      startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay())

      for (let i = 0; i < 7; i++) {
        const date = new Date(startOfWeek)
        date.setDate(date.getDate() + i)
        days.push({
          date: date,
          name: weekDaysEN[i],
          day: date.getDate(),
          isToday: isDateToday(date),
          events: getEventsForDate(date),
        })
      }

      return days
    })

    // 获取选中日期的事件
    const selectedDayEvents = computed(() => {
      return getEventsForDate(selectedDate.value)
    })

    // 过滤后的任务
    const filteredTasks = computed(() => {
      let filtered = props.tasks

      if (selectedCategory.value) {
        filtered = filtered.filter((t) => t.category === selectedCategory.value)
      }

      if (selectedType.value) {
        filtered = filtered.filter((t) => t.type === selectedType.value)
      }

      return filtered
    })

    // 统计信息
    const stats = computed(() => {
      const allEvents = props.events
      return {
        total: allEvents.length,
        band: allEvents.filter((e) => e.type === 'band').length,
        singer: allEvents.filter((e) => e.type === 'singer').length,
        other: allEvents.filter((e) => !['band', 'singer'].includes(e.type)).length,
      }
    })

    // 模态框相关
    const modalDate = ref('')
    const modalMonth = ref('')
    const modalDay = ref('')
    const modalDayName = ref('')
    const modalEvents = ref([])
    const allDayEvents = computed(() => modalEvents.value.filter((e) => e.allDay))
    const timedEvents = computed(() => modalEvents.value.filter((e) => !e.allDay))

    // 函数
    const prevMonth = () => {
      currentDate.setMonth(currentDate.getMonth() - 1)
    }

    const nextMonth = () => {
      currentDate.setMonth(currentDate.getMonth() + 1)
    }

    const prevWeek = () => {
      selectedDate.value.setDate(selectedDate.value.getDate() - 7)
    }

    const nextWeek = () => {
      selectedDate.value.setDate(selectedDate.value.getDate() + 7)
    }

    const isDateToday = (date) => {
      const today = new Date()
      return (
        date.getFullYear() === today.getFullYear() &&
        date.getMonth() === today.getMonth() &&
        date.getDate() === today.getDate()
      )
    }

    const getEventsForDate = (date) => {
      return props.events.filter((e) => {
        const eventDate = new Date(e.date)
        return (
          eventDate.getFullYear() === date.getFullYear() &&
          eventDate.getMonth() === date.getMonth() &&
          eventDate.getDate() === date.getDate()
        )
      })
    }

    const openDayModal = (day) => {
      if (!day.currentMonth) return

      modalDate.value = day.date.getFullYear()
      modalMonth.value = day.date.getMonth() + 1
      modalDay.value = day.day
      modalDayName.value = weekDaysEN[day.date.getDay()]
      modalEvents.value = day.events

      showDayModal.value = true
    }

    const addEventToDay = () => {
      // 触发添加事件的事件或打开表单
      console.log('添加事件到', modalDate.value, modalMonth.value, modalDay.value)
    }

    const editTask = (task) => {
      // 编辑任务
      console.log('编辑任务:', task)
    }

    const handleTaskAction = (task) => {
      // 处理任务操作
      console.log('执行任务操作:', task)
    }

    return {
      currentDate,
      viewType,
      calendarView,
      currentRegion,
      selectedCompany,
      selectedType,
      selectedDate,
      selectedCategory,
      showDayModal,
      currentYear,
      monthCN,
      monthEN,
      regionName,
      regionEmoji,
      calendarDays,
      weekDays,
      selectedDayEvents,
      filteredTasks,
      stats,
      modalDate,
      modalMonth,
      modalDay,
      modalDayName,
      modalEvents,
      allDayEvents,
      timedEvents,
      categories,
      prevMonth,
      nextMonth,
      prevWeek,
      nextWeek,
      openDayModal,
      addEventToDay,
      editTask,
      handleTaskAction,
    }
  },
}
</script>

<style scoped>
/* 导入全局CSS变量和样式 */
@import './styles-system.css';

.calendar-wrapper {
  max-width: 1200px;
  margin: 0 auto;
  padding: var(--space-lg);
}
</style>
