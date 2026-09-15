<template>
  <div class="week-view">
    <!-- 周导航 -->
    <div class="week-header">
      <button @click="previousWeek" class="nav-btn">‹</button>
      <div class="week-info">
        <div class="week-title">{{ weekStart.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' }) }} - {{ weekEnd.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' }) }}</div>
      </div>
      <button @click="nextWeek" class="nav-btn">›</button>
    </div>

    <!-- 日期选择 -->
    <div class="weekdays-slider">
      <button 
        v-for="day in weekDays" 
        :key="day.dateStr"
        @click="selectDate(day.date)"
        :class="{ active: day.dateStr === selectedDateStr }"
        class="day-btn"
      >
        <div class="day-name">{{ dayNames[day.date.getDay()] }}</div>
        <div class="day-number">{{ day.date.getDate() }}</div>
      </button>
    </div>

    <!-- 当日活动列表 -->
    <div class="day-events">
      <h3 class="events-title">{{ selectedDateStr }} 的活动</h3>
      
      <div v-if="todayEvents.length === 0" class="no-events">
        这一天没有活动安排
      </div>

      <div v-else class="events-list">
        <div 
          v-for="event in todayEvents" 
          :key="event.id"
          @click="selectedEvent = event"
          :style="getEventStyle(event)"
          class="event-item"
        >
          <div class="event-header">
            <h4 class="event-name">
              {{ event.name }}
              <span v-if="event.isofficial" class="official-badge">★ 官方</span>
            </h4>
            <div class="event-time">{{ event.time || '全天' }}</div>
          </div>
          
          <div class="event-details">
            <p v-if="event.company"><strong>艺人：</strong> {{ event.company }}</p>
            <p v-if="event.activity"><strong>类型：</strong> {{ event.activity }}</p>
            <p v-if="event.venue"><strong>地点：</strong> {{ event.venue }}</p>
            <p v-if="event.city"><strong>城市：</strong> {{ event.city }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useViewStore } from '@/stores/view'
import { useEventsStore } from '@/stores/events'
import { getArtistColor } from '@/utils/config'

const viewStore = useViewStore()
const eventsStore = useEventsStore()

const selectedEvent = ref(null)
const dayNames = ['日', '一', '二', '三', '四', '五', '六']

const selectedDateStr = computed(() => {
  const year = viewStore.selectedDate.getFullYear()
  const month = String(viewStore.selectedDate.getMonth() + 1).padStart(2, '0')
  const date = String(viewStore.selectedDate.getDate()).padStart(2, '0')
  return `${year}-${month}-${date}`
})

const weekStart = computed(() => {
  const date = new Date(viewStore.selectedDate)
  date.setDate(date.getDate() - date.getDay())
  return date
})

const weekEnd = computed(() => {
  const date = new Date(weekStart.value)
  date.setDate(date.getDate() + 6)
  return date
})

const weekDays = computed(() => {
  const days = []
  for (let i = 0; i < 7; i++) {
    const date = new Date(weekStart.value)
    date.setDate(date.getDate() + i)
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    days.push({
      date,
      dateStr: `${year}-${month}-${day}`
    })
  }
  return days
})

const todayEvents = computed(() => {
  return eventsStore.filteredEvents.filter(e => 
    (e.date || e.sale_date) === selectedDateStr.value
  )
})

function previousWeek() {
  const newDate = new Date(viewStore.selectedDate)
  newDate.setDate(newDate.getDate() - 7)
  viewStore.selectDate(newDate)
}

function nextWeek() {
  const newDate = new Date(viewStore.selectedDate)
  newDate.setDate(newDate.getDate() + 7)
  viewStore.selectDate(newDate)
}

function selectDate(date) {
  viewStore.selectDate(date)
}

function getEventStyle(event) {
  const colors = getArtistColor(event.category, viewStore.currentRegion, event.isofficial)
  return {
    borderLeft: `3px solid ${colors.background || colors.color}`,
    backgroundColor: colors.background ? colors.background + '10' : 'transparent'
  }
}
</script>

<style scoped>
.week-view {
  padding: 2rem;
  background: var(--color-background);
  color: var(--color-text);
}

.week-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid var(--color-border);
}

.nav-btn {
  width: 2.5rem;
  height: 2.5rem;
  border: 1px solid var(--color-border);
  background: var(--color-surface);
  border-radius: 8px;
  font-size: 1.5rem;
  cursor: pointer;
  transition: all 0.2s;
}

.nav-btn:hover {
  background: var(--color-primary);
  color: white;
  border-color: var(--color-primary);
}

.week-info {
  text-align: center;
  flex: 1;
}

.week-title {
  font-size: 1.25rem;
  font-weight: 600;
}

.weekdays-slider {
  display: flex;
  gap: 0.75rem;
  margin-bottom: 2rem;
  overflow-x: auto;
  padding-bottom: 0.5rem;
}

.day-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  border: 1px solid var(--color-border);
  background: var(--color-surface);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
  min-width: 70px;
}

.day-btn:hover {
  border-color: var(--color-primary);
}

.day-btn.active {
  background: #1a1a1a;
  color: white;
  border-color: #1a1a1a;
}

.day-name {
  font-size: 0.75rem;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.day-number {
  font-size: 1.25rem;
  font-weight: 600;
}

.day-events {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 12px;
  padding: 1.5rem;
}

.events-title {
  margin: 0 0 1.5rem 0;
  font-size: 1.25rem;
  font-weight: 600;
}

.no-events {
  text-align: center;
  color: var(--color-textSecondary);
  padding: 2rem;
  font-size: 0.9rem;
}

.events-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.event-item {
  border-left: 3px solid var(--color-primary);
  padding: 1rem;
  background: var(--color-background);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
}

.event-item:hover {
  transform: translateX(4px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.event-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 0.75rem;
}

.event-name {
  margin: 0;
  font-size: 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.official-badge {
  font-size: 0.75rem;
  background: var(--color-primary);
  color: white;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-weight: 500;
}

.event-time {
  font-size: 0.875rem;
  color: var(--color-textSecondary);
  white-space: nowrap;
}

.event-details {
  font-size: 0.875rem;
  color: var(--color-textSecondary);
}

.event-details p {
  margin: 0.25rem 0;
}

.event-details strong {
  color: var(--color-text);
}

@media (max-width: 768px) {
  .week-view {
    padding: 1rem;
  }

  .weekdays-slider {
    gap: 0.5rem;
  }

  .day-btn {
    padding: 0.5rem 0.75rem;
    min-width: 60px;
  }
}
</style>