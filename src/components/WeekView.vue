<template>
  <div class="week-view" :style="weekCssVariables">
    <!-- 周选择器 -->
    <div class="week-selector">
      <button class="nav-button" @click="previousWeek">‹</button>
      
      <div class="week-dates">
        <button
          v-for="day in weekDates"
          :key="day.dateStr"
          class="week-date"
          :class="{ 'is-selected': day.isSelected, 'is-today': day.isToday }"
          @click="selectDate(day)"
        >
          <span class="day-name">{{ day.dayName }}</span>
          <span class="date-num">{{ day.date }}</span>
        </button>
      </div>

      <button class="nav-button" @click="nextWeek">›</button>
    </div>

    <!-- 事件列表 -->
    <div class="events-container">
      <div class="events-header">
        <h3 class="selected-date">{{ formatSelectedDate() }}</h3>
        <span class="event-count">共 {{ selectedDayEvents.length }} 项日程</span>
      </div>

      <!-- 事件列表 -->
      <div v-if="selectedDayEvents.length > 0" class="events-list">
        <div
          v-for="(event, idx) in selectedDayEvents"
          :key="idx"
          class="event-card"
          :class="getChipClasses(event)"
          :style="getChipStyle(event)"
        >
          <!-- 左边颜色条 -->
          <div class="event-color-bar"></div>

          <!-- 内容区 -->
          <div class="event-content">
            <div class="event-header">
              <h4 class="event-name">
                <span v-if="event.isofficial" class="official-badge">★</span>
                {{ event.name }}
              </h4>
              <span v-if="event.activity" class="activity-type">
                {{ event.activity }}
              </span>
            </div>

            <div class="event-details">
              <p v-if="event.time" class="detail-item">
                <span class="label">⏰ 时间：</span>
                <span>{{ event.time }}</span>
              </p>
              <p v-if="event.venue" class="detail-item">
                <span class="label">📍 场地：</span>
                <span>{{ event.venue }}, {{ event.city }}</span>
              </p>
              <p v-if="event.price" class="detail-item">
                <span class="label">💵 价格：</span>
                <span>{{ event.price }}</span>
              </p>
              <p v-if="event.note" class="detail-item">
                <span class="label">📝 备注：</span>
                <span>{{ event.note }}</span>
              </p>
            </div>

            <!-- 操作按钮 -->
            <div class="event-actions">
              <button v-if="event.ticket_url" class="btn-link" @click="openLink(event.ticket_url)">
                🎫 购票
              </button>
              <button class="btn-favorite" :class="{ active: isFavorited(event.id) }" @click="toggleFavorite(event.id)">
                ♥
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- 空状态 -->
      <div v-else class="empty-state">
        <div class="empty-icon">📅</div>
        <p class="empty-text">这一天没有日程</p>
      </div>
    </div>
  </div>
</template>

<script>
import { computed, ref } from 'vue'
import { useViewStore } from '@/stores/view'
import { useEventsStore } from '@/stores/events'
import { useUserStore } from '@/stores/user'
import { getOfficialChipStyle, getFanChipStyle } from '@/utils/config'

export default {
  name: 'WeekView',
  setup() {
    const viewStore = useViewStore()
    const eventsStore = useEventsStore()
    const userStore = useUserStore()

    const selectedDate = ref(new Date())

    // 计算周日期
    const weekDates = computed(() => {
      const date = new Date(selectedDate.value)
      const dayOfWeek = date.getDay()
      const diff = date.getDate() - dayOfWeek

      const weekStart = new Date(date.setDate(diff))
      const dates = []

      for (let i = 0; i < 7; i++) {
        const day = new Date(weekStart)
        day.setDate(day.getDate() + i)

        const dateStr = formatDateStr(day)
        const isToday = isDateToday(day)

        dates.push({
          dateStr,
          fullDate: day,
          date: day.getDate(),
          dayName: getDayName(day),
          isToday,
          isSelected: dateStr === formatDateStr(selectedDate.value),
        })
      }

      return dates
    })

    // 获取选中日期的事件
    const selectedDayEvents = computed(() => {
      const dateStr = formatDateStr(selectedDate.value)
      return eventsStore.getEventsByDate(dateStr)
    })

    // CSS 变量
    const weekCssVariables = computed(() => {
      const colors = viewStore.currentColors
      const vars = {}
      Object.entries(colors).forEach(([key, value]) => {
        vars[`--${key}`] = value
      })
      return vars
    })

    // 获取芯片样式类
    const getChipClasses = (event) => {
      const category = event.category || 'other'
      return {
        [`category-${category}`]: true,
        'is-official': event.isofficial,
        'is-fan': !event.isofficial,
      }
    }

    // 获取芯片样式
    const getChipStyle = (event) => {
      const category = event.category || 'other'
      const region = viewStore.currentRegion

      if (event.isofficial) {
        const officialStyle = getOfficialChipStyle(category, region)
        return {
          '--border-color': officialStyle.borderColor,
          '--text-color': officialStyle.color,
          '--bg-color': 'transparent',
        }
      } else {
        const fanStyle = getFanChipStyle(category, region)
        return {
          '--border-color': fanStyle.bg,
          '--text-color': fanStyle.text,
          '--bg-color': fanStyle.bg,
        }
      }
    }

    // 日期格式化
    const formatDateStr = (date) => {
      const year = date.getFullYear()
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const day = String(date.getDate()).padStart(2, '0')
      return `${year}-${month}-${day}`
    }

    const formatSelectedDate = () => {
      return selectedDate.value.toLocaleDateString('zh-CN', {
        month: '2-digit',
        day: '2-digit',
        weekday: 'long',
      })
    }

    const getDayName = (date) => {
      const names = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
      return names[date.getDay()]
    }

    const isDateToday = (date) => {
      const today = new Date()
      return (
        date.getFullYear() === today.getFullYear() &&
        date.getMonth() === today.getMonth() &&
        date.getDate() === today.getDate()
      )
    }

    // 操作函数
    const selectDate = (day) => {
      selectedDate.value = new Date(day.fullDate)
    }

    const previousWeek = () => {
      selectedDate.value = new Date(selectedDate.value.setDate(selectedDate.value.getDate() - 7))
    }

    const nextWeek = () => {
      selectedDate.value = new Date(selectedDate.value.setDate(selectedDate.value.getDate() + 7))
    }

    const openLink = (url) => {
      if (url) {
        window.open(url, '_blank')
      }
    }

    const toggleFavorite = (eventId) => {
      userStore.toggleFavorite(eventId)
    }

    const isFavorited = (eventId) => {
      return userStore.favorites.includes(eventId)
    }

    return {
      weekDates,
      selectedDayEvents,
      weekCssVariables,
      selectedDate,
      getChipClasses,
      getChipStyle,
      selectDate,
      previousWeek,
      nextWeek,
      openLink,
      toggleFavorite,
      isFavorited,
      formatSelectedDate,
    }
  },
}
</script>

<style scoped>
.week-view {
  width: 100%;
  background-color: var(--bg);
  padding: 1.5rem;
  border-radius: 0.75rem;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

/* ============ 周选择器 ============ */
.week-selector {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 1rem;
  background-color: var(--surface);
  border: 1px solid var(--border);
  border-radius: 0.75rem;
}

.nav-button {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2.5rem;
  height: 2.5rem;
  padding: 0;
  font-size: 1.5rem;
  background-color: var(--border-soft);
  border: 1px solid var(--border);
  border-radius: 0.5rem;
  cursor: pointer;
  transition: all 0.2s ease;
  color: var(--text);
}

.nav-button:hover {
  background-color: var(--c-gl);
  border-color: var(--c-gl);
  color: white;
}

.week-dates {
  display: flex;
  gap: 0.75rem;
  flex: 1;
  overflow-x: auto;
  padding: 0.25rem;
  scroll-behavior: smooth;
}

.week-date {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-width: 4.5rem;
  padding: 0.75rem;
  background-color: var(--border-soft);
  border: 1px solid var(--border);
  border-radius: 0.5rem;
  cursor: pointer;
  transition: all 0.2s ease;
  color: var(--text);
  font-weight: 500;
}

.week-date:hover {
  background-color: var(--c-gl);
  border-color: var(--c-gl);
  color: white;
}

.week-date.is-selected {
  background-color: var(--c-gl);
  border-color: var(--c-gl);
  color: white;
  font-weight: 600;
}

.week-date.is-today {
  border: 2px solid var(--c-gl);
}

.day-name {
  font-size: 0.75rem;
  opacity: 0.8;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.date-num {
  font-size: 1rem;
  font-weight: 600;
  margin-top: 0.25rem;
}

/* ============ 事件容器 ============ */
.events-container {
  background-color: var(--surface);
  border: 1px solid var(--border);
  border-radius: 0.75rem;
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.events-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 2px solid var(--border);
  padding-bottom: 1rem;
}

.selected-date {
  font-size: 1.125rem;
  font-weight: 700;
  color: var(--text);
  margin: 0;
}

.event-count {
  font-size: 0.875rem;
  color: var(--muted);
  font-weight: 500;
}

/* ============ 事件列表 ============ */
.events-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.event-card {
  display: flex;
  gap: 1rem;
  padding: 1rem;
  background-color: var(--bg);
  border: 1px solid var(--border-soft);
  border-radius: 0.75rem;
  transition: all 0.2s ease;
  cursor: pointer;
}

.event-card:hover {
  border-color: var(--c-gl);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  transform: translateY(-2px);
}

/* 官方样式 */
.event-card.is-official {
  border: 1.5px solid var(--border-color);
  background-color: rgba(255, 255, 255, 0.5);
}

/* 粉丝样式 */
.event-card.is-fan {
  background-color: rgba(255, 255, 255, 0.8);
}

.event-color-bar {
  width: 4px;
  background-color: var(--border-color);
  border-radius: 2px;
  flex-shrink: 0;
}

.event-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  min-width: 0;
}

.event-header {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  justify-content: space-between;
}

.event-name {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1rem;
  font-weight: 600;
  color: var(--text);
  margin: 0;
  flex: 1;
}

.official-badge {
  color: var(--border-color);
  font-size: 0.875rem;
  flex-shrink: 0;
}

.activity-type {
  display: inline-block;
  padding: 0.25rem 0.75rem;
  font-size: 0.75rem;
  font-weight: 500;
  background-color: var(--border);
  color: var(--muted);
  border-radius: 0.375rem;
  white-space: nowrap;
  flex-shrink: 0;
}

/* ============ 事件详情 ============ */
.event-details {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.detail-item {
  display: flex;
  gap: 0.5rem;
  font-size: 0.875rem;
  color: var(--text);
  margin: 0;
  line-height: 1.4;
}

.label {
  color: var(--muted);
  font-weight: 500;
  flex-shrink: 0;
}

/* ============ 操作按钮 ============ */
.event-actions {
  display: flex;
  gap: 0.75rem;
  margin-top: 0.5rem;
}

.btn-link,
.btn-favorite {
  padding: 0.375rem 0.75rem;
  font-size: 0.75rem;
  font-weight: 500;
  border-radius: 0.375rem;
  border: 1px solid var(--border);
  background-color: var(--surface);
  color: var(--text);
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-link:hover {
  background-color: var(--border-soft);
  border-color: var(--c-gl);
}

.btn-favorite {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2rem;
  padding: 0;
  color: var(--muted);
  flex-shrink: 0;
}

.btn-favorite:hover {
  color: #e74c3c;
  border-color: #e74c3c;
}

.btn-favorite.active {
  color: #e74c3c;
  background-color: rgba(231, 76, 60, 0.1);
  border-color: #e74c3c;
}

/* ============ 空状态 ============ */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  padding: 3rem 1rem;
  color: var(--muted);
}

.empty-icon {
  font-size: 3rem;
  opacity: 0.5;
}

.empty-text {
  font-size: 0.875rem;
  margin: 0;
}

/* ============ 响应式设计 ============ */
@media (max-width: 768px) {
  .week-view {
    padding: 1rem;
    gap: 1rem;
  }

  .week-selector {
    padding: 0.75rem;
  }

  .week-dates {
    gap: 0.5rem;
  }

  .week-date {
    min-width: 3.5rem;
    padding: 0.5rem;
    font-size: 0.875rem;
  }

  .event-card {
    flex-direction: column;
    gap: 0.75rem;
  }

  .event-color-bar {
    height: 4px;
    width: 100%;
  }

  .event-header {
    flex-direction: column;
  }

  .activity-type {
    align-self: flex-start;
  }
}
</style>