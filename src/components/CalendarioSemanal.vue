<template>
  <v-card class="calendario-compacto" elevation="1">
    <v-card-title class="py-2 px-3 bg-primary">
      <div class="d-flex justify-space-between align-center">
        <span class="text-subtitle-1 text-white">
          {{ store.nombreMes }} {{ store.añoSeleccionado }}
        </span>
        <v-chip 
          v-if="store.semanaSeleccionada" 
          size="x-small" 
          color="white"
        >
          S{{ store.semanaSeleccionada }}
        </v-chip>
      </div>
    </v-card-title>

    <v-card-text class="pa-2">
      <v-progress-linear
        v-if="store.loading"
        indeterminate
        color="primary"
        height="2"
        class="mb-2"
      ></v-progress-linear>

      <!-- Calendario Grid Compacto -->
      <div v-if="!store.loading && calendarioDias.length > 0" class="calendario-mini">
        <!-- Headers de días -->
        <div class="dias-header-mini">
          <div v-for="dia in diasSemana" :key="dia" class="dia-header-mini">
            {{ dia }}
          </div>
        </div>

        <!-- Grid de días -->
        <div class="dias-grid-mini">
          <div
            v-for="dia in calendarioDias"
            :key="dia.fecha"
            class="dia-mini"
            :class="{
              'dia-fuera': !dia.esDelMes,
              'dia-hoy': dia.esHoy,
              'dia-semana-seleccionada': dia.estaSemanaSeleccionada,
              'dia-activo': dia.esDelMes
            }"
            @click="seleccionarDia(dia)"
          >
            <span class="dia-numero-mini">{{ dia.dia }}</span>
            <div v-if="dia.esHoy" class="dia-hoy-dot"></div>
          </div>
        </div>
      </div>

      <!-- Info semana seleccionada -->
      <div v-if="rangoSemanaSeleccionada" class="semana-info mt-2">
        <v-chip 
          size="small" 
          color="primary" 
          variant="tonal"
          closable
          @click:close="store.limpiarFiltroSemana()"
        >
          <v-icon start size="x-small">mdi-calendar-check</v-icon>
          {{ rangoSemanaSeleccionada }}
        </v-chip>
      </div>
    </v-card-text>
  </v-card>
</template>

<script setup>
import { computed } from 'vue'
import { useCitasStore } from '@/stores/citasStore'

const store = useCitasStore()

const diasSemana = ['D', 'L', 'M', 'M', 'J', 'V', 'S']

const calendarioDias = computed(() => {
  if (!store.semanas || store.semanas.length === 0) return []

  const dias = []
  const primeraSemana = store.semanas[0]
  const ultimaSemana = store.semanas[store.semanas.length - 1]

  if (!primeraSemana || !primeraSemana.dias || primeraSemana.dias.length === 0) return []

  const primerDiaDelMes = new Date(primeraSemana.dias[0].fecha)
  const diaSemana = primerDiaDelMes.getDay()

  // Días del mes anterior
  for (let i = diaSemana - 1; i >= 0; i--) {
    const fecha = new Date(primerDiaDelMes)
    fecha.setDate(fecha.getDate() - (i + 1))
    dias.push({
      fecha: fecha.toISOString().split('T')[0],
      dia: fecha.getDate(),
      esDelMes: false,
      esHoy: false,
      estaSemanaSeleccionada: false,
      numeroSemana: null
    })
  }

  // Días del mes actual
  store.semanas.forEach(semana => {
    semana.dias.forEach(dia => {
      dias.push({
        fecha: dia.fecha,
        dia: dia.dia,
        esDelMes: true,
        esHoy: dia.es_hoy,
        estaSemanaSeleccionada: store.semanaSeleccionada === semana.numero,
        numeroSemana: semana.numero,
        esFindeSemana: dia.es_fin_semana
      })
    })
  })

  // Días del mes siguiente
  const ultimoDiaDelMes = new Date(ultimaSemana.dias[ultimaSemana.dias.length - 1].fecha)
  const diasRestantes = 6 - ultimoDiaDelMes.getDay()
  
  for (let i = 1; i <= diasRestantes; i++) {
    const fecha = new Date(ultimoDiaDelMes)
    fecha.setDate(fecha.getDate() + i)
    dias.push({
      fecha: fecha.toISOString().split('T')[0],
      dia: fecha.getDate(),
      esDelMes: false,
      esHoy: false,
      estaSemanaSeleccionada: false,
      numeroSemana: null
    })
  }

  return dias
})

const rangoSemanaSeleccionada = computed(() => {
  if (!store.semanaSeleccionada) return null
  
  const semana = store.semanas.find(s => s.numero === store.semanaSeleccionada)
  if (!semana) return null

  const inicio = new Date(semana.fecha_inicio).toLocaleDateString('es-CL', { day: '2-digit', month: 'short' })
  const fin = new Date(semana.fecha_fin).toLocaleDateString('es-CL', { day: '2-digit', month: 'short' })
  
  return `${inicio} - ${fin}`
})

const seleccionarDia = (dia) => {
  if (!dia.esDelMes) return
  
  if (store.semanaSeleccionada === dia.numeroSemana) {
    store.limpiarFiltroSemana()
  } else {
    store.seleccionarSemana(dia.numeroSemana)
  }
}
</script>

<style scoped>
.calendario-compacto {
  max-width: 320px;
  font-size: 0.875rem;
}

.calendario-mini {
  width: 100%;
}

.dias-header-mini {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 2px;
  margin-bottom: 4px;
}

.dia-header-mini {
  text-align: center;
  font-weight: 600;
  font-size: 0.7rem;
  color: #666;
  padding: 4px 0;
}

.dias-grid-mini {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 2px;
}

.dia-mini {
  aspect-ratio: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
  position: relative;
  transition: all 0.15s ease;
  border: 1px solid #e0e0e0;
  background-color: #fafafa;
  font-size: 0.75rem;
}

.dia-activo {
  cursor: pointer;
  background-color: white;
}

.dia-activo:hover {
  background-color: #e3f2fd;
  transform: scale(1.1);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  z-index: 1;
}

.dia-fuera {
  opacity: 0.25;
  background-color: transparent;
  border-color: transparent;
  cursor: default;
}

.dia-fuera:hover {
  background-color: transparent;
  transform: none;
  box-shadow: none;
}

.dia-hoy {
  background-color: #e8f5e9 !important;
  border: 2px solid #4caf50;
  font-weight: 700;
}

.dia-semana-seleccionada {
  background: linear-gradient(135deg, #1976d2 0%, #1565c0 100%) !important;
  border-color: #1976d2;
  box-shadow: 0 2px 6px rgba(25, 118, 210, 0.4);
}

.dia-semana-seleccionada .dia-numero-mini {
  color: white;
  font-weight: 700;
}

.dia-numero-mini {
  font-size: 0.75rem;
  color: #212121;
}

.dia-hoy-dot {
  position: absolute;
  bottom: 2px;
  width: 4px;
  height: 4px;
  border-radius: 50%;
  background-color: #4caf50;
}

.semana-info {
  display: flex;
  justify-content: center;
}

@media (max-width: 600px) {
  .calendario-compacto {
    max-width: 100%;
  }
  
  .dia-numero-mini {
    font-size: 0.7rem;
  }
}
</style>