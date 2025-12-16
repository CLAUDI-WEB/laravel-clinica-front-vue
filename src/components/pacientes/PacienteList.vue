<script setup>
// Asignas defineProps a una constante
const props = defineProps({
  pacientes: Array,
  loading: Boolean
})

const emit = defineEmits(['editar', 'eliminar'])

// Ahora podrías usar props en el script si necesitaras
// Por ejemplo:
 console.log('Total pacientes:', props.pacientes?.length)
// watch(() => props.loading, (val) => console.log('Loading:', val))
</script>

<template>
  <div class="paciente-list">
    <!-- Puedes usar loading directamente (SIN props.) -->
    <div v-if="loading">Cargando...</div>
    
    <div v-else class="pacientes-grid">
      <!-- También puedes usar pacientes directamente (SIN props.) -->
      <div v-for="paciente in pacientes" :key="paciente.id" class="paciente-card">
        <h3>{{ paciente.nombre }} {{ paciente.apellido }}</h3>
        <p><strong>RUT:</strong> {{ paciente.rut }}</p>
        <p><strong>Email:</strong> {{ paciente.email }}</p>
        <p><strong>Teléfono:</strong> {{ paciente.telefono }}</p>
        <p><strong>Fecha Nac.:</strong> {{ paciente.fecha_nacimiento }}</p>
        <p v-if="paciente.observaciones"><strong>Obs:</strong> {{ paciente.observaciones }}</p>
        <div class="actions">
          <button @click="emit('editar', paciente)">Editar</button>
          <button @click="emit('eliminar', paciente.id)">Eliminar</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.pacientes-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
}

.paciente-card {
  background: white;
  padding: 1.5rem;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  transition: transform 0.3s;
}

.paciente-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
}

.paciente-card h3 {
  margin-bottom: 1rem;
  color: #2c3e50;
}

.paciente-card p {
  margin: 0.5rem 0;
  color: #555;
}

.actions {
  display: flex;
  gap: 0.5rem;
  margin-top: 1rem;
}

button {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  background: #42b983;
  color: white;
  font-weight: 500;
}

button:hover {
  background: #359268;
}

button:last-child {
  background: #e74c3c;
}

button:last-child:hover {
  background: #c0392b;
}
</style>