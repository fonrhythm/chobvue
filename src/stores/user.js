import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { auth, db, onAuthStateChanged, signOut } from '@/utils/firebase'
import { collection, doc, getDoc, setDoc, arrayUnion, arrayRemove } from 'firebase/firestore'

export const useUserStore = defineStore('user', () => {
  // 状态
  const user = ref(null)
  const isAuthenticated = ref(false)
  const favorites = ref([])
  const loading = ref(false)
  const error = ref(null)

  // 计算属性：喜欢的数量
  const favoritesCount = computed(() => favorites.value.length)

  // 监听认证状态变化
  function watchAuthState() {
    onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        user.value = {
          uid: currentUser.uid,
          email: currentUser.email,
          displayName: currentUser.displayName || ''
        }
        isAuthenticated.value = true
        await loadFavorites(currentUser.uid)
      } else {
        user.value = null
        isAuthenticated.value = false
        favorites.value = []
      }
    })
  }

  // 方法：加载收藏
  async function loadFavorites(userId) {
    try {
      const userDocRef = doc(db, 'users', userId)
      const userDocSnap = await getDoc(userDocRef)
      
      if (userDocSnap.exists()) {
        favorites.value = userDocSnap.data().favorites || []
      }
    } catch (err) {
      error.value = err.message
      console.error('Error loading favorites:', err)
    }
  }

  // 方法：添加收藏
  async function addFavorite(eventId) {
    if (!isAuthenticated.value || !user.value) {
      error.value = '请先登录'
      return false
    }

    try {
      const userDocRef = doc(db, 'users', user.value.uid)
      await setDoc(userDocRef, {
        favorites: arrayUnion(eventId)
      }, { merge: true })
      
      if (!favorites.value.includes(eventId)) {
        favorites.value.push(eventId)
      }
      return true
    } catch (err) {
      error.value = err.message
      console.error('Error adding favorite:', err)
      return false
    }
  }

  // 方法：移除收藏
  async function removeFavorite(eventId) {
    if (!isAuthenticated.value || !user.value) {
      error.value = '请先登录'
      return false
    }

    try {
      const userDocRef = doc(db, 'users', user.value.uid)
      await setDoc(userDocRef, {
        favorites: arrayRemove(eventId)
      }, { merge: true })
      
      favorites.value = favorites.value.filter(id => id !== eventId)
      return true
    } catch (err) {
      error.value = err.message
      console.error('Error removing favorite:', err)
      return false
    }
  }

  // 方法：检查是否已收藏
  function isFavorite(eventId) {
    return favorites.value.includes(eventId)
  }

  // 方法：登出
  async function logout() {
    try {
      await signOut(auth)
      user.value = null
      isAuthenticated.value = false
      favorites.value = []
    } catch (err) {
      error.value = err.message
      console.error('Error logging out:', err)
    }
  }

  return {
    // 状态
    user,
    isAuthenticated,
    favorites,
    loading,
    error,
    
    // 计算属性
    favoritesCount,
    
    // 方法
    watchAuthState,
    loadFavorites,
    addFavorite,
    removeFavorite,
    isFavorite,
    logout
  }
})