import axios from 'axios'
import router from '@/router'

const axiosInstance = axios.create({
    baseURL: 'http://localhost:8000',
    // ❌ ELIMINAR: withCredentials: true,
    // ❌ ELIMINAR: withXSRFToken: true,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'X-Requested-With': 'XMLHttpRequest'
    }
})

// ✅ INTERCEPTOR: Agregar token
axiosInstance.interceptors.request.use(
    config => {
        const token = localStorage.getItem('token')
        if (token) {
            config.headers.Authorization = `Bearer ${token}`
        }

        console.log('📤 Request:', config.method.toUpperCase(), config.url)
        return config
    },
    error => {
        console.error('❌ Request Error:', error)
        return Promise.reject(error)
    }
)

// ✅ INTERCEPTOR: Manejar errores
axiosInstance.interceptors.response.use(
    response => {
        console.log('📥 Response:', response.status, response.config.url)
        return response
    },
    error => {
        console.error('❌ Response Error:', error.response?.status, error.response?.data)

        if (error.response?.status === 401) {
            localStorage.removeItem('token')
            localStorage.removeItem('user')

            if (router.currentRoute.value.path !== '/login') {
                router.push('/login')
            }
        }

        return Promise.reject(error)
    }
)

export default axiosInstance