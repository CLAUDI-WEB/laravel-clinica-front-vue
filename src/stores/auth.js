import { defineStore } from 'pinia'
import api from '@/services/api'
import axios from 'axios'

export const useAuthStore = defineStore('auth', {
    state: () => ({
        user: null,
        isAuthenticated: false,
        loading: false,
        error: null,
        checkedAuth: false
    }),

    getters: {
        userName: (state) => state.user?.nombre || '',
        userEmail: (state) => state.user?.email || '',
        isAdmin: (state) => state.user?.role === 'admin',
        isDoctor: (state) => state.user?.role === 'doctor',
        isPaciente: (state) => state.user?.role === 'paciente'
    },

    actions: {
        async getCsrfToken() {
        },

        async login(credentials) {
            this.loading = true
            this.error = null

            try {
                await this.getCsrfToken()
                const response = await api.post('/auth/login', credentials)

                this.user = response.data.user
                this.isAuthenticated = true
                this.checkedAuth = true

                return response.data
            } catch (error) {
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
                const response = await api.post('/auth/register', userData)

                this.user = response.data.user
                this.isAuthenticated = true
                this.checkedAuth = true

                return response.data
            } catch (error) {
                this.error = error.response?.data?.message || 'Error al registrarse'
                throw error
            } finally {
                this.loading = false
            }
        },

        async logout() {
            this.loading = true

            try {
                await api.post('/auth/logout')
            } catch (error) {
                console.error('Error al cerrar sesión:', error)
            } finally {
                this.user = null
                this.isAuthenticated = false
                this.loading = false
            }
        },

        async checkAuth() {
            if (this.checkedAuth) return

            try {
                const response = await api.get('/auth/user')
                this.user = response.data.user
                this.isAuthenticated = true
            } catch (error) {
                this.user = null
                this.isAuthenticated = false
            } finally {
                this.checkedAuth = true
            }
        },

        clearError() {
            this.error = null
        }
    }
})