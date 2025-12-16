import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import PacientesView from '../views/PacientesView.vue'
import DoctoresView from '../views/DoctoresView.vue'
import CitasView from '../views/CitasView.vue'
import TratamientosView from '../views/TratamientosView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView
    },
    {
      path: '/pacientes',
      name: 'pacientes',
      component: PacientesView
    },
    {
      path: '/citas',
      name: 'citas',
      component: CitasView
    },
     {
      path: '/doctores',
      name: 'doctores',
      component: DoctoresView
    },
    {
      path: '/tratamientos',
      name: 'tratamientos',
      component: TratamientosView
    }
  ]
})

export default router