<template>
    <v-dialog v-model="dialogVisible" max-width="500">
        <v-card v-if="cita">
            <v-card-title class="d-flex align-center bg-primary">
                <v-icon class="mr-2" color="white">
                    mdi-calendar-check
                </v-icon>
                <span class="text-white">Detalle de Cita</span>
            </v-card-title>

            <v-divider></v-divider>

            <v-card-text class="pt-6">
                <v-row>
                    <v-col cols="12">
                        <div class="mb-4">
                            <div class="text-caption text-grey-darken-1 mb-1">
                                <v-icon size="small" class="mr-1">mdi-account</v-icon>
                                Paciente
                            </div>
                            <div class="text-h6">{{ cita.paciente_nombre }}</div>
                            <div class="text-h6">{{ cita.paciente_apellido }}</div>
                        </div>
                    </v-col>

                    <v-col cols="12">
                        <div class="mb-4">
                            <div class="text-caption text-grey-darken-1 mb-1">
                                <v-icon size="small" class="mr-1">mdi-doctor</v-icon>
                                Doctor
                            </div>
                            <div class="text-body-1">Dr. {{ cita.doctor_nombre }}</div>
                        </div>
                    </v-col>

                    <v-col cols="6">
                        <div class="mb-4">
                            <div class="text-caption text-grey-darken-1 mb-1">
                                <v-icon size="small" class="mr-1">mdi-calendar</v-icon>
                                Fecha
                            </div>
                            <div class="text-body-1">{{ formatearFecha(cita.fecha) }}</div>
                        </div>
                    </v-col>

                    <v-col cols="6">
                        <div class="mb-4">
                            <div class="text-caption text-grey-darken-1 mb-1">
                                <v-icon size="small" class="mr-1">mdi-clock-outline</v-icon>
                                Hora
                            </div>
                            <div class="text-body-1">{{ formatearHora(cita.hora) }}</div>
                        </div>
                    </v-col>

                    <v-col cols="12" v-if="cita.motivo">
                        <div class="mb-4">
                            <div class="text-caption text-grey-darken-1 mb-1">
                                <v-icon size="small" class="mr-1">mdi-text</v-icon>
                                Motivo
                            </div>
                            <div class="text-body-1">{{ cita.motivo }}</div>
                        </div>
                    </v-col>

                    <v-col cols="12">
                        <div class="mb-2">
                            <div class="text-caption text-grey-darken-1 mb-1">
                                <v-icon size="small" class="mr-1">mdi-information</v-icon>
                                Estado
                            </div>
                            <v-chip :color="getColorEstado(cita.estado)" size="small" class="text-capitalize">
                                {{ cita.estado }}
                            </v-chip>
                        </div>
                    </v-col>
                </v-row>
            </v-card-text>

            <v-divider></v-divider>

            <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn color="primary" variant="text" @click="cerrar">
                    Cerrar
                </v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>

<script setup>
import { computed, watch } from 'vue'
// ══════════════════════════════════════════════════════════════
// PROPS
// ══════════════════════════════════════════════════════════════

const props = defineProps({
    modelValue: {
        type: Boolean,
        default: false
    },
    cita: {
        type: Object,
        default: null
    }
})

// ══════════════════════════════════════════════════════════════
// EMITS
// ══════════════════════════════════════════════════════════════

const emit = defineEmits(['update:modelValue'])

// ══════════════════════════════════════════════════════════════
// COMPUTED
// ══════════════════════════════════════════════════════════════

const dialogVisible = computed({
    get: () => {
        console.log('📖 DIALOG GET - modelValue:', props.modelValue)
        return props.modelValue
    },
    set: (value) => {
        console.log('📝 DIALOG SET - emitiendo update:modelValue:', value)
        emit('update:modelValue', value)
    }
})
watch(() => props.modelValue, (newVal) => {
    console.log('👁️ DIALOG WATCH - modelValue cambió a:', newVal)
})

watch(() => props.cita, (newVal) => {
    console.log('👁️ DIALOG WATCH - cita cambió a:', newVal)
})

// ══════════════════════════════════════════════════════════════
// FUNCIONES
// ══════════════════════════════════════════════════════════════

/**
 * Formatear fecha
 */
const formatearFecha = (fecha) => {
    // Extraer solo la parte de la fecha
    const fechaSolo = fecha.split('T')[0] // "2025-12-17T00:00:00.000000Z" → "2025-12-17"

    return new Date(fechaSolo + 'T00:00:00').toLocaleDateString('es-CL', {
        weekday: 'long',
        day: '2-digit',
        month: 'long',
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
        'completada': 'info',
        'agendada': 'primary'
    }
    return colores[estado?.toLowerCase()] || 'grey'
}

/**
 * Cerrar dialog
 */
const cerrar = () => {
    dialogVisible.value = false
}
</script>