<template>
  <div class="calendar-view">
    <!-- 月份导航 -->
    <div class="month-header">
      <div class="month-info">
        <button @click="previousMonth" class="nav-btn">‹</button>
        <div class="month-title">
          <div class="year">{{ currentYear }}</div>
          <div class="month">{{ currentMonthName }}</div>
          <div class="month-en">{{ currentMonthNameEn }}</div>
        </div>
        <button @click="nextMonth" class="nav-btn">›</button>
      </div>

      <!-- 地区导航 -->
      <div class="region-tabs">
        <button 
          v-for="region in regions" 
          :key="region"
          @click="viewStore.setRegion(region)"
          :class="{ active: viewStore.currentRegion === region }"
          class="region-tab"
        >
          {{ regionNames[region] }}
        </button>
      </div>
    </div>

    <!-- 统计信息 -->
    <div class="stats-bar">
      <div class="stat-item">
        <div class="stat-value">{{ stats.total }}</div>
        <div class="stat-label">站台活动</div>
      </div>
      <div class="stat-item">
        <div class="stat-value">{{ stats.official }}</div>
        <div class="stat-label">官方宣传</div>
      </div>
      <div class="stat-item">
        <div class="stat-value">{{ stats.fan }}</div>
        <div class="stat-label">粉丝推送</div>
      </div>
      <div class="stat-item">
        <div class="stat-value">{{ stats.other }}</div>
        <div class="stat-label">其他</div>
      </div>
    </div>

    <!-- 视图切换 -->
    <div class="view-toggle">
      <button 
        @click="viewStore.setView('calendar')"
        :class="{ active: viewStore.currentView === 'calendar' }"
        class="toggle-btn"
      >
        📅 日历
      </button>
      <button 
        @click="viewStore.setView('week')"
        :class="{ active: viewStore.currentView === 'week' }"
        class="toggle-btn"
      >
        📆 周
      </button>
      <button 
        @click="viewStore.setView('task')"
        :class="{ active: viewStore.currentView === 'task' }"
        class="toggle-btn"
      >
        📋 事项
      </button>
    </div>

    <!-- 周几标题 -->
    <div class="weekdays">
      <div v-for="day in weekdayLabels" :key="day" class="weekday">
        {{ day }}
      </div>
    </div>

    <!-- 日历格子 -->
    <div class="calendar-grid">
      <div 
        v-for="day in calendarDays" 
        :key="day.dateStr"
        @click="selectDay(day)"
        :class="{ 
          'other-month': !day.isCurrentMonth,
          'today': day.isToday,
          'selected': day.dateStr === selectedDateStr
        }"
        class="calendar-day"
      >
        <div class="day-number">{{ day.date }}</div>
        
        <div class="events-container">
          <div 
            v-for="(event, idx) in day.events.slice(0, 3)" 
            :key="idx"
            @click.stop="showEventDetail(event)"
            :style="getEventStyle(event)"
            class="event-chip"
          >
            <span class="event-text">{{ event.name }}</span>
            <span v-if="event.isofficial" class="official-star">★</span>
          </div>
        </div>

        <div v-if="day.events.length > 3" class="more-events">
          +{{ day.events.length - 3 }} 更多
        </div>
      </div>
    </div>

    <!-- 事件详情弹窗 -->
    <div v-if="selectedEventDetail" class="modal-overlay" @click="selectedEventDetail = null">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>{{ selectedEventDetail.name }}</h3>
          <button @click="selectedEventDetail = null" class="close-btn">✕</button>
        </div>
        <div class="modal-body">
          <p v-if="selectedEventDetail.company"><strong>艺人：</strong> {{ selectedEventDetail.company }}</p>
          <p v-if="selectedEventDetail.category"><strong>类型：</strong> {{ selectedEventDetail.category }}</p>
          <p v-if="selectedEventDetail.activity"><strong>活动：</strong> {{ selectedEventDetail.activity }}</p>
          <p v-if="selectedEventDetail.venue"><strong>地点：</strong> {{ selectedEventDetail.venue }}</p>
          <p v-if="selectedEventDetail.city"><strong>城市：</strong> {{ selectedEventDetail.city }}</p>
          <p v-if="selectedEventDetail.time"><strong>时间：</strong> {{ selectedEventDetail.time }}</p>
          <p v-if="selectedEventDetail.price"><strong>票价：</strong> {{ selectedEventDetail.price }}</p>
          <p v-if="selectedEventDetail.ticket_url"><strong>购票：</strong> 
            <a :href="selectedEventDetail.ticket_url" target="_blank">点击购票</a>
          </p>
          <p v-if="selectedEventDetail.isofficial" class="official-badge">★ 官方活动</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useViewStore } from '@/stores/view'
import { useEventsStore } from '@/stores/events'
import { getArtistColor } from '@/utils/config'

const viewStore = useViewStore()
const eventsStore = useEventsStore()

// 状态
const currentDate = ref(new Date())
const selectedEventDetail = ref(null)

// 常量
const regions = ['oversea', 'china', 'thailand', 'chob']
const regionNames = {
  oversea: 'OVERSEA',
  china: 'CHINA',
  thailand: 'THAILAND',
  chob: 'CHOB'
}

const weekdayLabels = ['日', '一', '二', '三', '四', '五', '六']
const monthNames = ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月']
const monthNamesEn = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

// 计算属性
const currentYear = computed(() => currentDate.value.getFullYear())
const currentMonth = computed(() => currentDate.value.getMonth())
const currentMonthName = computed(() => monthNames[currentMonth.value])
const currentMonthNameEn = computed(() => monthNamesEn[currentMonth.value])

const selectedDateStr = computed(() => {
  const year = currentDate.value.getFullYear()
  const month = String(currentDate.value.getMonth() + 1).padStart(2, '0')
  const date = String(currentDate.value.getDate()).padStart(2, '0')
  return `${year}-${month}-${date}`
})

const calendarDays = computed(() => {
  const year = currentDate.value.getFullYear()
  const month = currentDate.value.getMonth()
  
  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)
  const prevLastDay = new Date(year, month, 0)
  
  const firstDayOfWeek = firstDay.getDay()
  const lastDateOfMonth = lastDay.getDate()
  const prevLastDate = prevLastDay.getDate()
  
  const days = []
  const today = new Date()
  
  // 前一个月的日期
  for (let i = firstDayOfWeek - 1; i >= 0; i--) {
    const date = prevLastDate - i
    days.push({
      date,
      isCurrentMonth: false,
      dateStr: `${year}-${month}-${date}`,
      isToday: false,
      events: []
    })
  }
  
  // 当前月的日期
  for (let date = 1; date <= lastDateOfMonth; date++) {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(date).padStart(2, '0')}`
    const isToday = date === today.getDate() && 
                    month === today.getMonth() && 
                    year === today.getFullYear()
    
    const dayEvents = eventsStore.filteredEvents.filter(e => 
      (e.date || e.sale_date) === dateStr
    )
    
    days.push({
      date,
      isCurrentMonth: true,
      dateStr,
      isToday,
      events: dayEvents
    })
  }
  
  // 下一个月的日期
  const remainingDays = 42 - days.length
  for (let date = 1; date <= remainingDays; date++) {
    days.push({
      date,
      isCurrentMonth: false,
      dateStr: `${year}-${month + 2}-${date}`,
      isToday: false,
      events: []
    })
  }
  
  return days
})

const stats = computed(() => {
  const events = eventsStore.filteredEvents
  return {
    total: events.length,
    official: events.filter(e => e.isofficial).length,
    fan: events.filter(e => !e.isofficial).length,
    other: 0
  }
})

// 方法
function previousMonth() {
  currentDate.value = new Date(currentDate.value.getFullYear(), currentDate.value.getMonth() - 1, 1)
}

function nextMonth() {
  currentDate.value = new Date(currentDate.value.getFullYear(), currentDate.value.getMonth() + 1, 1)
}

function selectDay(day) {
  if (day.isCurrentMonth) {
    currentDate.value = new Date(currentDate.value.getFullYear(), currentDate.value.getMonth(), day.date)
  }
}

function getEventStyle(event) {
  const colors = getArtistColor(event.category, viewStore.currentRegion, event.isofficial)
  return {
    backgroundColor: colors.background,
    color: colors.color,
    border: colors.border
  }
}

function showEventDetail(event) {
  selectedEventDetail.value = event
}

// 初始化
onMounted(() => {
  eventsStore.fetchAllEvents()
})
</script>

<style scoped>
.calendar-view {
  padding: 2rem;
  background: var(--color-background);
  color: var(--color-text);
  transition: all 0.3s ease;
}

/* 月份头部 */
.month-header {
  margin-bottom: 2rem;
  padding-bottom: 1.5rem;
  border-bottom: 1px solid var(--color-border);
}

.month-info {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1.5rem;
}

.month-title {
  text-align: center;
  flex: 1;
}

.year {
  font-size: 0.875rem;
  color: var(--color-textSecondary);
  letter-spacing: 0.15em;
}

.month {
  font-size: 3rem;
  font-weight: 900;
  line-height: 1;
  margin: 0.25rem 0;
}

.month-en {
  font-size: 1.5rem;
  color: var(--color-textSecondary);
  font-weight: 300;
  letter-spacing: 0.05em;
}

.nav-btn {
  width: 2.5rem;
  height: 2.5rem;
  border: none;
  background: var(--color-surface);
  border-radius: 8px;
  font-size: 1.5rem;
  cursor: pointer;
  transition: all 0.2s;
  border: 1px solid var(--color-border);
}

.nav-btn:hover {
  background: var(--color-primary);
  color: white;
  border-color: var(--color-primary);
}

/* 地区标签 */
.region-tabs {
  display: flex;
  gap: 0.75rem;
  justify-content: center;
  flex-wrap: wrap;
}

.region-tab {
  padding: 0.5rem 1.25rem;
  border: 1px solid var(--color-border);
  background: var(--color-surface);
  border-radius: 20px;
  cursor: pointer;
  font-size: 0.875rem;
  font-weight: 500;
  transition: all 0.2s;
  color: var(--color-text);
}

.region-tab.active {
  background: #1a1a1a;
  color: white;
  border-color: #1a1a1a;
}

.region-tab:hover:not(.active) {
  border-color: var(--color-primary);
  color: var(--color-primary);
}

/* 统计栏 */
.stats-bar {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 1rem;
  margin-bottom: 1.5rem;
  padding: 1.5rem;
  background: var(--color-surface);
  border-radius: 12px;
  border: 1px solid var(--color-border);
}

.stat-item {
  text-align: center;
}

.stat-value {
  font-size: 1.75rem;
  font-weight: bold;
  color: var(--color-primary);
}

.stat-label {
  font-size: 0.75rem;
  color: var(--color-textSecondary);
  margin-top: 0.25rem;
}

/* 视图切换 */
.view-toggle {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
  justify-content: center;
}

.toggle-btn {
  padding: 0.5rem 1rem;
  border: 1px solid var(--color-border);
  background: var(--color-surface);
  border-radius: 8px;
  cursor: pointer;
  font-size: 0.875rem;
  font-weight: 500;
  transition: all 0.2s;
  color: var(--color-text);
}

.toggle-btn.active {
  background: #1a1a1a;
  color: white;
  border-color: #1a1a1a;
}

.toggle-btn:hover:not(.active) {
  border-color: var(--color-primary);
}

/* 周几标题 */
.weekdays {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 0.5rem;
  margin-bottom: 0.5rem;
}

.weekday {
  text-align: center;
  font-weight: 600;
  color: var(--color-textSecondary);
  font-size: 0.875rem;
  padding: 0.5rem;
}

/* 日历网格 */
.calendar-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 0.5rem;
  margin-bottom: 2rem;
}

.calendar-day {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  min-height: 6.5rem;
  padding: 0.75rem;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  position: relative;
}

.calendar-day:hover {
  border-color: var(--color-primary);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.calendar-day.today {
  background: linear-gradient(135deg, var(--color-primary) 0%, rgba(0,0,0,0) 100%);
  border-color: var(--color-primary);
}

.calendar-day.today .day-number {
  color: white;
  font-weight: bold;
}

.calendar-day.other-month {
  opacity: 0.3;
  cursor: default;
}

.calendar-day.other-month:hover {
  border-color: var(--color-border);
  box-shadow: none;
}

.calendar-day.selected {
  box-shadow: 0 0 0 2px var(--color-primary);
}

.day-number {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--color-text);
}

.events-container {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  flex: 1;
  overflow: hidden;
}

.event-chip {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.35rem 0.5rem;
  font-size: 0.7rem;
  font-weight: 500;
  border-radius: 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  transition: all 0.2s;
  cursor: pointer;
}

.event-chip:hover {
  transform: scale(1.02);
}

.event-text {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
}

.official-star {
  flex-shrink: 0;
  font-size: 0.65rem;
}

.more-events {
  font-size: 0.65rem;
  color: var(--color-textSecondary);
  padding: 0.25rem;
}

/* 弹窗样式 */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(4px);
}

.modal-content {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 12px;
  padding: 1.5rem;
  max-width: 500px;
  width: 90%;
  max-height: 80vh;
  overflow-y: auto;
  animation: slideUp 0.3s ease;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid var(--color-border);
}

.modal-header h3 {
  margin: 0;
  font-size: 1.25rem;
}

.close-btn {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: var(--color-textSecondary);
  transition: color 0.2s;
}

.close-btn:hover {
  color: var(--color-text);
}

.modal-body {
  font-size: 0.875rem;
  line-height: 1.6;
}

.modal-body p {
  margin: 0.5rem 0;
}

.modal-body a {
  color: var(--color-primary);
  text-decoration: none;
  font-weight: 500;
}

.modal-body a:hover {
  text-decoration: underline;
}

.official-badge {
  margin-top: 1rem;
  padding: 0.75rem;
  background: var(--color-primary);
  color: white;
  border-radius: 8px;
  text-align: center;
  font-weight: 600;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 响应式 */
@media (max-width: 768px) {
  .calendar-view {
    padding: 1rem;
  }

  .month {
    font-size: 2rem;
  }

  .calendar-day {
    min-height: 5rem;
    padding: 0.5rem;
    font-size: 0.75rem;
  }

  .stats-bar {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>