import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import vuetify from './plugins/vuetify'
import axios from './plugins/axios' // ⬅️ SOLO ESTE IMPORT

// PrimeVue v4
import PrimeVue from 'primevue/config'
import Aura from '@primevue/themes/aura'
import 'primeicons/primeicons.css'

// ❌ ELIMINAR ESTE IMPORT DUPLICADO
// import axios from 'axios'

// ❌ ELIMINAR TODA ESTA CONFIGURACIÓN (ya está en plugins/axios.js)
// axios.defaults.baseURL = 'http://localhost:8000'
// axios.defaults.withCredentials = true
// axios.defaults.withXSRFToken = true
// axios.defaults.headers.common['Accept'] = 'application/json'
// axios.defaults.headers.common['Content-Type'] = 'application/json'

// Interceptor para manejar errores de autenticación
axios.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      // Redirigir al login si no está autenticado
      router.push('/login')
    }
    return Promise.reject(error)
  }
)

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)
app.use(vuetify)

app.use(PrimeVue, {
  theme: {
    preset: Aura,
    options: {
      prefix: 'p',
      darkModeSelector: false,
      cssLayer: false
    }
  },
  locale: {
    dayNames: ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'],
    dayNamesShort: ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'],
    dayNamesMin: ['D', 'L', 'M', 'M', 'J', 'V', 'S'],
    monthNames: ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'],
    monthNamesShort: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'],
    today: 'Hoy',
    clear: 'Limpiar',
    weekHeader: 'Sem',
    firstDayOfWeek: 0,
    dateFormat: 'dd/mm/yy'
  }
})

app.mount('#app')