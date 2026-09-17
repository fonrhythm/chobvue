<template>
  <div class="calendar-page">
    <ChobCalendar
      :events="events"
      :tasks="tasks"
      :initial-region="region"
      @event-click="handleEventClick"
      @task-click="handleTaskClick"
    />
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import ChobCalendar from '@/components/calendar/ChobCalendar.vue'
import {
  getEventsByRegion,
  tasksData,
} from '@/utils/calendar/sample-data.js'

// Props
const props = defineProps({
  region: {
    type: String,
    default: 'oversea',
  },
})

// 数据
const events = computed(() => {
  return getEventsByRegion(props.region)
})

const tasks = tasksData

// 方法
const handleEventClick = (event) => {
  console.log('点击了事件:', event)
  // 你可以在这里打开详情页面或弹窗
}

const handleTaskClick = (task) => {
  console.log('点击了任务:', task)
  // 你可以在这里打开任务详情
}
</script>

<style scoped>
.calendar-page {
  width: 100%;
  min-height: 100vh;
  background: var(--bg);
}
</style>
