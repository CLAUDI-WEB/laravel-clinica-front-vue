import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import api from '@/services/api'

export const useDoctorStore = defineStore('doctor', () => {
  // 1. STATE - Variables reactivas (datos)
  const doctors = ref([])
  const loading = ref(false)
  const error = ref(null)

  // 2. GETTERS - Valores computados (derivados del state)
  const doctoresActivos = computed(() => {
    return doctors.value.filter(d => d.activo)
  })


  // 3. ACTIONS - Funciones que modifican el state
  const fetchDoctors = async () => {
    loading.value = true
    error.value = null
    try {
      const response = await api.get('/doctors')
      doctors.value = response.data
    } catch (err) {
      error.value = 'Error al cargar doctores'
    } finally {
      loading.value = false
    }
  }
  

  const deleteDoctor = async (id) => {
    loading.value = true
    try {
      await api.delete(`/doctors/${id}`)
      doctors.value = doctors.value.filter(d => d.id !== id)
    } finally {
      loading.value = false
    }
  }


const updateDoctor = async (id, doctorData) => {
  loading.value = true
  error.value = null
  try {
    console.log('Store - Actualizando doctor:', id, doctorData) 
    const response = await api.put(`/doctors/${id}`, doctorData)
    console.log('Store - Respuesta:', response.data) 
    
    const index = doctors.value.findIndex(d => d.id === id)
    if (index !== -1) {
      doctors.value[index] = response.data
    }
    return response.data
  } catch (err) {
    console.error('Store - Error:', err) 
    error.value = 'Error al actualizar doctor'
    throw err
  } finally {
    loading.value = false
  }
}

const createDoctor = async (doctorData) => {
  loading.value = true
  error.value = null
  try {
    const response = await api.post('/doctors', doctorData)
    
    doctors.value.push(response.data)
    return response.data
  } catch (err) {
    error.value = 'Error al crear doctor'
    throw err
  } finally {
    loading.value = false
  }
}


  // 4. RETURN - Expone state
return {
  doctors,
  loading,
  error,
  doctoresActivos,
  // totalDoctores,
  fetchDoctors,
  createDoctor,   
  updateDoctor,     
  deleteDoctor,
}
})