<template>
  <div class="horas-tomadas-view">

    <!-- Título -->
    <v-card>
      <v-card-title>
        <div class="d-flex justify-space-between align-center">
          <span class="text-h5">Horas Tomadas</span>

          <!-- Botón recargar -->
          <v-btn color="primary" variant="tonal" prepend-icon="mdi-refresh" @click="recargar">
            Recargar
          </v-btn>
        </div>
      </v-card-title>
      <v-divider></v-divider>
    </v-card>

    <!-- Lista de citas -->
    <v-card class="mt-4">

      <!-- Loading -->
      <div v-if="store.loading" class="text-center py-12">
        <v-progress-circular indeterminate color="primary"></v-progress-circular>
        <p class="mt-4">Cargando...</p>
      </div>

      <!-- Error -->
      <v-alert v-else-if="store.error" type="error" variant="tonal" class="ma-4">
        {{ store.error }}
      </v-alert>

      <!-- Lista -->
      <v-list v-else>
        <v-list-item v-for="cita in store.citas" :key="cita.id">
          <template v-slot:prepend>
            <v-avatar color="primary">
              <v-icon color="white">mdi-calendar-check</v-icon>
            </v-avatar>
          </template>

          <v-list-item-title>
            {{ cita.paciente_nombre }}
          </v-list-item-title>

          <v-list-item-subtitle>
            {{ formatearFecha(cita.fecha) }} - {{ formatearHora(cita.hora) }} - Dr. {{ cita.doctor_nombre }}
          </v-list-item-subtitle>

          <template v-slot:append>
            <v-chip :color="getColorEstado(cita.estado)" size="small">
              {{ cita.estado }}
            </v-chip>
          </template>
        </v-list-item>

        <!-- Sin datos -->
        <v-list-item v-if="store.citas.length === 0">
          <v-list-item-title class="text-center text-grey py-8">
            No hay citas agendadas
          </v-list-item-title>
        </v-list-item>
      </v-list>
    </v-card>

  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useHorasTomadasStore } from '@/stores/horasTomadasStore'

// ══════════════════════════════════════════════════════════════
// STORE
// ══════════════════════════════════════════════════════════════

const store = useHorasTomadasStore()

// ══════════════════════════════════════════════════════════════
// FUNCIONES
// ══════════════════════════════════════════════════════════════

/**
 * Recargar citas
 */
const recargar = async () => {
  console.log('🔄 Recargando citas...')
  await store.cargarCitas()
}

/**
 * Formatear fecha
 */
const formatearFecha = (fecha) => {
  return new Date(fecha + 'T00:00:00').toLocaleDateString('es-CL', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  })
}

/**
 * Formatear hora
 */
const formatearHora = (hora) => {
  return hora.substring(0, 5) // "09:00:00" → "09:00"
}

/**
 * Color según estado
 */
const getColorEstado = (estado) => {
  const colores = {
    'confirmada': 'success',
    'pendiente': 'warning',
    'cancelada': 'error',
    'completada': 'info'
  }
  return colores[estado] || 'default'
}

// ══════════════════════════════════════════════════════════════
// LIFECYCLE
// ══════════════════════════════════════════════════════════════

onMounted(async () => {
  console.log('🚀 HorasTomadasView montado')
  await store.cargarCitas()
})
</script>

<style scoped>
.horas-tomadas-view {
  padding: 20px;
}
</style>