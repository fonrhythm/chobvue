<template>
  <div class="task-view">
    <div class="task-header">
      <h2>待办事项</h2>
      <div class="task-filters">
        <input 
          v-model="searchKeyword"
          type="text"
          placeholder="搜索事项..."
          class="search-input"
        />
      </div>
    </div>

    <div v-if="filteredTasks.length === 0" class="no-tasks">
      <p>暂无事项</p>
    </div>

    <div v-else class="tasks-list">
      <div 
        v-for="task in filteredTasks" 
        :key="task.id"
        @click="selectedTask = task"
        :class="{ 'is-official': task.isOfficial }"
        class="task-card"
      >
        <div class="task-indicator" :style="getTaskColor(task)"></div>
        
        <div class="task-content">
          <h3 class="task-title">
            {{ task.title }}
            <span v-if="task.isOfficial" class="official-star">★</span>
          </h3>
          
          <p class="task-description">{{ task.description }}</p>
          
          <div class="task-meta">
            <span class="task-date">📅 {{ task.date }}</span>
            <span v-if="task.time" class="task-time">⏰ {{ task.time }}</span>
            <span v-if="task.category" class="task-category">{{ task.category }}</span>
          </div>
        </div>

        <div v-if="task.actionUrl" class="task-action">
          <a :href="task.actionUrl" target="_blank" rel="noopener noreferrer" @click.stop class="action-link">
            {{ task.actionLabel || '了解更多' }} →
          </a>
        </div>
      </div>
    </div>

    <!-- 任务详情弹窗 -->
    <div v-if="selectedTask" class="modal-overlay" @click="selectedTask = null">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>{{ selectedTask.title }}</h3>
          <button @click="selectedTask = null" class="close-btn">✕</button>
        </div>
        <div class="modal-body">
          <p>{{ selectedTask.description }}</p>
          <div class="task-details">
            <p><strong>日期：</strong> {{ selectedTask.date }}</p>
            <p v-if="selectedTask.time"><strong>时间：</strong> {{ selectedTask.time }}</p>
            <p v-if="selectedTask.category"><strong>类型：</strong> {{ selectedTask.category }}</p>
            <p v-if="selectedTask.actionUrl">
              <strong>操作：</strong> 
              <a :href="selectedTask.actionUrl" target="_blank">{{ selectedTask.actionLabel || '打开链接' }}</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useViewStore } from '@/stores/view'

const viewStore = useViewStore()
const selectedTask = ref(null)
const searchKeyword = ref('')

// 示例任务数据
const tasks = ref([
  {
    id: '1',
    title: 'Beyer 演唱会抢票',
    description: '9月15日10点开放购票，务必提前准备',
    date: '2026-09-15',
    time: '10:00',
    category: '购票',
    isOfficial: true,
    actionUrl: 'https://ticket.example.com',
    actionLabel: '前往购票'
  },
  {
    id: '2',
    title: 'Gemini 演唱会门票验证',
    description: '持票入场需要出示身份证和票券',
    date: '2026-09-17',
    time: '19:00',
    category: '演出提醒',
    isOfficial: false,
    actionUrl: null
  },
  {
    id: '3',
    title: 'TOPTAP/MINLEE 粉丝见面会报名',
    description: '填表报名，截止时间9月20日',
    date: '2026-09-20',
    category: '填表报名',
    isOfficial: true,
    actionUrl: 'https://form.example.com',
    actionLabel: '填写表单'
  }
])

const filteredTasks = computed(() => {
  if (!searchKeyword.value) return tasks.value
  
  return tasks.value.filter(task =>
    task.title.toLowerCase().includes(searchKeyword.value.toLowerCase()) ||
    task.description.toLowerCase().includes(searchKeyword.value.toLowerCase())
  )
})

function getTaskColor(task) {
  const colors = ['#FFB6C1', '#87CEEB', '#F0E68C', '#98FB98', '#DDA0DD']
  const colorIndex = task.category?.charCodeAt(0) % colors.length || 0
  return {
    backgroundColor: colors[colorIndex]
  }
}
</script>

<style scoped>
.task-view {
  padding: 2rem;
  background: var(--color-background);
  color: var(--color-text);
  min-height: 100vh;
}

.task-header {
  margin-bottom: 2rem;
}

.task-header h2 {
  font-size: 2rem;
  margin: 0 0 1rem 0;
}

.task-filters {
  display: flex;
  gap: 1rem;
}

.search-input {
  flex: 1;
  padding: 0.75rem 1rem;
  border: 1px solid var(--color-border);
  background: var(--color-surface);
  border-radius: 8px;
  font-size: 0.9rem;
  color: var(--color-text);
  transition: all 0.2s;
}

.search-input:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px rgba(0, 0, 0, 0.05);
}

.no-tasks {
  text-align: center;
  padding: 3rem 2rem;
  color: var(--color-textSecondary);
  font-size: 1rem;
}

.tasks-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 1.5rem;
}

.task-card {
  display: flex;
  gap: 1rem;
  padding: 1.5rem;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s;
  position: relative;
}

.task-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
  border-color: var(--color-primary);
}

.task-indicator {
  width: 4px;
  height: 100%;
  border-radius: 4px;
  flex-shrink: 0;
  transition: all 0.3s;
}

.task-card:hover .task-indicator {
  width: 6px;
  box-shadow: 0 0 8px rgba(0, 0, 0, 0.2);
}

.task-card.is-official::before {
  content: '★';
  position: absolute;
  top: 0.75rem;
  right: 0.75rem;
  font-size: 1.25rem;
  opacity: 0.6;
}

.task-content {
  flex: 1;
  min-width: 0;
}

.task-title {
  margin: 0 0 0.5rem 0;
  font-size: 1.125rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.official-star {
  font-size: 0.85rem;
  color: var(--color-primary);
}

.task-description {
  margin: 0 0 1rem 0;
  font-size: 0.875rem;
  color: var(--color-textSecondary);
  line-height: 1.4;
}

.task-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  font-size: 0.8rem;
}

.task-date,
.task-time,
.task-category {
  display: inline-block;
  padding: 0.25rem 0.5rem;
  background: var(--color-background);
  border-radius: 4px;
  color: var(--color-textSecondary);
}

.task-action {
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid var(--color-border);
}

.action-link {
  font-size: 0.875rem;
  color: var(--color-primary);
  text-decoration: none;
  font-weight: 500;
  transition: all 0.2s;
}

.action-link:hover {
  color: var(--color-primary);
  text-decoration: underline;
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
  padding: 2rem;
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
  margin-bottom: 1.5rem;
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
  font-size: 0.9rem;
  line-height: 1.6;
  margin-bottom: 1rem;
}

.task-details {
  margin-top: 1.5rem;
  padding-top: 1.5rem;
  border-top: 1px solid var(--color-border);
  font-size: 0.875rem;
}

.task-details p {
  margin: 0.5rem 0;
}

.task-details a {
  color: var(--color-primary);
  text-decoration: none;
  font-weight: 500;
}

.task-details a:hover {
  text-decoration: underline;
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

@media (max-width: 768px) {
  .task-view {
    padding: 1rem;
  }

  .tasks-list {
    grid-template-columns: 1fr;
  }
}
</style>