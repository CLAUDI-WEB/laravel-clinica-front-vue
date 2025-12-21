import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import HomeView from '../views/HomeView.vue'
import PacientesView from '../views/PacientesView.vue'
import DoctoresView from '../views/DoctoresView.vue'
import CitasView from '../views/CitasView.vue'
import TratamientosView from '../views/TratamientosView.vue'
import HorasTomadasView from '../views/horastomadasview.vue'
import LoginView from '../views/LoginView.vue'
import UnauthorizedView from '../views/UnauthorizedView.vue'
import GestionHorariosView from '../views/GestionHorariosView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/login',
      name: 'login',
      component: LoginView,
      meta: { requiresGuest: true }
    },
    {
      path: '/unauthorized',
      name: 'unauthorized',
      component: UnauthorizedView
    },
    {
      path: '/',
      name: 'home',
      component: HomeView,
      meta: {
        requiresAuth: true,
        roles: ['admin', 'paciente'] // Ambos pueden ver home
      }
    },
    {
      path: '/pacientes',
      name: 'pacientes',
      component: PacientesView,
      meta: {
        requiresAuth: true,
        roles: ['admin'] // Solo admin
      }
    },
    {
      path: '/citas',
      name: 'citas',
      component: CitasView,
      meta: {
        requiresAuth: true,
        roles: ['admin', 'paciente'] // Ambos pueden ver citas
      }
    },
    {
      path: '/doctores',
      name: 'doctores',
      component: DoctoresView,
      meta: {
        requiresAuth: true,
        roles: ['admin'] // Solo admin
      }
    },
    {
      path: '/tratamientos',
      name: 'tratamientos',
      component: TratamientosView,
      meta: {
        requiresAuth: true,
        roles: ['admin'] // Solo admin
      }
    },
    {
      path: '/gestion-horas',
      name: '/gestion-horas',
      component: GestionHorariosView,
      meta: {
        requiresAuth: true,
        roles: ['admin'] // Solo admin
      }
    },
    {
      path: '/horas-tomadas',
      name: 'horastomadas',
      component: HorasTomadasView,
      meta: {
        requiresAuth: true,
        roles: ['admin'] // Solo admin
      }
    },
    {
      path: '/:pathMatch(.*)*',
      redirect: '/'
    }
  ]
})

// Guard de navegación mejorado con verificación de roles 19-12-2025
router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore()

  // Verificar autenticación al cargar la app
  if (!authStore.checkedAuth) {
    console.log('🔄 Verificando autenticación en router guard...')
    await authStore.checkAuth()
  }

  const requiresAuth = to.matched.some(record => record.meta.requiresAuth)
  const requiresGuest = to.matched.some(record => record.meta.requiresGuest)
  const allowedRoles = to.meta.roles

  console.log('🛣️ Navegando a:', to.name)
  console.log('   - Requiere auth:', requiresAuth)
  console.log('   - Roles permitidos:', allowedRoles)
  console.log('   - Usuario autenticado:', authStore.isAuthenticated)
  console.log('   - Rol del usuario:', authStore.userRole)

  if (requiresAuth && !authStore.isAuthenticated) {
    // No autenticado -> ir a login
    console.log('❌ No autenticado, redirigiendo a login')
    next({ name: 'login' })
  } else if (requiresGuest && authStore.isAuthenticated) {
    // Ya autenticado -> ir a home
    console.log('✅ Ya autenticado, redirigiendo a home')
    next({ name: 'home' })
  } else if (allowedRoles && !authStore.hasRole(allowedRoles)) {
    // Autenticado pero sin permisos -> ir a página de acceso denegado
    console.log('⛔ Sin permisos para esta ruta, redirigiendo a unauthorized')
    next({ name: 'unauthorized' })
  } else {
    // Todo OK
    console.log('✅ Acceso permitido')
    next()
  }
})

export default router