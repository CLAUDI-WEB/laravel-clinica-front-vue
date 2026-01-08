import axios from 'axios'

const api = axios.create({
  baseURL: 'http://localhost:8000/api',
  // ❌ ELIMINAR: withCredentials: true,
  // ❌ ELIMINAR: withXSRFToken: true,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
})

// ✅ INTERCEPTOR: Agregar token automáticamente
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')

    if (token) {
      config.headers.Authorization = `Bearer ${token}`
      console.log('✅ Token agregado al header')
    }

    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// ✅ INTERCEPTOR: Manejar errores 401
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.error('⛔ Error 401 - Redirigiendo al login')
      localStorage.removeItem('token')
      localStorage.removeItem('user')

      if (window.location.pathname !== '/login') {
        window.location.href = '/login'
      }
    }
    return Promise.reject(error)
  }
)

export default api