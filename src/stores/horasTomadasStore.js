import { defineStore } from 'pinia'
import { ref } from 'vue'
import api from '@/services/api'

/**
 * ═══════════════════════════════════════════════════════════════
 * STORE: Gestión de Horas Tomadas (Citas Agendadas)
 * ═══════════════════════════════════════════════════════════════
 */
export const useHorasTomadasStore = defineStore('horasTomadas', () => {

    // ═══════════════════════════════════════════════════════════════
    // STATE - Variables Reactivas
    // ═══════════════════════════════════════════════════════════════

    const citas = ref([])
    const loading = ref(false)
    const error = ref(null)

    // ═══════════════════════════════════════════════════════════════
    // ACTIONS - Funciones
    // ═══════════════════════════════════════════════════════════════

    /**
     *  TEST: Cargar citas tomadas desde el backend
     * 
     * Endpoint esperado: GET /api/citas/tomadas
     * 
     * @returns {Promise<Array>} - Array de citas
     */
    async function cargarCitas() {
        loading.value = true
        error.value = null

        try {
            const token = localStorage.getItem('token')

            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
            console.log('🧪 TEST: Llamando al backend')
            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
            console.log('📡 URL: GET /api/citas/tomadas')
            console.log('🔑 Token:', token ? 'Presente' : 'Ausente')

            const response = await api.get('citas/tomadas', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json'
                }
            })

            console.log('✅ Respuesta recibida del backend:')
            console.log('📦 Data:', response.data)
            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')

            citas.value = response.data.citas || response.data

            return citas.value

        } catch (err) {
            console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
            console.error('❌ ERROR en cargarCitas()')
            console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
            console.error('Mensaje:', err.message)
            console.error('Status:', err.response?.status)
            console.error('Data:', err.response?.data)
            console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')

            error.value = err.response?.data?.message || 'Error al cargar las citas'

            throw err
        } finally {
            loading.value = false
        }
    }

    /**
     * Limpiar datos del store
     */
    function limpiar() {
        citas.value = []
        loading.value = false
        error.value = null
    }

    // ═══════════════════════════════════════════════════════════════
    // RETURN - API Pública del Store
    // ═══════════════════════════════════════════════════════════════

    return {
        // State
        citas,
        loading,
        error,

        // Actions
        cargarCitas,
        limpiar
    }
})