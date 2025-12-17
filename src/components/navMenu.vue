<script setup>
import { RouterLink, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { computed } from 'vue'

const authStore = useAuthStore()
const router = useRouter()

// Computed para saber si el usuario está autenticado
const isAuthenticated = computed(() => authStore.isAuthenticated)
const userName = computed(() => authStore.user?.nombre || authStore.user?.email || 'Usuario')

const handleLogout = async () => {
  try {
    await authStore.logout()
    router.push('/login')
  } catch (error) {
    console.error('Error al cerrar sesión:', error)
  }
}
</script>

<template>
  <nav class="nav-menu">
    <div class="nav-container">
      <div class="nav-logo">
        <h2>🦷 Clínica Dental</h2>
      </div>

      <ul class="nav-links">
        <li>
          <RouterLink to="/">Inicio</RouterLink>
        </li>
        <li>
          <RouterLink to="/pacientes">Pacientes</RouterLink>
        </li>
        <li>
          <RouterLink to="/doctores">Doctores</RouterLink>
        </li>
        <li>
          <RouterLink to="/citas">Citas</RouterLink>
        </li>
        <li>
          <RouterLink to="/horas-tomadas">Horas Tomadas</RouterLink>
        </li>
        <li>
          <RouterLink to="/tratamientos">Tratamientos</RouterLink>
        </li>

        <!-- Mostrar solo si está autenticado -->
        <li v-if="isAuthenticated" class="user-section">
          <span class="user-name">👤 {{ userName }}</span>
          <button @click="handleLogout" class="logout-btn">
            Cerrar Sesión
          </button>
        </li>

        <!-- Mostrar solo si NO está autenticado -->
        <li v-else>
          <RouterLink to="/login" class="login-link">Iniciar Sesión</RouterLink>
        </li>
      </ul>
    </div>
  </nav>
</template>

<style scoped>
.nav-menu {
  background-color: #2c3e50;
  color: white;
  padding: 1rem 0;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.nav-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.nav-logo h2 {
  margin: 0;
  font-size: 1.5rem;
}

.nav-links {
  list-style: none;
  display: flex;
  gap: 2rem;
  margin: 0;
  padding: 0;
  align-items: center;
}

.nav-links a {
  color: white;
  text-decoration: none;
  font-weight: 500;
  transition: color 0.3s;
  padding: 0.5rem 1rem;
  border-radius: 4px;
}

.nav-links a:hover {
  background-color: rgba(255, 255, 255, 0.1);
}

.nav-links a.router-link-active {
  background-color: #42b983;
}

/* Estilos para la sección de usuario */
.user-section {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.user-name {
  color: white;
  font-size: 0.9rem;
  padding: 0.5rem;
}

.logout-btn {
  background-color: #e74c3c;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
  transition: background-color 0.3s;
}

.logout-btn:hover {
  background-color: #c0392b;
}

.login-link {
  background-color: #42b983;
}

.login-link:hover {
  background-color: #35a372;
}
</style>