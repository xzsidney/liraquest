import { ref } from 'vue';
import axios from 'axios';
import { useRouter } from 'vue-router';
const router = useRouter();
const activeTab = ref('login');
const isLoading = ref(false);
const errorMessage = ref('');
const successMessage = ref('');
const loginForm = ref({
    email: '',
    password: ''
});
const registerForm = ref({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
});
const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'https://api.liragames.com.br'
});
const handleLogin = async () => {
    isLoading.value = true;
    errorMessage.value = '';
    successMessage.value = '';
    try {
        const response = await api.post('/api/auth/login', {
            email: loginForm.value.email,
            password: loginForm.value.password
        });
        // Sucesso
        const token = response.data.token;
        const user = response.data.user;
        sessionStorage.setItem('lira_token', token);
        sessionStorage.setItem('lira_user', JSON.stringify(user));
        successMessage.value = 'Login realizado com sucesso! Redirecionando...';
        // Redirecionamento por Perfil (Role)
        if (user && user.role === 'LIRA') {
            router.push('/familia/sala');
        }
        else if (user && user.role === 'MESTRE') {
            router.push('/mestre');
        }
        else {
            router.push('/dashboard');
        }
    }
    catch (error) {
        if (error.response && error.response.status === 401) {
            errorMessage.value = 'Email ou senha inválidos.';
        }
        else {
            errorMessage.value = 'Erro ao conectar com o servidor.';
        }
        console.error('Login error:', error);
    }
    finally {
        isLoading.value = false;
    }
};
const handleRegister = async () => {
    if (registerForm.value.password !== registerForm.value.confirmPassword) {
        errorMessage.value = 'As senhas não coincidem.';
        return;
    }
    isLoading.value = true;
    errorMessage.value = '';
    successMessage.value = '';
    try {
        await api.post('/api/auth/register', {
            name: registerForm.value.name,
            username: registerForm.value.name,
            email: registerForm.value.email,
            password: registerForm.value.password
        });
        successMessage.value = 'Conta criada com sucesso! Você já pode entrar.';
        activeTab.value = 'login'; // Muda para a aba de login
    }
    catch (error) {
        if (error.response && error.response.data) {
            errorMessage.value = error.response.data.message || error.response.data.error || 'Erro ao criar conta.';
        }
        else {
            errorMessage.value = 'Erro ao conectar com o servidor.';
        }
        console.error('Register error:', error);
    }
    finally {
        isLoading.value = false;
    }
};
const __VLS_ctx = {
    ...{},
    ...{},
};
let __VLS_components;
let __VLS_intrinsics;
let __VLS_directives;
__VLS_asFunctionalElement1(__VLS_intrinsics.main, __VLS_intrinsics.main)({
    ...{ class: "min-h-screen flex items-center justify-center bg-[#050505] relative overflow-hidden" },
});
/** @type {__VLS_StyleScopedClasses['min-h-screen']} */ ;
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['justify-center']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-[#050505]']} */ ;
/** @type {__VLS_StyleScopedClasses['relative']} */ ;
/** @type {__VLS_StyleScopedClasses['overflow-hidden']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blood-red/10 via-black/80 to-black z-0 pointer-events-none" },
});
/** @type {__VLS_StyleScopedClasses['absolute']} */ ;
/** @type {__VLS_StyleScopedClasses['inset-0']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))]']} */ ;
/** @type {__VLS_StyleScopedClasses['from-blood-red/10']} */ ;
/** @type {__VLS_StyleScopedClasses['via-black/80']} */ ;
/** @type {__VLS_StyleScopedClasses['to-black']} */ ;
/** @type {__VLS_StyleScopedClasses['z-0']} */ ;
/** @type {__VLS_StyleScopedClasses['pointer-events-none']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "relative z-10 w-full max-w-md p-6" },
});
/** @type {__VLS_StyleScopedClasses['relative']} */ ;
/** @type {__VLS_StyleScopedClasses['z-10']} */ ;
/** @type {__VLS_StyleScopedClasses['w-full']} */ ;
/** @type {__VLS_StyleScopedClasses['max-w-md']} */ ;
/** @type {__VLS_StyleScopedClasses['p-6']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "text-center mb-8" },
});
/** @type {__VLS_StyleScopedClasses['text-center']} */ ;
/** @type {__VLS_StyleScopedClasses['mb-8']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.h1, __VLS_intrinsics.h1)({
    ...{ class: "text-4xl font-bold tracking-widest text-white uppercase drop-shadow-[0_0_10px_rgba(139,0,0,0.8)]" },
});
/** @type {__VLS_StyleScopedClasses['text-4xl']} */ ;
/** @type {__VLS_StyleScopedClasses['font-bold']} */ ;
/** @type {__VLS_StyleScopedClasses['tracking-widest']} */ ;
/** @type {__VLS_StyleScopedClasses['text-white']} */ ;
/** @type {__VLS_StyleScopedClasses['uppercase']} */ ;
/** @type {__VLS_StyleScopedClasses['drop-shadow-[0_0_10px_rgba(139,0,0,0.8)]']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
    ...{ class: "text-text-muted mt-2 tracking-wide text-sm uppercase" },
});
/** @type {__VLS_StyleScopedClasses['text-text-muted']} */ ;
/** @type {__VLS_StyleScopedClasses['mt-2']} */ ;
/** @type {__VLS_StyleScopedClasses['tracking-wide']} */ ;
/** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
/** @type {__VLS_StyleScopedClasses['uppercase']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "glass-panel p-8" },
});
/** @type {__VLS_StyleScopedClasses['glass-panel']} */ ;
/** @type {__VLS_StyleScopedClasses['p-8']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "flex border-b border-white/10 mb-6" },
});
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['border-b']} */ ;
/** @type {__VLS_StyleScopedClasses['border-white/10']} */ ;
/** @type {__VLS_StyleScopedClasses['mb-6']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
    ...{ onClick: (...[$event]) => {
            __VLS_ctx.activeTab = 'login';
            __VLS_ctx.errorMessage = '';
            __VLS_ctx.successMessage = '';
            // @ts-ignore
            [activeTab, errorMessage, successMessage,];
        } },
    ...{ class: "flex-1 pb-3 text-sm font-medium transition-all duration-300 relative" },
    ...{ class: (__VLS_ctx.activeTab === 'login' ? 'text-white' : 'text-text-muted hover:text-white/80') },
});
/** @type {__VLS_StyleScopedClasses['flex-1']} */ ;
/** @type {__VLS_StyleScopedClasses['pb-3']} */ ;
/** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
/** @type {__VLS_StyleScopedClasses['font-medium']} */ ;
/** @type {__VLS_StyleScopedClasses['transition-all']} */ ;
/** @type {__VLS_StyleScopedClasses['duration-300']} */ ;
/** @type {__VLS_StyleScopedClasses['relative']} */ ;
if (__VLS_ctx.activeTab === 'login') {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "absolute bottom-0 left-0 w-full h-0.5 bg-blood-red shadow-[0_0_8px_rgba(139,0,0,0.8)]" },
    });
    /** @type {__VLS_StyleScopedClasses['absolute']} */ ;
    /** @type {__VLS_StyleScopedClasses['bottom-0']} */ ;
    /** @type {__VLS_StyleScopedClasses['left-0']} */ ;
    /** @type {__VLS_StyleScopedClasses['w-full']} */ ;
    /** @type {__VLS_StyleScopedClasses['h-0.5']} */ ;
    /** @type {__VLS_StyleScopedClasses['bg-blood-red']} */ ;
    /** @type {__VLS_StyleScopedClasses['shadow-[0_0_8px_rgba(139,0,0,0.8)]']} */ ;
}
__VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
    ...{ onClick: (...[$event]) => {
            __VLS_ctx.activeTab = 'register';
            __VLS_ctx.errorMessage = '';
            __VLS_ctx.successMessage = '';
            // @ts-ignore
            [activeTab, activeTab, activeTab, errorMessage, successMessage,];
        } },
    ...{ class: "flex-1 pb-3 text-sm font-medium transition-all duration-300 relative" },
    ...{ class: (__VLS_ctx.activeTab === 'register' ? 'text-white' : 'text-text-muted hover:text-white/80') },
});
/** @type {__VLS_StyleScopedClasses['flex-1']} */ ;
/** @type {__VLS_StyleScopedClasses['pb-3']} */ ;
/** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
/** @type {__VLS_StyleScopedClasses['font-medium']} */ ;
/** @type {__VLS_StyleScopedClasses['transition-all']} */ ;
/** @type {__VLS_StyleScopedClasses['duration-300']} */ ;
/** @type {__VLS_StyleScopedClasses['relative']} */ ;
if (__VLS_ctx.activeTab === 'register') {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "absolute bottom-0 left-0 w-full h-0.5 bg-blood-red shadow-[0_0_8px_rgba(139,0,0,0.8)]" },
    });
    /** @type {__VLS_StyleScopedClasses['absolute']} */ ;
    /** @type {__VLS_StyleScopedClasses['bottom-0']} */ ;
    /** @type {__VLS_StyleScopedClasses['left-0']} */ ;
    /** @type {__VLS_StyleScopedClasses['w-full']} */ ;
    /** @type {__VLS_StyleScopedClasses['h-0.5']} */ ;
    /** @type {__VLS_StyleScopedClasses['bg-blood-red']} */ ;
    /** @type {__VLS_StyleScopedClasses['shadow-[0_0_8px_rgba(139,0,0,0.8)]']} */ ;
}
if (__VLS_ctx.errorMessage) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "mb-4 p-3 rounded bg-red-900/50 border border-red-500/50 text-red-200 text-sm animate-fade-in text-center" },
    });
    /** @type {__VLS_StyleScopedClasses['mb-4']} */ ;
    /** @type {__VLS_StyleScopedClasses['p-3']} */ ;
    /** @type {__VLS_StyleScopedClasses['rounded']} */ ;
    /** @type {__VLS_StyleScopedClasses['bg-red-900/50']} */ ;
    /** @type {__VLS_StyleScopedClasses['border']} */ ;
    /** @type {__VLS_StyleScopedClasses['border-red-500/50']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-red-200']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
    /** @type {__VLS_StyleScopedClasses['animate-fade-in']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-center']} */ ;
    (__VLS_ctx.errorMessage);
}
if (__VLS_ctx.successMessage) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "mb-4 p-3 rounded bg-green-900/50 border border-green-500/50 text-green-200 text-sm animate-fade-in text-center" },
    });
    /** @type {__VLS_StyleScopedClasses['mb-4']} */ ;
    /** @type {__VLS_StyleScopedClasses['p-3']} */ ;
    /** @type {__VLS_StyleScopedClasses['rounded']} */ ;
    /** @type {__VLS_StyleScopedClasses['bg-green-900/50']} */ ;
    /** @type {__VLS_StyleScopedClasses['border']} */ ;
    /** @type {__VLS_StyleScopedClasses['border-green-500/50']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-green-200']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
    /** @type {__VLS_StyleScopedClasses['animate-fade-in']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-center']} */ ;
    (__VLS_ctx.successMessage);
}
if (__VLS_ctx.activeTab === 'login') {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "animate-fade-in" },
    });
    /** @type {__VLS_StyleScopedClasses['animate-fade-in']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.form, __VLS_intrinsics.form)({
        ...{ onSubmit: (__VLS_ctx.handleLogin) },
        ...{ class: "space-y-4" },
    });
    /** @type {__VLS_StyleScopedClasses['space-y-4']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({});
    __VLS_asFunctionalElement1(__VLS_intrinsics.label, __VLS_intrinsics.label)({
        ...{ class: "block text-xs font-semibold text-text-muted uppercase tracking-wider mb-1" },
    });
    /** @type {__VLS_StyleScopedClasses['block']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-semibold']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-text-muted']} */ ;
    /** @type {__VLS_StyleScopedClasses['uppercase']} */ ;
    /** @type {__VLS_StyleScopedClasses['tracking-wider']} */ ;
    /** @type {__VLS_StyleScopedClasses['mb-1']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.input, __VLS_intrinsics.input)({
        type: "email",
        ...{ class: "input-premium" },
        placeholder: "seu@email.com",
        required: true,
    });
    (__VLS_ctx.loginForm.email);
    /** @type {__VLS_StyleScopedClasses['input-premium']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({});
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "flex justify-between items-center mb-1" },
    });
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['justify-between']} */ ;
    /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['mb-1']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.label, __VLS_intrinsics.label)({
        ...{ class: "block text-xs font-semibold text-text-muted uppercase tracking-wider" },
    });
    /** @type {__VLS_StyleScopedClasses['block']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-semibold']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-text-muted']} */ ;
    /** @type {__VLS_StyleScopedClasses['uppercase']} */ ;
    /** @type {__VLS_StyleScopedClasses['tracking-wider']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.a, __VLS_intrinsics.a)({
        href: "#",
        ...{ class: "text-xs text-blood-red hover:text-blood-red-hover transition-colors" },
    });
    /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-blood-red']} */ ;
    /** @type {__VLS_StyleScopedClasses['hover:text-blood-red-hover']} */ ;
    /** @type {__VLS_StyleScopedClasses['transition-colors']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.input, __VLS_intrinsics.input)({
        type: "password",
        ...{ class: "input-premium" },
        placeholder: "••••••••",
        required: true,
    });
    (__VLS_ctx.loginForm.password);
    /** @type {__VLS_StyleScopedClasses['input-premium']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "pt-4" },
    });
    /** @type {__VLS_StyleScopedClasses['pt-4']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
        type: "submit",
        ...{ class: "btn-primary" },
        disabled: (__VLS_ctx.isLoading),
    });
    /** @type {__VLS_StyleScopedClasses['btn-primary']} */ ;
    (__VLS_ctx.isLoading ? 'Conectando...' : 'Acessar a Noite');
}
else {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "animate-fade-in" },
    });
    /** @type {__VLS_StyleScopedClasses['animate-fade-in']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.form, __VLS_intrinsics.form)({
        ...{ onSubmit: (__VLS_ctx.handleRegister) },
        ...{ class: "space-y-4" },
    });
    /** @type {__VLS_StyleScopedClasses['space-y-4']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({});
    __VLS_asFunctionalElement1(__VLS_intrinsics.label, __VLS_intrinsics.label)({
        ...{ class: "block text-xs font-semibold text-text-muted uppercase tracking-wider mb-1" },
    });
    /** @type {__VLS_StyleScopedClasses['block']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-semibold']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-text-muted']} */ ;
    /** @type {__VLS_StyleScopedClasses['uppercase']} */ ;
    /** @type {__VLS_StyleScopedClasses['tracking-wider']} */ ;
    /** @type {__VLS_StyleScopedClasses['mb-1']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.input, __VLS_intrinsics.input)({
        type: "text",
        value: (__VLS_ctx.registerForm.name),
        ...{ class: "input-premium" },
        placeholder: "Como é conhecido?",
        required: true,
    });
    /** @type {__VLS_StyleScopedClasses['input-premium']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({});
    __VLS_asFunctionalElement1(__VLS_intrinsics.label, __VLS_intrinsics.label)({
        ...{ class: "block text-xs font-semibold text-text-muted uppercase tracking-wider mb-1" },
    });
    /** @type {__VLS_StyleScopedClasses['block']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-semibold']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-text-muted']} */ ;
    /** @type {__VLS_StyleScopedClasses['uppercase']} */ ;
    /** @type {__VLS_StyleScopedClasses['tracking-wider']} */ ;
    /** @type {__VLS_StyleScopedClasses['mb-1']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.input, __VLS_intrinsics.input)({
        type: "email",
        ...{ class: "input-premium" },
        placeholder: "seu@email.com",
        required: true,
    });
    (__VLS_ctx.registerForm.email);
    /** @type {__VLS_StyleScopedClasses['input-premium']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({});
    __VLS_asFunctionalElement1(__VLS_intrinsics.label, __VLS_intrinsics.label)({
        ...{ class: "block text-xs font-semibold text-text-muted uppercase tracking-wider mb-1" },
    });
    /** @type {__VLS_StyleScopedClasses['block']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-semibold']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-text-muted']} */ ;
    /** @type {__VLS_StyleScopedClasses['uppercase']} */ ;
    /** @type {__VLS_StyleScopedClasses['tracking-wider']} */ ;
    /** @type {__VLS_StyleScopedClasses['mb-1']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.input, __VLS_intrinsics.input)({
        type: "password",
        ...{ class: "input-premium" },
        placeholder: "••••••••",
        required: true,
    });
    (__VLS_ctx.registerForm.password);
    /** @type {__VLS_StyleScopedClasses['input-premium']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({});
    __VLS_asFunctionalElement1(__VLS_intrinsics.label, __VLS_intrinsics.label)({
        ...{ class: "block text-xs font-semibold text-text-muted uppercase tracking-wider mb-1" },
    });
    /** @type {__VLS_StyleScopedClasses['block']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-semibold']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-text-muted']} */ ;
    /** @type {__VLS_StyleScopedClasses['uppercase']} */ ;
    /** @type {__VLS_StyleScopedClasses['tracking-wider']} */ ;
    /** @type {__VLS_StyleScopedClasses['mb-1']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.input, __VLS_intrinsics.input)({
        type: "password",
        ...{ class: "input-premium" },
        placeholder: "••••••••",
        required: true,
    });
    (__VLS_ctx.registerForm.confirmPassword);
    /** @type {__VLS_StyleScopedClasses['input-premium']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "pt-4" },
    });
    /** @type {__VLS_StyleScopedClasses['pt-4']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
        type: "submit",
        ...{ class: "btn-primary" },
        disabled: (__VLS_ctx.isLoading),
    });
    /** @type {__VLS_StyleScopedClasses['btn-primary']} */ ;
    (__VLS_ctx.isLoading ? 'Forjando Vínculo...' : 'Abraçar a Escuridão');
}
// @ts-ignore
[activeTab, activeTab, activeTab, errorMessage, errorMessage, successMessage, successMessage, handleLogin, loginForm, loginForm, isLoading, isLoading, isLoading, isLoading, handleRegister, registerForm, registerForm, registerForm, registerForm,];
const __VLS_export = (await import('vue')).defineComponent({});
export default {};
