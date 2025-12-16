<script setup>
import { RouterLink } from 'vue-router'
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
          <RouterLink to="/tratamientos">Tratamientos</RouterLink>
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
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
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
</style>