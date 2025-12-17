import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import HomeView from '../views/HomeView.vue'
import PacientesView from '../views/PacientesView.vue'
import DoctoresView from '../views/DoctoresView.vue'
import CitasView from '../views/CitasView.vue'
import TratamientosView from '../views/TratamientosView.vue'
import HorasTomadasView from '../views/horastomadasview.vue'
import LoginView from '../views/LoginView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/login',
      name: 'login',
      component: LoginView,
      meta: { requiresGuest: true } // Solo accesible si NO está autenticado
    },
    {
      path: '/',
      name: 'home',
      component: HomeView,
      meta: { requiresAuth: true }
    },
    {
      path: '/pacientes',
      name: 'pacientes',
      component: PacientesView,
      meta: { requiresAuth: true }
    },
    {
      path: '/citas',
      name: 'citas',
      component: CitasView,
      meta: { requiresAuth: true }
    },
    {
      path: '/doctores',
      name: 'doctores',
      component: DoctoresView,
      meta: { requiresAuth: true }
    },
    {
      path: '/tratamientos',
      name: 'tratamientos',
      component: TratamientosView,
      meta: { requiresAuth: true }
    },
    {
      path: '/horas-tomadas',
      name: 'horas-tomadas',
      component: HorasTomadasView,
      meta: { requiresAuth: true }
    },
    {
      path: '/:pathMatch(.*)*',
      redirect: '/'
    }
  ]
})

// Guard de navegación para proteger rutas
router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore()

  // Verificar autenticación al cargar la app
  if (!authStore.checkedAuth) {
    await authStore.checkAuth()
  }

  const requiresAuth = to.matched.some(record => record.meta.requiresAuth)
  const requiresGuest = to.matched.some(record => record.meta.requiresGuest)

  if (requiresAuth && !authStore.isAuthenticated) {
    // Ruta protegida y usuario no autenticado -> ir a login
    next({ name: 'login' })
  } else if (requiresGuest && authStore.isAuthenticated) {
    // Ruta de invitado (login) y usuario ya autenticado -> ir a home
    next({ name: 'home' })
  } else {
    // Permitir navegación
    next()
  }
})

export default router