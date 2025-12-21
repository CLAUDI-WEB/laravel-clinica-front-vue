<script setup>
import { RouterLink } from 'vue-router'
</script>

<template>
  <div class="home">
    <h1>Bienvenido al Sistema Dental</h1>
    <div class="cards">
      <RouterLink to="/pacientes" class="card">
        <h3>👥 Pacientes</h3>
        <p>Gestiona la información de tus pacientes</p>
      </RouterLink>

      <RouterLink to="/citas" class="card">
        <h3>📅 Citas</h3>
        <p>Administra tu agenda de citas</p>
      </RouterLink>

      <RouterLink to="/doctores" class="card">
        <h3>👨‍⚕️ Doctores</h3>
        <p>Administra tu equipo médico</p>
      </RouterLink>

      <RouterLink to="/tratamientos" class="card">
        <h3>💉 Tratamientos</h3>
        <p>Control de tratamientos activos</p>
      </RouterLink>

      <RouterLink to="/horas-tomadas" class="card">
        <h3>💉 Horas Reservadas</h3>
        <p>Control de horas Reservadas</p>
      </RouterLink>

      <RouterLink to="/gestion-horas" class="card">
        <h3>💉 Gestion Horas Doctores</h3>
        <p>Control de horas Doctores</p>
      </RouterLink>
    </div>
  </div>
</template>

<style scoped>
.home {
  text-align: center;
}

h1 {
  margin-bottom: 2rem;
  color: #2c3e50;
}

.cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 2rem;
  margin-top: 2rem;
}

.card {
  background: white;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s;
  text-decoration: none;
  color: inherit;
  display: block;
  cursor: pointer;
}

.card:hover {
  transform: translateY(-5px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.card h3 {
  margin-bottom: 1rem;
  font-size: 1.5rem;
}
</style>