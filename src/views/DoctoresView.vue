<script setup>
import { ref, onMounted } from 'vue'
import { useDoctorStore } from '@/stores/doctorStore'
import DoctorList from '@/components/doctores/DoctorList.vue'
import DoctorForm from '@/components/doctores/DoctorForm.vue'

const doctorStore = useDoctorStore()
const showModal = ref(false)
const doctorEditar = ref(null)

const abrirModalNuevo = () => {
  doctorEditar.value = null
  showModal.value = true
}

const editarDoctor = (doctor) => {
  doctorEditar.value = doctor
  showModal.value = true
}

const eliminarDoctor = async (id) => {
  if (confirm('¿Estás seguro de eliminar este doctor?')) {
    try {
      await doctorStore.deleteDoctor(id)
      alert('Doctor eliminado correctamente')
    } catch (error) {
      alert('Error al eliminar el doctor')
    }
  }
}

const guardarDoctor = async (datos) => {
  try {
    if (doctorEditar.value) {
      await doctorStore.updateDoctor(doctorEditar.value.id, datos)
      alert('Doctor actualizado correctamente')
    } else {
      await doctorStore.createDoctor(datos)
      alert('Doctor creado correctamente')
    }

    await doctorStore.fetchDoctors()
    showModal.value = false
    doctorEditar.value = null
  } catch (error) {
    console.error('Error:', error)

    // Mostrar errores específicos de validación
    if (error.response?.status === 422) {
      const errores = error.response.data.errors
      let mensaje = 'Errores de validación:\n'

      for (const campo in errores) {
        mensaje += `\n• ${errores[campo].join(', ')}`
      }

      alert(mensaje)
    } else {
      alert('Error al guardar el doctor: ' + (error.message || 'Error desconocido'))
    }
  }
}

onMounted(() => {
  doctorStore.fetchDoctors()
})
</script>

<template>
  <div class="doctores-view">
    <div class="header">
      <div>
        <h1>Dentistas</h1>
        <p class="subtitle">Total: {{ doctorStore.totalDoctores }} doctores registrados</p>
      </div>
      <button @click="abrirModalNuevo" class="btn-nuevo">+ Nuevo Doctor</button>
    </div>

    <div v-if="doctorStore.loading" class="loading">
      <p>⏳ Cargando doctores...</p>
    </div>

    <div v-else-if="doctorStore.error" class="error">
      ⚠️ {{ doctorStore.error }}
    </div>

    <!-- nombre componente DoctorList ,:doctors paso dato al hijo doctorlist, : es un v-bind 
     ,doctors  es el props del hijo que es un array,
     @eliminar son los eventos que estan a la escucha los cuales los defini como emits en el componente hijo-->
    <DoctorList v-else :doctors="doctorStore.doctors" @editar="editarDoctor" @eliminar="eliminarDoctor" />

    <DoctorForm v-if="showModal" :doctor="doctorEditar" @cerrar="showModal = false; doctorEditar = null"
      @guardar="guardarDoctor" />
  </div>
</template>

<style scoped>
.doctores-view {
  padding: 2rem;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.header h1 {
  margin: 0;
  color: #2c3e50;
}

.subtitle {
  color: #666;
  margin: 0.5rem 0 0 0;
}

.btn-nuevo {
  padding: 0.75rem 1.5rem;
  background: #42b983;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
  font-size: 1rem;
  transition: background 0.3s;
}

.btn-nuevo:hover {
  background: #359268;
}

.loading {
  text-align: center;
  padding: 3rem;
  color: #42b983;
  font-size: 1.2rem;
}

.error {
  background-color: #fee;
  color: #c00;
  padding: 1rem;
  border-radius: 4px;
  border-left: 4px solid #c00;
  margin: 2rem 0;
}
</style>