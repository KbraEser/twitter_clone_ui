import axios from 'axios'
import { store } from '../store'
import { logout } from '../store/authSlice'

const AUTH_KEY = 'twitter_auth'

export interface StoredAuth {
  token: string
  userId: number
  email: string
  name: string
  surname: string
}

export function getStoredAuth(): StoredAuth | null {
  const raw = localStorage.getItem(AUTH_KEY)
  if (!raw) return null
  try {
    return JSON.parse(raw)
  } catch {
    return null
  }
}

export function setStoredAuth(auth: StoredAuth) {
  localStorage.setItem(AUTH_KEY, JSON.stringify(auth))
}

export function clearStoredAuth() {
  localStorage.removeItem(AUTH_KEY)
}

const api = axios.create({ baseURL: '/api' })

api.interceptors.request.use((config) => {
  const auth = getStoredAuth()
  if (auth?.token) {
    config.headers.Authorization = `Bearer ${auth.token}`
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      store.dispatch(logout())
      if (window.location.pathname !== '/login') {
        window.location.href = '/login'
      }
    }
    return Promise.reject(error)
  },
)

export default api
