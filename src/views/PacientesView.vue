<script setup>
import { ref, onMounted } from 'vue'
import api from '@/services/api'
import PacienteList from '@/components/pacientes/PacienteList.vue'
import PacienteForm from '@/components/pacientes/PacienteForm.vue'
import SearchBar from '@/components/shared/SearchBar.vue'

const pacientes = ref([])
const pacientesFiltrados = ref([])
const loading = ref(false)
const showModal = ref(false)
const pacienteEditar = ref(null)

const cargarPacientes = async () => {
  try {
    loading.value = true
    const response = await api.get('/pacientes')
    pacientes.value = response.data
    pacientesFiltrados.value = response.data
  } catch (error) {
    console.error('Error al cargar pacientes:', error)
  } finally {
    loading.value = false
  }
}

const buscar = (texto) => {
  if (!texto || texto.trim() === '') {
    pacientesFiltrados.value = pacientes.value
    return
  }
  
  const textoLower = texto.toLowerCase()
  pacientesFiltrados.value = pacientes.value.filter(p => 
    p.nombre.toLowerCase().includes(textoLower) ||
    p.apellido.toLowerCase().includes(textoLower) ||
    p.rut.includes(texto)
  )
}

// 3. Funciones que ESCUCHAN los eventos del hijo
const editarPaciente = (paciente) => {
  console.log('Editar paciente:', paciente)
  pacienteEditar.value = paciente
  showModal.value = true
}

const eliminarPaciente = async (id) => {
  if (confirm('¿Estás seguro de eliminar este paciente?')) {
    try {
      await api.delete(`/pacientes/${id}`)
      cargarPacientes()
    } catch (error) {
      console.error('Error al eliminar:', error)
    }
  }
}

const guardarPaciente = async (datos) => {
  try {
    if (pacienteEditar.value) {
      // Actualizar paciente existente
      await api.put(`/pacientes/${pacienteEditar.value.id}`, datos)
    } else {
      // Crear nuevo paciente
      await api.post('/pacientes', datos)
    }
    showModal.value = false
    pacienteEditar.value = null
    cargarPacientes()
  } catch (error) {
    console.error('Error al guardar paciente:', error)
  }
}

onMounted(() => {
  cargarPacientes()
})
</script>

<template>
  <div class="pacientes-view">
    <div class="header">
      <h1>Gestión de Pacientes</h1>
      <button @click="showModal = true" class="btn-nuevo">+ Nuevo Paciente</button>
    </div>
    
    <SearchBar @search="buscar" />
    
    <!-- 4. Padre ESCUCHA los eventos del hijo -->
    <PacienteList 
      :pacientes="pacientesFiltrados" 
      :loading="loading"
      @editar="editarPaciente"
      @eliminar="eliminarPaciente"
    />
    
    <PacienteForm 
      v-if="showModal" 
      :paciente="pacienteEditar"
      @cerrar="showModal = false; pacienteEditar = null"
      @guardar="guardarPaciente"
    />
  </div>
</template>

<style scoped>
.pacientes-view {
  padding: 2rem;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.btn-nuevo {
  padding: 0.75rem 1.5rem;
  background: #42b983;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
}

.btn-nuevo:hover {
  background: #359268;
}
</style>