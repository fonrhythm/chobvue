<template>
  <div id="app" :data-region="currentRegion">
    <!-- 顶部导航栏 -->
    <header class="app-header">
      <div class="header-left">
        <h1 class="logo">
          <span class="logo-emoji">📅</span>
          <span>CHOB Calendar</span>
        </h1>
      </div>

      <div class="header-center">
        <div class="region-switcher">
          <button
            v-for="region in regionList"
            :key="region.value"
            class="region-btn"
            :class="{ active: currentRegion === region.value }"
            @click="currentRegion = region.value"
            :title="region.label"
          >
            {{ region.emoji }}
            <span class="region-name">{{ region.name }}</span>
          </button>
        </div>
      </div>

      <div class="header-right">
        <button class="settings-btn" @click="showSettings = !showSettings" title="设置">
          ⚙️
        </button>
      </div>
    </header>

    <!-- 主要内容 -->
    <main class="app-main">
      <CalendarPage :region="currentRegion" />
    </main>

    <!-- 设置面板 -->
    <aside v-if="showSettings" class="settings-panel" @click.self="showSettings = false">
      <div class="settings-content">
        <div class="settings-header">
          <h2>⚙️ 设置</h2>
          <button class="close-btn" @click="showSettings = false">✕</button>
        </div>

        <div class="settings-body">
          <!-- 地区选择 -->
          <div class="setting-item">
            <label>地区主题</label>
            <div class="region-options">
              <label v-for="region in regionList" :key="region.value" class="option">
                <input v-model="currentRegion" type="radio" :value="region.value" />
                <span>{{ region.emoji }} {{ region.label }}</span>
              </label>
            </div>
          </div>

          <!-- 主题信息 -->
          <div class="setting-item">
            <h3>当前主题信息</h3>
            <p class="theme-info">
              <strong>地区:</strong> {{ getCurrentRegionName() }}<br />
              <strong>颜色方案:</strong> {{ getColorScheme() }}<br />
              <strong>状态:</strong> ✅ 正常
            </p>
          </div>

          <!-- 快速链接 -->
          <div class="setting-item">
            <h3>快速操作</h3>
            <button class="action-btn" @click="exportData">
              📥 导出日历数据
            </button>
            <button class="action-btn" @click="openDocs">
              📖 查看文档
            </button>
          </div>

          <!-- 版本信息 -->
          <div class="setting-item footer-info">
            <p>CHOB Calendar v1.0.0</p>
            <p>Powered by Vue 3 + CSS Variables</p>
          </div>
        </div>
      </div>
    </aside>

    <!-- 通知提示 -->
    <div v-if="notification" class="notification" :class="notification.type">
      <span>{{ notification.message }}</span>
      <button @click="notification = null">✕</button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import CalendarPage from '@/views/CalendarPage.vue'

// 状态
const currentRegion = ref('oversea')
const showSettings = ref(false)
const notification = ref(null)

// 地区列表
const regionList = [
  { value: 'thailand', name: '泰国', emoji: '🇹🇭', label: '泰国 Thailand' },
  { value: 'china', name: '中国', emoji: '🇨🇳', label: '中国 China' },
  { value: 'oversea', name: '海外', emoji: '🌏', label: '海外 Oversea' },
]

// 方法
const getCurrentRegionName = () => {
  const region = regionList.find((r) => r.value === currentRegion.value)
  return region ? region.label : 'Unknown'
}

const getColorScheme = () => {
  const schemes = {
    thailand: '蓝色温暖色系',
    china: '中国红棕色系',
    oversea: '棕色系',
  }
  return schemes[currentRegion.value] || 'Unknown'
}

const showNotification = (message, type = 'success', duration = 3000) => {
  notification.value = { message, type }
  setTimeout(() => {
    notification.value = null
  }, duration)
}

const exportData = () => {
  const data = {
    region: currentRegion.value,
    exportTime: new Date().toISOString(),
    message: '数据导出功能即将上线',
  }
  showNotification(`已导出: ${data.region} 主题数据`, 'success')
  console.log('Export data:', data)
}

const openDocs = () => {
  showNotification('文档已复制到剪贴板', 'info')
  // 你可以改为打开外部链接
  // window.open('https://your-docs-url')
}

// 监听region变化
import { watch } from 'vue'
watch(currentRegion, (newRegion) => {
  document.documentElement.setAttribute('data-region', newRegion)
  showNotification(`已切换到 ${getCurrentRegionName()}`, 'success')
})

// 初始化地区
document.documentElement.setAttribute('data-region', currentRegion.value)
</script>

<style scoped>
/* ========== 布局 ========== */
#app {
  width: 100%;
  min-height: 100vh;
  background-color: var(--bg);
  color: var(--text);
  display: flex;
  flex-direction: column;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue',
    Arial, sans-serif;
}

/* ========== 顶部导航栏 ========== */
.app-header {
  position: sticky;
  top: 0;
  z-index: 40;
  background-color: var(--surface);
  border-bottom: 1px solid var(--border);
  padding: 1rem 2rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 2rem;
  box-shadow: var(--shadow-sm);
}

.header-left {
  display: flex;
  align-items: center;
  flex-shrink: 0;
}

.logo {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  color: var(--text);
}

.logo-emoji {
  font-size: 2rem;
}

.header-center {
  flex: 1;
  display: flex;
  justify-content: center;
}

.header-right {
  display: flex;
  gap: 1rem;
  flex-shrink: 0;
}

/* ========== 地区切换器 ========== */
.region-switcher {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
  justify-content: center;
}

.region-btn {
  padding: 0.5rem 0.875rem;
  background-color: var(--border-soft);
  border: 1px solid var(--border);
  border-radius: 0.5rem;
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--text);
  cursor: pointer;
  transition: all var(--transition-base);
  display: flex;
  align-items: center;
  gap: 0.5rem;
  white-space: nowrap;
}

.region-btn:hover {
  border-color: var(--c-band);
  background-color: var(--surface);
}

.region-btn.active {
  background-color: var(--c-band);
  color: var(--t-band);
  border-color: var(--c-band);
  font-weight: 700;
}

.region-name {
  display: none;
}

.region-btn.active .region-name {
  display: inline;
}

/* ========== 设置按钮 ========== */
.settings-btn {
  padding: 0.5rem;
  background-color: var(--border-soft);
  border: 1px solid var(--border);
  border-radius: 0.5rem;
  font-size: 1.25rem;
  cursor: pointer;
  transition: all var(--transition-base);
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 2.5rem;
  min-height: 2.5rem;
}

.settings-btn:hover {
  border-color: var(--c-band);
  background-color: var(--surface);
}

/* ========== 主内容 ========== */
.app-main {
  flex: 1;
  width: 100%;
  overflow-y: auto;
}

/* ========== 设置面板 ========== */
.settings-panel {
  position: fixed;
  right: 0;
  top: 0;
  width: 350px;
  height: 100vh;
  background-color: var(--surface);
  border-left: 1px solid var(--border);
  box-shadow: var(--shadow-lg);
  z-index: 50;
  overflow-y: auto;
  animation: slideInRight 0.3s ease-out;
}

@keyframes slideInRight {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

.settings-content {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.settings-header {
  padding: 1.5rem;
  border-bottom: 1px solid var(--border);
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-shrink: 0;
}

.settings-header h2 {
  margin: 0;
  font-size: 1.25rem;
  color: var(--text);
}

.close-btn {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: var(--muted);
  transition: color var(--transition-base);
}

.close-btn:hover {
  color: var(--text);
}

.settings-body {
  flex: 1;
  overflow-y: auto;
  padding: 1.5rem;
}

.setting-item {
  margin-bottom: 2rem;
}

.setting-item label {
  display: block;
  font-size: 0.875rem;
  font-weight: 700;
  color: var(--muted);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 0.75rem;
}

.setting-item h3 {
  margin: 0 0 0.75rem 0;
  font-size: 1rem;
  color: var(--text);
}

.region-options {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.option {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.5rem;
  border-radius: 0.375rem;
  cursor: pointer;
  transition: all var(--transition-base);
}

.option:hover {
  background-color: var(--border-soft);
}

.option input {
  cursor: pointer;
}

.option span {
  font-size: 0.875rem;
  color: var(--text);
}

.theme-info {
  font-size: 0.875rem;
  color: var(--sub);
  background-color: var(--border-soft);
  padding: 1rem;
  border-radius: 0.375rem;
  margin: 0;
  line-height: 1.6;
}

.action-btn {
  display: block;
  width: 100%;
  padding: 0.75rem 1rem;
  background-color: var(--c-band);
  color: var(--t-band);
  border: none;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all var(--transition-base);
  margin-bottom: 0.5rem;
}

.action-btn:hover {
  opacity: 0.9;
  transform: translateY(-1px);
}

.footer-info {
  padding-top: 2rem;
  border-top: 1px solid var(--border);
  margin-top: auto;
  text-align: center;
}

.footer-info p {
  margin: 0.25rem 0;
  font-size: 0.75rem;
  color: var(--muted);
}

/* ========== 通知 ========== */
.notification {
  position: fixed;
  bottom: 2rem;
  right: 2rem;
  max-width: 400px;
  padding: 1rem 1.5rem;
  background-color: var(--c-band);
  color: var(--t-band);
  border-radius: 0.75rem;
  box-shadow: var(--shadow-lg);
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  z-index: 60;
  animation: slideUp 0.3s ease-out;
}

@keyframes slideUp {
  from {
    transform: translateY(100%);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.notification.error {
  background-color: #d32f2f;
}

.notification.info {
  background-color: #1976d2;
}

.notification button {
  background: none;
  border: none;
  color: inherit;
  font-size: 1.5rem;
  cursor: pointer;
  padding: 0;
  display: flex;
  align-items: center;
}

/* ========== 响应式 ========== */
@media (max-width: 1024px) {
  .app-header {
    padding: 1rem;
    gap: 1rem;
  }

  .logo span {
    display: none;
  }

  .logo {
    font-size: 1.25rem;
  }

  .region-switcher {
    gap: 0.25rem;
  }

  .region-btn {
    padding: 0.375rem 0.5rem;
    font-size: 0.75rem;
  }

  .settings-panel {
    width: 300px;
  }
}

@media (max-width: 768px) {
  .app-header {
    flex-wrap: wrap;
    padding: 0.75rem;
  }

  .header-left,
  .header-right {
    flex: 0 0 auto;
  }

  .header-center {
    flex: 0 0 100%;
    order: 3;
  }

  .region-switcher {
    width: 100%;
  }

  .region-btn {
    flex: 1;
    min-width: 0;
  }

  .settings-panel {
    width: 100%;
    height: 80vh;
    bottom: 0;
    border-left: none;
    border-top: 1px solid var(--border);
    animation: slideUp 0.3s ease-out;
  }

  .notification {
    bottom: 1rem;
    right: 1rem;
    left: 1rem;
    max-width: none;
  }
}

@media (max-width: 480px) {
  #app {
    font-size: 14px;
  }

  .app-header {
    padding: 0.5rem;
  }

  .logo-emoji {
    font-size: 1.5rem;
  }

  .region-btn {
    padding: 0.25rem 0.375rem;
    font-size: 0.7rem;
  }

  .settings-panel {
    width: 100%;
    height: 70vh;
  }

  .notification {
    font-size: 0.875rem;
    padding: 0.75rem 1rem;
    bottom: 0.5rem;
    right: 0.5rem;
    left: 0.5rem;
  }
}
</style>
