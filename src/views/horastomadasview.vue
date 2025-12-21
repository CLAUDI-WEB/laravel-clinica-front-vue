<template>
  <div class="horas-tomadas-view">
    <!-- Título -->
    <v-card>
      <v-card-title>
        <div class="d-flex justify-space-between align-center">
          <span class="text-h5">
            <v-icon class="mr-2">mdi-calendar-clock</v-icon>
            Horas Tomadas
          </span>
          <v-btn color="primary" variant="tonal" prepend-icon="mdi-refresh" @click="recargar" :loading="store.loading">
            Recargar
          </v-btn>
        </div>
      </v-card-title>
      <v-divider></v-divider>
    </v-card>

    <!-- Loading -->
    <v-card v-if="store.loading && store.citas.length === 0" class="mt-4">
      <div class="text-center py-12">
        <v-progress-circular indeterminate color="primary" size="64"></v-progress-circular>
        <p class="mt-4 text-h6">Cargando citas...</p>
      </div>
    </v-card>

    <!-- Error -->
    <v-alert v-else-if="store.error" type="error" variant="tonal" class="mt-4" closable
      @click:close="store.error = null">
      {{ store.error }}
    </v-alert>

    <!-- Calendario -->
    <div v-else class="mt-4">
      <CalendarioCitas :citas="store.citas" @click:cita="mostrarDetalleCita" @change:range="onRangeChange" />
    </div>

    <!-- Dialog de detalle - FUERA de cualquier v-if/v-else -->
    <DetalleCitaDialog v-model="dialogDetalle" :cita="citaSeleccionada" />

    <!-- DEBUG: Mostrar estado actual -->
    <v-card class="mt-4 pa-4" color="grey-lighten-4">
      <div class="text-caption">
        <strong>🔍 DEBUG:</strong><br>
        dialogDetalle: {{ dialogDetalle }}<br>
        citaSeleccionada: {{ citaSeleccionada?.paciente_nombre || 'null' }}
      </div>
    </v-card>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { useHorasTomadasStore } from '@/stores/horasTomadasStore'
import CalendarioCitas from '@/components/horastomadas/CalendarioCitas.vue'
import DetalleCitaDialog from '@/components/horastomadas/DetalleCitaDialog.vue'

// ══════════════════════════════════════════════════════════════
// STORE
// ══════════════════════════════════════════════════════════════

const store = useHorasTomadasStore()

// ══════════════════════════════════════════════════════════════
// REFS
// ══════════════════════════════════════════════════════════════

const dialogDetalle = ref(false)
const citaSeleccionada = ref(null)

// ══════════════════════════════════════════════════════════════
// WATCHERS PARA DEBUG
// ══════════════════════════════════════════════════════════════

watch(dialogDetalle, (newVal) => {
  console.log('👁️ WATCH - dialogDetalle cambió a:', newVal)
})

watch(citaSeleccionada, (newVal) => {
  console.log('👁️ WATCH - citaSeleccionada cambió a:', newVal)
})

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
 * Mostrar detalle de cita
 */
const mostrarDetalleCita = (cita) => {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('✅ EVENTO RECIBIDO EN PADRE')
  console.log('📦 Cita recibida:', cita)
  console.log('🔧 Antes - dialogDetalle:', dialogDetalle.value)
  console.log('🔧 Antes - citaSeleccionada:', citaSeleccionada.value)

  citaSeleccionada.value = cita
  dialogDetalle.value = true

  console.log('🔧 Después - dialogDetalle:', dialogDetalle.value)
  console.log('🔧 Después - citaSeleccionada:', citaSeleccionada.value)
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
}

/**
 * Cuando cambia el rango del calendario
 */
const onRangeChange = ({ start, end }) => {
  console.log('📅 Rango cambió:', start, end)
}

// ══════════════════════════════════════════════════════════════
// LIFECYCLE
// ══════════════════════════════════════════════════════════════

onMounted(async () => {
  console.log('🚀 HorasTomadasView montado')
  console.log('📊 Citas actuales:', store.citas.length)

  if (store.citas.length === 0) {
    await store.cargarCitas()
  }
})
</script>

<style scoped>
.horas-tomadas-view {
  padding: 20px;
}
</style>