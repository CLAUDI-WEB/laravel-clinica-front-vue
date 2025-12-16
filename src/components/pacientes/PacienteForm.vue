<script setup>
import { ref } from 'vue'

const emit = defineEmits(['cerrar', 'guardar'])

const form = ref({
  rut: '',
  nombre: '',
  apellido: '',
  email: '',
  telefono: '',
  fecha_nacimiento: '',
  direccion: '',
  observaciones: ''
})

const guardar = () => {
  emit('guardar', form.value)
}
</script>

<template>
  <div class="modal-overlay" @click="emit('cerrar')">
    <div class="modal-content" @click.stop>
      <h2>Nuevo Paciente</h2>
      
      <form @submit.prevent="guardar">
        <div class="form-group">
          <label>RUT:</label>
          <input v-model="form.rut" required>
        </div>
        
        <div class="form-group">
          <label>Nombre:</label>
          <input v-model="form.nombre" required>
        </div>
        
        <div class="form-group">
          <label>Apellido:</label>
          <input v-model="form.apellido" required>
        </div>
        
        <div class="form-group">
          <label>Email:</label>
          <input v-model="form.email" type="email">
        </div>
        
        <div class="form-group">
          <label>Teléfono:</label>
          <input v-model="form.telefono" required>
        </div>
        
        <div class="form-group">
          <label>Fecha Nacimiento:</label>
          <input v-model="form.fecha_nacimiento" type="date" required>
        </div>
        
        <div class="actions">
          <button type="submit">Guardar</button>
          <button type="button" @click="emit('cerrar')">Cancelar</button>
        </div>
      </form>
    </div>
  </div>
</template>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  padding: 2rem;
  border-radius: 8px;
  max-width: 500px;
  width: 90%;
  max-height: 90vh;
  overflow-y: auto;
}

.form-group {
  margin-bottom: 1rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
}

.form-group input {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.actions {
  display: flex;
  gap: 1rem;
  margin-top: 1.5rem;
}

button {
  flex: 1;
  padding: 0.75rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
}

button[type="submit"] {
  background: #42b983;
  color: white;
}

button[type="button"] {
  background: #ddd;
}
</style>