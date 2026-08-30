import axios from 'axios'

export const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://api.liragames.com.br'

const api = axios.create({
  baseURL: API_BASE_URL
})

api.interceptors.request.use((config) => {
  const token = sessionStorage.getItem('lira_token') || localStorage.getItem('lira_token') || localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export default api
