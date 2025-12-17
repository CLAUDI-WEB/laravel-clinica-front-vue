<template>
    <v-container class="fill-height">
        <v-row justify="center" align="center">
            <v-col cols="12" sm="8" md="4">
                <v-card>
                    <v-card-title class="text-h5 text-center">
                        Iniciar Sesión
                    </v-card-title>

                    <v-card-text>
                        <v-form @submit.prevent="handleLogin" ref="loginForm">
                            <v-text-field v-model="credentials.email" label="Email" type="email"
                                prepend-icon="mdi-email" :rules="[rules.required, rules.email]" required></v-text-field>

                            <v-text-field v-model="credentials.password" label="Contraseña"
                                :type="showPassword ? 'text' : 'password'" prepend-icon="mdi-lock"
                                :append-icon="showPassword ? 'mdi-eye' : 'mdi-eye-off'"
                                @click:append="showPassword = !showPassword" :rules="[rules.required]"
                                required></v-text-field>

                            <v-alert v-if="authStore.error" type="error" class="mb-4">
                                {{ authStore.error }}
                            </v-alert>

                            <v-btn type="submit" color="primary" block :loading="authStore.loading" class="mb-2">
                                Ingresar
                            </v-btn>

                            <v-btn text block @click="$emit('show-register')">
                                ¿No tienes cuenta? Regístrate
                            </v-btn>
                        </v-form>
                    </v-card-text>
                </v-card>
            </v-col>
        </v-row>
    </v-container>
</template>

<script setup>
import { ref } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useRouter } from 'vue-router'

const authStore = useAuthStore()
const router = useRouter()

const credentials = ref({
    email: '',
    password: ''
})

const showPassword = ref(false)
const loginForm = ref(null)

const rules = {
    required: value => !!value || 'Campo requerido',
    email: value => /.+@.+\..+/.test(value) || 'Email inválido'
}

const handleLogin = async () => {
    const { valid } = await loginForm.value.validate()

    if (valid) {
        try {
            await authStore.login(credentials.value)
            router.push('/appointments')
        } catch (error) {
            console.error('Error al iniciar sesión:', error)
        }
    }
}
</script>