<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  doctor: Object  // null = crear, objeto = editar
})

const emit = defineEmits(['cerrar', 'guardar'])

const form = ref({
  rut: '',
  nombre: '',
  apellido: '',
  email: '',
  telefono: '',
  especialidad: '',
  numero_registro: '',
  activo: true
})

// Si recibe un doctor, carga sus datos
watch(() => props.doctor, (nuevo) => {
  if (nuevo) {
    form.value = { ...nuevo }
  }
}, { immediate: true })

const guardar = () => {
  emit('guardar', form.value)
}
</script>

<template>
  <div class="modal-overlay" @click="emit('cerrar')">
    <div class="modal-content" @click.stop>
      <h2>{{ doctor ? 'Editar' : 'Nuevo' }} Doctor</h2>
      
      <form @submit.prevent="guardar">
        <div class="form-row">
          <div class="form-group">
            <label>RUT: *</label>
            <input v-model="form.rut" required>
          </div>
          
          <div class="form-group">
            <label>Número Registro: *</label>
            <input v-model="form.numero_registro" required>
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label>Nombre: *</label>
            <input v-model="form.nombre" required>
          </div>
          
          <div class="form-group">
            <label>Apellido: *</label>
            <input v-model="form.apellido" required>
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label>Email: *</label>
            <input v-model="form.email" type="email" required>
          </div>
          
          <div class="form-group">
            <label>Teléfono: *</label>
            <input v-model="form.telefono" required>
          </div>
        </div>

        <div class="form-group">
          <label>Especialidad: *</label>
          <select v-model="form.especialidad" required>
            <option value="">Seleccione una especialidad</option>
            <option value="Odontología General">Odontología General</option>
            <option value="Ortodoncia">Ortodoncia</option>
            <option value="Endodoncia">Endodoncia</option>
            <option value="Periodoncia">Periodoncia</option>
            <option value="Cirugía Oral">Cirugía Oral</option>
            <option value="Implantología">Implantología</option>
            <option value="Odontopediatría">Odontopediatría</option>
          </select>
        </div>

        <div class="form-group">
          <label>
            <input type="checkbox" v-model="form.activo">
            Activo
          </label>
        </div>
        
        <div class="actions">
          <button type="submit" class="btn-submit">Guardar</button>
          <button type="button" @click="emit('cerrar')" class="btn-cancel">Cancelar</button>
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
  max-width: 600px;
  width: 90%;
  max-height: 90vh;
  overflow-y: auto;
}

h2 {
  margin-bottom: 1.5rem;
  color: #2c3e50;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.form-group {
  margin-bottom: 1rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: #2c3e50;
}

.form-group input[type="text"],
.form-group input[type="email"],
.form-group input,
.form-group select {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
}

.form-group input[type="checkbox"] {
  width: auto;
  margin-right: 0.5rem;
}

.actions {
  display: flex;
  gap: 1rem;
  margin-top: 1.5rem;
}

.actions button {
  flex: 1;
  padding: 0.75rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
  font-size: 1rem;
}

.btn-submit {
  background: #42b983;
  color: white;
}

.btn-submit:hover {
  background: #359268;
}

.btn-cancel {
  background: #ddd;
  color: #333;
}

.btn-cancel:hover {
  background: #ccc;
}
</style>