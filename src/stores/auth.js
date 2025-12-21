import { defineStore } from 'pinia'
import api from '@/services/api'
import axios from '@/plugins/axios'

export const useAuthStore = defineStore('auth', {
    state: () => ({
        user: null,
        isAuthenticated: false,
        loading: false,
        error: null,
        checkedAuth: false
    }),

    getters: {
        userName: (state) => state.user?.nombre || state.user?.name || '',
        userEmail: (state) => state.user?.email || '',
        userRole: (state) => state.user?.rol || null,

        // Getters de roles
        isAdmin: (state) => state.user?.rol === 'admin',
        isPaciente: (state) => state.user?.rol === 'paciente',

        // Método para verificar múltiples roles
        hasRole: (state) => (roles) => {
            if (!state.user?.rol) return false

            if (Array.isArray(roles)) {
                return roles.includes(state.user.rol)
            }

            return state.user.rol === roles
        }
    },

    actions: {
        async getCsrfToken() {
            try {
                console.log('🔐 Obteniendo CSRF cookie...')
                await axios.get('/sanctum/csrf-cookie')
            } catch (error) {
                console.error('❌ Error obteniendo CSRF:', error)
                throw error
            }
        },

        async login(credentials) {
            this.loading = true
            this.error = null

            try {
                await this.getCsrfToken()

                console.log('📤 Enviando login a /auth/login...')
                const response = await api.post('/auth/login', credentials) // ✅ CORREGIDO

                console.log('✅ Respuesta login:', response.data)

                this.user = response.data.user
                this.isAuthenticated = true
                this.checkedAuth = true

                // localStorage para persistencia
                localStorage.setItem('user', JSON.stringify(response.data.user))
                localStorage.setItem('isAuthenticated', 'true')

                console.log('👤 Usuario autenticado como:', this.user.rol)

                return response.data
            } catch (error) {
                console.error('❌ Error en login:', error.response?.data)
                this.error = error.response?.data?.message || 'Error al iniciar sesión'
                this.isAuthenticated = false
                this.user = null
                throw error
            } finally {
                this.loading = false
            }
        },

        async register(userData) {
            this.loading = true
            this.error = null

            try {
                await this.getCsrfToken()

                console.log('📤 Enviando registro a /auth/register...')
                const response = await api.post('/auth/register', userData) // ✅ CORREGIDO

                console.log('✅ Respuesta registro:', response.data)

                this.user = response.data.user
                this.isAuthenticated = true
                this.checkedAuth = true

                // Guardar en localStorage
                localStorage.setItem('user', JSON.stringify(response.data.user))
                localStorage.setItem('isAuthenticated', 'true')

                console.log('👤 Usuario registrado como:', this.user.rol)

                return response.data
            } catch (error) {
                console.error('❌ Error en registro:', error.response?.data)
                this.error = error.response?.data?.message || 'Error al registrarse'
                throw error
            } finally {
                this.loading = false
            }
        },

        async logout() {
            this.loading = true

            try {
                await api.post('/auth/logout') // ✅ CORREGIDO
                console.log('✅ Logout exitoso')
            } catch (error) {
                console.error('❌ Error al cerrar sesión:', error)
            } finally {
                this.user = null
                this.isAuthenticated = false
                this.checkedAuth = false

                // Limpiar localStorage
                localStorage.removeItem('user')
                localStorage.removeItem('isAuthenticated')

                this.loading = false
            }
        },

        async checkAuth() {
            if (this.checkedAuth) {
                console.log('✅ Auth ya verificado previamente')
                return
            }

            console.log('🔍 Verificando autenticación...')

            try {
                // PRIMERO: Verificar localStorage
                const userStr = localStorage.getItem('user')
                const isAuth = localStorage.getItem('isAuthenticated')

                if (userStr && isAuth === 'true') {
                    console.log('📦 Usuario encontrado en localStorage')
                    const userData = JSON.parse(userStr)
                    this.user = userData
                    this.isAuthenticated = true
                    this.checkedAuth = true

                    console.log('👤 Rol del usuario:', userData.rol)

                    // SEGUNDO: Verificar con el backend
                    try {
                        console.log('🔄 Verificando sesión con backend...')
                        const response = await api.get('/auth/user') // ✅ CORREGIDO

                        // Actualizar con datos frescos del backend
                        this.user = response.data.user || response.data
                        localStorage.setItem('user', JSON.stringify(this.user))

                        console.log('✅ Sesión válida en backend. Rol:', this.user.rol)
                    } catch (backendError) {
                        console.warn('⚠️ Sesión expirada en backend')

                        // Si el backend dice que no está autenticado, limpiar todo
                        if (backendError.response?.status === 401) {
                            this.user = null
                            this.isAuthenticated = false
                            localStorage.removeItem('user')
                            localStorage.removeItem('isAuthenticated')
                        }
                    }
                } else {
                    console.log('❌ No hay sesión guardada')
                    this.user = null
                    this.isAuthenticated = false
                }
            } catch (error) {
                console.error('❌ Error en checkAuth:', error)
                this.user = null
                this.isAuthenticated = false
                localStorage.removeItem('user')
                localStorage.removeItem('isAuthenticated')
            } finally {
                this.checkedAuth = true
                console.log('🏁 Check auth completado.')
                console.log('   - isAuthenticated:', this.isAuthenticated)
                console.log('   - Rol:', this.user?.rol || 'sin rol')
            }
        },

        clearError() {
            this.error = null
        }
    }
})