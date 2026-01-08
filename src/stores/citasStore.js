import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
// import axios from 'axios'
import api from '@/services/api'
import { useAuthStore } from './auth'

// ═══════════════════════════════════════════════════════════════════════════
// 📦 STORE DE GESTIÓN DE CITAS
// ═══════════════════════════════════════════════════════════════════════════
// defineStore crea un "almacén centralizado" de datos compartidos entre componentes
// Parámetros:
// 1. 'citas' = ID único del store (como un nombre de identificación)
// 2. () => {} = función setup que define el contenido del store (Composition API)
export const useCitasStore = defineStore('citas', () => {

  // ═══════════════════════════════════════════════════════════════════════════
  // 📊 STATE - Variables Reactivas
  // ═══════════════════════════════════════════════════════════════════════════
  // Equivalente a "data()" en Options API
  // Se usan ref() para crear variables reactivas que pueden cambiar y
  // automáticamente actualizar la UI cuando se modifican

  // Array que almacena todas las semanas del mes cargadas desde el backend
  // Estructura esperada: [
  //   { numero: 1, fecha_inicio: "2025-12-01", fecha_fin: "2025-12-07", dias: [...] },
  //   { numero: 2, fecha_inicio: "2025-12-08", fecha_fin: "2025-12-14", dias: [...] },
  //   ...
  // ]
  const semanas = ref([])

  // Indicador booleano para mostrar spinners/loaders en la UI
  // true = mostrando loading, false = ocultar loading
  const loading = ref(false)

  // Almacena mensajes de error si falla una petición al backend
  // null = sin errores, string = mensaje de error
  const error = ref(null)

  // Año actualmente seleccionado (inicializa con el año actual del sistema)
  // Ejemplo: 2025
  const añoSeleccionado = ref(new Date().getFullYear())

  // Mes actualmente seleccionado (1-12, inicializa con mes actual del sistema)
  // Ejemplo: 12 (diciembre)
  // Nota: JavaScript usa meses base 0, por eso sumamos 1
  const mesSeleccionado = ref(new Date().getMonth() + 1)

  // Nombre del mes en español (recibido del backend)
  // Ejemplo: "diciembre", "enero", etc.
  const nombreMes = ref('')

  // Número de la semana seleccionada (1, 2, 3, 4, etc.)
  // null = ninguna semana seleccionada
  // Se usa para saber qué semana está activa en el calendario
  const semanaSeleccionada = ref(null)

  // Fecha de inicio de la semana seleccionada en formato ISO (YYYY-MM-DD)
  // Ejemplo: "2025-12-08" (lunes)
  // Se usa para filtros y peticiones al backend
  const fechaInicioSemana = ref(null)

  // Fecha de fin de la semana seleccionada en formato ISO (YYYY-MM-DD)
  // Ejemplo: "2025-12-14" (domingo)
  // Se usa para filtros y peticiones al backend
  const fechaFinSemana = ref(null)

  // ═══════════════════════════════════════════════════════════════════════════
  // 🧮 GETTERS - Valores Computados
  // ═══════════════════════════════════════════════════════════════════════════
  // Equivalente a "computed" en Options API
  // Se recalculan automáticamente cuando cambian las variables de las que dependen

  // Getter simple: retorna el array de semanas
  // Es un alias reactivo de semanas.value
  // Útil cuando quieres acceder a semanas de forma "computed" en otros componentes
  const semanasDelMes = computed(() => semanas.value)

  // Getter complejo: filtra y retorna solo los días de la semana seleccionada
  // Se recalcula automáticamente cuando cambia:
  // - semanaSeleccionada.value
  // - semanas.value
  // Retorna un array de objetos día con estructura:
  // [
  //   { fecha: "2025-12-08", dia: 8, dia_semana: "lunes", es_hoy: false, ... },
  //   { fecha: "2025-12-09", dia: 9, dia_semana: "martes", es_hoy: false, ... },
  //   ...
  // ]
  const diasDeLaSemanaSeleccionada = computed(() => {
    // Si no hay semana seleccionada, retornar array vacío
    if (!semanaSeleccionada.value) return []

    // Buscar la semana completa en el array por su número
    const semana = semanas.value.find(s => s.numero === semanaSeleccionada.value)

    // Retornar los días de esa semana o array vacío si no se encuentra
    return semana ? semana.dias : []
  })

  // ═══════════════════════════════════════════════════════════════════════════
  // ⚡ ACTIONS - Funciones que Modifican el Estado
  // ═══════════════════════════════════════════════════════════════════════════
  // Equivalente a "methods" en Options API
  // Son funciones que pueden ser síncronas o asíncronas y modifican el state

  /**
   * 🔄 ACCIÓN: Cargar semanas desde el backend
   * 
   * Función asíncrona que hace una petición HTTP al endpoint de Laravel
   * para obtener todas las semanas de un mes específico.
   * 
   * Flujo de ejecución:
   * 1. Activa el indicador de loading (muestra spinner en UI)
   * 2. Limpia errores previos
   * 3. Obtiene el token JWT del localStorage
   * 4. Hace petición GET a: /api/citas/semanas?año=2025&mes=12
   * 5. Guarda la respuesta en semanas.value y nombreMes.value
   * 6. Desactiva loading (oculta spinner)
   * 7. Si hay error, lo captura y guarda en error.value
   * 
   * Respuesta del backend esperada:
   * {
   *   año: 2025,
   *   mes: 12,
   *   nombre_mes: "diciembre",
   *   semanas: [
   *     {
   *       numero: 1,
   *       fecha_inicio: "2025-12-01",
   *       fecha_fin: "2025-12-07",
   *       label: "Semana 1: 01/12 - 07/12",
   *       dias: [
   *         { fecha: "2025-12-01", dia: 1, dia_semana: "lunes", ... },
   *         ...
   *       ]
   *     },
   *     ...
   *   ]
   * }
   * 
   * @returns {Promise<void>}
   */
  async function cargarSemanas() {
    loading.value = true  // Activar indicador de carga (mostrar spinner)
    error.value = null    // Limpiar errores anteriores

    try {

      const token = localStorage.getItem('token')

      const response = await api.get('citas/semanas', {
        params: {
          año: añoSeleccionado.value,  // Ejemplo: 2025
          mes: mesSeleccionado.value   // Ejemplo: 12
        },
        headers: {
          'Authorization': `Bearer ${token}`,  // Token JWT para autenticación
          'Accept': 'application/json'         // Esperar respuesta en JSON
        }
      })


      semanas.value = response.data.semanas      // Array de semanas
      nombreMes.value = response.data.nombre_mes // "diciembre"

    } catch (err) {
      error.value = 'Error al cargar las semanas'
      console.error('Error completo:', err)
    } finally {
      loading.value = false  // Desactivar indicador de carga (ocultar spinner)
    }
  }

  /**
   * ACCIÓN: Cambiar el período (mes/año)
   * 
   * Actualiza el año y mes seleccionado, limpia la selección de semana
   * y recarga las semanas del nuevo período desde el backend.
   */
  function cambiarPeriodo(año, mes) {
    // Actualizar el año seleccionado en el state
    añoSeleccionado.value = año

    // Actualizar el mes seleccionado en el state
    mesSeleccionado.value = mes

    // Limpiar la selección de semana anterior
    // Esto es importante para evitar que se muestre una semana del mes anterior
    semanaSeleccionada.value = null
    fechaInicioSemana.value = null
    fechaFinSemana.value = null

    // Cargar las semanas del nuevo período desde el backend
    // Retorna la promesa para que se pueda hacer await en el componente
    // Ejemplo en componente: await store.cambiarPeriodo(2025, 12)
    return cargarSemanas()
  }

  /**
   * ACCIÓN: Seleccionar una semana específica
   * 
   * Marca una semana como seleccionada y muestra información de debugging.
   * Esta función NO guarda las fechas de inicio/fin, solo marca el número de semana.
   * Para guardar las fechas, usar setRangoSemana() después de esta función.
   * 
   * Uso típico: Cuando el usuario hace clic en un día del calendario
   * 
   * Flujo en CalendarioDropdown.vue:
   * 1. Usuario hace clic en día 10 de diciembre
   * 2. Se busca a qué semana pertenece ese día (semana 2)
   * 3. Se llama: store.seleccionarSemana(2)
   * 4. Se llama: store.setRangoSemana("2025-12-08", "2025-12-14")
   * 
   * @param {number} numeroSemana - Número de semana a seleccionar (1, 2, 3, etc.)
   */
  function seleccionarSemana(numeroSemana) {
    // Guardar el número de semana seleccionada en el state
    // Esto hace que diasDeLaSemanaSeleccionada (getter) se recalcule automáticamente
    semanaSeleccionada.value = numeroSemana

    // Buscar la semana completa en el array para obtener toda su información
    const semana = semanas.value.find(s => s.numero === numeroSemana)

    // Si se encontró la semana, mostrar información de debugging en consola
    if (semana) {
      console.log('Semana seleccionada en store:', {
        numero: numeroSemana,           // 2
        fechaInicio: semana.fecha_inicio, // "2025-12-08"
        fechaFin: semana.fecha_fin,       // "2025-12-14"
        totalDias: semana.dias.length     // 7
      })
    }
  }

  /**
   * 📌 ACCIÓN: Guardar el rango de fechas de la semana seleccionada
   * 
   * Guarda las fechas de inicio y fin de la semana en formato ISO.
   * Estas fechas se usan para:
   * - Mostrar en la UI el rango seleccionado
   * - Enviar al backend para filtrar citas/horarios
   * - Hacer peticiones específicas de datos de esa semana
   * 
   * Uso típico: Se llama inmediatamente después de seleccionarSemana()
   * 
   * Ejemplo de flujo completo:
   * const semana = store.semanas.find(s => s.numero === 2)
   * store.seleccionarSemana(semana.numero)
   * store.setRangoSemana(semana.fecha_inicio, semana.fecha_fin)
   * 
   * @param {string} fechaInicio - Fecha de inicio en formato ISO (YYYY-MM-DD)
   *                               Ejemplo: "2025-12-08"
   * @param {string} fechaFin - Fecha de fin en formato ISO (YYYY-MM-DD)
   *                            Ejemplo: "2025-12-14"
   */
  function setRangoSemana(fechaInicio, fechaFin) {
    // Guardar fecha de inicio en el state
    fechaInicioSemana.value = fechaInicio  // "2025-12-08"

    // Guardar fecha de fin en el state
    fechaFinSemana.value = fechaFin        // "2025-12-14"

    // Log para debugging - útil para verificar que las fechas se guardaron correctamente
    console.log('Rango de semana guardado:', {
      inicio: fechaInicioSemana.value,
      fin: fechaFinSemana.value
    })
  }

  /**
   * 🧹 ACCIÓN: Limpiar la selección de semana
   * 
   * Resetea todos los valores relacionados con la semana seleccionada.
   * Útil cuando el usuario quiere ver todas las semanas nuevamente
   * o cuando cierra un filtro/modal.
   * 
   * Uso típico:
   * - Usuario hace clic en X para cerrar el filtro de semana
   * - Usuario hace clic en "Limpiar filtros"
   * - Al cambiar de mes (opcional, ya se hace en cambiarPeriodo)
   * 
   * Ejemplo en template:
   * <v-btn @click="store.limpiarFiltroSemana()">
   *   <v-icon>mdi-close</v-icon>
   *   Limpiar selección
   * </v-btn>
   */
  function limpiarFiltroSemana() {
    // Resetear número de semana seleccionada
    semanaSeleccionada.value = null

    // Resetear fecha de inicio
    fechaInicioSemana.value = null

    // Resetear fecha de fin
    fechaFinSemana.value = null

  }




  // ═══════════════════════════════════════════════════════════════════════════
  // 📤 RETURN - Exportar API Pública del Store
  // ═══════════════════════════════════════════════════════════════════════════
  // Todo lo que se retorna aquí estará disponible cuando uses:
  // const store = useCitasStore()
  // 
  // Estructura de uso en componentes:
  // - State: store.semanas, store.loading, etc.
  // - Getters: store.diasDeLaSemanaSeleccionada
  // - Actions: store.cargarSemanas(), store.seleccionarSemana(2), etc.



  // ═══════════════════════════════════════════════════════════════════════════
  //  NUEVAS FUNCIONALIDADES PARA HORARIOS - AGREGAR AL FINAL DEL STORE
  // ═══════════════════════════════════════════════════════════════════════════

  // ─────────────────────────────────────────────────────────────────────────
  //  STATE ADICIONAL - Variables para horarios
  // ─────────────────────────────────────────────────────────────────────────

  // Array de horarios disponibles del día seleccionado
  // const horariosDisponibles = ref([])
  const horariosDisponibles = ref({
    fecha: null,
    total_doctores: 0,
    total_bloques: 0,
    doctores: []
  })

  // Estado de carga de horarios
  const loadingHorarios = ref(false)

  // Error al cargar horarios
  const errorHorarios = ref(null)

  // Día actualmente seleccionado para ver horarios
  const diaSeleccionado = ref(null)

  // ─────────────────────────────────────────────────────────────────────────
  //  ACTIONS - Funciones para gestión de horarios
  // ─────────────────────────────────────────────────────────────────────────

  async function cargarHorarios(fecha) {
    loadingHorarios.value = true
    errorHorarios.value = null
    diaSeleccionado.value = fecha

    try {
      const token = localStorage.getItem('token')
      //va a citas porque son para las citas de pacientes
      const response = await api.get('citas/horarios-disponibles', {
        params: {
          fecha: fecha  //  Enviando la fecha como parámetro
        },
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      })

      console.log(' Respuesta del backend:', response.data)

      //  Guardar la estructura completa
      horariosDisponibles.value = {
        fecha: response.data.fecha,
        total_doctores: response.data.total_doctores || 0,
        total_bloques: response.data.total_bloques || 0,
        doctores: response.data.doctores || []
      }



      return horariosDisponibles.value

    } catch (err) {
      errorHorarios.value = 'No se pudieron cargar los horarios disponibles'
      console.error(' Error al cargar horarios:', err)
      console.error(' Detalles del error:', err.response?.data)

      // Resetear a estructura vacía
      horariosDisponibles.value = {
        fecha: fecha,
        total_doctores: 0,
        total_bloques: 0,
        doctores: []
      }

      throw err
    } finally {
      loadingHorarios.value = false
    }
  }

  /**
   *  Limpiar horarios cargados
   */
  function limpiarHorarios() {
    horariosDisponibles.value = {
      fecha: null,
      total_doctores: 0,
      total_bloques: 0,
      doctores: []
    }
    // ✅ Resetea a la estructura completa vacía
  }

  /**
   * 🆕 Agendar una cita con un horario específico
   * @param {number} horarioId - ID del horario seleccionado
   * @param {object} datosPaciente - Datos del paciente (opcional)
   * @returns {Promise<object>} - Respuesta del servidor
   */
  async function agendarCita(horarioId, datosPaciente = {}) {
    try {
      // ❌ ELIMINAR: const authStore = useAuthStore()
      // ❌ ELIMINAR: await authStore.getCsrfToken()
      // ✅ El interceptor de axios agrega el token automáticamente

      console.log('📝 Agendando cita:', { horarioId, datosPaciente })

      const response = await api.post('citas/agendar', {
        horario_id: horarioId,
        observaciones: datosPaciente.observaciones || null
      })

      console.log('✅ Cita agendada exitosamente:', response.data)

      // Recargar horarios para actualizar disponibilidad
      if (diaSeleccionado.value) {
        await cargarHorarios(diaSeleccionado.value)
      }

      return response.data

    } catch (err) {
      console.error('❌ Error al agendar cita:', err.response?.data || err)
      throw err
    }
  }


  /**
   * 🆕 Cancelar una cita
   * @param {number} horarioId - ID del horario a liberar
   * @returns {Promise<object>} - Respuesta del servidor
   */
  async function cancelarCita(horarioId) {
    try {
      // ❌ ELIMINAR: const authStore = useAuthStore()
      // ❌ ELIMINAR: await authStore.getCsrfToken()

      console.log('🗑️ Cancelando cita:', horarioId)

      const response = await api.post(`citas/cancelar/${horarioId}`)

      console.log('✅ Cita cancelada exitosamente')

      if (diaSeleccionado.value) {
        await cargarHorarios(diaSeleccionado.value)
      }

      return response.data

    } catch (err) {
      console.error('❌ Error al cancelar cita:', err.response?.data || err)
      throw err
    }
  }

  return {
    // ─────────────────────────────────────────────────────────────────────────
    // 📦 STATE - Variables Reactivas
    // ─────────────────────────────────────────────────────────────────────────
    // Acceso directo desde componentes: store.semanas, store.loading, etc.
    semanas,              // Array de todas las semanas del mes
    loading,              // Boolean para mostrar spinners
    error,                // String con mensaje de error o null
    añoSeleccionado,      // Number: año actual seleccionado
    mesSeleccionado,      // Number: mes actual seleccionado (1-12)
    nombreMes,            // String: nombre del mes en español
    semanaSeleccionada,   // Number: número de semana activa o null
    fechaInicioSemana,    // String: fecha ISO de inicio o null
    fechaFinSemana,       // String: fecha ISO de fin o null

    // ─────────────────────────────────────────────────────────────────────────
    // 🧮 GETTERS - Valores Computados
    // ─────────────────────────────────────────────────────────────────────────
    // Acceso desde componentes: store.semanasDelMes
    semanasDelMes,                  // Computed: alias de semanas
    diasDeLaSemanaSeleccionada,     // Computed: solo días de semana activa

    // ─────────────────────────────────────────────────────────────────────────
    // ⚡ ACTIONS - Funciones
    // ─────────────────────────────────────────────────────────────────────────
    // Llamadas desde componentes: store.cargarSemanas(), store.seleccionarSemana(2)
    cargarSemanas,           // Async: cargar semanas desde API
    cambiarPeriodo,          // Sync: cambiar mes/año y recargar
    seleccionarSemana,       // Sync: marcar una semana como seleccionada
    setRangoSemana,          // Sync: guardar rango de fechas
    limpiarFiltroSemana,      // Sync: resetear selección de semana
    horariosDisponibles,
    loadingHorarios,
    errorHorarios,
    diaSeleccionado,
    cargarHorarios,
    limpiarHorarios,
    agendarCita,
    cancelarCita
  }
})

