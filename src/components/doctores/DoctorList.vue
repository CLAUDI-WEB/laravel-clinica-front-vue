<script setup>
defineProps({
  doctors: Array
})

const emit = defineEmits(['eliminar','editar', 'eliminar'])

</script>

<template>
  <div class="doctors-grid">
    <div v-for="doctor in doctors" :key="doctor.id" class="doctor-card">
      <div class="doctor-header">
        <h3>Dr(a). {{ doctor.nombre }} {{ doctor.apellido }}</h3>
            <span :class="['badge', doctor.activo ? 'activo' : 'inactivo']">
            {{ doctor.activo ? 'Activo' : 'Inactivo' }}
            </span>
      </div>
      
      <div class="doctor-info">
        <p><strong>Especialidad:</strong> {{ doctor.especialidad }}</p>
        <p><strong>Email:</strong> {{ doctor.email }}</p>
        <p><strong>Teléfono:</strong> {{ doctor.telefono }}</p>
        <p><strong>RUT:</strong> {{ doctor.rut }}</p>
        <p><strong>Registro:</strong> {{ doctor.numero_registro }}</p>
      </div>

      <div class="actions">
        <button class="btn-edit" @click="emit('editar', doctor)">Editar</button>
        <button class="btn-delete" @click="emit('eliminar', doctor.id)">Eliminar</button>
      </div>
    </div>
  </div>

  
</template>


<style scoped>
.doctors-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 1.5rem;
}

.doctor-card {
  background: white;
  padding: 1.5rem;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  transition: transform 0.3s;
}

.doctor-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
}

.doctor-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  padding-bottom: 1rem;
  border-bottom: 2px solid #f0f0f0;
}

.doctor-header h3 {
  color: #2c3e50;
  margin: 0;
  font-size: 1.2rem;
}

.badge {
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.85rem;
  font-weight: 500;
}

.badge.activo {
  background: #d4edda;
  color: #155724;
}

.doctor-info p {
  margin: 0.5rem 0;
  color: #555;
  font-size: 0.95rem;
}

.doctor-info strong {
  color: #2c3e50;
}

.actions {
  display: flex;
  gap: 0.5rem;
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid #f0f0f0;
}

.actions button {
  flex: 1;
  padding: 0.6rem 1rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
  transition: background 0.3s;
}

.btn-edit {
  background: #42b983;
  color: white;
}

.btn-edit:hover {
  background: #359268;
}

.btn-delete {
  background: #e74c3c;
  color: white;
}

.btn-delete:hover {
  background: #c0392b;
}
</style>