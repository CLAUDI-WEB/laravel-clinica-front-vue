<template>
    <v-app>
        <v-main>
            <v-container class="fill-height" fluid>
                <v-row justify="center" align="center">
                    <v-col cols="12" sm="8" md="5" lg="4">
                        <v-card elevation="8" class="pa-4">
                            <v-card-title class="text-h4 text-center mb-4">
                                <v-icon size="48" color="primary" class="mr-2">mdi-tooth</v-icon>
                                Clínica Dental
                            </v-card-title>

                            <v-card-subtitle class="text-center mb-4">
                                Sistema de Gestión de Citas
                            </v-card-subtitle>

                            <v-card-text>
                                <v-tabs v-model="tab" grow>
                                    <v-tab value="login">Iniciar Sesión</v-tab>
                                    <v-tab value="register">Registrarse</v-tab>
                                </v-tabs>

                                <v-window v-model="tab" class="mt-6">
                                    <v-window-item value="login">
                                        <v-form @submit.prevent="handleLogin" ref="loginForm">
                                            <v-text-field v-model="loginData.email" label="Email" type="email"
                                                prepend-inner-icon="mdi-email" variant="outlined"
                                                :rules="[rules.required, rules.email]" required></v-text-field>

                                            <v-text-field v-model="loginData.password" label="Contraseña"
                                                :type="showPassword ? 'text' : 'password'" prepend-inner-icon="mdi-lock"
                                                :append-inner-icon="showPassword ? 'mdi-eye' : 'mdi-eye-off'"
                                                @click:append-inner="showPassword = !showPassword" variant="outlined"
                                                :rules="[rules.required]" required></v-text-field>

                                            <v-alert v-if="authStore.error" type="error" variant="tonal" class="mb-4"
                                                closable @click:close="authStore.clearError()">
                                                {{ authStore.error }}
                                            </v-alert>

                                            <v-btn type="submit" color="primary" block size="large"
                                                :loading="authStore.loading" class="mb-2">
                                                Ingresar
                                            </v-btn>
                                        </v-form>
                                    </v-window-item>

                                    <v-window-item value="register">
                                        <v-form @submit.prevent="handleRegister" ref="registerForm">
                                            <v-text-field v-model="registerData.name" label="Nombre completo"
                                                prepend-inner-icon="mdi-account" variant="outlined"
                                                :rules="[rules.required]" required></v-text-field>

                                            <v-text-field v-model="registerData.rut" label="RUT (opcional)"
                                                prepend-inner-icon="mdi-card-account-details" variant="outlined"
                                                placeholder="12345678-9"></v-text-field>

                                            <v-text-field v-model="registerData.email" label="Email" type="email"
                                                prepend-inner-icon="mdi-email" variant="outlined"
                                                :rules="[rules.required, rules.email]" required></v-text-field>

                                            <v-text-field v-model="registerData.phone" label="Teléfono (opcional)"
                                                prepend-inner-icon="mdi-phone" variant="outlined"
                                                placeholder="+56912345678"></v-text-field>

                                            <v-text-field v-model="registerData.password" label="Contraseña"
                                                :type="showPassword ? 'text' : 'password'" prepend-inner-icon="mdi-lock"
                                                :append-inner-icon="showPassword ? 'mdi-eye' : 'mdi-eye-off'"
                                                @click:append-inner="showPassword = !showPassword" variant="outlined"
                                                :rules="[rules.required, rules.minLength]" required></v-text-field>

                                            <v-text-field v-model="registerData.password_confirmation"
                                                label="Confirmar contraseña" :type="showPassword ? 'text' : 'password'"
                                                prepend-inner-icon="mdi-lock-check" variant="outlined"
                                                :rules="[rules.required, rules.passwordMatch]" required></v-text-field>

                                            <v-alert v-if="authStore.error" type="error" variant="tonal" class="mb-4"
                                                closable @click:close="authStore.clearError()">
                                                {{ authStore.error }}
                                            </v-alert>

                                            <v-btn type="submit" color="primary" block size="large"
                                                :loading="authStore.loading">
                                                Registrarse
                                            </v-btn>
                                        </v-form>
                                    </v-window-item>
                                </v-window>
                            </v-card-text>
                        </v-card>
                    </v-col>
                </v-row>
            </v-container>
        </v-main>
    </v-app>
</template>

<script setup>
import { ref } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useRouter } from 'vue-router'

const authStore = useAuthStore()
const router = useRouter()

const tab = ref('login')
const showPassword = ref(false)
const loginForm = ref(null)
const registerForm = ref(null)

const loginData = ref({
    email: '',
    password: ''
})

const registerData = ref({
    name: '',
    rut: '',
    email: '',
    phone: '',
    password: '',
    password_confirmation: ''
})

const rules = {
    required: value => !!value || 'Campo requerido',
    email: value => /.+@.+\..+/.test(value) || 'Email inválido',
    minLength: value => value.length >= 8 || 'Mínimo 8 caracteres',
    passwordMatch: value => value === registerData.value.password || 'Las contraseñas no coinciden'
}

const handleLogin = async () => {
    const { valid } = await loginForm.value.validate()

    if (valid) {
        try {
            await authStore.login(loginData.value)
            router.push({ name: 'home' })
        } catch (error) {
            console.error('Error al iniciar sesión:', error)
        }
    }
}

const handleRegister = async () => {
    const { valid } = await registerForm.value.validate()

    if (valid) {
        try {
            await authStore.register(registerData.value)
            router.push({ name: 'home' })
        } catch (error) {
            console.error('Error al registrarse:', error)
        }
    }
}
</script>

<style scoped>
.fill-height {
    min-height: 100vh;
}
</style>