<template>
  <div class="citas-view">
    <v-card>
      <v-card-title class="d-flex justify-space-between align-center">
        <span class="text-h5">Gestión de Citas</span>
        <CalendarioDropdown />
      </v-card-title>

      <v-divider></v-divider>

      <v-card-text>
        <!-- Info de semana seleccionada -->
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
                    <v-btn color="primary" variant="elevated" prepend-icon="mdi-magnify" @click="buscarHorarios">
                      Buscar Horarios
                    </v-btn>
                    <v-btn color="error" variant="text" icon @click="store.limpiarFiltroSemana()">
                      <v-icon>mdi-close</v-icon>
                    </v-btn>
                  </div>
                </div>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>

        <!-- Grid de días -->
        <div v-if="store.semanaSeleccionada">
          <v-row>
            <v-col v-for="dia in store.diasDeLaSemanaSeleccionada" :key="dia.fecha" cols="12" sm="6" md="4" lg="3">
              <v-card :color="dia.es_hoy ? 'green-lighten-5' : ''" variant="outlined" hover class="dia-card">
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
                  <v-btn color="primary" variant="tonal" size="small" block prepend-icon="mdi-clock-outline"
                    @click="verHorarios(dia)">
                    Ver horarios
                  </v-btn>
                </v-card-actions>
              </v-card>
            </v-col>
          </v-row>
        </div>

        <!-- Estado vacío -->
        <div v-else class="text-center py-12">
          <v-icon size="80" color="grey-lighten-2">mdi-calendar-cursor</v-icon>
          <p class="text-h6 text-grey mt-4">Selecciona una semana</p>
          <p class="text-caption text-grey">
            Haz clic en el botón de calendario para comenzar
          </p>
        </div>
      </v-card-text>
    </v-card>

    <!--  MODAL CON HORARIOS AGRUPADOS POR DOCTOR -->
    <v-dialog v-model="dialogHorarios" max-width="900" persistent scrollable>
      <v-card>
        <!-- Header del modal -->
        <v-card-title class="d-flex justify-space-between align-center bg-primary">
          <div class="text-white">
            <div class="text-h6">Horarios Disponibles</div>
            <div class="text-caption" v-if="diaSeleccionadoCompleto">
              {{ diaSeleccionadoCompleto.dia_semana }}, {{ diaSeleccionadoCompleto.dia }} de {{ store.nombreMes }}
            </div>
          </div>
          <v-btn icon variant="text" color="white" @click="cerrarModal">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-card-title>

        <v-divider></v-divider>

        <!-- Contenido del modal -->
        <v-card-text class="pa-4">
          <!-- Estado de carga -->
          <div v-if="store.loadingHorarios" class="text-center py-12">
            <v-progress-circular indeterminate color="primary" size="64"></v-progress-circular>
            <p class="mt-4 text-grey">Cargando horarios disponibles...</p>
          </div>

          <!-- Estado de error -->
          <div v-else-if="store.errorHorarios" class="text-center py-12">
            <v-icon size="64" color="error">mdi-alert-circle</v-icon>
            <p class="mt-4 text-error">{{ store.errorHorarios }}</p>
            <v-btn color="primary" variant="tonal" class="mt-4"
              @click="store.cargarHorarios(diaSeleccionadoCompleto.fecha)">
              Reintentar
            </v-btn>
          </div>

          <!--  DOCTORES CON SUS HORARIOS AGRUPADOS -->
          <div v-else>
            <!-- Si hay doctores disponibles -->
            <div v-if="doctoresConHorarios.length > 0">
              <!-- Card por cada doctor -->
              <v-card v-for="doctor in doctoresConHorarios" :key="doctor.doctor_id" class="mb-4" variant="outlined">
                <!-- Header del doctor -->
                <v-card-title class="bg-grey-lighten-4">
                  <div class="d-flex align-center gap-3">
                    <v-avatar color="primary" size="50">
                      <v-img v-if="doctor.foto" :src="doctor.foto"></v-img>
                      <span v-else class="text-h6 text-white">
                        {{ doctor.doctor_nombre.substring(0, 2).toUpperCase() }}
                      </span>
                    </v-avatar>

                    <div class="flex-grow-1">
                      <div class="text-h6">Dr(a). {{ doctor.doctor_nombre }}</div>
                      <div class="text-caption text-grey-darken-1">
                        {{ doctor.especialidad }}
                      </div>
                    </div>

                    <!-- Info del rango horario -->
                    <v-chip color="primary" variant="tonal" prepend-icon="mdi-clock-outline">
                      {{ doctor.rango_horario }}
                    </v-chip>

                    <v-chip color="success" variant="tonal">
                      {{ doctor.total_bloques }} bloques
                    </v-chip>
                  </div>
                </v-card-title>

                <v-divider></v-divider>

                <!-- Bloques de horarios del doctor -->
                <v-card-text class="pa-3">
                  <v-row dense>
                    <v-col v-for="bloque in doctor.bloques" :key="bloque.id" cols="6" sm="4" md="3">
                      <v-btn block size="large" class="ml-1" :disabled="!bloque.disponible"
                        :color="getColorBloque(bloque)" :variant="getVariantBloque(bloque)"
                        @click="seleccionarBloque(doctor, bloque)">
                        <div class="text-center">
                          <div class="text-subtitle-2">{{ bloque.hora_inicio }}</div>
                          <div class="text-caption">
                            {{ bloque.duracion }} min
                            <v-chip v-if="!bloque.disponible" size="x-small" color="error" class="ml-1">
                              Ocupado
                            </v-chip>
                          </div>
                        </div>
                      </v-btn>
                    </v-col>
                  </v-row>
                </v-card-text>
              </v-card>
            </div>

            <!-- Sin horarios disponibles -->
            <div v-else class="text-center py-12">
              <v-icon size="80" color="grey-lighten-2">mdi-calendar-remove</v-icon>
              <p class="text-h6 text-grey mt-4">No hay horarios disponibles</p>
              <p class="text-caption text-grey">
                No hay médicos con horarios disponibles para este día
              </p>
            </div>
          </div>
        </v-card-text>

        <!-- Acciones del modal -->
        <v-divider></v-divider>

        <v-card-actions class="pa-4">
          <v-spacer></v-spacer>
          <v-btn variant="text" @click="cerrarModal">
            Cancelar
          </v-btn>
          <v-btn color="primary" variant="elevated" :disabled="!bloqueSeleccionado" @click="confirmarAgendamiento">
            Agendar Cita
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup>
import { onMounted, watch, ref, computed } from 'vue'
import { useCitasStore } from '@/stores/citasStore'
import CalendarioDropdown from '@/components/CalendarioDropdown.vue'

const store = useCitasStore()

// Variables reactivas
const dialogHorarios = ref(false)
const diaSeleccionadoCompleto = ref(null)
const bloqueSeleccionado = ref(null)
const doctorSeleccionado = ref(null)

//  Computed: Obtener doctores con horarios desde el store
const doctoresConHorarios = computed(() => {

  if (!store.horariosDisponibles) {
    console.warn(' store.horariosDisponibles es null/undefined')
    return []
  }

  // Validación 2: ¿Existe la propiedad doctores?
  if (!store.horariosDisponibles.doctores) {
    console.warn(' store.horariosDisponibles.doctores es null/undefined')
    return []
  }

  // Validación 3: ¿Es un array?
  if (!Array.isArray(store.horariosDisponibles.doctores)) {
    console.error(' store.horariosDisponibles.doctores NO es un array')
    return []
  }

  return store.horariosDisponibles.doctores
})

// Watch para debugging
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

// Funciones de formato
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

const formatearFechaCorta = (fecha) => {
  return new Date(fecha + 'T00:00:00').toLocaleDateString('es-CL', {
    day: '2-digit',
    month: 'short'
  })
}

const buscarHorarios = () => {
  console.log('🔍 Buscar horarios entre:', {
    inicio: store.fechaInicioSemana,
    fin: store.fechaFinSemana
  })
}

// Ver horarios de un día
const verHorarios = async (dia) => {
  console.log('📅 CLICK EN VER HORARIOS - Día:', dia.fecha)

  diaSeleccionadoCompleto.value = dia
  bloqueSeleccionado.value = null
  doctorSeleccionado.value = null
  dialogHorarios.value = true

  await store.cargarHorarios(dia.fecha)
}

// 🆕 Seleccionar un bloque de horario
const seleccionarBloque = (doctor, bloque) => {
  // ✅ VALIDAR que el bloque esté disponible
  if (!bloque.disponible) {
    console.warn('⚠️ Intento de seleccionar bloque ocupado')
    console.warn('   Bloque ID:', bloque.id)
    console.warn('   Hora:', bloque.hora_inicio)
    return  // ❌ No hace nada si está ocupado
  }



  bloqueSeleccionado.value = bloque.id
  doctorSeleccionado.value = doctor
}

// 🆕 Confirmar agendamiento
// ✅ MEJORADO - Con más validaciones
const confirmarAgendamiento = async () => {
  if (!bloqueSeleccionado.value) {
    console.warn(' No hay bloque seleccionado')
    return
  }

  // Validación 2: Hay un doctor seleccionado
  if (!doctorSeleccionado.value) {
    console.warn(' No hay doctor seleccionado')
    return
  }

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log(' CONFIRMAR AGENDAMIENTO')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log(' Doctor:', doctorSeleccionado.value.doctor_nombre)
  console.log(' Horario ID:', bloqueSeleccionado.value)

  try {
    await store.agendarCita(bloqueSeleccionado.value)



    // TODO: Aquí podrías mostrar un snackbar de éxito

    cerrarModal()
  } catch (error) {
    console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.error(' ERROR AL AGENDAR CITA')
    console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.error('Mensaje:', error.message)
    console.error('Detalles:', error.response?.data)
    console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')

    // TODO: Aquí podrías mostrar un snackbar de error
  }
}

// Cerrar modal
const cerrarModal = () => {
  dialogHorarios.value = false

  setTimeout(() => {
    diaSeleccionadoCompleto.value = null
    bloqueSeleccionado.value = null
    doctorSeleccionado.value = null
    store.limpiarHorarios()
  }, 300)
}

// Lifecycle
onMounted(() => {
  const hoy = new Date()
  store.cambiarPeriodo(hoy.getFullYear(), hoy.getMonth() + 1)
})

const getColorBloque = (bloque) => {
  // Si el bloque NO está disponible → Rojo
  if (!bloque.disponible) {
    return 'error'
  }

  // Si está seleccionado → Azul primario
  if (bloqueSeleccionado.value === bloque.id) {
    return 'primary'
  }

  // Estado normal → Color por defecto
  return 'default'
}

/**
 * 🎨 Determina el variant (estilo) del botón
 */
const getVariantBloque = (bloque) => {
  // Si NO está disponible → Tonal (más suave)
  if (!bloque.disponible) {
    return 'tonal'
  }

  // Si está seleccionado → Elevated (con sombra)
  if (bloqueSeleccionado.value === bloque.id) {
    return 'elevated'
  }

  // Estado normal → Outlined (solo borde)
  return 'outlined'
}

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
</style>