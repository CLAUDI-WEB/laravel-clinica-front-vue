<script setup>
// ═══════════════════════════════════════════════════════════════════════════
// IMPORTS - Importar dependencias necesarias
// ═══════════════════════════════════════════════════════════════════════════

import { onMounted, watch, ref } from 'vue'
import { useCitasStore } from '@/stores/citasStore'
import CalendarioDropdown from '@/components/CalendarioDropdown.vue'

// ❌ NO IMPORTAR API - Todo se hace a través del store
// import api from '@/services/api'  ← ELIMINAR ESTA LÍNEA

// ═══════════════════════════════════════════════════════════════════════════
// INSTANCIA DEL STORE
// ═══════════════════════════════════════════════════════════════════════════

const store = useCitasStore()

// ═══════════════════════════════════════════════════════════════════════════
// STATE - Variables Reactivas SOLO para el Modal (UI)
// ═══════════════════════════════════════════════════════════════════════════

// Control del estado abierto/cerrado del modal
const dialogHorarios = ref(false)

// Día seleccionado con toda su información (objeto completo del día)
const diaSeleccionadoCompleto = ref(null)

// ═══════════════════════════════════════════════════════════════════════════
// WATCH - Observador de cambios para debugging
// ═══════════════════════════════════════════════════════════════════════════

watch(
  () => store.semanaSeleccionada,
  (nuevoValor) => {
    console.log('✅ SEMANA SELECCIONADA CAMBIÓ:', nuevoValor)
    console.log('📅 Fechas:', {
      inicio: store.fechaInicioSemana,
      fin: store.fechaFinSemana
    })
  }
)

// ═══════════════════════════════════════════════════════════════════════════
// FUNCIÓN: formatearRangoCompleto
// ═══════════════════════════════════════════════════════════════════════════
const formatearRangoCompleto = () => {
  if (!store.fechaInicioSemana || !store.fechaFinSemana) {
    return 'Sin fecha'
  }
  
  const inicio = new Date(store.fechaInicioSemana + 'T00:00:00')
  const fin = new Date(store.fechaFinSemana + 'T00:00:00')
  
  const opcionesInicio = { day: 'numeric', month: 'long' }
  const opcionesFin = { day: 'numeric', month: 'long', year: 'numeric' }
  
  return `${inicio.toLocaleDateString('es-CL', opcionesInicio)} al ${fin.toLocaleDateString('es-CL', opcionesFin)}`
}

// ═══════════════════════════════════════════════════════════════════════════
// FUNCIÓN: formatearFechaCorta
// ═══════════════════════════════════════════════════════════════════════════
const formatearFechaCorta = (fecha) => {
  return new Date(fecha + 'T00:00:00').toLocaleDateString('es-CL', {
    day: '2-digit',
    month: 'short'
  })
}

// ═══════════════════════════════════════════════════════════════════════════
// FUNCIÓN: formatearHora
// ═══════════════════════════════════════════════════════════════════════════
const formatearHora = (hora) => {
  return hora.substring(11, 19)
}

// ═══════════════════════════════════════════════════════════════════════════
// FUNCIÓN: buscarHorarios
// ═══════════════════════════════════════════════════════════════════════════
const buscarHorarios = () => {
  console.log('🔍 Buscar horarios entre:', {
    inicio: store.fechaInicioSemana,
    fin: store.fechaFinSemana
  })
}

// ═══════════════════════════════════════════════════════════════════════════
// FUNCIÓN: verHorarios - USA SOLO EL STORE
// ═══════════════════════════════════════════════════════════════════════════
const verHorarios = async (dia) => {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('📅 CLICK EN VER HORARIOS')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('Día seleccionado:', dia)
  console.log('Fecha:', dia.fecha)
  console.log('Día de la semana:', dia.dia_semana)
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  
  // Guardar día completo localmente (para mostrar en el header del modal)
  diaSeleccionadoCompleto.value = dia
  
  // Abrir modal
  dialogHorarios.value = true
  
  //  Cargar horarios usando SOLO el STORE (no hace llamadas API directas)
  await store.cargarHorarios(dia.fecha)
}

// ═══════════════════════════════════════════════════════════════════════════
// FUNCIÓN: cerrarModal
// ═══════════════════════════════════════════════════════════════════════════
const cerrarModal = () => {
  dialogHorarios.value = false
  
  setTimeout(() => {
    diaSeleccionadoCompleto.value = null
    // ✅ Limpiar horarios del STORE
    store.limpiarHorarios()
  }, 300)
}

// ═══════════════════════════════════════════════════════════════════════════
// FUNCIÓN: agendarCita - USA SOLO EL STORE
// ═══════════════════════════════════════════════════════════════════════════
const agendarCita = async (horario) => {

  const Hora= formatearHora(horario.hora) 

  console.log('📝 Intentando agendar cita:', {
    fecha: diaSeleccionadoCompleto.value.fecha,
    hora: Hora,
    doctor: horario.doctor_nombre,
    id: horario.id
  })
  
  try {
    // ✅ Agendar cita usando SOLO el STORE (no hace llamadas API directas)
    await store.agendarCita(horario.id)
    
    console.log('✅ Cita agendada exitosamente')
    
    // Cerrar modal después de agendar
    cerrarModal()
    
    // TODO: Aquí podrías mostrar un snackbar de éxito
    
  } catch (error) {
    console.error('❌ Error al agendar cita:', error)
    // TODO: Aquí podrías mostrar un snackbar de error
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// LIFECYCLE HOOK: onMounted
// ═══════════════════════════════════════════════════════════════════════════
onMounted(() => {
  const hoy = new Date()
  store.cambiarPeriodo(hoy.getFullYear(), hoy.getMonth() + 1)
  
  console.log('🚀 CitasView montado')
})
</script>

<style scoped>
.citas-view {
  padding: 20px;
}

.dia-card {
  transition: all 0.2s ease;
}

.dia-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.horario-item {
  transition: background-color 0.2s ease;
}

.horario-item:hover {
  background-color: rgba(25, 118, 210, 0.08);
}
</style>

<template>
  <div class="citas-view">
    <v-card>
      <v-card-title class="d-flex justify-space-between align-center">
        <span class="text-h5">Gestión de Citas</span>
        <CalendarioDropdown />
      </v-card-title>

      <v-divider></v-divider>

      <v-card-text>
        <v-row v-if="store.semanaSeleccionada" class="mb-4">
          <v-col cols="12">
            <v-card color="primary" variant="tonal">
              <v-card-text class="py-3">
                <div class="d-flex align-center justify-space-between flex-wrap gap-3">
                  <div class="d-flex align-center gap-3">
                    <v-icon size="large" color="primary">mdi-calendar-check</v-icon>
                    <div>
                      <div class="text-overline text-primary">Semana Seleccionada</div>
                      <div class="text-h6 font-weight-bold">
                        {{ formatearRangoCompleto() }}
                      </div>
                      <div class="text-caption text-grey-darken-1">
                        {{ store.diasDeLaSemanaSeleccionada.length }} días • 
                        Semana {{ store.semanaSeleccionada }} de {{ store.nombreMes }}
                      </div>
                    </div>
                  </div>
                  
                  <div class="d-flex gap-2">
                    <v-btn
                      color="primary"
                      variant="elevated"
                      prepend-icon="mdi-magnify"
                      @click="buscarHorarios"
                    >
                      Buscar Horarios
                    </v-btn>
                    <v-btn
                      color="error"
                      variant="text"
                      icon
                      @click="store.limpiarFiltroSemana()"
                    >
                      <v-icon>mdi-close</v-icon>
                    </v-btn>
                  </div>
                </div>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>

        <div v-if="store.semanaSeleccionada">
          <v-row>
            <v-col
              v-for="dia in store.diasDeLaSemanaSeleccionada"
              :key="dia.fecha"
              cols="12"
              sm="6"
              md="4"
              lg="3"
            >
              <v-card
                :color="dia.es_hoy ? 'green-lighten-5' : ''"
                variant="outlined"
                hover
                class="dia-card"
              >
                <v-card-title class="d-flex align-center gap-2 py-3">
                  <v-avatar :color="dia.es_hoy ? 'success' : 'primary'" size="40">
                    <span class="text-h6">{{ dia.dia }}</span>
                  </v-avatar>
                  <div>
                    <div class="text-subtitle-1">{{ dia.dia_semana }}</div>
                    <div class="text-caption text-grey">
                      {{ formatearFechaCorta(dia.fecha) }}
                    </div>
                  </div>
                  <v-spacer></v-spacer>
                  <v-chip v-if="dia.es_hoy" size="x-small" color="success">
                    Hoy
                  </v-chip>
                </v-card-title>

                <v-divider></v-divider>

                <v-card-actions>
                  <v-btn
                    color="primary"
                    variant="tonal"
                    size="small"
                    block
                    prepend-icon="mdi-clock-outline"
                    @click="verHorarios(dia)"
                  >
                    Ver horarios
                  </v-btn>
                </v-card-actions>
              </v-card>
            </v-col>
          </v-row>
        </div>

        <div v-else class="text-center py-12">
          <v-icon size="80" color="grey-lighten-2">mdi-calendar-cursor</v-icon>
          <p class="text-h6 text-grey mt-4">Selecciona una semana</p>
          <p class="text-caption text-grey">
            Haz clic en el botón de calendario para comenzar
          </p>
        </div>
      </v-card-text>
    </v-card>

    <!-- Modal usando datos del STORE -->
    <v-dialog v-model="dialogHorarios" max-width="700" persistent>
      <v-card>
        <v-card-title class="d-flex justify-space-between align-center bg-primary">
          <div class="text-white">
            <div class="text-h6">Horarios Disponibles</div>
            <div class="text-caption" v-if="diaSeleccionadoCompleto">
              {{ diaSeleccionadoCompleto.dia_semana }}, {{ diaSeleccionadoCompleto.dia }} de {{ store.nombreMes }}
            </div>
          </div>
          <v-btn
            icon
            variant="text"
            color="white"
            @click="cerrarModal"
          >
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-card-title>

        <v-divider></v-divider>

        <v-card-text class="pa-0">
          <!-- Estado de carga desde el STORE -->
          <div v-if="store.loadingHorarios" class="text-center py-12">
            <v-progress-circular
              indeterminate
              color="primary"
              size="64"
            ></v-progress-circular>
            <p class="mt-4 text-grey">Cargando horarios disponibles...</p>
          </div>

          <!-- Estado de error desde el STORE -->
          <div v-else-if="store.errorHorarios" class="text-center py-12">
            <v-icon size="64" color="error">mdi-alert-circle</v-icon>
            <p class="mt-4 text-error">{{ store.errorHorarios }}</p>
            <v-btn
              color="primary"
              variant="tonal"
              class="mt-4"
              @click="store.cargarHorarios(diaSeleccionadoCompleto.fecha)"
            >
              Reintentar
            </v-btn>
          </div>

          <!-- Lista de horarios desde el STORE -->
          <div v-else>
            <v-list v-if="store.horariosDisponibles.length > 0">
              <v-list-item
                v-for="horario in store.horariosDisponibles"
                :key="horario.id"
                class="horario-item"
              >
                <template v-slot:prepend>
                  <v-avatar color="primary" size="40">
                    <v-icon color="white">mdi-clock-outline</v-icon>
                  </v-avatar>
                </template>

                <v-list-item-title class="text-h6">
                  {{ formatearHora(horario.hora) }}
                </v-list-item-title>
                <v-list-item-subtitle>
                  Dr. {{ horario.doctor_nombre }}
                  <span v-if="horario.especialidad"> • {{ horario.especialidad }}</span>
                </v-list-item-subtitle>

                <template v-slot:append>
                  <v-btn
                    color="primary"
                    variant="elevated"
                    size="small"
                    @click="agendarCita(horario)"
                  >
                    Agendar
                  </v-btn>
                </template>
              </v-list-item>
            </v-list>

            <div v-else class="text-center py-12">
              <v-icon size="80" color="grey-lighten-2">mdi-calendar-remove</v-icon>
              <p class="text-h6 text-grey mt-4">No hay horarios disponibles</p>
              <p class="text-caption text-grey">
                No hay horarios disponibles para este día
              </p>
            </div>
          </div>
        </v-card-text>

        <v-card-actions v-if="!store.loadingHorarios && !store.errorHorarios">
          <v-spacer></v-spacer>
          <v-btn
            variant="text"
            @click="cerrarModal"
          >
            Cerrar
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>