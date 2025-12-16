<template>
  <!-- Contenedor principal del componente calendario -->
  <div class="calendario-primevue">
    
    <!-- MENÚ DROPDOWN: Componente de Vuetify que maneja el estado abierto/cerrado del calendario -->
    <!-- v-model="menuAbierto": Vincula el estado del menú con la variable reactiva -->
    <!-- :close-on-content-click="false": Evita que el menú se cierre al hacer clic dentro -->
    <!-- location="bottom": Posiciona el menú debajo del botón activador -->
    <!-- offset="8": Separación de 8px entre el botón y el menú -->
    <v-menu
      v-model="menuAbierto"
      :close-on-content-click="false"
      location="bottom"
      offset="8"
    >
      <!-- SLOT ACTIVATOR: Define qué elemento abre/cierra el menú -->
      <template v-slot:activator="{ props }">
        <!-- BOTÓN PRINCIPAL: Muestra el rango de fechas seleccionado o texto por defecto -->
        <!-- v-bind="props": Vincula todas las props del activador automáticamente -->
        <!-- color="primary": Color azul del botón -->
        <!-- variant="tonal": Estilo tonal (fondo suave) -->
        <!-- prepend-icon: Ícono de calendario antes del texto -->
        <v-btn
          v-bind="props"
          color="primary"
          variant="tonal"
          prepend-icon="mdi-calendar-month"
        >
          <!-- Texto del botón calculado dinámicamente por el computed textoBoton -->
          {{ textoBoton }}
        </v-btn>
      </template>

      <!-- CONTENIDO DEL MENÚ: Tarjeta que contiene el calendario y controles -->
      <!-- width="360": Ancho fijo de 360px -->
      <!-- class="pa-3": Padding de 12px en todos los lados -->
      <v-card width="360" class="pa-3">
        
        <!-- HEADER DEL MENÚ: Título y botón de cerrar -->
        <div class="d-flex justify-space-between align-center mb-3">
          <!-- Título del menú -->
          <span class="text-h6">Seleccionar Semana</span>
          
          <!-- BOTÓN CERRAR: Cierra el menú al hacer clic -->
          <!-- icon: Botón circular solo con ícono -->
          <!-- size="small": Tamaño pequeño -->
          <!-- variant="text": Sin fondo -->
          <!-- @click: Cierra el menú poniendo menuAbierto en false -->
          <v-btn
            icon
            size="small"
            variant="text"
            @click="menuAbierto = false"
          >
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </div>

        <!-- CALENDARIO PRIMEVUE: Componente de calendario interactivo -->
        <!-- v-model="fechaSeleccionada": Vincula la fecha seleccionada -->
        <!-- inline: Muestra el calendario siempre visible (no popup) -->
        <!-- :manualInput="false": Desactiva entrada manual de fechas -->
        <!-- dateFormat="dd/mm/yy": Formato de fecha día/mes/año -->
        <!-- :firstDayOfWeek="1": La semana empieza en lunes (1=lunes, 0=domingo) -->
        <!-- @date-select: Se ejecuta cuando el usuario hace clic en un día -->
        <!-- :pt: PassThrough para aplicar clases CSS personalizadas -->
        <Calendar
          v-model="fechaSeleccionada"
          inline
          :manualInput="false"
          dateFormat="dd/mm/yy"
          :firstDayOfWeek="1"
          @date-select="onDateSelect"
          :pt="{
            root: { class: 'calendario-semana' }
          }"
        />

        <!-- Línea divisoria entre calendario e información -->
        <v-divider class="my-3"></v-divider>
        
        <!-- INFORMACIÓN DE LA SEMANA: Se muestra solo si hay una semana seleccionada -->
        <!-- v-if="semanaInfo": Solo renderiza si el computed semanaInfo tiene valor -->
        <div v-if="semanaInfo">
          
          <!-- ALERTA INFORMATIVA: Muestra detalles de la semana seleccionada -->
          <!-- type="info": Alerta azul informativa -->
          <!-- variant="tonal": Fondo suave -->
          <!-- density="compact": Altura reducida -->
          <v-alert type="info" variant="tonal" density="compact">
            <!-- Etiqueta superior -->
            <div class="text-caption mb-1">Semana seleccionada:</div>
            
            <!-- Rango de fechas formateado (ej: "08 dic - 14 dic") -->
            <div class="font-weight-bold">
              {{ semanaInfo.label }}
            </div>
            
            <!-- Información adicional: cantidad de días y rango completo -->
            <!-- Llama a formatearFecha() para formatear fechas con día de semana -->
            <div class="text-caption mt-1">
              {{ semanaInfo.totalDias }} días ({{ formatearFecha(semanaInfo.fechaInicio) }} - {{ formatearFecha(semanaInfo.fechaFin) }})
            </div>
          </v-alert>

          <!-- BOTÓN CONFIRMAR: Cierra el menú y confirma la selección -->
          <!-- color="primary": Color azul -->
          <!-- block: Ocupa 100% del ancho -->
          <!-- class="mt-3": Margin top de 12px -->
          <!-- @click: Ejecuta confirmarSeleccion() que cierra el menú -->
          <v-btn
            color="primary"
            block
            class="mt-3"
            @click="confirmarSeleccion"
          >
            Confirmar selección
          </v-btn>
        </div>

        <!-- BOTÓN IR A HOY: Se muestra cuando NO hay semana seleccionada -->
        <!-- v-else: Aparece cuando semanaInfo es null -->
        <!-- variant="text": Sin fondo -->
        <!-- block: Ocupa 100% del ancho -->
        <!-- @click: Ejecuta irHoy() que navega al mes actual y selecciona hoy -->
        <v-btn
          v-else
          variant="text"
          block
          class="mt-2"
          @click="irHoy"
        >
          Ir a hoy
        </v-btn>
      </v-card>
    </v-menu>
  </div>
</template>

<script setup>
// ═══════════════════════════════════════════════════════════════════════════
// IMPORTS - Importar dependencias necesarias
// ═══════════════════════════════════════════════════════════════════════════

// ref: Crear variables reactivas
// computed: Crear propiedades computadas que se recalculan automáticamente
// watch: Observar cambios en variables reactivas
// nextTick: Esperar a que Vue actualice el DOM
import { ref, computed, watch, nextTick } from 'vue'

// Importar componente Calendar de PrimeVue
import Calendar from 'primevue/calendar'

// Importar el store de Pinia para gestión de citas
import { useCitasStore } from '@/stores/citasStore'

// ═══════════════════════════════════════════════════════════════════════════
// STATE - Variables Reactivas
// ═══════════════════════════════════════════════════════════════════════════

// Instancia del store de citas
const store = useCitasStore()

// Control del estado abierto/cerrado del menú dropdown
const menuAbierto = ref(false)

// Fecha actualmente seleccionada en el calendario (objeto Date)
const fechaSeleccionada = ref(null)

// Bandera para evitar bucles infinitos en watchers
// Se activa cuando cambiamos la fecha programáticamente
const ignorarCambioFecha = ref(false)

// ═══════════════════════════════════════════════════════════════════════════
// COMPUTED - Propiedades Computadas
// ═══════════════════════════════════════════════════════════════════════════

/**
 * COMPUTED: textoBoton
 * Calcula el texto que se muestra en el botón del calendario
 * 
 * Retorna:
 * - Si hay fechas seleccionadas: "08 dic - 14 dic"
 * - Si no hay selección: "Seleccionar semana"
 */
const textoBoton = computed(() => {
  // Verificar si hay fechas de inicio y fin en el store
  if (store.fechaInicioSemana && store.fechaFinSemana) {
    // FIX: Agregar 'T00:00:00' para evitar desfase de zona horaria
    const inicio = new Date(store.fechaInicioSemana + 'T00:00:00').toLocaleDateString('es-CL', { day: '2-digit', month: 'short' })
    const fin = new Date(store.fechaFinSemana + 'T00:00:00').toLocaleDateString('es-CL', { day: '2-digit', month: 'short' })
    return `${inicio} - ${fin}`
  }
  // Si no hay selección, mostrar texto por defecto
  return 'Seleccionar semana'
})

/**
 * COMPUTED: semanaInfo
 * Obtiene información detallada de la semana seleccionada
 * 
 * Retorna:
 * - Objeto con información de la semana si hay selección
 * - null si no hay semana seleccionada
 */
const semanaInfo = computed(() => {
  // Si no hay semana seleccionada, retornar null
  if (!store.semanaSeleccionada) return null
  
  // Buscar la semana en el array de semanas del store
  const semana = store.semanas.find(s => s.numero === store.semanaSeleccionada)
  if (!semana) return null

  // FIX: Agregar 'T00:00:00' para evitar desfase de zona horaria
  const inicio = new Date(semana.fecha_inicio + 'T00:00:00')
  const fin = new Date(semana.fecha_fin + 'T00:00:00')
  
  // Formatear fechas para el label
  const labelInicio = inicio.toLocaleDateString('es-CL', { day: '2-digit', month: 'short' })
  const labelFin = fin.toLocaleDateString('es-CL', { day: '2-digit', month: 'short' })
  
  // Retornar objeto con toda la información de la semana
  return {
    ...semana,                          // Propiedades originales de la semana
    label: `${labelInicio} - ${labelFin}`, // Label formateado: "08 dic - 14 dic"
    totalDias: semana.dias.length,      // Cantidad de días (normalmente 7)
    fechaInicio: semana.fecha_inicio,   // Fecha ISO de inicio
    fechaFin: semana.fecha_fin          // Fecha ISO de fin
  }
})

// ═══════════════════════════════════════════════════════════════════════════
// FUNCIONES - Métodos del componente
// ═══════════════════════════════════════════════════════════════════════════

/**
 * FUNCIÓN: formatearFecha
 * Formatea una fecha para mostrar día de semana, día y mes
 * 
 * @param {string} fecha - Fecha en formato ISO (YYYY-MM-DD)
 * @returns {string} - Fecha formateada (ej: "lun, 08 dic")
 */
const formatearFecha = (fecha) => {
  return new Date(fecha + 'T00:00:00').toLocaleDateString('es-CL', {
    weekday: 'short', // Día de semana abreviado: lun, mar, mié
    day: '2-digit',   // Día con 2 dígitos: 08, 09, 10
    month: 'short'    // Mes abreviado: ene, feb, dic
  })
}

/**
 * FUNCIÓN: resaltarSemana
 * Aplica estilos CSS a todos los días de la semana seleccionada en el calendario
 * Esto hace que visualmente se vea toda la semana resaltada en azul
 * 
 * @param {object} semana - Objeto semana con array de días
 */
const resaltarSemana = (semana) => {
  // 1. Limpiar resaltados anteriores
  // Buscar todos los td (celdas) del calendario y quitar la clase
  document.querySelectorAll('.p-datepicker-calendar td').forEach(td => {
    td.classList.remove('semana-seleccionada')
  })

  // 2. Agregar clase a cada día de la semana seleccionada
  semana.dias.forEach(dia => {
    // Convertir la fecha del día a objeto Date
    const fecha = new Date(dia.fecha + 'T00:00:00')
    const dia_numero = fecha.getDate()
    
    // Buscar el elemento del día en el calendario por su número
    const celdas = document.querySelectorAll('.p-datepicker-calendar td')
    celdas.forEach(celda => {
      const span = celda.querySelector('span')
      // Verificar que el número del día coincida
      if (span && parseInt(span.textContent) === dia_numero) {
        // Verificar que NO sea un día de otro mes
        if (!celda.classList.contains('p-datepicker-other-month')) {
          // Agregar clase para resaltar visualmente
          celda.classList.add('semana-seleccionada')
        }
      }
    })
  })
}

/**
 * FUNCIÓN: onDateSelect
 * Se ejecuta cuando el usuario hace clic en un día del calendario
 * 
 * Flujo:
 * 1. Convierte la fecha a formato ISO
 * 2. Busca a qué semana pertenece ese día
 * 3. Actualiza el store con la semana encontrada
 * 4. Resalta visualmente la semana en el calendario
 * 
 * @param {Date} event - Fecha seleccionada (objeto Date de JavaScript)
 */
const onDateSelect = (event) => {
  console.log('========== INICIO onDateSelect ==========')
  
  // Activar bandera para que el watch no se dispare
  ignorarCambioFecha.value = true
  
  // Convertir evento a objeto Date
  const fecha = new Date(event)
  console.log('1. Fecha evento recibida:', fecha)
  
  // Obtener la fecha en formato local sin conversión UTC
  // Esto evita problemas de zona horaria
  const año = fecha.getFullYear()
  const mes = String(fecha.getMonth() + 1).padStart(2, '0')
  const dia = String(fecha.getDate()).padStart(2, '0')
  const fechaISO = `${año}-${mes}-${dia}`
  
  console.log('2. Fecha ISO convertida:', fechaISO)
  console.log('3. Total de semanas en store:', store.semanas.length)
  
  // Buscar la semana que contiene esta fecha
  // Itera sobre todas las semanas y busca si algún día coincide
  const semanaEncontrada = store.semanas.find(semana => {
    return semana.dias.some(dia => dia.fecha === fechaISO)
  })

  console.log('4. Semana encontrada:', semanaEncontrada)

  if (semanaEncontrada) {
    console.log('5. SEMANA ENCONTRADA - Datos:', {
      numero: semanaEncontrada.numero,
      fecha_inicio: semanaEncontrada.fecha_inicio,
      fecha_fin: semanaEncontrada.fecha_fin
    })
    
    // Actualizar el store con la semana seleccionada
    store.seleccionarSemana(semanaEncontrada.numero)
    store.setRangoSemana(semanaEncontrada.fecha_inicio, semanaEncontrada.fecha_fin)
    
    console.log('6. Store actualizado:', {
      fechaInicioSemana: store.fechaInicioSemana,
      fechaFinSemana: store.fechaFinSemana,
      semanaSeleccionada: store.semanaSeleccionada
    })
    
    // Esperar a que Vue actualice el DOM y luego resaltar la semana
    nextTick(() => {
      resaltarSemana(semanaEncontrada)
      ignorarCambioFecha.value = false
    })
  } else {
    console.error('NO SE ENCONTRÓ SEMANA para:', fechaISO)
    ignorarCambioFecha.value = false
  }
  
  console.log('========== FIN onDateSelect ==========')
}

/**
 * FUNCIÓN: confirmarSeleccion
 * Se ejecuta cuando el usuario hace clic en "Confirmar selección"
 * Simplemente cierra el menú dropdown
 */
const confirmarSeleccion = () => {
  menuAbierto.value = false
}

/**
 * FUNCIÓN: irHoy
 * Navega al mes actual y selecciona la semana que contiene el día de hoy
 * 
 * Flujo:
 * 1. Obtiene la fecha de hoy
 * 2. Cambia al período (año/mes) actual
 * 3. Espera 500ms para que carguen las semanas
 * 4. Selecciona automáticamente la semana de hoy
 */
const irHoy = () => {
  const hoy = new Date()
  fechaSeleccionada.value = hoy
  // Cambiar al mes actual
  store.cambiarPeriodo(hoy.getFullYear(), hoy.getMonth() + 1)
  // Esperar a que se carguen las semanas y luego seleccionar hoy
  setTimeout(() => {
    onDateSelect(hoy)
  }, 500)
}

// ═══════════════════════════════════════════════════════════════════════════
// WATCHERS - Observadores de cambios
// ═══════════════════════════════════════════════════════════════════════════

/**
 * WATCH: menuAbierto
 * Observa cuando se abre/cierra el menú del calendario
 * 
 * Cuando se abre:
 * 1. Carga las semanas del mes actual (o del mes de la fecha seleccionada)
 * 2. Si ya había una semana seleccionada, la resalta visualmente
 */
watch(menuAbierto, async (nuevoValor) => {
  if (nuevoValor) {
    // El menú se acaba de abrir
    const fechaActual = fechaSeleccionada.value || new Date()
    
    // Cargar semanas del mes correspondiente
    await store.cambiarPeriodo(fechaActual.getFullYear(), fechaActual.getMonth() + 1)
    
    // Si ya hay una semana seleccionada, resaltarla
    if (store.semanaSeleccionada) {
      nextTick(() => {
        const semana = store.semanas.find(s => s.numero === store.semanaSeleccionada)
        if (semana) {
          resaltarSemana(semana)
        }
      })
    }
  }
})

/**
 * WATCH: fechaSeleccionada
 * Observa cuando cambia la fecha seleccionada por navegación del calendario
 * 
 * Cuando el usuario cambia de mes usando las flechas del calendario:
 * 1. Detecta el cambio
 * 2. Carga las semanas del nuevo mes
 * 
 * Nota: Solo se ejecuta si ignorarCambioFecha es false
 */
watch(fechaSeleccionada, async (nuevaFecha) => {
  // Solo ejecutar si hay fecha, el menú está abierto y NO estamos ignorando cambios
  if (nuevaFecha && menuAbierto.value && !ignorarCambioFecha.value) {
    // Cargar semanas del nuevo mes
    await store.cambiarPeriodo(nuevaFecha.getFullYear(), nuevaFecha.getMonth() + 1)
  }
})
</script>

<style>
/* ═══════════════════════════════════════════════════════════════════════════
   ESTILOS GLOBALES - Aplican a PrimeVue Calendar
   ═══════════════════════════════════════════════════════════════════════════ */

/* Estilos del contenedor principal del calendario */
.calendario-semana .p-datepicker {
  border: none;
  box-shadow: none;
}

/* Header del calendario (mes/año y flechas de navegación) */
.calendario-semana .p-datepicker-header {
  background: #1976d2;  /* Fondo azul */
  color: white;
  border-radius: 8px 8px 0 0;  /* Bordes redondeados arriba */
  padding: 0.75rem;
}

/* Título del mes y año */
.calendario-semana .p-datepicker-title {
  color: white;
  font-weight: 600;
}

/* Botones de navegación (flechas prev/next) */
.calendario-semana .p-datepicker-prev,
.calendario-semana .p-datepicker-next {
  color: white !important;
}

/* Hover en botones de navegación */
.calendario-semana .p-datepicker-prev:hover,
.calendario-semana .p-datepicker-next:hover {
  background: rgba(255, 255, 255, 0.2) !important;
}

/* Tabla del calendario (grid de días) */
.calendario-semana .p-datepicker-calendar {
  margin-top: 0.5rem;
}

/* Celdas de los días */
.calendario-semana .p-datepicker-calendar td {
  padding: 0.25rem;
}

/* Número del día dentro de cada celda */
.calendario-semana .p-datepicker-calendar td > span {
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;  /* Transición suave para hover */
}

/* Hover en días individuales */
.calendario-semana .p-datepicker-calendar td > span:hover {
  background: #e3f2fd !important;  /* Fondo azul claro */
  transform: scale(1.1);  /* Aumenta ligeramente el tamaño */
}

/* Estilo del día de hoy */
.calendario-semana .p-datepicker-today > span {
  background: #e8f5e9 !important;  /* Fondo verde claro */
  border: 2px solid #4caf50 !important;  /* Borde verde */
  font-weight: bold;
}

/* Estilos para días de la semana seleccionada */
.calendario-semana td.semana-seleccionada > span {
  background: linear-gradient(135deg, #1976d2 0%, #1565c0 100%) !important;  /* Gradiente azul */
  color: white !important;
  font-weight: bold;
  box-shadow: 0 2px 8px rgba(25, 118, 210, 0.4);  /* Sombra azul */
}

/* Si el día de hoy está en la semana seleccionada */
.calendario-semana td.semana-seleccionada.p-datepicker-today > span {
  background: linear-gradient(135deg, #1976d2 0%, #1565c0 100%) !important;
  border: 2px solid #4caf50 !important;  /* Mantener borde verde */
  color: white !important;
}

/* Días de otros meses (antes/después del mes actual) */
.calendario-semana .p-datepicker-other-month {
  opacity: 0.3;  /* Semi-transparentes */
}

/* Día seleccionado con clic */
.calendario-semana .p-highlight > span {
  background: #1976d2 !important;
  color: white !important;
  box-shadow: 0 3px 10px rgba(25, 118, 210, 0.5);
}
</style>

<style scoped>
/* ═══════════════════════════════════════════════════════════════════════════
   ESTILOS SCOPED - Solo aplican a este componente
   ═══════════════════════════════════════════════════════════════════════════ */

/* Contenedor principal del componente */
.calendario-primevue {
  position: relative;
}
</style>