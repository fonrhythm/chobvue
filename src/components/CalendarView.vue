<template>
  <div class="calendar-view" :style="calendarCssVariables">
    <!-- 日历网格 -->
    <div class="calendar-grid">
      <!-- 周头 (Sun-Sat) -->
      <div class="week-header">
        <div class="week-day" v-for="day in weekDays" :key="day">
          {{ day }}
        </div>
      </div>

      <!-- 日期格子 -->
      <div
        class="calendar-cell"
        v-for="day in calendarDays"
        :key="day.dateStr"
        :class="{
          'is-other-month': !day.isCurrentMonth,
          'is-today': day.isToday,
        }"
        @click="selectDate(day)"
      >
        <!-- 日期数字 -->
        <div class="cell-header">
          <span class="date-number">{{ day.date }}</span>
          <span v-if="day.eventCount > 3" class="event-indicator">
            +{{ day.eventCount - 3 }}
          </span>
        </div>

        <!-- 事件标签区 -->
        <div class="cell-events">
          <div
            v-for="(event, idx) in day.events.slice(0, 3)"
            :key="idx"
            class="event-chip"
            :class="getChipClasses(event)"
            :style="getChipStyle(event)"
          >
            <!-- 官方标记星星 -->
            <span v-if="event.isofficial" class="chip-star">★</span>
            <!-- 艺人名称 -->
            <span class="chip-text">{{ event.name }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 日期详情弹窗 -->
    <Teleport to="body" v-if="selectedDate">
      <div class="modal-overlay" @click.self="selectedDate = null">
        <div class="modal-content">
          <div class="modal-header">
            <div>
              <h3 class="modal-title">{{ formatDate(selectedDate.date) }}</h3>
              <p class="modal-subtitle">
                {{ getWeekdayName(selectedDate.date) }} · 共 {{ selectedDate.eventCount }} 项日程
              </p>
            </div>
            <button class="modal-close" @click="selectedDate = null">✕</button>
          </div>

          <div class="modal-body">
            <!-- 全天活动 -->
            <div v-if="selectedDate.allDayEvents.length > 0" class="event-section">
              <div class="section-title">全天 / 跨天</div>
              <div class="event-list">
                <div
                  v-for="(event, idx) in selectedDate.allDayEvents"
                  :key="idx"
                  class="event-item"
                  :style="getChipStyle(event)"
                  :class="getChipClasses(event)"
                >
                  {{ event.name }}
                </div>
              </div>
            </div>

            <!-- 时间线活动 -->
            <div v-if="selectedDate.timedEvents.length > 0" class="event-section">
              <div class="section-title">时间轴日程</div>
              <div class="timeline">
                <div
                  v-for="(event, idx) in selectedDate.timedEvents"
                  :key="idx"
                  class="timeline-item"
                >
                  <span class="timeline-dot"></span>
                  <div class="timeline-content">
                    <div class="time-range">{{ event.time || event.sale_time }}</div>
                    <div class="event-name">{{ event.name }}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="modal-footer">
            <button class="btn-secondary" @click="selectedDate = null">关闭</button>
            <button class="btn-primary">+ 在这天新增</button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script>
import { computed, ref } from 'vue'
import { useViewStore } from '@/stores/view'
import { useEventsStore } from '@/stores/events'
import { getCategoryColor, getOfficialChipStyle, getFanChipStyle } from '@/utils/config'

export default {
  name: 'CalendarView',
  setup() {
    const viewStore = useViewStore()
    const eventsStore = useEventsStore()
    const selectedDate = ref(null)

    const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

    // 计算当前月份的日历数据
    const calendarDays = computed(() => {
      const year = viewStore.currentYear
      const month = viewStore.currentMonth
      const firstDay = new Date(year, month, 1)
      const lastDay = new Date(year, month + 1, 0)
      const startDate = new Date(firstDay)
      startDate.setDate(startDate.getDate() - firstDay.getDay())

      const days = []
      const cellsNeeded = Math.ceil((startDate.getDay() + lastDay.getDate()) / 7) * 7

      for (let i = 0; i < cellsNeeded; i++) {
        const date = new Date(startDate)
        date.setDate(date.getDate() + i)

        const dateStr = formatDateStr(date)
        const dayEvents = eventsStore.getEventsByDate(dateStr)

        days.push({
          date: date.getDate(),
          dateStr,
          fullDate: date,
          isCurrentMonth: date.getMonth() === month,
          isToday: isToday(date),
          events: dayEvents,
          eventCount: dayEvents.length,
          allDayEvents: dayEvents.filter(e => !e.time),
          timedEvents: dayEvents.filter(e => e.time),
        })
      }

      return days
    })

    // CSS 变量映射
    const calendarCssVariables = computed(() => {
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

    // 获取芯片样式（背景色、边框等）
    const getChipStyle = (event) => {
      const category = event.category || 'other'
      const region = viewStore.currentRegion

      if (event.isofficial) {
        const officialStyle = getOfficialChipStyle(category, region)
        return {
          borderColor: officialStyle.borderColor,
          color: officialStyle.color,
          backgroundColor: 'transparent',
          border: `1.5px solid ${officialStyle.borderColor}`,
        }
      } else {
        const fanStyle = getFanChipStyle(category, region)
        return {
          backgroundColor: fanStyle.bg,
          color: fanStyle.text,
          border: 'none',
        }
      }
    }

    // 日期选择
    const selectDate = (day) => {
      if (day.eventCount > 0) {
        selectedDate.value = day
      }
    }

    // 日期格式化
    const formatDateStr = (date) => {
      const year = date.getFullYear()
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const day = String(date.getDate()).padStart(2, '0')
      return `${year}-${month}-${day}`
    }

    const formatDate = (date) => {
      return date.toLocaleDateString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
      })
    }

    const getWeekdayName = (date) => {
      const names = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六']
      return names[date.getDay()]
    }

    const isToday = (date) => {
      const today = new Date()
      return (
        date.getFullYear() === today.getFullYear() &&
        date.getMonth() === today.getMonth() &&
        date.getDate() === today.getDate()
      )
    }

    return {
      calendarDays,
      calendarCssVariables,
      selectedDate,
      weekDays,
      getChipClasses,
      getChipStyle,
      selectDate,
      formatDate,
      getWeekdayName,
    }
  },
}
</script>

<style scoped>
.calendar-view {
  width: 100%;
  background-color: var(--bg);
  padding: 1rem;
  border-radius: 0.75rem;
}

/* ============ 日历网格 ============ */
.calendar-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 0.5rem;
  background-color: var(--surface);
  padding: 1rem;
  border-radius: 0.5rem;
  border: 1px solid var(--border);
}

.week-header {
  display: contents;
}

.week-day {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 2.5rem;
  font-weight: 600;
  color: var(--muted);
  font-size: 0.875rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  border-bottom: 1px solid var(--border-soft);
  padding-bottom: 0.5rem;
}

/* ============ 日期格子 ============ */
.calendar-cell {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  min-height: 7rem;
  padding: 0.75rem;
  background-color: var(--surface);
  border: 1px solid var(--border);
  border-radius: 0.375rem;
  transition: all 0.2s ease;
  cursor: pointer;
}

.calendar-cell:hover {
  border-color: var(--c-gl);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.calendar-cell.is-other-month {
  opacity: 0.4;
  background-color: var(--bg);
}

.calendar-cell.is-today {
  background-color: var(--border-soft);
  border-color: var(--c-gl);
}

/* 格子头部 */
.cell-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.date-number {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 1.5rem;
  height: 1.5rem;
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--text);
  border-radius: 50%;
}

.calendar-cell:hover .date-number {
  background-color: var(--border-soft);
  color: var(--c-gl);
}

.event-indicator {
  font-size: 0.75rem;
  color: var(--muted);
  font-weight: 500;
}

/* 事件区域 */
.cell-events {
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
  flex: 1;
  overflow: hidden;
}

/* ============ 芯片样式 ============ */
.event-chip {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.375rem 0.75rem;
  border-radius: 0.375rem;
  font-size: 0.75rem;
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  transition: all 0.2s ease;
  position: relative;
}

.event-chip:hover {
  transform: translateX(2px);
}

/* 官方样式（镶边 + 星星） */
.event-chip.is-official {
  background-color: transparent;
}

.event-chip.is-official .chip-star {
  margin-right: -0.25rem;
  font-size: 0.625rem;
}

/* 粉丝样式（填充） */
.event-chip.is-fan {
  border: none;
}

.chip-star {
  flex-shrink: 0;
  font-size: 0.75rem;
}

.chip-text {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* ============ 模态框 ============ */
.modal-overlay {
  position: fixed;
  inset: 0;
  z-index: 50;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: rgba(0, 0, 0, 0.25);
  backdrop-filter: blur(4px);
  padding: 1rem;
}

.modal-content {
  width: 100%;
  max-width: 28rem;
  background-color: var(--surface);
  border-radius: 1rem;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
  border: 1px solid var(--border);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  max-height: 85vh;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 1.25rem;
  border-bottom: 1px solid var(--border);
  background-color: rgba(0, 0, 0, 0.025);
}

.modal-title {
  font-size: 1rem;
  font-weight: 600;
  color: var(--text);
  margin: 0;
}

.modal-subtitle {
  font-size: 0.75rem;
  color: var(--muted);
  margin: 0.25rem 0 0;
}

.modal-close {
  padding: 0.375rem;
  font-size: 1.25rem;
  color: var(--muted);
  background: none;
  border: none;
  border-radius: 0.375rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.modal-close:hover {
  background-color: var(--border-soft);
  color: var(--text);
}

.modal-body {
  padding: 1.25rem;
  overflow-y: auto;
  flex: 1;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
  padding: 1rem 1.25rem;
  border-top: 1px solid var(--border);
  background-color: rgba(0, 0, 0, 0.025);
}

/* ============ 事件部分 ============ */
.event-section {
  margin-bottom: 1.5rem;
}

.event-section:last-child {
  margin-bottom: 0;
}

.section-title {
  font-size: 0.6875rem;
  font-weight: 600;
  color: var(--muted);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 0.75rem;
}

.event-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.event-item {
  padding: 0.75rem;
  border-radius: 0.75rem;
  font-size: 0.875rem;
  font-weight: 500;
}

/* ============ 时间线 ============ */
.timeline {
  position: relative;
  border-left: 2px solid var(--border);
  margin-left: 0.5rem;
  padding-left: 1rem;
  space: 1rem;
}

.timeline-item {
  position: relative;
  margin-bottom: 1rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.timeline-item:hover {
  transform: translateX(4px);
}

.timeline-dot {
  position: absolute;
  left: -0.9375rem;
  top: 0.25rem;
  width: 0.625rem;
  height: 0.625rem;
  border-radius: 50%;
  background-color: var(--c-gl);
  border: 3px solid var(--surface);
  box-shadow: 0 0 0 2px var(--border);
}

.timeline-content {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.time-range {
  font-size: 0.6875rem;
  color: var(--muted);
  font-family: monospace;
}

.event-name {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--text);
}

/* ============ 按钮 ============ */
.btn-secondary,
.btn-primary {
  padding: 0.5rem 1rem;
  font-size: 0.75rem;
  font-weight: 500;
  border-radius: 0.75rem;
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-secondary {
  color: var(--sub);
  background-color: transparent;
  border: 1px solid var(--border);
}

.btn-secondary:hover {
  background-color: var(--border-soft);
}

.btn-primary {
  color: #fff;
  background-color: var(--c-gl);
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
}

.btn-primary:hover {
  opacity: 0.9;
}

/* ============ 响应式设计 ============ */
@media (max-width: 768px) {
  .calendar-cell {
    min-height: 5rem;
    padding: 0.5rem;
  }

  .event-chip {
    font-size: 0.7rem;
    padding: 0.25rem 0.5rem;
  }

  .cell-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.25rem;
  }

  .date-number {
    width: 1.25rem;
    height: 1.25rem;
    font-size: 0.75rem;
  }

  .modal-content {
    max-width: 100%;
  }
}
</style>