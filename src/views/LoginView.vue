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
  baseURL: import.meta.env.VITE_API_URL || ''
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
    
    // Redirecionamento para a Sala da Família
    router.push('/familia/sala')
    
  } catch (error: any) {
    if (error.response?.data?.error) {
      errorMessage.value = error.response.data.error
    } else if (error.response?.data?.message) {
      errorMessage.value = error.response.data.message
    } else if (error.response?.status === 400 || error.response?.status === 401) {
      errorMessage.value = 'Email ou senha inválidos. Se ainda não tem conta, clique na aba "Cadastrar" acima!'
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
    const regRes = await api.post('/api/auth/register', {
      name: registerForm.value.name,
      username: registerForm.value.name,
      email: registerForm.value.email,
      password: registerForm.value.password,
      role: 'LIRA'
    })
    
    // Login automático após registrar
    if (regRes.data && regRes.data.token) {
      sessionStorage.setItem('lira_token', regRes.data.token)
      sessionStorage.setItem('lira_user', JSON.stringify(regRes.data.user))
      successMessage.value = 'Conta criada com sucesso! Entrando no Reino...'
      setTimeout(() => {
        router.push('/familia/sala')
      }, 800)
    } else {
      successMessage.value = 'Conta criada com sucesso! Você já pode entrar.'
      activeTab.value = 'login'
    }
    
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
  <main class="min-h-screen flex items-center justify-center bg-gradient-to-b from-[#090214] via-[#040817] to-[#02040a] text-slate-100 relative overflow-hidden">
    <!-- Efeito de partículas/brilho no fundo -->
    <div class="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-amber-600/10 via-purple-950/20 to-black z-0 pointer-events-none"></div>
    
    <div class="relative z-10 w-full max-w-md p-6">
      
      <!-- Logo/Titulo -->
      <div class="text-center mb-8">
        <h1 class="text-4xl font-extrabold tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-yellow-200 to-amber-500 uppercase drop-shadow-[0_0_20px_rgba(245,158,11,0.4)]">
          🏰 LiraQuest
        </h1>
        <p class="text-amber-200/70 mt-2 font-medium tracking-wide text-sm">O RPG Épico de Gamificação da Família</p>
      </div>

      <!-- Container principal Glassmorphism -->
      <div class="bg-slate-900/80 backdrop-blur-xl border border-amber-500/30 shadow-2xl shadow-amber-500/10 rounded-3xl p-8">
        
        <!-- Abas -->
        <div class="flex border-b border-slate-700/60 mb-6">
          <button 
            @click="activeTab = 'login'; errorMessage = ''; successMessage = ''" 
            class="flex-1 pb-3 text-sm font-bold transition-all duration-300 relative text-center"
            :class="activeTab === 'login' ? 'text-amber-400' : 'text-slate-400 hover:text-slate-200'"
          >
            Entrar
            <div v-if="activeTab === 'login'" class="absolute bottom-0 left-0 w-full h-0.5 bg-amber-400 shadow-[0_0_10px_rgba(251,191,36,0.8)]"></div>
          </button>
          
          <button 
            @click="activeTab = 'register'; errorMessage = ''; successMessage = ''" 
            class="flex-1 pb-3 text-sm font-bold transition-all duration-300 relative text-center"
            :class="activeTab === 'register' ? 'text-amber-400' : 'text-slate-400 hover:text-slate-200'"
          >
            Cadastrar
            <div v-if="activeTab === 'register'" class="absolute bottom-0 left-0 w-full h-0.5 bg-amber-400 shadow-[0_0_10px_rgba(251,191,36,0.8)]"></div>
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
                <label class="block text-xs font-semibold text-slate-300 uppercase tracking-wider">Senha</label>
              </div>
              <input type="password" v-model="loginForm.password" class="w-full bg-slate-950/80 border border-slate-700 focus:border-amber-400 focus:outline-none rounded-xl px-4 py-3 text-white placeholder-slate-500 transition-all" placeholder="••••••••" required>
            </div>

            <div class="pt-4">
              <button type="submit" class="w-full bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black py-3.5 px-6 rounded-xl shadow-lg shadow-amber-500/20 transition-all active:scale-98 disabled:opacity-50" :disabled="isLoading">
                {{ isLoading ? 'Conectando...' : '⚔️ Entrar no Reino' }}
              </button>
            </div>
          </form>
        </div>

        <!-- Formulário de Registro -->
        <div v-else class="animate-fade-in">
          <form @submit.prevent="handleRegister" class="space-y-4">
            <div>
              <label class="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">Nome do Herói / Patriarca</label>
              <input type="text" v-model="registerForm.name" class="w-full bg-slate-950/80 border border-slate-700 focus:border-amber-400 focus:outline-none rounded-xl px-4 py-3 text-white placeholder-slate-500 transition-all" placeholder="Ex: Sidney Lira" required>
            </div>

            <div>
              <label class="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">Email</label>
              <input type="email" v-model="registerForm.email" class="w-full bg-slate-950/80 border border-slate-700 focus:border-amber-400 focus:outline-none rounded-xl px-4 py-3 text-white placeholder-slate-500 transition-all" placeholder="seu@email.com" required>
            </div>
            
            <div>
              <label class="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">Senha</label>
              <input type="password" v-model="registerForm.password" class="w-full bg-slate-950/80 border border-slate-700 focus:border-amber-400 focus:outline-none rounded-xl px-4 py-3 text-white placeholder-slate-500 transition-all" placeholder="••••••••" required>
            </div>

            <div>
              <label class="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">Confirmar Senha</label>
              <input type="password" v-model="registerForm.confirmPassword" class="w-full bg-slate-950/80 border border-slate-700 focus:border-amber-400 focus:outline-none rounded-xl px-4 py-3 text-white placeholder-slate-500 transition-all" placeholder="••••••••" required>
            </div>

            <div class="pt-4">
              <button type="submit" class="w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-black py-3.5 px-6 rounded-xl shadow-lg shadow-emerald-500/20 transition-all active:scale-98 disabled:opacity-50" :disabled="isLoading">
                {{ isLoading ? 'Criando Conta...' : '✨ Criar Conta e Entrar' }}
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
