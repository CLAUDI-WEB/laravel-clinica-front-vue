<script setup>
import { ref } from 'vue'

const emit = defineEmits(['search'])
const searchText = ref('')

const buscar = () => {
  emit('search', searchText.value)
}
</script>

<template>
  <div class="search-bar">
    <input 
      v-model="searchText" 
      @input="buscar"
      placeholder="Buscar paciente..."
      class="search-input"
    >
    <button @click="buscar" class="search-button">🔍</button>
  </div>
</template>

<style scoped>
.search-bar {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
}

.search-input {
  flex: 1;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
}

.search-button {
  padding: 0.75rem 1.5rem;
  background: #42b983;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1.2rem;
}

.search-button:hover {
  background: #359268;
}
</style>