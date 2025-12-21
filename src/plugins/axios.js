import axios from 'axios'
import router from '@/router'

// Configuración base de axios
const axiosInstance = axios.create({
    baseURL: 'http://localhost:8000',
    withCredentials: true,
    withXSRFToken: true,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'X-Requested-With': 'XMLHttpRequest'
    }
})

// Interceptor de requests (opcional para debugging)
axiosInstance.interceptors.request.use(
    config => {
        console.log('📤 Request:', config.method.toUpperCase(), config.url)
        return config
    },
    error => {
        console.error('❌ Request Error:', error)
        return Promise.reject(error)
    }
)

// Interceptor de responses
axiosInstance.interceptors.response.use(
    response => {
        console.log('📥 Response:', response.status, response.config.url)
        return response
    },
    error => {
        console.error('❌ Response Error:', error.response?.status, error.response?.data)

        // Redirigir al login si no está autenticado
        if (error.response?.status === 401) {
            router.push('/login')
        }

        return Promise.reject(error)
    }
)

export default axiosInstance