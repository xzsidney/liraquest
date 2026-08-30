<script setup lang="ts">
import { ref } from 'vue'
import axios from 'axios'
import { useRouter } from 'vue-router'

const router = useRouter()
const activeTab = ref<'login' | 'register'>('login')

const isLoading = ref(false)
const errorMessage = ref('')
const successMessage = ref('')

const loginForm = ref({
  email: '',
  password: ''
})

const registerForm = ref({
  name: '',
  email: '',
  password: '',
  confirmPassword: ''
})

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'https://api.liragames.com.br'
})

const handleLogin = async () => {
  isLoading.value = true
  errorMessage.value = ''
  successMessage.value = ''
  
  try {
    const response = await api.post('/api/auth/login', {
      email: loginForm.value.email,
      password: loginForm.value.password
    })
    
    // Sucesso
    const token = response.data.token
    const user = response.data.user
    
    sessionStorage.setItem('lira_token', token)
    sessionStorage.setItem('lira_user', JSON.stringify(user))
    
    successMessage.value = 'Login realizado com sucesso! Redirecionando...'
    
    // Redirecionamento por Perfil (Role)
    if (user && user.role === 'LIRA') {
      router.push('/familia/sala')
    } else if (user && user.role === 'MESTRE') {
      router.push('/mestre')
    } else {
      router.push('/dashboard')
    }
    
  } catch (error: any) {
    if (error.response && error.response.status === 401) {
      errorMessage.value = 'Email ou senha inválidos.'
    } else {
      errorMessage.value = 'Erro ao conectar com o servidor.'
    }
    console.error('Login error:', error)
  } finally {
    isLoading.value = false
  }
}

const handleRegister = async () => {
  if (registerForm.value.password !== registerForm.value.confirmPassword) {
    errorMessage.value = 'As senhas não coincidem.'
    return
  }

  isLoading.value = true
  errorMessage.value = ''
  successMessage.value = ''

  try {
    await api.post('/api/auth/register', {
      name: registerForm.value.name,
      username: registerForm.value.name,
      email: registerForm.value.email,
      password: registerForm.value.password
    })
    
    successMessage.value = 'Conta criada com sucesso! Você já pode entrar.'
    activeTab.value = 'login' // Muda para a aba de login
    
  } catch (error: any) {
    if (error.response && error.response.data) {
      errorMessage.value = error.response.data.message || error.response.data.error || 'Erro ao criar conta.'
    } else {
      errorMessage.value = 'Erro ao conectar com o servidor.'
    }
    console.error('Register error:', error)
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <main class="min-h-screen flex items-center justify-center bg-[#050505] relative overflow-hidden">
    <!-- Efeito de fumaça/névoa vermelha no fundo -->
    <div class="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blood-red/10 via-black/80 to-black z-0 pointer-events-none"></div>
    
    <div class="relative z-10 w-full max-w-md p-6">
      
      <!-- Logo/Titulo -->
      <div class="text-center mb-8">
        <h1 class="text-4xl font-bold tracking-widest text-white uppercase drop-shadow-[0_0_10px_rgba(139,0,0,0.8)]">Lira RPG</h1>
        <p class="text-text-muted mt-2 tracking-wide text-sm uppercase">O Mundo das Trevas Aguarda</p>
      </div>

      <!-- Container principal Glassmorphism -->
      <div class="glass-panel p-8">
        
        <!-- Abas -->
        <div class="flex border-b border-white/10 mb-6">
          <button 
            @click="activeTab = 'login'; errorMessage = ''; successMessage = ''" 
            class="flex-1 pb-3 text-sm font-medium transition-all duration-300 relative"
            :class="activeTab === 'login' ? 'text-white' : 'text-text-muted hover:text-white/80'"
          >
            Entrar
            <div v-if="activeTab === 'login'" class="absolute bottom-0 left-0 w-full h-0.5 bg-blood-red shadow-[0_0_8px_rgba(139,0,0,0.8)]"></div>
          </button>
          
          <button 
            @click="activeTab = 'register'; errorMessage = ''; successMessage = ''" 
            class="flex-1 pb-3 text-sm font-medium transition-all duration-300 relative"
            :class="activeTab === 'register' ? 'text-white' : 'text-text-muted hover:text-white/80'"
          >
            Despertar
            <div v-if="activeTab === 'register'" class="absolute bottom-0 left-0 w-full h-0.5 bg-blood-red shadow-[0_0_8px_rgba(139,0,0,0.8)]"></div>
          </button>
        </div>

        <!-- Alertas de Feedback -->
        <div v-if="errorMessage" class="mb-4 p-3 rounded bg-red-900/50 border border-red-500/50 text-red-200 text-sm animate-fade-in text-center">
          {{ errorMessage }}
        </div>
        <div v-if="successMessage" class="mb-4 p-3 rounded bg-green-900/50 border border-green-500/50 text-green-200 text-sm animate-fade-in text-center">
          {{ successMessage }}
        </div>

        <!-- Formulário de Login -->
        <div v-if="activeTab === 'login'" class="animate-fade-in">
          <form @submit.prevent="handleLogin" class="space-y-4">
            <div>
              <label class="block text-xs font-semibold text-text-muted uppercase tracking-wider mb-1">Email</label>
              <input type="email" v-model="loginForm.email" class="input-premium" placeholder="seu@email.com" required>
            </div>
            
            <div>
              <div class="flex justify-between items-center mb-1">
                <label class="block text-xs font-semibold text-text-muted uppercase tracking-wider">Senha</label>
                <a href="#" class="text-xs text-blood-red hover:text-blood-red-hover transition-colors">Esqueceu?</a>
              </div>
              <input type="password" v-model="loginForm.password" class="input-premium" placeholder="••••••••" required>
            </div>

            <div class="pt-4">
              <button type="submit" class="btn-primary" :disabled="isLoading">
                {{ isLoading ? 'Conectando...' : 'Acessar a Noite' }}
              </button>
            </div>
          </form>
        </div>

        <!-- Formulário de Registro -->
        <div v-else class="animate-fade-in">
          <form @submit.prevent="handleRegister" class="space-y-4">
            <div>
              <label class="block text-xs font-semibold text-text-muted uppercase tracking-wider mb-1">Nome/Alcunha</label>
              <input type="text" v-model="registerForm.name" class="input-premium" placeholder="Como é conhecido?" required>
            </div>

            <div>
              <label class="block text-xs font-semibold text-text-muted uppercase tracking-wider mb-1">Email</label>
              <input type="email" v-model="registerForm.email" class="input-premium" placeholder="seu@email.com" required>
            </div>
            
            <div>
              <label class="block text-xs font-semibold text-text-muted uppercase tracking-wider mb-1">Senha</label>
              <input type="password" v-model="registerForm.password" class="input-premium" placeholder="••••••••" required>
            </div>

            <div>
              <label class="block text-xs font-semibold text-text-muted uppercase tracking-wider mb-1">Confirmar Senha</label>
              <input type="password" v-model="registerForm.confirmPassword" class="input-premium" placeholder="••••••••" required>
            </div>

            <div class="pt-4">
              <button type="submit" class="btn-primary" :disabled="isLoading">
                {{ isLoading ? 'Forjando Vínculo...' : 'Abraçar a Escuridão' }}
              </button>
            </div>
          </form>
        </div>
        
      </div>
    </div>
  </main>
</template>

<style scoped>
.animate-fade-in {
  animation: fadeIn 0.4s ease-out forwards;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(5px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
