// LiraQuest - Client-Side App & Authentication State Management

const API_BASE = '/api/auth';

const state = {
  token: localStorage.getItem('liraquest_token') || null,
  user: JSON.parse(localStorage.getItem('liraquest_user') || 'null'),
  currentRoute: 'home',
};

// Navegação entre as 6 telas
function navigateTo(route) {
  state.currentRoute = route;
  window.location.hash = route;
  renderRoute();
}

// Inicializador de rota baseado no hash da URL
function initRouter() {
  window.addEventListener('hashchange', () => {
    const hash = window.location.hash.replace('#', '') || 'home';
    state.currentRoute = hash;
    renderRoute();
  });

  const initialHash = window.location.hash.replace('#', '') || 'home';
  state.currentRoute = initialHash;
  renderRoute();
}

// Guardas de navegação (Route Guards)
function renderRoute() {
  const route = state.currentRoute;
  const protectedRoutes = {
    admin: ['ADMIN'],
    parent: ['ADMIN', 'PARENT'],
    child: ['ADMIN', 'PARENT', 'CHILD'],
  };

  // Se a rota for protegida e o usuário não estiver logado
  if (protectedRoutes[route]) {
    if (!state.token || !state.user) {
      showToast('Acesso restrito. Faça login para continuar.', 'warning');
      state.currentRoute = 'login';
      window.location.hash = 'login';
    } else {
      const allowedRoles = protectedRoutes[route];
      if (!allowedRoles.includes(state.user.role)) {
        showToast(`Acesso negado: Perfil ${state.user.role} não pode acessar este painel.`, 'error');
        redirectToUserHome();
        return;
      }
    }
  }

  // Ocultar todas as seções e mostrar apenas a ativa
  const views = ['home', 'register', 'login', 'admin', 'parent', 'child'];
  views.forEach((viewId) => {
    const el = document.getElementById(`view-${viewId}`);
    if (el) {
      el.style.display = viewId === state.currentRoute ? 'block' : 'none';
    }
  });

  updateNavbar();

  // Executar inicializadores específicos da tela ativa
  if (state.currentRoute === 'admin') loadAdminDashboard();
  if (state.currentRoute === 'parent') loadParentDashboard();
  if (state.currentRoute === 'child') loadChildDashboard();
}

// Atualizar Navbar conforme autenticação
function updateNavbar() {
  const navAuthLogged = document.getElementById('nav-auth-logged');
  const navAuthGuest = document.getElementById('nav-auth-guest');
  const navUserName = document.getElementById('nav-user-name');
  const navUserBadge = document.getElementById('nav-user-badge');

  if (state.token && state.user) {
    if (navAuthGuest) navAuthGuest.style.display = 'none';
    if (navAuthLogged) navAuthLogged.style.display = 'flex';
    if (navUserName) navUserName.innerText = state.user.name;
    if (navUserBadge) {
      navUserBadge.innerText = formatRoleName(state.user.role);
      navUserBadge.className = `role-badge badge-${state.user.role.toLowerCase()}`;
    }
  } else {
    if (navAuthGuest) navAuthGuest.style.display = 'flex';
    if (navAuthLogged) navAuthLogged.style.display = 'none';
  }
}

// Redireciona o usuário para seu painel apropriado
function redirectToUserHome() {
  if (!state.user) {
    navigateTo('home');
    return;
  }
  switch (state.user.role) {
    case 'ADMIN':
      navigateTo('admin');
      break;
    case 'PARENT':
      navigateTo('parent');
      break;
    case 'CHILD':
    default:
      navigateTo('child');
      break;
  }
}

// Formatar nome do perfil para exibição
function formatRoleName(role) {
  switch (role) {
    case 'ADMIN':
      return '👑 Administrador';
    case 'PARENT':
      return '🛡️ Pais / Guardião';
    case 'CHILD':
      return '⚔️ Filho / Herói';
    default:
      return role;
  }
}

// Ações de Autenticação (API)
async function handleLogin(e) {
  e?.preventDefault();
  const emailInput = document.getElementById('login-email');
  const passwordInput = document.getElementById('login-password');
  const btnSubmit = document.getElementById('btn-login-submit');

  const email = emailInput.value.trim();
  const password = passwordInput.value;

  if (!email || !password) {
    showToast('Preencha o e-mail e a senha.', 'warning');
    return;
  }

  btnSubmit.disabled = true;
  btnSubmit.innerText = 'Entrando...';

  try {
    const res = await fetch(`${API_BASE}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();

    if (!res.ok || !data.success) {
      throw new Error(data.message || 'Erro ao realizar login.');
    }

    // Salvar sessão
    state.token = data.token;
    state.user = data.user;
    localStorage.setItem('liraquest_token', data.token);
    localStorage.setItem('liraquest_user', JSON.stringify(data.user));

    showToast(`Bem-vindo, ${data.user.name}!`, 'success');
    redirectToUserHome();
  } catch (error) {
    showToast(error.message, 'error');
  } finally {
    btnSubmit.disabled = false;
    btnSubmit.innerText = 'Entrar no Jogo';
  }
}

async function handleRegister(e) {
  e?.preventDefault();
  const name = document.getElementById('reg-name').value.trim();
  const email = document.getElementById('reg-email').value.trim();
  const password = document.getElementById('reg-password').value;
  const role = document.getElementById('reg-role').value;
  const btnSubmit = document.getElementById('btn-register-submit');

  if (!name || !email || !password) {
    showToast('Preencha todos os campos.', 'warning');
    return;
  }

  btnSubmit.disabled = true;
  btnSubmit.innerText = 'Cadastrando...';

  try {
    const res = await fetch(`${API_BASE}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password, role }),
    });

    const data = await res.json();

    if (!res.ok || !data.success) {
      throw new Error(data.message || 'Erro ao cadastrar.');
    }

    state.token = data.token;
    state.user = data.user;
    localStorage.setItem('liraquest_token', data.token);
    localStorage.setItem('liraquest_user', JSON.stringify(data.user));

    showToast('Conta criada com sucesso!', 'success');
    redirectToUserHome();
  } catch (error) {
    showToast(error.message, 'error');
  } finally {
    btnSubmit.disabled = false;
    btnSubmit.innerText = 'Criar Minha Conta';
  }
}

function handleLogout() {
  state.token = null;
  state.user = null;
  localStorage.removeItem('liraquest_token');
  localStorage.removeItem('liraquest_user');
  showToast('Você saiu da sua conta com sucesso.', 'info');
  navigateTo('home');
}

// Botões de Teste Rápido (Preenchimento e Login 1-clique)
async function quickLogin(role) {
  const credentials = {
    admin: { email: 'admin@liraquest.com', pass: 'admin123' },
    parent: { email: 'pai@liraquest.com', pass: 'pai123' },
    child: { email: 'filho@liraquest.com', pass: 'filho123' },
  };

  const cred = credentials[role];
  if (!cred) return;

  const emailInput = document.getElementById('login-email');
  const passwordInput = document.getElementById('login-password');
  if (emailInput && passwordInput) {
    emailInput.value = cred.email;
    passwordInput.value = cred.pass;
  }

  await handleLogin();
}

// Carregamento dos Dashboards Específicos
async function loadAdminDashboard() {
  if (!state.user) return;
  document.getElementById('admin-user-name').innerText = state.user.name;
  document.getElementById('admin-user-email').innerText = state.user.email;

  const usersListContainer = document.getElementById('admin-users-list');
  if (usersListContainer) {
    usersListContainer.innerHTML = '<div class="loading-spinner">Carregando usuários do MySQL Hostinger...</div>';
    try {
      const res = await fetch(`${API_BASE}/users`, {
        headers: { Authorization: `Bearer ${state.token}` },
      });
      const data = await res.json();
      if (res.ok && data.success) {
        document.getElementById('admin-total-users').innerText = data.count;
        usersListContainer.innerHTML = data.users
          .map(
            (u) => `
            <div class="user-row">
              <div class="user-info">
                <strong>${u.name}</strong>
                <span class="user-email">${u.email}</span>
              </div>
              <div class="user-meta">
                <span class="role-badge badge-${u.role.toLowerCase()}">${formatRoleName(u.role)}</span>
                <span class="user-date">${new Date(u.created_at || u.createdAt).toLocaleDateString('pt-BR')}</span>
              </div>
            </div>
          `
          )
          .join('');
      } else {
        usersListContainer.innerHTML = '<p class="error-msg">Não foi possível carregar a lista de usuários.</p>';
      }
    } catch (err) {
      usersListContainer.innerHTML = `<p class="error-msg">Erro: ${err.message}</p>`;
    }
  }
}

function loadParentDashboard() {
  if (!state.user) return;
  document.getElementById('parent-user-name').innerText = state.user.name;
  document.getElementById('parent-user-email').innerText = state.user.email;
}

function loadChildDashboard() {
  if (!state.user) return;
  document.getElementById('child-user-name').innerText = state.user.name;
  document.getElementById('child-user-email').innerText = state.user.email;
}

// Toasts / Notificações
function showToast(message, type = 'info') {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.innerHTML = `<span>${message}</span>`;

  container.appendChild(toast);

  setTimeout(() => {
    toast.classList.add('toast-fadeout');
    setTimeout(() => toast.remove(), 300);
  }, 4000);
}

// Inicializar quando a página carregar
document.addEventListener('DOMContentLoaded', () => {
  initRouter();

  const loginForm = document.getElementById('login-form');
  if (loginForm) loginForm.addEventListener('submit', handleLogin);

  const regForm = document.getElementById('register-form');
  if (regForm) regForm.addEventListener('submit', handleRegister);
});
