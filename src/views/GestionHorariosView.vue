<template>
    <div class="gestion-horarios">
        <div class="container">
            <h1>Gestión de Horarios por Doctor</h1>

            <!-- Selector de Doctor -->
            <div class="card">
                <h2>Seleccionar Doctor</h2>
                <div class="doctor-selector">
                    <label for="doctor">Doctor:</label>
                    <select id="doctor" v-model="selectedDoctorId" @change="onDoctorChange" class="form-select">
                        <option value="">-- Seleccione un doctor --</option>
                        <option v-for="doctor in doctores" :key="doctor.id" :value="doctor.id">
                            Dr. {{ doctor.nombre }} {{ doctor.apellido }} - {{ doctor.especialidad }}
                        </option>
                    </select>
                </div>

                <!-- Info del doctor seleccionado -->
                <div v-if="selectedDoctor" class="doctor-info">
                    <div class="info-card">
                        <h3>👨‍⚕️ {{ selectedDoctor.nombre }} {{ selectedDoctor.apellido }}</h3>
                        <p><strong>Especialidad:</strong> {{ selectedDoctor.especialidad }}</p>
                        <p><strong>Email:</strong> {{ selectedDoctor.email }}</p>
                        <p><strong>Teléfono:</strong> {{ selectedDoctor.telefono }}</p>
                    </div>
                </div>
            </div>

            <!-- Panel de Gestión de Horarios -->
            <div v-if="selectedDoctor" class="card">
                <h2>Agregar Horarios Disponibles</h2>

                <!-- Selector de Fecha -->
                <div class="fecha-selector">
                    <label for="fecha">Fecha:</label>
                    <input type="date" id="fecha" v-model="selectedDate" :min="today" class="form-input">
                </div>

                <!-- Horarios del día -->
                <div v-if="selectedDate" class="horarios-section">
                    <div class="horarios-header">
                        <h3>Horarios para {{ formatDate(selectedDate) }}</h3>
                        <button @click="showAddHorarioModal = true" class="btn btn-primary">
                            ➕ Agregar Horario
                        </button>
                    </div>

                    <!-- Lista de horarios existentes -->
                    <div v-if="horariosDelDia.length > 0" class="horarios-lista">
                        <div v-for="horario in horariosDelDia" :key="horario.id" class="horario-item"
                            :class="{ 'ocupado': horario.ocupado }">
                            <div class="horario-info">
                                <span class="hora">🕐 {{ horario.hora }}</span>
                                <span class="estado" :class="horario.ocupado ? 'badge-ocupado' : 'badge-disponible'">
                                    {{ horario.ocupado ? 'Ocupado' : 'Disponible' }}
                                </span>
                                <span v-if="horario.paciente" class="paciente-info">
                                    👤 {{ horario.paciente.nombre }}
                                </span>
                            </div>
                            <div class="horario-acciones">
                                <button v-if="!horario.ocupado" @click="eliminarHorario(horario.id)"
                                    class="btn btn-danger btn-sm">
                                    🗑️ Eliminar
                                </button>
                            </div>
                        </div>
                    </div>

                    <!-- Sin horarios -->
                    <div v-else class="empty-state">
                        <p>📅 No hay horarios registrados para esta fecha</p>
                        <p class="text-muted">Haz clic en "Agregar Horario" para comenzar</p>
                    </div>
                </div>

                <!-- Agregar múltiples horarios -->
                <div v-if="selectedDate" class="quick-actions">
                    <h3>Acciones Rápidas</h3>
                    <div class="quick-buttons">
                        <button @click="agregarHorariosMañana" class="btn btn-outline">
                            🌅 Horarios de Mañana (09:00 - 13:00)
                        </button>
                        <button @click="agregarHorariosTarde" class="btn btn-outline">
                            🌆 Horarios de Tarde (14:00 - 18:00)
                        </button>
                        <button @click="agregarHorariosDiaCompleto" class="btn btn-outline">
                            📆 Día Completo (09:00 - 18:00)
                        </button>
                    </div>
                </div>
            </div>

            <!-- Modal para agregar horario individual -->
            <div v-if="showAddHorarioModal" class="modal-overlay" @click="closeModal">
                <div class="modal-content" @click.stop>
                    <div class="modal-header">
                        <h3>Agregar Horario</h3>
                        <button @click="closeModal" class="btn-close">✕</button>
                    </div>

                    <div class="modal-body">
                        <div class="form-group">
                            <label>Hora:</label>
                            <input type="time" v-model="nuevoHorario.hora" class="form-input" step="900">
                        </div>

                        <div class="form-group">
                            <label>Duración (minutos):</label>
                            <select v-model="nuevoHorario.duracion" class="form-select">
                                <option value="15">15 minutos</option>
                                <option value="30">30 minutos</option>
                                <option value="45">45 minutos</option>
                                <option value="60">60 minutos</option>
                            </select>
                        </div>
                    </div>

                    <div class="modal-footer">
                        <button @click="closeModal" class="btn btn-secondary">
                            Cancelar
                        </button>
                        <button @click="agregarHorario" class="btn btn-primary">
                            Guardar Horario
                        </button>
                    </div>
                </div>
            </div>

            <!-- Calendario Mensual (Vista Rápida) -->
            <div v-if="selectedDoctor" class="card">
                <h2>Vista Mensual</h2>
                <div class="calendario-resumen">
                    <div class="mes-selector">
                        <button @click="cambiarMes(-1)" class="btn btn-sm">◀</button>
                        <h3>{{ nombreMes }} {{ añoActual }}</h3>
                        <button @click="cambiarMes(1)" class="btn btn-sm">▶</button>
                    </div>

                    <div class="calendario-grid">
                        <div v-for="dia in diasDelMes" :key="dia.fecha" class="dia-item" :class="{
                            'tiene-horarios': dia.cantidadHorarios > 0,
                            'hoy': dia.esHoy,
                            'pasado': dia.esPasado
                        }" @click="selectedDate = dia.fecha">
                            <div class="dia-numero">{{ dia.numero }}</div>
                            <div v-if="dia.cantidadHorarios > 0" class="dia-badge">
                                {{ dia.cantidadHorarios }} 🕐
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import api from '@/services/api'

// Estado
const doctores = ref([])
const selectedDoctorId = ref('')
const selectedDoctor = computed(() =>
    doctores.value.find(d => d.id === selectedDoctorId.value)
)
const selectedDate = ref('')
const today = ref(new Date().toISOString().split('T')[0])
const horariosDelDia = ref([])
const showAddHorarioModal = ref(false)
const nuevoHorario = ref({
    hora: '09:00',
    duracion: 30
})

// Para calendario mensual
const mesActual = ref(new Date().getMonth())
const añoActual = ref(new Date().getFullYear())
const nombreMes = computed(() => {
    const meses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
        'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre']
    return meses[mesActual.value]
})

// Cargar doctores al montar
onMounted(async () => {
    await cargarDoctores()
})

// Cargar horarios cuando cambia la fecha
watch([selectedDoctorId, selectedDate], async () => {
    if (selectedDoctorId.value && selectedDate.value) {
        await cargarHorariosDelDia()
    }
})

// Funciones
async function cargarDoctores() {
    try {
        const response = await api.get('/doctors')
        doctores.value = response.data
    } catch (error) {
        console.error('Error cargando doctores:', error)
        alert('Error al cargar la lista de doctores')
    }
}

function onDoctorChange() {
    selectedDate.value = ''
    horariosDelDia.value = []
}

async function cargarHorariosDelDia() {
    try {
        // Ajusta esta URL según tu API
        const response = await api.get('horarios/horarios-disponibles', {
            params: {
                doctor_id: selectedDoctorId.value,
                fecha: selectedDate.value
            }
        })
        horariosDelDia.value = response.data
    } catch (error) {
        console.error('Error cargando horarios:', error)
        horariosDelDia.value = []
    }
}

async function agregarHorario() {
    try {
        await api.post('/horarios', {
            doctor_id: selectedDoctorId.value,
            fecha: selectedDate.value,
            hora: nuevoHorario.value.hora,
            duracion: nuevoHorario.value.duracion,
            especialidad: selectedDoctor.value.especialidad

        })

        closeModal()
        await cargarHorariosDelDia()
        alert('✅ Horario agregado exitosamente')
    } catch (error) {
        console.error('Error agregando horario:', error)
        alert('❌ Error al agregar horario')
    }
}

async function eliminarHorario(horarioId) {
    if (!confirm('¿Estás seguro de eliminar este horario?')) return

    try {
        await api.delete(`/horarios/${horarioId}`)
        await cargarHorariosDelDia()
        alert('✅ Horario eliminado')
    } catch (error) {
        console.error('Error eliminando horario:', error)
        alert('❌ Error al eliminar horario')
    }
}

async function agregarHorariosMañana() {
    await agregarRangoHorarios('09:00', '13:00', 30)
}

async function agregarHorariosTarde() {
    await agregarRangoHorarios('14:00', '18:00', 30)
}

async function agregarHorariosDiaCompleto() {
    await agregarRangoHorarios('09:00', '18:00', 30)
}

async function agregarRangoHorarios(horaInicio, horaFin, intervalo) {
    try {
        await api.post('/horarios/rango', {
            doctor_id: selectedDoctorId.value,
            fecha: selectedDate.value,
            hora_inicio: horaInicio,
            hora_fin: horaFin,
            intervalo: intervalo
        })

        await cargarHorariosDelDia()
        alert(`✅ Horarios agregados de ${horaInicio} a ${horaFin}`)
    } catch (error) {
        console.error('Error agregando rango de horarios:', error)
        alert('❌ Error al agregar horarios')
    }
}

function closeModal() {
    showAddHorarioModal.value = false
    nuevoHorario.value = { hora: '09:00', duracion: 30 }
}

function formatDate(dateStr) {
    const date = new Date(dateStr + 'T00:00:00')
    return date.toLocaleDateString('es-CL', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    })
}

function cambiarMes(direccion) {
    mesActual.value += direccion
    if (mesActual.value > 11) {
        mesActual.value = 0
        añoActual.value++
    } else if (mesActual.value < 0) {
        mesActual.value = 11
        añoActual.value--
    }
}

const diasDelMes = computed(() => {
    const dias = []
    const primerDia = new Date(añoActual.value, mesActual.value, 1)
    const ultimoDia = new Date(añoActual.value, mesActual.value + 1, 0)
    const hoy = new Date()

    for (let d = 1; d <= ultimoDia.getDate(); d++) {
        const fecha = new Date(añoActual.value, mesActual.value, d)
        const fechaStr = fecha.toISOString().split('T')[0]

        // Aquí deberías obtener la cantidad real de horarios desde tu API
        const cantidadHorarios = 0 // Placeholder

        dias.push({
            numero: d,
            fecha: fechaStr,
            cantidadHorarios: cantidadHorarios,
            esHoy: fecha.toDateString() === hoy.toDateString(),
            esPasado: fecha < hoy
        })
    }

    return dias
})
</script>

<style scoped>
.gestion-horarios {
    padding: 2rem;
    background-color: #f5f7fa;
    min-height: 100vh;
}

.container {
    max-width: 1200px;
    margin: 0 auto;
}

h1 {
    color: #2c3e50;
    margin-bottom: 2rem;
    font-size: 2rem;
}

.card {
    background: white;
    border-radius: 12px;
    padding: 2rem;
    margin-bottom: 2rem;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.card h2 {
    color: #34495e;
    margin-bottom: 1.5rem;
    font-size: 1.5rem;
    border-bottom: 2px solid #3498db;
    padding-bottom: 0.5rem;
}

/* Selector de Doctor */
.doctor-selector {
    display: flex;
    align-items: center;
    gap: 1rem;
    margin-bottom: 1.5rem;
}

.doctor-selector label {
    font-weight: 600;
    color: #2c3e50;
    min-width: 80px;
}

.form-select,
.form-input {
    flex: 1;
    padding: 0.75rem;
    border: 2px solid #e0e6ed;
    border-radius: 8px;
    font-size: 1rem;
    transition: border-color 0.3s;
}

.form-select:focus,
.form-input:focus {
    outline: none;
    border-color: #3498db;
}

/* Info del Doctor */
.doctor-info {
    margin-top: 1.5rem;
}

.info-card {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    padding: 1.5rem;
    border-radius: 12px;
}

.info-card h3 {
    margin: 0 0 1rem 0;
    font-size: 1.3rem;
}

.info-card p {
    margin: 0.5rem 0;
    opacity: 0.95;
}

/* Fecha Selector */
.fecha-selector {
    display: flex;
    align-items: center;
    gap: 1rem;
    margin-bottom: 2rem;
}

.fecha-selector label {
    font-weight: 600;
    color: #2c3e50;
    min-width: 80px;
}

/* Horarios Section */
.horarios-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1.5rem;
}

.horarios-header h3 {
    color: #2c3e50;
    margin: 0;
}

.horarios-lista {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
}

.horario-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem;
    background: #f8f9fa;
    border-radius: 8px;
    border-left: 4px solid #27ae60;
    transition: all 0.3s;
}

.horario-item:hover {
    transform: translateX(5px);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.horario-item.ocupado {
    border-left-color: #e74c3c;
    background: #ffebee;
}

.horario-info {
    display: flex;
    align-items: center;
    gap: 1rem;
}

.hora {
    font-weight: 600;
    font-size: 1.1rem;
    color: #2c3e50;
}

.badge-disponible {
    background: #d4edda;
    color: #155724;
    padding: 0.25rem 0.75rem;
    border-radius: 12px;
    font-size: 0.85rem;
    font-weight: 600;
}

.badge-ocupado {
    background: #f8d7da;
    color: #721c24;
    padding: 0.25rem 0.75rem;
    border-radius: 12px;
    font-size: 0.85rem;
    font-weight: 600;
}

.paciente-info {
    color: #7f8c8d;
    font-style: italic;
}

/* Botones */
.btn {
    padding: 0.75rem 1.5rem;
    border: none;
    border-radius: 8px;
    font-size: 1rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s;
}

.btn-primary {
    background: #3498db;
    color: white;
}

.btn-primary:hover {
    background: #2980b9;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(52, 152, 219, 0.3);
}

.btn-secondary {
    background: #95a5a6;
    color: white;
}

.btn-secondary:hover {
    background: #7f8c8d;
}

.btn-danger {
    background: #e74c3c;
    color: white;
}

.btn-danger:hover {
    background: #c0392b;
}

.btn-outline {
    background: white;
    color: #3498db;
    border: 2px solid #3498db;
}

.btn-outline:hover {
    background: #3498db;
    color: white;
}

.btn-sm {
    padding: 0.5rem 1rem;
    font-size: 0.9rem;
}

/* Quick Actions */
.quick-actions {
    margin-top: 2rem;
    padding-top: 2rem;
    border-top: 2px dashed #e0e6ed;
}

.quick-actions h3 {
    color: #2c3e50;
    margin-bottom: 1rem;
}

.quick-buttons {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 1rem;
}

/* Modal */
.modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
}

.modal-content {
    background: white;
    border-radius: 12px;
    width: 90%;
    max-width: 500px;
    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
}

.modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1.5rem;
    border-bottom: 1px solid #e0e6ed;
}

.modal-header h3 {
    margin: 0;
    color: #2c3e50;
}

.btn-close {
    background: none;
    border: none;
    font-size: 1.5rem;
    cursor: pointer;
    color: #95a5a6;
    padding: 0;
    width: 30px;
    height: 30px;
}

.btn-close:hover {
    color: #e74c3c;
}

.modal-body {
    padding: 1.5rem;
}

.form-group {
    margin-bottom: 1.5rem;
}

.form-group label {
    display: block;
    margin-bottom: 0.5rem;
    font-weight: 600;
    color: #2c3e50;
}

.modal-footer {
    display: flex;
    justify-content: flex-end;
    gap: 1rem;
    padding: 1.5rem;
    border-top: 1px solid #e0e6ed;
}

/* Empty State */
.empty-state {
    text-align: center;
    padding: 3rem 1rem;
    color: #7f8c8d;
}

.empty-state p {
    margin: 0.5rem 0;
}

.text-muted {
    font-size: 0.9rem;
    opacity: 0.7;
}

/* Calendario */
.calendario-resumen {
    padding: 1rem;
}

.mes-selector {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1.5rem;
}

.mes-selector h3 {
    margin: 0;
    color: #2c3e50;
}

.calendario-grid {
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    gap: 0.5rem;
}

.dia-item {
    aspect-ratio: 1;
    border: 2px solid #e0e6ed;
    border-radius: 8px;
    padding: 0.5rem;
    cursor: pointer;
    transition: all 0.3s;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
}

.dia-item:hover {
    background: #f8f9fa;
    border-color: #3498db;
}

.dia-item.tiene-horarios {
    background: #e3f2fd;
    border-color: #2196f3;
}

.dia-item.hoy {
    background: #fff3cd;
    border-color: #ffc107;
    font-weight: bold;
}

.dia-item.pasado {
    opacity: 0.5;
    cursor: not-allowed;
}

.dia-numero {
    font-size: 1rem;
    font-weight: 600;
    color: #2c3e50;
}

.dia-badge {
    font-size: 0.7rem;
    color: #2196f3;
    margin-top: 0.25rem;
}

/* Responsive */
@media (max-width: 768px) {
    .gestion-horarios {
        padding: 1rem;
    }

    .doctor-selector,
    .fecha-selector {
        flex-direction: column;
        align-items: flex-start;
    }

    .horarios-header {
        flex-direction: column;
        align-items: flex-start;
        gap: 1rem;
    }

    .quick-buttons {
        grid-template-columns: 1fr;
    }

    .calendario-grid {
        grid-template-columns: repeat(7, 1fr);
        gap: 0.25rem;
    }

    .dia-item {
        padding: 0.25rem;
    }

    .dia-numero {
        font-size: 0.85rem;
    }
}
</style>