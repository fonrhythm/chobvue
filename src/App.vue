<template>
  <div id="app" class="app-container">
    <!-- 顶部导航栏 -->
    <header class="app-header">
      <div class="header-content">
        <h1 class="app-title">📅 CHOB Calendar</h1>
        
        <div class="header-controls">
          <!-- 多语言切换 -->
          <select 
            v-model="languageStore.currentLanguage" 
            @change="languageStore.setLanguage(languageStore.currentLanguage)"
            class="language-select"
          >
            <option value="zh">中文</option>
            <option value="en">English</option>
            <option value="th">ไทย</option>
          </select>
          
          <!-- 主题切换 -->
          <button 
            @click="themeStore.toggleTheme()"
            class="theme-btn"
          >
            {{ themeStore.isDark ? '☀️' : '🌙' }}
          </button>
        </div>
      </div>
    </header>

    <!-- 主内容区域 -->
    <main class="app-main">
      <!-- 日历视图 -->
      <CalendarView v-if="viewStore.currentView === 'calendar'" />
      
      <!-- 周视图 -->
      <WeekView v-else-if="viewStore.currentView === 'week'" />
      
      <!-- 事项视图 -->
      <TaskView v-else-if="viewStore.currentView === 'task'" />
    </main>

    <!-- 页脚 -->
    <footer class="app-footer">
      <p>&copy; 2024 CHOB Calendar. All rights reserved.</p>
    </footer>
  </div>
</template>

<script setup>
import { useThemeStore } from '@/stores/theme'
import { useLanguageStore } from '@/stores/language'
import { useViewStore } from '@/stores/view'
import CalendarView from '@/components/CalendarView.vue'
import WeekView from '@/components/WeekView.vue'
import TaskView from '@/components/TaskView.vue'

const themeStore = useThemeStore()
const languageStore = useLanguageStore()
const viewStore = useViewStore()
</script>

<style scoped>
/* 容器和布局 */
.app-container {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background-color: var(--color-background);
  color: var(--color-text);
  transition: all 0.3s ease;
}

/* 顶部导航栏 */
.app-header {
  background-color: var(--color-primary);
  color: white;
  padding: 1rem 0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  position: sticky;
  top: 0;
  z-index: 100;
}

.header-content {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.app-title {
  font-size: 1.5rem;
  font-weight: bold;
  margin: 0;
}

.header-controls {
  display: flex;
  gap: 1rem;
  align-items: center;
}

/* 语言选择 */
.language-select {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 4px;
  background-color: rgba(255, 255, 255, 0.2);
  color: white;
  cursor: pointer;
  font-size: 1rem;
  font-weight: 500;
}

.language-select option {
  background-color: var(--color-surface);
  color: var(--color-text);
}

.language-select:hover {
  background-color: rgba(255, 255, 255, 0.3);
}

/* 主题切换按钮 */
.theme-btn {
  background: rgba(255, 255, 255, 0.2);
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  font-size: 1.2rem;
  cursor: pointer;
  transition: all 0.3s;
}

.theme-btn:hover {
  background: rgba(255, 255, 255, 0.3);
}

/* 主内容 */
.app-main {
  flex: 1;
}

/* 页脚 */
.app-footer {
  background-color: var(--color-surface);
  border-top: 1px solid var(--color-border);
  padding: 2rem;
  text-align: center;
  color: var(--color-textSecondary);
}

/* 响应式 */
@media (max-width: 768px) {
  .header-content {
    flex-direction: column;
    gap: 1rem;
    padding: 0 1rem;
  }

  .app-title {
    font-size: 1.2rem;
  }

  .header-controls {
    width: 100%;
    justify-content: space-between;
  }
}
</style>