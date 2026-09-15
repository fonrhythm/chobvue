import { initializeApp } from 'firebase/app'
import { 
  getAuth, 
  signInWithGoogle, 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: "AIzaSyAv4v5B1HXotOABmIcc5TOi3uzqPmLnvNs",
  authDomain: "chob-calendar.firebaseapp.com",
  projectId: "chob-calendar",
  storageBucket: "chob-calendar.firebasestorage.app",
  messagingSenderId: "629896393980",
  appId: "1:629896393980:web:d8800df187ba495b895379",
  measurementId: "G-CSTX7JW9H3"
};

// 初始化 Firebase
const app = initializeApp(firebaseConfig)

// 获取服务
export const auth = getAuth(app)
export const db = getFirestore(app)

// 导出认证函数
export { 
  signInWithGoogle, 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged
}