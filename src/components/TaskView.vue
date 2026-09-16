<template>
  <div class="task-view" :style="taskCssVariables">
    <!-- 任务筛选器 -->
    <div class="task-filters">
      <div class="filter-group">
        <button
          v-for="status in taskStatuses"
          :key="status.id"
          class="filter-btn"
          :class="{ active: selectedStatus === status.id }"
          @click="selectedStatus = status.id"
        >
          {{ status.label }}
        </button>
      </div>

      <button class="add-task-btn" @click="showCreateTask = true">
        + 新建事项
      </button>
    </div>

    <!-- 任务列表 -->
    <div class="tasks-container">
      <!-- 按时间分组 -->
      <div
        v-for="group in groupedTasks"
        :key="group.dateStr"
        class="task-group"
      >
        <div class="group-header">
          <span class="group-date">{{ formatGroupDate(group.date) }}</span>
          <span class="group-count">{{ group.tasks.length }} 项</span>
        </div>

        <div class="task-list">
          <div
            v-for="task in group.tasks"
            :key="task.id"
            class="task-card"
            :class="getTaskClasses(task)"
            :style="getTaskStyle(task)"
          >
            <!-- 左边颜色条 -->
            <div class="task-color-bar"></div>

            <!-- 内容区 -->
            <div class="task-content">
              <div class="task-header">
                <div class="task-title-section">
                  <h4 class="task-title">
                    <span v-if="task.isofficial" class="official-badge">★</span>
                    {{ task.title }}
                  </h4>
                  <span v-if="task.category" class="task-category">
                    {{ task.category }}
                  </span>
                </div>

                <div class="task-status">
                  <span
                    class="status-badge"
                    :class="{ [`status-${task.status}`]: true }"
                  >
                    {{ getStatusLabel(task.status) }}
                  </span>
                </div>
              </div>

              <!-- 任务描述 -->
              <div v-if="task.description" class="task-description">
                {{ task.description }}
              </div>

              <!-- 关键信息 -->
              <div class="task-meta">
                <div v-if="task.start_date" class="meta-item">
                  <span class="meta-icon">📅</span>
                  <span class="meta-text">
                    {{ formatTaskDate(task.start_date) }}
                    <span v-if="task.end_date">
                      - {{ formatTaskDate(task.end_date) }}
                    </span>
                  </span>
                </div>

                <div v-if="task.contact_info" class="meta-item">
                  <span class="meta-icon">👤</span>
                  <span class="meta-text">{{ task.contact_info }}</span>
                </div>

                <div v-if="task.contact_method" class="meta-item">
                  <span class="meta-icon">📞</span>
                  <span class="meta-text">{{ task.contact_method }}</span>
                </div>
              </div>

              <!-- 操作按钮 -->
              <div class="task-actions">
                <button
                  v-if="task.link"
                  class="btn-link"
                  @click="openLink(task.link)"
                >
                  🔗 查看详情
                </button>
                <button
                  class="btn-status"
                  :class="{ active: task.status === 'completed' }"
                  @click="toggleTaskStatus(task.id)"
                >
                  <span v-if="task.status === 'pending'">✓ 标记完成</span>
                  <span v-else>↩ 标记未完成</span>
                </button>
              </div>
            </div>

            <!-- 右上角快速菜单 -->
            <div class="task-menu">
              <button class="menu-btn" @click="deleteTask(task.id)">···</button>
            </div>
          </div>
        </div>
      </div>

      <!-- 空状态 -->
      <div v-if="filteredTasks.length === 0" class="empty-state">
        <div class="empty-icon">📋</div>
        <p class="empty-text">暂无事项</p>
        <button class="btn-create-now" @click="showCreateTask = true">
          现在创建第一项事项
        </button>
      </div>
    </div>

    <!-- 创建事项弹窗 -->
    <Teleport to="body" v-if="showCreateTask">
      <div class="modal-overlay" @click.self="showCreateTask = false">
        <div class="modal-content">
          <div class="modal-header">
            <h3>新建事项</h3>
            <button class="modal-close" @click="showCreateTask = false">✕</button>
          </div>

          <form class="task-form" @submit.prevent="submitNewTask">
            <!-- 标题 -->
            <div class="form-group">
              <label class="form-label">事项标题 *</label>
              <input
                v-model="newTask.title"
                type="text"
                placeholder="例如：抢票开始、订桌预定..."
                class="form-input"
              />
            </div>

            <!-- 描述 -->
            <div class="form-group">
              <label class="form-label">事项描述</label>
              <textarea
                v-model="newTask.description"
                placeholder="详细说明此事项..."
                class="form-textarea"
                rows="3"
              ></textarea>
            </div>

            <!-- 日期范围 -->
            <div class="form-row">
              <div class="form-group">
                <label class="form-label">开始日期 *</label>
                <input
                  v-model="newTask.start_date"
                  type="date"
                  class="form-input"
                />
              </div>
              <div class="form-group">
                <label class="form-label">结束日期</label>
                <input
                  v-model="newTask.end_date"
                  type="date"
                  class="form-input"
                />
              </div>
            </div>

            <!-- 分类 -->
            <div class="form-group">
              <label class="form-label">分类</label>
              <select v-model="newTask.category" class="form-input">
                <option value="">选择分类...</option>
                <option v-for="cat in categories" :key="cat" :value="cat">
                  {{ cat }}
                </option>
              </select>
            </div>

            <!-- 联系方式 -->
            <div class="form-row">
              <div class="form-group">
                <label class="form-label">联系人/方式</label>
                <input
                  v-model="newTask.contact_info"
                  type="text"
                  placeholder="例如：微博@xxx, 微信xxxx"
                  class="form-input"
                />
              </div>
              <div class="form-group">
                <label class="form-label">联系方法</label>
                <input
                  v-model="newTask.contact_method"
                  type="text"
                  placeholder="例如：私信、电话、邮件"
                  class="form-input"
                />
              </div>
            </div>

            <!-- 链接 -->
            <div class="form-group">
              <label class="form-label">相关链接</label>
              <input
                v-model="newTask.link"
                type="url"
                placeholder="https://..."
                class="form-input"
              />
            </div>

            <!-- 底部按钮 -->
            <div class="form-actions">
              <button
                type="button"
                class="btn-cancel"
                @click="showCreateTask = false"
              >
                取消
              </button>
              <button type="submit" class="btn-submit">创建事项</button>
            </div>
          </form>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script>
import { computed, ref } from 'vue'
import { useViewStore } from '@/stores/view'
import { useEventsStore } from '@/stores/events'
import { getOfficialChipStyle, getFanChipStyle } from '@/utils/config'

export default {
  name: 'TaskView',
  setup() {
    const viewStore = useViewStore()
    const eventsStore = useEventsStore()

    const selectedStatus = ref('all')
    const showCreateTask = ref(false)
    const newTask = ref({
      title: '',
      description: '',
      category: '',
      start_date: '',
      end_date: '',
      contact_info: '',
      contact_method: '',
      link: '',
      status: 'pending',
      isofficial: false,
    })

    const taskStatuses = [
      { id: 'all', label: '全部' },
      { id: 'pending', label: '待进行' },
      { id: 'in-progress', label: '进行中' },
      { id: 'completed', label: '已完成' },
    ]

    const categories = ['抢票', '订桌', '应援', '打卡', '其他']

    // 获取所有任务
    const allTasks = computed(() => {
      return eventsStore.tasks || []
    })

    // 过滤任务
    const filteredTasks = computed(() => {
      if (selectedStatus.value === 'all') {
        return allTasks.value
      }
      return allTasks.value.filter((task) => task.status === selectedStatus.value)
    })

    // 按日期分组
    const groupedTasks = computed(() => {
      const groups = {}

      filteredTasks.value.forEach((task) => {
        const dateStr = task.start_date
        if (!groups[dateStr]) {
          groups[dateStr] = {
            dateStr,
            date: new Date(dateStr),
            tasks: [],
          }
        }
        groups[dateStr].tasks.push(task)
      })

      // 按日期排序
      return Object.values(groups).sort((a, b) => a.date - b.date)
    })

    // CSS 变量
    const taskCssVariables = computed(() => {
      const colors = viewStore.currentColors
      const vars = {}
      Object.entries(colors).forEach(([key, value]) => {
        vars[`--${key}`] = value
      })
      return vars
    })

    // 获取任务样式类
    const getTaskClasses = (task) => {
      const category = task.category || 'other'
      return {
        [`category-${category}`]: true,
        'is-official': task.isofficial,
        'is-fan': !task.isofficial,
        [`status-${task.status}`]: true,
      }
    }

    // 获取任务样式
    const getTaskStyle = (task) => {
      const category = task.category || 'other'
      const region = viewStore.currentRegion

      if (task.isofficial) {
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

    // 格式化日期
    const formatGroupDate = (date) => {
      return date.toLocaleDateString('zh-CN', {
        month: 'numeric',
        day: 'numeric',
        weekday: 'short',
      })
    }

    const formatTaskDate = (dateStr) => {
      const date = new Date(dateStr)
      return date.toLocaleDateString('zh-CN', {
        month: 'numeric',
        day: 'numeric',
      })
    }

    const getStatusLabel = (status) => {
      const map = {
        pending: '待进行',
        'in-progress': '进行中',
        completed: '已完成',
      }
      return map[status] || status
    }

    // 操作函数
    const openLink = (url) => {
      if (url) {
        window.open(url, '_blank')
      }
    }

    const toggleTaskStatus = (taskId) => {
      const task = allTasks.value.find((t) => t.id === taskId)
      if (task) {
        task.status = task.status === 'completed' ? 'pending' : 'completed'
      }
    }

    const deleteTask = (taskId) => {
      if (confirm('确定要删除这项事项吗？')) {
        eventsStore.deleteTask(taskId)
      }
    }

    const submitNewTask = () => {
      if (!newTask.value.title || !newTask.value.start_date) {
        alert('请填写标题和开始日期')
        return
      }

      // 创建任务
      const task = {
        id: `task-${Date.now()}`,
        ...newTask.value,
      }

      eventsStore.addTask(task)

      // 重置表单
      newTask.value = {
        title: '',
        description: '',
        category: '',
        start_date: '',
        end_date: '',
        contact_info: '',
        contact_method: '',
        link: '',
        status: 'pending',
        isofficial: false,
      }

      showCreateTask.value = false
    }

    return {
      selectedStatus,
      showCreateTask,
      newTask,
      taskStatuses,
      categories,
      filteredTasks,
      groupedTasks,
      taskCssVariables,
      getTaskClasses,
      getTaskStyle,
      formatGroupDate,
      formatTaskDate,
      getStatusLabel,
      openLink,
      toggleTaskStatus,
      deleteTask,
      submitNewTask,
    }
  },
}
</script>

<style scoped>
.task-view {
  width: 100%;
  background-color: var(--bg);
  padding: 1.5rem;
  border-radius: 0.75rem;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

/* ============ 筛选器 ============ */
.task-filters {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 1rem;
  background-color: var(--surface);
  border: 1px solid var(--border);
  border-radius: 0.75rem;
  flex-wrap: wrap;
}

.filter-group {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.filter-btn {
  padding: 0.5rem 1rem;
  font-size: 0.875rem;
  font-weight: 500;
  background-color: var(--border-soft);
  border: 1px solid var(--border);
  border-radius: 2rem;
  cursor: pointer;
  transition: all 0.2s ease;
  color: var(--text);
}

.filter-btn:hover {
  background-color: var(--border);
  border-color: var(--c-gl);
}

.filter-btn.active {
  background-color: var(--c-gl);
  border-color: var(--c-gl);
  color: white;
  font-weight: 600;
}

.add-task-btn {
  padding: 0.5rem 1rem;
  font-size: 0.875rem;
  font-weight: 600;
  background-color: var(--c-gl);
  border: none;
  border-radius: 0.5rem;
  color: white;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
}

.add-task-btn:hover {
  opacity: 0.9;
  transform: translateY(-1px);
}

/* ============ 任务容器 ============ */
.tasks-container {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

/* ============ 任务分组 ============ */
.task-group {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.group-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.75rem 1rem;
  background-color: var(--border-soft);
  border-radius: 0.5rem;
  border-left: 4px solid var(--c-gl);
}

.group-date {
  font-size: 0.875rem;
  font-weight: 700;
  color: var(--text);
}

.group-count {
  font-size: 0.75rem;
  color: var(--muted);
  font-weight: 500;
}

/* ============ 任务列表 ============ */
.task-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.task-card {
  display: flex;
  gap: 1rem;
  padding: 1rem;
  background-color: var(--surface);
  border: 1px solid var(--border);
  border-radius: 0.75rem;
  transition: all 0.2s ease;
  position: relative;
}

.task-card:hover {
  border-color: var(--c-gl);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  transform: translateY(-2px);
}

/* 官方样式 */
.task-card.is-official {
  border: 1.5px solid var(--border-color);
}

/* 任务颜色条 */
.task-color-bar {
  width: 4px;
  background-color: var(--border-color);
  border-radius: 2px;
  flex-shrink: 0;
}

/* 任务内容 */
.task-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  min-width: 0;
}

.task-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
}

.task-title-section {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex: 1;
  min-width: 0;
}

.task-title {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1rem;
  font-weight: 600;
  color: var(--text);
  margin: 0;
  flex: 1;
  min-width: 0;
}

.official-badge {
  color: var(--border-color);
  font-size: 0.875rem;
  flex-shrink: 0;
}

.task-category {
  display: inline-block;
  padding: 0.25rem 0.625rem;
  font-size: 0.75rem;
  font-weight: 500;
  background-color: var(--border-soft);
  color: var(--text);
  border-radius: 0.375rem;
  white-space: nowrap;
  flex-shrink: 0;
}

.task-status {
  flex-shrink: 0;
}

.status-badge {
  display: inline-block;
  padding: 0.375rem 0.75rem;
  font-size: 0.75rem;
  font-weight: 600;
  border-radius: 0.375rem;
  white-space: nowrap;
}

.status-pending {
  background-color: #fef3c7;
  color: #92400e;
}

.status-in-progress {
  background-color: #dbeafe;
  color: #1e40af;
}

.status-completed {
  background-color: #dcfce7;
  color: #166534;
}

/* ============ 任务描述和元数据 ============ */
.task-description {
  font-size: 0.875rem;
  color: var(--sub);
  line-height: 1.5;
  margin: 0;
}

.task-meta {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-top: 0.5rem;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  color: var(--muted);
}

.meta-icon {
  flex-shrink: 0;
  font-size: 1rem;
}

.meta-text {
  flex: 1;
  min-width: 0;
}

/* ============ 任务操作 ============ */
.task-actions {
  display: flex;
  gap: 0.75rem;
  margin-top: 0.75rem;
  flex-wrap: wrap;
}

.btn-link,
.btn-status {
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

.btn-status {
  background-color: var(--border-soft);
}

.btn-status:hover {
  background-color: #d4f4dd;
  border-color: #10b981;
}

.btn-status.active {
  background-color: #d1fae5;
  border-color: #10b981;
  color: #065f46;
}

/* ============ 任务菜单 ============ */
.task-menu {
  position: absolute;
  right: 1rem;
  top: 1rem;
}

.menu-btn {
  padding: 0.25rem 0.5rem;
  font-size: 1rem;
  background: none;
  border: none;
  cursor: pointer;
  color: var(--muted);
  transition: all 0.2s ease;
}

.menu-btn:hover {
  color: var(--text);
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

.btn-create-now {
  padding: 0.5rem 1rem;
  font-size: 0.875rem;
  font-weight: 500;
  background-color: var(--c-gl);
  border: none;
  border-radius: 0.5rem;
  color: white;
  cursor: pointer;
  transition: all 0.2s ease;
  margin-top: 1rem;
}

.btn-create-now:hover {
  opacity: 0.9;
}

/* ============ 创建任务模态框 ============ */
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
  max-width: 32rem;
  background-color: var(--surface);
  border-radius: 1rem;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
  border: 1px solid var(--border);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  max-height: 90vh;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid var(--border);
  background-color: var(--border-soft);
}

.modal-header h3 {
  font-size: 1.125rem;
  font-weight: 700;
  color: var(--text);
  margin: 0;
}

.modal-close {
  padding: 0.375rem;
  font-size: 1.5rem;
  color: var(--muted);
  background: none;
  border: none;
  border-radius: 0.375rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.modal-close:hover {
  background-color: var(--border);
  color: var(--text);
}

/* ============ 表单 ============ */
.task-form {
  padding: 1.5rem;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  flex: 1;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.form-label {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--text);
}

.form-input,
.form-textarea {
  padding: 0.625rem 0.875rem;
  font-size: 0.875rem;
  border: 1px solid var(--border);
  border-radius: 0.5rem;
  background-color: var(--bg);
  color: var(--text);
  transition: all 0.2s ease;
  font-family: inherit;
}

.form-input:focus,
.form-textarea:focus {
  outline: none;
  border-color: var(--c-gl);
  box-shadow: 0 0 0 3px rgba(0, 0, 0, 0.05);
}

.form-textarea {
  resize: vertical;
  min-height: 5rem;
}

/* ============ 表单操作 ============ */
.form-actions {
  display: flex;
  gap: 0.75rem;
  justify-content: flex-end;
  padding-top: 1rem;
  border-top: 1px solid var(--border);
}

.btn-cancel,
.btn-submit {
  padding: 0.5rem 1.25rem;
  font-size: 0.875rem;
  font-weight: 600;
  border-radius: 0.5rem;
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-cancel {
  background-color: var(--border-soft);
  color: var(--text);
  border: 1px solid var(--border);
}

.btn-cancel:hover {
  background-color: var(--border);
}

.btn-submit {
  background-color: var(--c-gl);
  color: white;
}

.btn-submit:hover {
  opacity: 0.9;
}

/* ============ 响应式设计 ============ */
@media (max-width: 768px) {
  .task-view {
    padding: 1rem;
  }

  .task-filters {
    flex-direction: column;
    align-items: stretch;
  }

  .add-task-btn {
    width: 100%;
  }

  .form-row {
    grid-template-columns: 1fr;
  }

  .modal-content {
    max-width: 100%;
  }
}
</style>