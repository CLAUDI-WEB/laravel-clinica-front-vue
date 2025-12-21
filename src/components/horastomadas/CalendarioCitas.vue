<template>
    <div class="calendario-citas">
        <!-- Controles del calendario -->
        <v-sheet class="d-flex align-center" tile>
            <v-btn class="ma-2" variant="text" icon @click="$refs.calendar?.prev()">
                <v-icon>mdi-chevron-left</v-icon>
            </v-btn>

            <v-select v-model="type" :items="types" class="ma-2" density="comfortable" label="Vista" variant="outlined"
                hide-details style="max-width: 150px;"></v-select>

            <v-select v-model="weekday" :items="weekdays" class="ma-2" density="comfortable" label="Días"
                variant="outlined" hide-details style="max-width: 180px;"></v-select>

            <v-chip class="ma-2" color="primary" variant="flat">
                <v-icon start>mdi-calendar-check</v-icon>
                {{ citas.length }} citas
            </v-chip>

            <v-spacer></v-spacer>

            <v-btn class="ma-2" variant="text" icon @click="$refs.calendar?.next()">
                <v-icon>mdi-chevron-right</v-icon>
            </v-btn>
        </v-sheet>

        <!-- Calendario -->
        <v-sheet height="600" class="mt-2">
            <v-calendar ref="calendar" v-model="value" :events="eventosCalendario" :type="type" :weekdays="weekday"
                @change="handleCalendarChange">
                <!-- ⭐ SLOT PERSONALIZADO para renderizar cada evento -->
                <template #event="{ event, day }">
                    <div @click="handleEventClick(event)" class="evento-cita" :style="{
                        backgroundColor: event.color,
                        cursor: 'pointer',
                        padding: '4px 8px',
                        borderRadius: '4px',
                        height: '100%',
                        overflow: 'hidden'
                    }">
                        <div class="text-white text-caption font-weight-bold">
                            {{ event.name }}{{ event.apellido }}-{{ event.doctor }}
                        </div>
                    </div>
                </template>
            </v-calendar>
        </v-sheet>

        <!-- Mensaje si no hay citas -->
        <v-alert v-if="citas.length === 0" type="info" variant="tonal" class="mt-4">
            <v-icon start>mdi-information</v-icon>
            No hay citas agendadas para mostrar
        </v-alert>
    </div>
</template>

<script setup>
import { ref, computed } from 'vue'

// ══════════════════════════════════════════════════════════════
// PROPS
// ══════════════════════════════════════════════════════════════

const props = defineProps({
    citas: {
        type: Array,
        required: true,
        default: () => []
    }
})

// ══════════════════════════════════════════════════════════════
// EMITS
// ══════════════════════════════════════════════════════════════

const emit = defineEmits(['click:cita', 'change:range'])

// ══════════════════════════════════════════════════════════════
// REFS
// ══════════════════════════════════════════════════════════════

const calendar = ref(null)
const type = ref('week')
const types = [
    { title: 'Mes', value: 'month' },
    { title: 'Semana', value: 'week' },
    { title: 'Día', value: 'day' },
    { title: '4 Días', value: '4day' }
]
const weekday = ref([1, 2, 3, 4, 5, 6])
const weekdays = [
    { title: 'Lun - Sáb', value: [1, 2, 3, 4, 5, 6] },
    { title: 'Dom - Sáb', value: [0, 1, 2, 3, 4, 5, 6] },
    { title: 'Lun - Vie', value: [1, 2, 3, 4, 5] }
]
const value = ref('')

// ══════════════════════════════════════════════════════════════
// COMPUTED
// ══════════════════════════════════════════════════════════════

/**
 * Convertir citas al formato del calendario
 */
const eventosCalendario = computed(() => {
    return props.citas.map(cita => {
        try {
            const fechaSolo = cita.fecha.split('T')[0]
            const [year, month, day] = fechaSolo.split('-')
            const [hours, minutes] = cita.hora.split(':')

            const start = new Date(year, month - 1, day, hours, minutes)
            const duracion = cita.duracion || 30
            const end = new Date(start.getTime() + duracion * 60000)

            return {
                name: `${cita.paciente_nombre}  `,
                doctor: `Dr. ${cita.doctor_nombre}`,
                apellido: `${cita.paciente_apellido} `,
                start: start,
                end: end,
                color: getColorEstado(cita.estado),
                timed: true,
                cita: cita // cita completa aquí
            }
        } catch (error) {
            return null
        }
    }).filter(evento => evento !== null)
})

// ══════════════════════════════════════════════════════════════
// FUNCIONES
// ══════════════════════════════════════════════════════════════

/**
 * Color según estado
 */
const getColorEstado = (estado) => {
    const colores = {
        'confirmada': '#4CAF50',    // verde
        'pendiente': '#FF9800',     // naranja
        'cancelada': '#F44336',     // rojo
        'completada': '#2196F3',    // azul
        'agendada': '#1976D2'       // azul oscuro
    }
    return colores[estado?.toLowerCase()] || '#9E9E9E'
}

/**
 * ⭐ NUEVA FUNCIÓN - Manejar click en evento (desde el slot)
 */
const handleEventClick = (event) => {
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('🎯 CLICK EN EVENTO DEL CALENDARIO')
    console.log('📦 Event completo:', event)
    console.log('👤 Paciente:', event.cita?.paciente_nombre)
    console.log('👨‍⚕️ Doctor:', event.cita?.doctor_nombre)

    if (event.cita) {
        console.log('✅ Cita encontrada, emitiendo al padre...')
        emit('click:cita', event.cita)
    } else {
        console.error('❌ No se encontró la cita en el evento')
    }

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
}

/**
 * Manejar cambio de calendario
 */
const handleCalendarChange = ({ start, end }) => {
    console.log('📆 Calendario cambió - Rango:', start.date, 'a', end.date)
    emit('change:range', { start, end })
}
</script>

<style scoped>
.calendario-citas {
    /* Estilos adicionales si necesitas */
}

.evento-cita {
    transition: opacity 0.2s;
}

.evento-cita:hover {
    opacity: 0.8;
}
</style>