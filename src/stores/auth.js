import { defineStore } from 'pinia'
import api from '@/services/api'

export const useAuthStore = defineStore('auth', {
    state: () => ({
        user: null,
        token: localStorage.getItem('token') || null, // ✅ NUEVO - Guardar token
        isAuthenticated: !!localStorage.getItem('token'), // ✅ Basado en token
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
        isPaciente: (state) => state.user?.rol === 'patient' || state.user?.rol === 'paciente',
        isDoctor: (state) => state.user?.rol === 'doctor',

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
        /**
         * 🔐 LOGIN - Autenticar usuario
         */
        async login(credentials) {
            this.loading = true
            this.error = null

            try {
                console.log('🔐 Intentando login con:', credentials.email)

                // ❌ ELIMINAR: await this.getCsrfToken()
                // ✅ SOLO hacer POST directo

                const response = await api.post('/auth/login', credentials)

                console.log('✅ Respuesta login:', response.data)

                // ✅ GUARDAR TOKEN (lo más importante)
                this.token = response.data.access_token
                this.user = response.data.user
                this.isAuthenticated = true
                this.checkedAuth = true

                // ✅ Guardar en localStorage
                localStorage.setItem('token', response.data.access_token)
                localStorage.setItem('user', JSON.stringify(response.data.user))

                console.log('👤 Usuario autenticado como:', this.user.rol)

                return response.data

            } catch (error) {
                console.error('❌ Error en login:', error.response?.data)
                this.error = error.response?.data?.message || 'Error al iniciar sesión'
                this.isAuthenticated = false
                this.user = null
                this.token = null
                throw error
            } finally {
                this.loading = false
            }
        },

        /**
         * 📝 REGISTER - Registrar nuevo usuario
         */
        async register(userData) {
            this.loading = true
            this.error = null

            try {
                console.log('📝 Registrando usuario:', userData.email)

                // ❌ ELIMINAR: await this.getCsrfToken()

                const response = await api.post('/auth/register', userData)

                console.log('✅ Respuesta registro:', response.data)

                // ✅ GUARDAR TOKEN
                this.token = response.data.access_token
                this.user = response.data.user
                this.isAuthenticated = true
                this.checkedAuth = true

                // ✅ Guardar en localStorage
                localStorage.setItem('token', response.data.access_token)
                localStorage.setItem('user', JSON.stringify(response.data.user))

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

        /**
         * 🚪 LOGOUT - Cerrar sesión
         */
        async logout() {
            this.loading = true

            try {
                await api.post('/auth/logout')
                console.log('✅ Logout exitoso')
            } catch (error) {
                console.error('❌ Error al cerrar sesión:', error)
            } finally {
                // ✅ Limpiar todo
                this.user = null
                this.token = null
                this.isAuthenticated = false
                this.checkedAuth = false

                localStorage.removeItem('token')
                localStorage.removeItem('user')

                this.loading = false
            }
        },

        /**
         * 🔍 CHECK AUTH - Verificar autenticación
         */
        async checkAuth() {
            if (this.checkedAuth) {
                console.log('✅ Auth ya verificado previamente')
                return
            }

            console.log('🔍 Verificando autenticación...')

            try {
                // PRIMERO: Verificar si hay token en localStorage
                const token = localStorage.getItem('token')
                const userStr = localStorage.getItem('user')

                if (token && userStr) {
                    console.log('📦 Token encontrado en localStorage')

                    const userData = JSON.parse(userStr)
                    this.token = token
                    this.user = userData
                    this.isAuthenticated = true
                    this.checkedAuth = true

                    console.log('👤 Rol del usuario:', userData.rol)

                    // SEGUNDO: Verificar con el backend (opcional pero recomendado)
                    try {
                        console.log('🔄 Verificando sesión con backend...')
                        const response = await api.get('/auth/user')

                        // Actualizar con datos frescos del backend
                        this.user = response.data.user || response.data
                        localStorage.setItem('user', JSON.stringify(this.user))

                        console.log('✅ Sesión válida en backend. Rol:', this.user.rol)

                    } catch (backendError) {
                        console.warn('⚠️ Token inválido o expirado')

                        // Si el backend dice 401, limpiar todo
                        if (backendError.response?.status === 401) {
                            this.user = null
                            this.token = null
                            this.isAuthenticated = false
                            localStorage.removeItem('token')
                            localStorage.removeItem('user')
                        }
                    }
                } else {
                    console.log('❌ No hay token guardado')
                    this.user = null
                    this.token = null
                    this.isAuthenticated = false
                }

            } catch (error) {
                console.error('❌ Error en checkAuth:', error)
                this.user = null
                this.token = null
                this.isAuthenticated = false
                localStorage.removeItem('token')
                localStorage.removeItem('user')
            } finally {
                this.checkedAuth = true
                console.log('🏁 Check auth completado.')
                console.log('   - isAuthenticated:', this.isAuthenticated)
                console.log('   - Token:', this.token ? 'Presente' : 'Ausente')
                console.log('   - Rol:', this.user?.rol || 'sin rol')
            }
        },

        /**
         * 💾 LOAD FROM STORAGE - Cargar al iniciar app
         */
        loadUserFromStorage() {
            const token = localStorage.getItem('token')
            const userStr = localStorage.getItem('user')

            if (token && userStr) {
                this.token = token
                this.user = JSON.parse(userStr)
                this.isAuthenticated = true
                console.log('✅ Usuario cargado desde localStorage')
            }
        },

        /**
         * 🧹 CLEAR ERROR
         */
        clearError() {
            this.error = null
        }
    }
})
