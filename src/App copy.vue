<script setup>
import { onMounted, ref } from 'vue'
import api from './services/api'

const mensaje = ref('')
const error = ref('')

onMounted(async () => {
  try {
    const response = await api.get('/test')
    mensaje.value = response.data.message
    console.log('Backend conectado:', response.data)
  } catch (err) {
    error.value = 'Error conectando al backend: ' + err.message
    console.error('Error:', err)
  }
})
</script>

<template>
  <div>
    <h1>Prueba de Conexión</h1>
    <p v-if="mensaje" style="color: green">✓ {{ mensaje }}</p>
    <p v-if="error" style="color: red">✗ {{ error }}</p>
  </div>
</template>