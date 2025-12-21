<!-- views/UnauthorizedView.vue -->
<template>
    <div class="unauthorized-container">
        <div class="unauthorized-content">
            <h1>⛔ Acceso Denegado</h1>
            <p>No tienes permisos para acceder a esta página.</p>
            <button @click="goHome" class="btn-primary">
                Volver al Inicio
            </button>
        </div>
    </div>
</template>

<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()

const goHome = () => {
    router.push({ name: 'home' })
}
</script>

<style scoped>
.unauthorized-container {
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 80vh;
}

.unauthorized-content {
    text-align: center;
    padding: 2rem;
}

.unauthorized-content h1 {
    font-size: 3rem;
    margin-bottom: 1rem;
    color: #dc3545;
}

.btn-primary {
    margin-top: 1rem;
    padding: 0.5rem 1.5rem;
    background-color: #007bff;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
}
</style>