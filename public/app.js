// LiraQuest - Client-Side App & RPG State Management (Fases 1, 2 e 3)

const API = {
  auth: '/api/auth',
  catalog: '/api/catalog',
  family: '/api/family',
  character: '/api/character',
  tasks: '/api/tasks',
  shop: '/api/shop',
  upload: '/api/upload',
  progress: '/api/progress',
};

const state = {
  token: localStorage.getItem('liraquest_token') || null,
  user: JSON.parse(localStorage.getItem('liraquest_user') || 'null'),
  currentRoute: 'home',
  character: null,
  classesCatalog: [],
  attributesCatalog: [],
  familyData: null,
  progress: {
    family_tokens: 0,
    adventure_energy: 0,
    tasks_done_total: 0,
    tasks_done_today: 0,
    streak_days: 0,
    best_streak_days: 0,
    last_active_date: null,
  },
  childDashboardData: null,
  selectedWizardAvatar: 'hero_warrior',
  selectedWizardClassId: null,
  selectedSwitchClassId: null,
  childActiveTab: 'game',
  parentActiveTab: 'tasks',
  childTerminalTab: 'tasks',
};

// Lista de Avatares MUGEN / Sprites com ícones e rótulos
const AVATAR_OPTIONS = [
  { key: 'hero_warrior', icon: '⚔️', label: 'Guerreiro' },
  { key: 'hero_mage', icon: '🧙‍♂️', label: 'Mago' },
  { key: 'hero_rogue', icon: '🗡️', label: 'Ladino' },
  { key: 'hero_paladin', icon: '🛡️', label: 'Paladino' },
  { key: 'hero_archer', icon: '🏹', label: 'Arqueiro' },
  { key: 'hero_engineer', icon: '🛠️', label: 'Artífice' },
  { key: 'hero_valkyrie', icon: '✨', label: 'Valquíria' },
  { key: 'hero_beastmaster', icon: '🐺', label: 'Fera' },
];

// Ícones visuais dos 6 Atributos
const ATTR_ICONS = {
  str: '💪',
  agi: '⚡',
  con: '🛡️',
  int: '📚',
  cha: '✨',
  luk: '🎲',
};

// ========================================================
// 1. ROTEAMENTO & NAVEGAÇÃO
// ========================================================
function navigateTo(route) {
  state.currentRoute = route;
  window.location.hash = route;
  renderRoute();
}

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

function renderRoute() {
  const route = state.currentRoute;
  const protectedRoutes = {
    admin: ['ADMIN'],
    parent: ['ADMIN', 'PARENT'],
    child: ['ADMIN', 'PARENT', 'CHILD'],
    avatar: ['ADMIN', 'PARENT', 'CHILD'],
  };

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

  const views = ['home', 'register', 'login', 'admin', 'parent', 'child', 'avatar'];
  views.forEach((viewId) => {
    const el = document.getElementById(`view-${viewId}`);
    if (el) {
      el.style.display = viewId === state.currentRoute ? 'block' : 'none';
    }
  });

  updateNavbar();

  if (state.currentRoute === 'admin') loadAdminDashboard();
  if (state.currentRoute === 'parent') loadParentDashboard();
  if (state.currentRoute === 'child') loadChildDashboard();
  if (state.currentRoute === 'avatar') loadAvatarTerminal();
}

function updateNavbar() {
  const navAuthLogged = document.getElementById('nav-auth-logged');
  const navAuthGuest = document.getElementById('nav-auth-guest');
  const navUserName = document.getElementById('nav-user-name');
  const navUserBadge = document.getElementById('nav-user-badge');
  const navBtnAvatar = document.getElementById('nav-btn-avatar');

  if (state.token && state.user) {
    if (navAuthGuest) navAuthGuest.style.display = 'none';
    if (navAuthLogged) navAuthLogged.style.display = 'flex';
    if (navUserName) navUserName.innerText = state.user.name;
    if (navUserBadge) {
      navUserBadge.innerText = formatRoleName(state.user.role);
      navUserBadge.className = `role-badge badge-${state.user.role.toLowerCase()}`;
    }

    // Botão de acesso ao avatar no topo (exibido para perfil Filho)
    if (navBtnAvatar) {
      if (state.user.role === 'CHILD' || state.user.role === 'ADMIN') {
        navBtnAvatar.style.display = 'inline-flex';
        if (state.character) {
          navBtnAvatar.innerText = `⚔️ Avatar: ${state.character.name}`;
          navBtnAvatar.className = 'btn btn-gold btn-sm';
        } else {
          navBtnAvatar.innerText = '✨ Despertar Avatar';
          navBtnAvatar.className = 'btn btn-primary btn-sm';
        }
      } else {
        navBtnAvatar.style.display = 'none';
      }
    }
  } else {
    if (navAuthGuest) navAuthGuest.style.display = 'flex';
    if (navAuthLogged) navAuthLogged.style.display = 'none';
  }
}

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

// ========================================================
// 2. AUTENTICAÇÃO (LOGIN & REGISTRO)
// ========================================================
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
    const res = await fetch(`${API.auth}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.message || 'Erro ao realizar login.');
    }

    state.token = data.token;
    state.user = data.user;
    localStorage.setItem('liraquest_token', data.token);
    localStorage.setItem('liraquest_user', JSON.stringify(data.user));

    showToast(`Bem-vindo de volta, ${data.user.name}!`, 'success');
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
  const btnSubmit = document.getElementById('btn-register-submit');

  if (!name || !email || !password) {
    showToast('Preencha todos os campos.', 'warning');
    return;
  }

  btnSubmit.disabled = true;
  btnSubmit.innerText = 'Cadastrando...';

  try {
    const res = await fetch(`${API.auth}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password, role: 'CHILD' }),
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
  state.character = null;
  localStorage.removeItem('liraquest_token');
  localStorage.removeItem('liraquest_user');
  showToast('Você saiu da sua conta com sucesso.', 'info');
  navigateTo('home');
}

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

// ========================================================
// 3. CATÁLOGO GLOBAL (CLASSES E ATRIBUTOS)
// ========================================================
async function fetchCatalogs() {
  try {
    const [resClasses, resAttrs] = await Promise.all([
      fetch(`${API.catalog}/classes`),
      fetch(`${API.catalog}/attributes`),
    ]);

    const dataClasses = await resClasses.json();
    const dataAttrs = await resAttrs.json();

    if (dataClasses.success) state.classesCatalog = dataClasses.classes;
    if (dataAttrs.success) state.attributesCatalog = dataAttrs.attributes;
  } catch (err) {
    console.error('Erro ao buscar catálogos:', err);
  }
}

// ========================================================
// 4. TERMINAL 1: DASHBOARD DO USUÁRIO (FILHO - MUNDO REAL)
// ========================================================
// ========================================================
// 4. TERMINAL 1: DASHBOARD DO USUÁRIO (FILHO - MUNDO REAL)
// ========================================================
function switchChildTerminalTab(tab) {
  state.childTerminalTab = tab;
  const tabs = ['tasks', 'studies', 'history', 'profile'];

  tabs.forEach((t) => {
    const navBtn = document.getElementById(`child-nav-${t}`);
    const panel = document.getElementById(`child-panel-${t}`);
    if (navBtn) {
      if (t === tab) {
        navBtn.classList.add('active');
      } else {
        navBtn.classList.remove('active');
      }
    }
    if (panel) {
      panel.style.display = t === tab ? 'block' : 'none';
    }
  });

  if (tab === 'tasks') {
    renderChildTasksBoard();
  } else if (tab === 'history') {
    renderChildHistoryTab();
  } else if (tab === 'profile') {
    renderChildProfileInfo();
  }
}

function updateChildSidebarStats() {
  const p = state.progress || {};
  
  // Saldos
  const tokensEl = document.getElementById('sidebar-tokens-value');
  const energyEl = document.getElementById('sidebar-energy-value');
  if (tokensEl) tokensEl.innerText = p.family_tokens ?? 0;
  if (energyEl) energyEl.innerText = p.adventure_energy ?? 0;

  // Streak
  const streakEl = document.getElementById('sidebar-streak-value');
  const streakRecEl = document.getElementById('sidebar-streak-record');
  const streakFlame = document.getElementById('sidebar-streak-flame');
  
  const streakDays = p.streak_days ?? 0;
  const bestStreak = p.best_streak_days ?? 0;

  if (streakEl) streakEl.innerText = `${streakDays}d`;
  if (streakRecEl) streakRecEl.innerText = streakDays === 0 ? 'Comece hoje! 💪' : `Recorde: ${bestStreak} dias`;

  if (streakFlame) {
    if (streakDays >= 3) {
      streakFlame.classList.add('flame-active');
    } else {
      streakFlame.classList.remove('flame-active');
    }
  }

  // Mini Estatísticas
  const tasksTodayEl = document.getElementById('sidebar-tasks-today');
  const tasksTotalEl = document.getElementById('sidebar-tasks-total');
  if (tasksTodayEl) tasksTodayEl.innerText = p.tasks_done_today ?? 0;
  if (tasksTotalEl) tasksTotalEl.innerText = p.tasks_done_total ?? 0;

  // Tag do Avatar no Perfil
  const avatarEnergyTag = document.getElementById('profile-avatar-energy-tag');
  if (avatarEnergyTag) {
    avatarEnergyTag.innerText = `⚡ ${p.adventure_energy ?? 0} Energia de Aventura disponível`;
  }
}

function renderChildProfileInfo() {
  if (!state.user) return;

  // Informações na Sidebar
  const nameEl = document.getElementById('child-user-name');
  const emailEl = document.getElementById('child-user-email');
  if (nameEl) nameEl.innerText = state.user.name;
  if (emailEl) emailEl.innerText = state.user.email;

  const sidebarPhotoBox = document.getElementById('child-sidebar-photo-box');
  if (sidebarPhotoBox) {
    if (state.user.profile_photo_url) {
      sidebarPhotoBox.innerHTML = `<img src="${state.user.profile_photo_url}" alt="Foto" class="user-square-photo-img" onerror="this.parentElement.innerHTML='👤';">`;
    } else {
      sidebarPhotoBox.innerHTML = '👤';
    }
  }

  // Ficha Informativa de Dados
  const infoName = document.getElementById('info-child-name');
  const infoEmail = document.getElementById('info-child-email');
  const infoPhone = document.getElementById('info-child-phone');
  const infoSchool = document.getElementById('info-child-school');
  const photoImg = document.getElementById('profile-photo-img');
  const photoPlaceholder = document.getElementById('profile-photo-placeholder');

  if (infoName) infoName.innerText = state.user.name || 'Jovem Filho';
  if (infoEmail) infoEmail.innerText = state.user.email || '--';
  if (infoPhone) infoPhone.innerText = state.user.phone || 'Não informado';
  if (infoSchool) infoSchool.innerText = state.user.school_or_work || 'Não informado';

  if (photoImg && photoPlaceholder) {
    if (state.user.profile_photo_url) {
      photoImg.src = state.user.profile_photo_url;
      photoImg.style.display = 'block';
      photoPlaceholder.style.display = 'none';
    } else {
      photoImg.style.display = 'none';
      photoPlaceholder.style.display = 'block';
    }
  }

  // Atualizar status do botão do Avatar
  const btnAvatar = document.getElementById('btn-profile-access-avatar');
  if (btnAvatar) {
    btnAvatar.innerText = state.character ? '⚔️ Entrar no Reino' : '✨ Criar seu Herói';
  }

  // Preencher formulário do modal de edição
  const inputName = document.getElementById('child-real-name');
  const inputPhone = document.getElementById('child-real-phone');
  const inputSchool = document.getElementById('child-real-school');
  const inputPhoto = document.getElementById('child-real-photo');

  if (inputName) inputName.value = state.user.name || '';
  if (inputPhone) inputPhone.value = state.user.phone || '';
  if (inputSchool) inputSchool.value = state.user.school_or_work || '';
  if (inputPhoto) inputPhoto.value = state.user.profile_photo_url || '';

  updateChildSidebarStats();
}

function openEditProfileModal() {
  renderChildProfileInfo();
  const modal = document.getElementById('child-edit-profile-modal');
  if (modal) modal.style.display = 'flex';
}

function closeEditProfileModal() {
  const modal = document.getElementById('child-edit-profile-modal');
  if (modal) modal.style.display = 'none';
}

async function handleDirectPhotoUpload(e) {
  const file = e.target.files?.[0];
  if (!file) return;

  if (file.size > 5 * 1024 * 1024) {
    showToast('A imagem deve ter no máximo 5MB.', 'warning');
    return;
  }

  const statusEl = document.getElementById('direct-upload-status');
  if (statusEl) statusEl.innerText = '⏳ Enviando foto...';

  const formData = new FormData();
  formData.append('photo', file);

  try {
    const res = await fetch(`${API.upload}/profile-photo`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${state.token}`,
      },
      body: formData,
    });

    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.message || 'Erro ao enviar foto.');
    }

    state.user = data.user;
    localStorage.setItem('liraquest_user', JSON.stringify(data.user));
    renderChildProfileInfo();
    updateNavbar();
    showToast('Foto de perfil atualizada com sucesso!', 'success');
  } catch (err) {
    showToast(err.message, 'error');
  } finally {
    if (statusEl) statusEl.innerText = '';
    e.target.value = '';
  }
}

async function handleModalPhotoUpload(e) {
  const file = e.target.files?.[0];
  if (!file) return;

  if (file.size > 5 * 1024 * 1024) {
    showToast('A imagem deve ter no máximo 5MB.', 'warning');
    return;
  }

  const loadingEl = document.getElementById('modal-upload-loading');
  if (loadingEl) loadingEl.style.display = 'block';

  const formData = new FormData();
  formData.append('photo', file);

  try {
    const res = await fetch(`${API.upload}/profile-photo`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${state.token}`,
      },
      body: formData,
    });

    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.message || 'Erro ao enviar foto.');
    }

    state.user = data.user;
    localStorage.setItem('liraquest_user', JSON.stringify(data.user));

    const inputPhoto = document.getElementById('child-real-photo');
    if (inputPhoto) inputPhoto.value = data.photo_url;

    renderChildProfileInfo();
    updateNavbar();
    showToast('Imagem carregada com sucesso!', 'success');
  } catch (err) {
    showToast(err.message, 'error');
  } finally {
    if (loadingEl) loadingEl.style.display = 'none';
    e.target.value = '';
  }
}

async function loadChildDashboard() {
  if (!state.user || !state.token) return;

  if (state.classesCatalog.length === 0) {
    await fetchCatalogs();
  }

  // Renderizar Ficha Informativa de Dados
  renderChildProfileInfo();

  // Carregar dados da família
  loadChildFamilyData();

  // Consultar personagem e atualizar estado do avatar
  try {
    const res = await fetch(`${API.character}/me`, {
      headers: { Authorization: `Bearer ${state.token}` },
    });
    const data = await res.json();

    if (res.ok && data.success && data.hasCharacter && data.character) {
      state.character = data.character;
    } else {
      state.character = null;
    }
    updateNavbar();
  } catch (err) {
    console.error('Erro ao consultar personagem no painel do usuário:', err);
  }

  // Carregar dados consolidados de progresso e tarefas do usuário
  await loadChildTerminalDashboard();

  // Abrir a aba ativa do terminal (padrão: Tarefas)
  switchChildTerminalTab(state.childTerminalTab || 'tasks');
}

async function loadChildTerminalDashboard() {
  if (!state.token) return;

  try {
    // 1. Tentar chamada unificada ao endpoint de dashboard
    const res = await fetch(`${API.progress}/dashboard`, {
      headers: { Authorization: `Bearer ${state.token}` },
    });
    const data = await res.json();

    if (res.ok && data.success) {
      state.progress = data.progress || state.progress;
      state.childDashboardData = data;
      updateChildSidebarStats();
      renderChildTasksBoard();
      renderChildHistoryTab();
      return;
    }
  } catch (err) {
    console.warn('⚠️ Endpoint /api/progress/dashboard em fallback:', err);
  }

  // Fallback transparente se /api/progress/dashboard não responder
  await loadChildTasksFallback();
}

function handleAccessAvatar() {
  if (state.character) {
    navigateTo('avatar');
  } else {
    openHeroCreationWizard();
  }
}

// --------------------------------------------------------
// Temporizador de Estudos (Pomodoro 25 min)
// --------------------------------------------------------
let studyTimerState = {
  interval: null,
  remainingSeconds: 25 * 60,
  isRunning: false,
};

function toggleStudyTimer() {
  const btn = document.getElementById('btn-study-start');
  const status = document.getElementById('study-timer-status');

  if (studyTimerState.isRunning) {
    // Pausar
    clearInterval(studyTimerState.interval);
    studyTimerState.isRunning = false;
    if (btn) btn.innerText = '▶️ Continuar Sessão';
    if (status) status.innerText = '⏸️ Temporizador pausado. Clique em Continuar quando estiver pronto.';
  } else {
    // Iniciar / Continuar
    studyTimerState.isRunning = true;
    if (btn) btn.innerText = '⏸️ Pausar Sessão';
    if (status) status.innerText = '🔥 Foco total! Mantenha a concentração nos seus estudos.';

    studyTimerState.interval = setInterval(() => {
      if (studyTimerState.remainingSeconds > 0) {
        studyTimerState.remainingSeconds--;
        updateStudyTimerDisplay();
      } else {
        clearInterval(studyTimerState.interval);
        studyTimerState.isRunning = false;
        if (btn) btn.innerText = '▶️ Iniciar Nova Sessão';
        if (status) status.innerText = '🎉 Excelente trabalho! Você completou 25 minutos de estudo focado!';
        showToast('🎉 Parabéns! Sessão de 25 minutos de estudos concluída!', 'success');
      }
    }, 1000);
  }
}

function resetStudyTimer() {
  clearInterval(studyTimerState.interval);
  studyTimerState.isRunning = false;
  studyTimerState.remainingSeconds = 25 * 60;
  updateStudyTimerDisplay();

  const btn = document.getElementById('btn-study-start');
  const status = document.getElementById('study-timer-status');
  if (btn) btn.innerText = '▶️ Iniciar Sessão (25 min)';
  if (status) status.innerText = 'Pronto para iniciar uma sessão de 25 minutos de estudo concentrado.';
}

function updateStudyTimerDisplay() {
  const display = document.getElementById('study-timer-display');
  if (!display) return;

  const minutes = Math.floor(studyTimerState.remainingSeconds / 60);
  const seconds = studyTimerState.remainingSeconds % 60;
  display.innerText = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

// ========================================================
// 5. TERMINAL 2: TERMINAL DO AVATAR / HERÓI (MUNDO RPG)
// ========================================================
function switchAvatarTab(tab) {
  state.avatarActiveTab = tab;
  const tabs = ['sheet', 'tasks', 'shop'];
  
  tabs.forEach((t) => {
    const tabBtn = document.getElementById(`avatar-tab-btn-${t}`);
    const view = document.getElementById(`avatar-tab-${t}`);
    if (tabBtn) {
      if (t === tab) {
        tabBtn.classList.add('active');
      } else {
        tabBtn.classList.remove('active');
      }
    }
    if (view) {
      view.style.display = t === tab ? 'block' : 'none';
    }
  });

  if (tab === 'tasks') {
    loadChildTasks();
    loadChildSubmissionsHistory();
  }
  if (tab === 'shop') {
    loadShopItems();
  }
}

async function loadAvatarTerminal() {
  if (!state.user || !state.token) {
    navigateTo('login');
    return;
  }

  try {
    const res = await fetch(`${API.character}/me`, {
      headers: { Authorization: `Bearer ${state.token}` },
    });
    const data = await res.json();

    if (!res.ok || !data.success || !data.hasCharacter || !data.character) {
      showToast('Você precisa criar um Avatar antes de acessar o Terminal RPG!', 'info');
      navigateTo('child');
      openHeroCreationWizard();
      return;
    }

    state.character = data.character;
    const char = data.character;

    // Header do Avatar
    const avatarObj = AVATAR_OPTIONS.find((a) => a.key === char.avatar_value);
    const icon = avatarObj ? avatarObj.icon : '⚔️';
    const currentClass = char.current_class?.name || 'Aventureiro';
    const progress = char.classes_progress?.find((cp) => cp.class_id === char.current_class_id);
    const lvl = progress ? progress.level : 1;

    document.getElementById('avatar-header-icon').innerText = icon;
    document.getElementById('avatar-header-name').innerText = char.name;
    document.getElementById('avatar-header-meta').innerText = `${currentClass} • Nível ${lvl}`;
    document.getElementById('avatar-header-gold').innerText = `💰 ${char.gold} Ouro`;

    // Renderizar Ficha Completa do Herói
    renderHeroHUD(char);

    // Abrir aba padrão da ficha
    switchAvatarTab(state.avatarActiveTab || 'sheet');
  } catch (err) {
    console.error('Erro ao carregar terminal do avatar:', err);
    showToast('Erro ao abrir terminal do avatar.', 'error');
  }
}

function renderHeroHUD(char) {
  const avatarBox = document.getElementById('hero-hud-avatar');
  const avatarObj = AVATAR_OPTIONS.find((a) => a.key === char.avatar_value);
  avatarBox.innerText = avatarObj ? avatarObj.icon : '⚔️';

  document.getElementById('hero-hud-name').innerText = char.name;
  document.getElementById('hero-hud-class').innerText = char.current_class ? char.current_class.name : 'Aventureiro';
  
  const currentClassProgress = char.classes_progress?.find((cp) => cp.class_id === char.current_class_id);
  const currentLevel = currentClassProgress ? currentClassProgress.level : 1;
  const currentXP = currentClassProgress ? currentClassProgress.xp : 0;
  const requiredXP = currentLevel * 100;

  document.getElementById('hero-hud-level').innerText = `Nível ${currentLevel}`;
  document.getElementById('hero-hud-xp-text').innerText = `${currentXP} / ${requiredXP} XP`;
  
  const xpPercent = Math.min(100, Math.round((currentXP / requiredXP) * 100));
  document.getElementById('hero-hud-xp-fill').style.width = `${Math.max(5, xpPercent)}%`;

  document.getElementById('hero-hud-gold').innerText = `💰 ${char.gold} Ouro`;
  const shopGoldEl = document.getElementById('shop-current-gold');
  if (shopGoldEl) shopGoldEl.innerText = `💰 ${char.gold} Ouro`;
  const sidebarGoldEl = document.getElementById('sidebar-child-gold');
  if (sidebarGoldEl) sidebarGoldEl.innerText = `💰 ${char.gold} Ouro`;

  // Atributos
  const attrsContainer = document.getElementById('hero-attributes-grid');
  if (attrsContainer && char.attributes) {
    attrsContainer.innerHTML = char.attributes
      .map((attr) => {
        const code = attr.attribute_info?.code || 'str';
        const icon = ATTR_ICONS[code] || '✨';
        const total = (attr.base_value || 10) + (attr.bonus_value || 0);
        return `
          <div class="attr-card">
            <div class="attr-header">
              <span class="attr-name">${attr.attribute_info?.name || code.toUpperCase()}</span>
              <span class="attr-icon">${icon}</span>
            </div>
            <div class="attr-score-row">
              <span class="attr-total">${total}</span>
              ${attr.bonus_value > 0 ? `<span class="attr-bonus">(+${attr.bonus_value})</span>` : ''}
            </div>
            <span class="attr-desc">${attr.attribute_info?.combat_role || ''}</span>
          </div>
        `;
      })
      .join('');
  }

  // Habilidades
  const skillsContainer = document.getElementById('hero-skills-grid');
  if (skillsContainer && char.skills) {
    if (char.skills.length === 0) {
      skillsContainer.innerHTML = '<p style="color: var(--text-muted);">Nenhuma habilidade desbloqueada ainda.</p>';
    } else {
      skillsContainer.innerHTML = char.skills
        .map((s) => {
          const sk = s.skill_info;
          return `
            <div class="skill-card">
              <div class="skill-icon-box">🔮</div>
              <div class="skill-info">
                <div class="skill-title">${sk?.name || 'Habilidade'}</div>
                <div class="skill-desc">${sk?.description || ''}</div>
                <div class="skill-meta">
                  <span>💧 Mana: ${sk?.mana_cost || 0}</span>
                  <span>⏳ Recarga: ${sk?.cooldown_turns || 0}t</span>
                </div>
              </div>
            </div>
          `;
        })
        .join('');
    }
  }
}

// ========================================================
// 5. CRIAÇÃO DE HERÓI (WIZARD)
// ========================================================
function openHeroCreationWizard() {
  const modal = document.getElementById('hero-creation-modal');
  modal.style.display = 'flex';

  const avatarGrid = document.getElementById('wizard-avatar-grid');
  avatarGrid.innerHTML = AVATAR_OPTIONS.map(
    (av) => `
      <div class="avatar-option ${state.selectedWizardAvatar === av.key ? 'selected' : ''}" onclick="selectWizardAvatar('${av.key}')">
        <span class="avatar-option-icon">${av.icon}</span>
        <span class="avatar-option-label">${av.label}</span>
      </div>
    `
  ).join('');

  const classesGrid = document.getElementById('wizard-classes-grid');
  if (state.classesCatalog.length > 0 && !state.selectedWizardClassId) {
    state.selectedWizardClassId = state.classesCatalog[0].id;
  }

  classesGrid.innerHTML = state.classesCatalog
    .map(
      (cls) => `
        <div class="class-choice-card ${state.selectedWizardClassId === cls.id ? 'selected' : ''}" onclick="selectWizardClass('${cls.id}')">
          <div class="class-choice-header">
            <span class="class-choice-icon">${getClassIcon(cls.code)}</span>
            <div>
              <div class="class-choice-title">${cls.name}</div>
              <div class="class-choice-role">${cls.combat_role}</div>
            </div>
          </div>
          <div class="class-choice-desc">${cls.description || ''}</div>
          <div class="class-choice-attributes">
            <span class="attr-pill-primary">Principal: ${cls.primary_attribute?.name || 'CON'}</span>
            <span class="attr-pill-secondary">Secundário: ${cls.secondary_attribute?.name || 'STR'}</span>
          </div>
        </div>
      `
    )
    .join('');
}

function closeHeroCreationWizard() {
  document.getElementById('hero-creation-modal').style.display = 'none';
}

function selectWizardAvatar(avatarKey) {
  state.selectedWizardAvatar = avatarKey;
  const avatarGrid = document.getElementById('wizard-avatar-grid');
  avatarGrid.querySelectorAll('.avatar-option').forEach((el) => el.classList.remove('selected'));
  event.currentTarget.classList.add('selected');
}

function selectWizardClass(classId) {
  state.selectedWizardClassId = classId;
  const classesGrid = document.getElementById('wizard-classes-grid');
  classesGrid.querySelectorAll('.class-choice-card').forEach((el) => el.classList.remove('selected'));
  event.currentTarget.classList.add('selected');
}

function getClassIcon(code) {
  switch (code) {
    case 'guardiao_do_lar': return '🛡️';
    case 'sabio_estrategista': return '📚';
    case 'guardiao_da_harmonia': return '✨';
    case 'rastreador_veloz': return '⚡';
    case 'artifice_criativo': return '🛠️';
    case 'aventureiro_oportunista': return '🎲';
    default: return '⚔️';
  }
}

async function handleCreateCharacter(e) {
  e?.preventDefault();
  const name = document.getElementById('wizard-hero-name').value.trim();
  const gender = document.getElementById('wizard-hero-gender').value;
  const avatar_value = state.selectedWizardAvatar;
  const initial_class_id = state.selectedWizardClassId;
  const btnSubmit = document.getElementById('btn-create-hero-submit');

  if (!name || !initial_class_id) {
    showToast('Preencha os campos obrigatórios.', 'warning');
    return;
  }

  btnSubmit.disabled = true;
  btnSubmit.innerText = 'Despertando Herói...';

  try {
    const res = await fetch(`${API.character}/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${state.token}`,
      },
      body: JSON.stringify({ name, gender, avatar_type: 'SPRITE', avatar_value, initial_class_id }),
    });

    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.message || 'Erro ao criar herói.');
    }

    showToast(data.message, 'success');
    closeHeroCreationWizard();
    await loadCharacterData();
  } catch (err) {
    showToast(err.message, 'error');
  } finally {
    btnSubmit.disabled = false;
    btnSubmit.innerText = '✨ Despertar Herói & Entrar no Reino';
  }
}

// ========================================================
// 6. TROCA DE CLASSE (MULTI-CLASSE)
// ========================================================
function openClassSwitchModal() {
  if (!state.character) return;
  const modal = document.getElementById('class-switch-modal');
  modal.style.display = 'flex';

  state.selectedSwitchClassId = state.character.current_class_id;

  const container = document.getElementById('switch-classes-grid');
  container.innerHTML = state.classesCatalog
    .map((cls) => {
      const isCurrent = cls.id === state.character.current_class_id;
      const progress = state.character.classes_progress?.find((cp) => cp.class_id === cls.id);
      const level = progress ? progress.level : 1;
      return `
        <div class="class-choice-card ${state.selectedSwitchClassId === cls.id ? 'selected' : ''}" onclick="selectSwitchClass('${cls.id}')">
          <div class="class-choice-header">
            <span class="class-choice-icon">${getClassIcon(cls.code)}</span>
            <div>
              <div class="class-choice-title">${cls.name} ${isCurrent ? '(Ativa)' : ''}</div>
              <div class="class-choice-role">${cls.combat_role} • Nível ${level}</div>
            </div>
          </div>
          <div class="class-choice-desc">${cls.description || ''}</div>
        </div>
      `;
    })
    .join('');
}

function closeClassSwitchModal() {
  document.getElementById('class-switch-modal').style.display = 'none';
}

function selectSwitchClass(classId) {
  state.selectedSwitchClassId = classId;
  const container = document.getElementById('switch-classes-grid');
  container.querySelectorAll('.class-choice-card').forEach((el) => el.classList.remove('selected'));
  event.currentTarget.classList.add('selected');
}

async function handleConfirmClassSwitch() {
  if (!state.selectedSwitchClassId) return;

  const btn = document.getElementById('btn-confirm-class-switch');
  btn.disabled = true;
  btn.innerText = 'Alternando Classe...';

  try {
    const res = await fetch(`${API.character}/change-class`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${state.token}`,
      },
      body: JSON.stringify({ class_id: state.selectedSwitchClassId }),
    });

    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.message || 'Erro ao trocar de classe.');
    }

    showToast(data.message, 'success');
    closeClassSwitchModal();
    await loadCharacterData();
  } catch (err) {
    showToast(err.message, 'error');
  } finally {
    btn.disabled = false;
    btn.innerText = 'Confirmar Mudança de Classe';
  }
}

// ========================================================
// 7. MISSÕES & PROVAS DO TERMINAL DO USUÁRIO
// ========================================================

// Categoria Label e Ícones
function getCategoryMeta(cat) {
  const meta = {
    DOMESTIC: { label: '🏠 Doméstica', class: 'task-cat-DOMESTIC' },
    STUDY: { label: '📚 Estudos', class: 'task-cat-STUDY' },
    HEALTH: { label: '💪 Saúde', class: 'task-cat-HEALTH' },
    CREATIVE: { label: '🎨 Criatividade', class: 'task-cat-CREATIVE' },
    SOCIAL: { label: '🤝 Social', class: 'task-cat-SOCIAL' },
    GERAL: { label: '⭐ Geral', class: 'task-cat-GERAL' },
  };
  return meta[cat] || { label: cat || 'Geral', class: 'task-cat-GERAL' };
}

// Dificuldade Label
function getDifficultyMeta(diff) {
  const meta = {
    EASY: { label: '🟢 Fácil', class: 'task-diff-EASY' },
    MEDIUM: { label: '🟡 Médio', class: 'task-diff-MEDIUM' },
    HARD: { label: '🔴 Difícil', class: 'task-diff-HARD' },
  };
  return meta[diff] || { label: '🟡 Médio', class: 'task-diff-MEDIUM' };
}

// FILHO: Renderizar Mural de Missões Pendentes
function renderChildTasksBoard() {
  const container = document.getElementById('child-user-tasks-list');
  if (!container) return;

  const pendingTasks = state.childDashboardData?.tasks?.pending || [];

  if (pendingTasks.length === 0) {
    container.innerHTML = `
      <div style="grid-column: 1/-1; background: linear-gradient(135deg, rgba(34, 197, 94, 0.15), rgba(15, 23, 42, 0.8)); border: 1px solid rgba(34, 197, 94, 0.35); border-radius: 18px; padding: 32px; text-align: center;">
        <span style="font-size: 3rem; display: block; margin-bottom: 12px;">🎉</span>
        <h3 style="font-size: 1.4rem; color: #ffffff; margin-bottom: 8px;">Todas as missões foram concluídas!</h3>
        <p style="color: var(--text-muted); font-size: 0.95rem; max-width: 480px; margin: 0 auto 20px auto;">
          Excelente trabalho! Vá até o <strong>Terminal do Avatar</strong> para gastar sua Energia de Aventura acumulada!
        </p>
        <button class="btn btn-primary" onclick="handleAccessAvatar()">
          ⚔️ Acessar Avatar no Reino
        </button>
      </div>
    `;
    renderChildApprovedToday();
    return;
  }

  const html = pendingTasks
    .map((t) => {
      const catMeta = getCategoryMeta(t.category);
      const diffMeta = getDifficultyMeta(t.difficulty || 'MEDIUM');
      const isPending = t.submission_status === 'PENDING';
      const isRejected = t.submission_status === 'REJECTED';

      let actionBlock = `
        <button class="btn btn-primary btn-sm" style="width: 100%;" onclick="openSubmitProofModal('${t.id}', '${t.title.replace(/'/g, "\\'")}')">
          ✅ Marcar como Feita
        </button>
      `;

      if (isPending) {
        actionBlock = `
          <div style="background: rgba(245, 158, 11, 0.15); border: 1px solid rgba(245, 158, 11, 0.4); border-radius: 10px; padding: 10px; text-align: center;">
            <span style="color: #fbbf24; font-size: 0.85rem; font-weight: 800; display: block;">
              ⏳ Aguardando aprovação dos pais...
            </span>
          </div>
        `;
      } else if (isRejected) {
        actionBlock = `
          <div>
            ${t.submission_feedback ? `
              <div style="background: rgba(239, 68, 68, 0.15); border: 1px solid rgba(239, 68, 68, 0.35); border-radius: 8px; padding: 8px 12px; margin-bottom: 10px; font-size: 0.82rem; color: #fca5a5;">
                💬 Feedback dos Pais: "${t.submission_feedback}"
              </div>
            ` : ''}
            <button class="btn btn-secondary btn-sm" style="width: 100%; border-color: #f87171; color: #fca5a5;" onclick="openSubmitProofModal('${t.id}', '${t.title.replace(/'/g, "\\'")}')">
              ↩️ Tentar Novamente
            </button>
          </div>
        `;
      }

      return `
        <div class="task-card">
          <div>
            <div style="display: flex; justify-content: space-between; align-items: center; gap: 8px; margin-bottom: 10px; flex-wrap: wrap;">
              <span class="task-category-badge ${catMeta.class}">${catMeta.label}</span>
              <div style="display: flex; align-items: center; gap: 6px;">
                <span class="task-diff-badge ${diffMeta.class}">${diffMeta.label}</span>
                ${t.estimated_time ? `<span style="font-size: 0.75rem; color: var(--text-muted);">⏱️ ${t.estimated_time}</span>` : ''}
              </div>
            </div>
            <h4 class="task-title">${t.title}</h4>
            <p class="task-desc">${t.description || 'Sem instruções adicionais.'}</p>
          </div>

          <div>
            <!-- Recompensas da Missão -->
            <div class="task-rewards-row" style="flex-wrap: wrap; gap: 6px; margin: 14px 0 16px 0;">
              <span class="reward-pill-xp">⭐ +${t.xp_reward || 0} XP</span>
              <span class="reward-pill-gold">💰 +${t.gold_reward || 0} Ouro</span>
              <span class="reward-pill-energy">⚡ +${t.energy_reward || 1} Energia</span>
              ${t.token_reward ? `<span class="reward-pill-tokens">🏠 +${t.token_reward} Fichas</span>` : ''}
            </div>

            ${actionBlock}
          </div>
        </div>
      `;
    })
    .join('');

  container.innerHTML = html;
  renderChildApprovedToday();
}

// Renderizar Missões Aprovadas Hoje
function renderChildApprovedToday() {
  const section = document.getElementById('child-approved-today-section');
  const container = document.getElementById('child-user-approved-today-list');
  if (!section || !container) return;

  const approved = state.childDashboardData?.tasks?.approved_today || [];

  if (approved.length === 0) {
    section.style.display = 'none';
    return;
  }

  section.style.display = 'block';
  container.innerHTML = approved
    .map((s) => {
      const timeStr = s.approved_at ? new Date(s.approved_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '';
      return `
        <div class="user-row" style="background: rgba(34, 197, 94, 0.08); border-color: rgba(34, 197, 94, 0.25); padding: 12px 18px; border-radius: 12px; margin-bottom: 8px;">
          <div style="display: flex; align-items: center; gap: 12px;">
            <span style="font-size: 1.3rem;">✅</span>
            <div>
              <strong style="color: #ffffff; font-size: 0.95rem;">${s.task_title}</strong>
              <div style="font-size: 0.78rem; color: var(--text-muted);">
                Aprovada hoje ${timeStr ? `às ${timeStr}` : ''}
              </div>
            </div>
          </div>
          <div style="display: flex; gap: 8px; flex-wrap: wrap;">
            <span class="reward-pill-xp">⭐ +${s.xp_reward} XP</span>
            <span class="reward-pill-gold">💰 +${s.gold_reward} Ouro</span>
            <span class="reward-pill-energy">⚡ +${s.energy_reward} Energia</span>
            ${s.token_reward ? `<span class="reward-pill-tokens">🏠 +${s.token_reward} Fichas</span>` : ''}
          </div>
        </div>
      `;
    })
    .join('');
}

// Renderizar Aba de Histórico
function renderChildHistoryTab() {
  const container = document.getElementById('child-user-history-list');
  if (!container) return;

  const history = state.childDashboardData?.tasks?.history || [];

  if (history.length === 0) {
    container.innerHTML = '<p style="color: var(--text-muted); padding: 20px 0;">Nenhuma comprovação enviada até o momento.</p>';
    return;
  }

  container.innerHTML = history
    .map((s) => {
      let statusBadge = `<span class="role-badge" style="background: rgba(245, 158, 11, 0.2); color: #fbbf24; border: 1px solid rgba(245, 158, 11, 0.4);">⏳ Aguardando Pais</span>`;
      if (s.status === 'APPROVED') {
        statusBadge = `<span class="role-badge" style="background: rgba(34, 197, 94, 0.2); color: #4ade80; border: 1px solid rgba(34, 197, 94, 0.4);">✅ Aprovada</span>`;
      } else if (s.status === 'REJECTED') {
        statusBadge = `<span class="role-badge" style="background: rgba(239, 68, 68, 0.2); color: #f87171; border: 1px solid rgba(239, 68, 68, 0.4);">❌ Rejeitada</span>`;
      }

      const dateStr = s.created_at ? new Date(s.created_at).toLocaleDateString([], { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }) : '';

      return `
        <div class="user-row" style="flex-direction: column; align-items: flex-start; gap: 10px; padding: 16px; background: rgba(15, 23, 42, 0.75); border: 1px solid var(--border-card); border-radius: 14px; margin-bottom: 12px;">
          <div style="display: flex; justify-content: space-between; width: 100%; align-items: center; flex-wrap: wrap; gap: 8px;">
            <div>
              <strong style="font-size: 1.05rem; color: #ffffff;">${s.task_title || 'Missão'}</strong>
              <span style="font-size: 0.78rem; color: var(--text-muted); margin-left: 8px;">📅 ${dateStr}</span>
            </div>
            ${statusBadge}
          </div>

          ${s.proof_text ? `
            <div style="font-size: 0.88rem; color: #cbd5e1; background: rgba(0,0,0,0.25); padding: 8px 12px; border-radius: 8px; width: 100%;">
              📝 <strong>Relato:</strong> "${s.proof_text}"
            </div>
          ` : ''}

          ${s.proof_photo_url ? `
            <div style="margin-top: 4px;">
              <a href="${s.proof_photo_url}" target="_blank" style="color: #60a5fa; font-size: 0.82rem; display: inline-flex; align-items: center; gap: 4px;">
                📷 Ver foto anexada
              </a>
            </div>
          ` : ''}

          ${s.status === 'APPROVED' ? `
            <div style="display: flex; gap: 8px; flex-wrap: wrap; margin-top: 4px;">
              <span class="reward-pill-xp">⭐ +${s.xp_reward} XP</span>
              <span class="reward-pill-gold">💰 +${s.gold_reward} Ouro</span>
              <span class="reward-pill-energy">⚡ +${s.energy_reward} Energia</span>
              ${s.token_reward ? `<span class="reward-pill-tokens">🏠 +${s.token_reward} Fichas</span>` : ''}
            </div>
          ` : ''}

          ${s.feedback ? `
            <div style="background: rgba(239, 68, 68, 0.12); border: 1px solid rgba(239, 68, 68, 0.3); border-radius: 8px; padding: 8px 12px; width: 100%; font-size: 0.85rem; color: #fca5a5;">
              💬 Feedback de ${s.reviewer_name || 'Guardião'}: "${s.feedback}"
            </div>
          ` : ''}
        </div>
      `;
    })
    .join('');
}

// Fallback caso /api/progress/dashboard não esteja ativo
async function loadChildTasksFallback() {
  try {
    const res = await fetch(`${API.tasks}`, {
      headers: { Authorization: `Bearer ${state.token}` },
    });
    const data = await res.json();

    if (res.ok && data.success) {
      const pending = (data.tasks || []).map((t) => {
        const userSubs = t.submissions || [];
        const latestSub = userSubs[0] || null;
        return {
          id: t.id,
          title: t.title,
          description: t.description,
          category: t.category || 'GERAL',
          difficulty: t.difficulty || 'MEDIUM',
          xp_reward: t.xp_reward,
          gold_reward: t.gold_reward,
          energy_reward: t.energy_reward || (t.difficulty === 'EASY' ? 1 : t.difficulty === 'HARD' ? 4 : 2),
          token_reward: t.token_reward || 0,
          estimated_time: t.estimated_time || '15-20 min',
          submission_status: latestSub ? latestSub.status : null,
          submission_feedback: latestSub ? latestSub.feedback : null,
        };
      });

      state.childDashboardData = {
        progress: state.progress,
        tasks: { pending, approved_today: [], history: [] },
      };
      renderChildTasksBoard();
    }
  } catch (err) {
    console.error('Erro no fallback de tarefas:', err);
  }
}

// MODAL DE COMPROVAÇÃO DE PROVAS
let proofSelectedFile = null;

function openSubmitProofModal(taskId, taskTitle) {
  document.getElementById('modal-task-id-target').value = taskId;
  document.getElementById('modal-task-title-target').innerText = `Comprovando: ${taskTitle}`;
  document.getElementById('proof-text-input').value = '';
  document.getElementById('proof-photo-input').value = '';
  clearProofPhotoPreview();
  document.getElementById('submit-proof-modal').style.display = 'flex';
}

function closeSubmitProofModal() {
  document.getElementById('submit-proof-modal').style.display = 'none';
  clearProofPhotoPreview();
}

function handleProofFileSelect(e) {
  const file = e.target.files?.[0];
  if (!file) return;

  if (file.size > 5 * 1024 * 1024) {
    showToast('A foto deve ter no máximo 5MB.', 'warning');
    return;
  }

  proofSelectedFile = file;
  const reader = new FileReader();
  reader.onload = (event) => {
    const preview = document.getElementById('proof-photo-preview');
    const container = document.getElementById('proof-photo-preview-container');
    if (preview && container) {
      preview.src = event.target.result;
      container.style.display = 'block';
    }
  };
  reader.readAsDataURL(file);
}

function clearProofPhotoPreview() {
  proofSelectedFile = null;
  const preview = document.getElementById('proof-photo-preview');
  const container = document.getElementById('proof-photo-preview-container');
  const fileInput = document.getElementById('proof-file-input');
  const photoInput = document.getElementById('proof-photo-input');
  const statusEl = document.getElementById('proof-upload-status');
  
  if (preview) preview.src = '';
  if (container) container.style.display = 'none';
  if (fileInput) fileInput.value = '';
  if (photoInput) photoInput.value = '';
  if (statusEl) {
    statusEl.innerText = '';
    statusEl.style.display = 'none';
  }
}

async function handleSubmitProof(e) {
  e?.preventDefault();
  const taskId = document.getElementById('modal-task-id-target').value;
  const proof_text = document.getElementById('proof-text-input').value.trim();
  let proof_photo_url = document.getElementById('proof-photo-input').value.trim();
  const btn = document.getElementById('btn-submit-proof');
  const statusEl = document.getElementById('proof-upload-status');

  if (!proof_text) {
    showToast('Descreva o que você fez no relato da tarefa.', 'warning');
    return;
  }

  btn.disabled = true;
  btn.innerText = 'Enviando...';

  try {
    // 1. Se houver arquivo selecionado, fazer upload primeiro
    if (proofSelectedFile) {
      if (statusEl) {
        statusEl.innerText = '⏳ Enviando foto...';
        statusEl.style.display = 'block';
      }
      const formData = new FormData();
      formData.append('photo', proofSelectedFile);

      const upRes = await fetch(`${API.upload}/profile-photo`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${state.token}` },
        body: formData,
      });
      const upData = await upRes.json();
      if (upRes.ok && upData.success && upData.photo_url) {
        proof_photo_url = upData.photo_url;
      }
    }

    // 2. Submeter prova da missão
    const res = await fetch(`${API.tasks}/${taskId}/submit`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${state.token}`,
      },
      body: JSON.stringify({ proof_text, proof_photo_url }),
    });

    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.message || 'Erro ao enviar comprovação.');
    }

    showToast('📸 Comprovação enviada! Aguarde a aprovação dos seus pais.', 'success');
    closeSubmitProofModal();

    // Recarregar dashboard completo
    await loadChildTerminalDashboard();
  } catch (err) {
    showToast(err.message, 'error');
  } finally {
    btn.disabled = false;
    btn.innerText = '🚀 Enviar para Avaliação dos Pais';
    if (statusEl) statusEl.style.display = 'none';
  }
}

// ========================================================
// 8. LOJA DO REINO (FASE 3)
// ========================================================
async function loadShopItems() {
  const container = document.getElementById('shop-items-grid');
  if (!container) return;

  try {
    const res = await fetch(`${API.shop}/items`, {
      headers: { Authorization: `Bearer ${state.token}` },
    });
    const data = await res.json();

    if (res.ok && data.success) {
      container.innerHTML = data.items
        .map((item) => {
          let icon = '🗡️';
          if (item.type === 'ARMOR') icon = '🛡️';
          if (item.type === 'ACCESSORY') icon = '📖';
          if (item.type === 'POTION') icon = '🧪';
          if (item.type === 'REAL_WORLD') icon = '🎟️';

          return `
            <div class="shop-item-card">
              <div>
                <div class="shop-item-icon">${icon}</div>
                <h4 class="shop-item-title">${item.name}</h4>
                <p class="shop-item-desc">${item.description || ''}</p>
              </div>
              <div>
                <div class="shop-item-price">💰 ${item.price_gold} Ouro</div>
                <button class="btn btn-gold btn-sm" style="width: 100%; margin-top: 10px;" onclick="handleBuyItem('${item.id}')">
                  Comprar Item
                </button>
              </div>
            </div>
          `;
        })
        .join('');
    }
  } catch (err) {
    console.error('Erro ao carregar loja:', err);
  }
}

async function handleBuyItem(itemId) {
  try {
    const res = await fetch(`${API.shop}/buy`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${state.token}`,
      },
      body: JSON.stringify({ item_id: itemId }),
    });

    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.message || 'Erro ao comprar item.');
    }

    showToast(data.message, 'success');
    await loadCharacterData();
  } catch (err) {
    showToast(err.message, 'error');
  }
}

// ========================================================
// 9. PAINEL DOS PAIS (MISSÕES & AVALIAÇÕES)
// ========================================================
function switchParentTab(tab) {
  state.parentActiveTab = tab;
  const tabs = ['tasks', 'submissions', 'clan'];

  tabs.forEach((t) => {
    const btn = document.getElementById(`parent-tab-btn-${t}`);
    const view = document.getElementById(`parent-tab-${t}`);
    if (btn && view) {
      if (t === tab) {
        btn.classList.add('active');
        view.style.display = 'block';
      } else {
        btn.classList.remove('active');
        view.style.display = 'none';
      }
    }
  });

  if (tab === 'tasks') loadParentTasks();
  if (tab === 'submissions') loadParentSubmissions();
}

async function loadParentDashboard() {
  if (!state.user || !state.token) return;
  document.getElementById('parent-user-name').innerText = state.user.name;
  document.getElementById('parent-user-email').innerText = state.user.email;

  try {
    const res = await fetch(`${API.family}/my-family`, {
      headers: { Authorization: `Bearer ${state.token}` },
    });
    const data = await res.json();

    const nameEl = document.getElementById('parent-family-name');
    const codeEl = document.getElementById('parent-family-code');
    const countEl = document.getElementById('parent-family-members-count');
    const setupBox = document.getElementById('parent-family-setup');

    if (res.ok && data.success && data.hasFamily) {
      nameEl.innerText = data.family.name;
      codeEl.innerText = data.family.invite_code;
      countEl.innerText = `${data.family.members?.length || 1} Membro(s)`;
      if (setupBox) setupBox.style.display = 'none';
      loadParentTasks();
      loadParentSubmissions();
    } else {
      nameEl.innerText = 'Não cadastrada';
      codeEl.innerText = '--';
      countEl.innerText = '0';
      if (setupBox) setupBox.style.display = 'block';
    }
  } catch (err) {
    console.error('Erro ao carregar dashboard dos pais:', err);
  }
}

async function loadParentTasks() {
  const container = document.getElementById('parent-tasks-list');
  if (!container) return;

  try {
    const res = await fetch(`${API.tasks}`, {
      headers: { Authorization: `Bearer ${state.token}` },
    });
    const data = await res.json();

    if (res.ok && data.success) {
      if (data.tasks.length === 0) {
        container.innerHTML = '<p style="color: var(--text-muted); grid-column: 1/-1;">Nenhuma missão criada ainda. Clique em "➕ Lançar Nova Missão" acima!</p>';
        return;
      }

      container.innerHTML = data.tasks
        .map(
          (t) => `
          <div class="task-card">
            <div>
              <span class="task-category-badge">${t.category || 'GERAL'}</span>
              <h4 class="task-title">${t.title}</h4>
              <p class="task-desc">${t.description || 'Sem descrição.'}</p>
            </div>
            <div class="task-rewards-row">
              <span class="reward-pill-xp">⭐ +${t.xp_reward} XP</span>
              <span class="reward-pill-gold">💰 +${t.gold_reward} Ouro</span>
            </div>
          </div>
        `
        )
        .join('');
    }
  } catch (err) {
    console.error('Erro ao carregar tarefas dos pais:', err);
  }
}

async function loadParentSubmissions() {
  const container = document.getElementById('parent-submissions-list');
  const badge = document.getElementById('parent-pending-badge');
  if (!container) return;

  try {
    const res = await fetch(`${API.tasks}/submissions/pending`, {
      headers: { Authorization: `Bearer ${state.token}` },
    });
    const data = await res.json();

    if (res.ok && data.success) {
      if (badge) {
        badge.innerText = data.count;
        badge.style.display = data.count > 0 ? 'inline-block' : 'none';
      }

      if (data.submissions.length === 0) {
        container.innerHTML = '<p style="color: var(--text-muted); grid-column: 1/-1;">Nenhuma comprovação aguardando aprovação no momento. Tudo em dia! 🎉</p>';
        return;
      }

      container.innerHTML = data.submissions
        .map(
          (s) => `
          <div class="submission-card">
            <div class="submission-header">
              <div class="avatar-circle" style="width: 44px; height: 44px; font-size: 1.2rem;">⚔️</div>
              <div>
                <strong style="color: #ffffff;">${s.submitter?.name || 'Filho'}</strong>
                <span style="display: block; font-size: 0.8rem; color: #c084fc;">Herói: ${s.character?.name || 'Sem Nome'}</span>
              </div>
            </div>

            <div>
              <span class="task-category-badge">${s.task?.category || 'MISSÃO'}</span>
              <h4 style="font-size: 1.1rem; color: #ffffff; margin: 4px 0;">${s.task?.title}</h4>
            </div>

            ${s.proof_text ? `<div class="submission-text-box">"${s.proof_text}"</div>` : ''}
            ${s.proof_photo_url ? `<img src="${s.proof_photo_url}" class="submission-photo" alt="Evidência da Missão">` : ''}

            <div style="display: flex; gap: 8px; margin-top: 4px;">
              <span class="reward-pill-xp">⭐ Recompensa: ${s.task?.xp_reward} XP</span>
              <span class="reward-pill-gold">💰 ${s.task?.gold_reward} Ouro</span>
            </div>

            <div class="form-group" style="margin-top: 8px;">
              <input type="text" id="feedback-${s.id}" class="form-input" placeholder="Mensagem de incentivo ou feedback..." style="font-size: 0.85rem;">
            </div>

            <div style="display: flex; gap: 10px;">
              <button class="btn btn-success btn-sm" style="flex: 1;" onclick="handleReviewSubmission('${s.id}', 'APPROVED')">
                ✅ Aprovar
              </button>
              <button class="btn btn-danger btn-sm" style="flex: 1;" onclick="handleReviewSubmission('${s.id}', 'REJECTED')">
                ❌ Rejeitar
              </button>
            </div>
          </div>
        `
        )
        .join('');
    }
  } catch (err) {
    console.error('Erro ao carregar comprovações pendentes:', err);
  }
}

function openCreateTaskModal() {
  document.getElementById('create-task-modal').style.display = 'flex';
}

function closeCreateTaskModal() {
  document.getElementById('create-task-modal').style.display = 'none';
}

async function handleCreateTask(e) {
  e?.preventDefault();
  const title = document.getElementById('task-title').value.trim();
  const description = document.getElementById('task-desc').value.trim();
  const xp_reward = document.getElementById('task-xp').value;
  const gold_reward = document.getElementById('task-gold').value;
  const category = document.getElementById('task-category').value;
  const btn = document.getElementById('btn-create-task-submit');

  if (!title) {
    showToast('Informe o título da missão.', 'warning');
    return;
  }

  btn.disabled = true;
  btn.innerText = 'Publicando...';

  try {
    const res = await fetch(`${API.tasks}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${state.token}`,
      },
      body: JSON.stringify({ title, description, xp_reward, gold_reward, category }),
    });

    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.message || 'Erro ao criar missão.');
    }

    showToast(data.message, 'success');
    closeCreateTaskModal();
    loadParentTasks();
  } catch (err) {
    showToast(err.message, 'error');
  } finally {
    btn.disabled = false;
    btn.innerText = '✨ Publicar Missão no Mural';
  }
}

async function handleReviewSubmission(submissionId, status) {
  const feedbackInput = document.getElementById(`feedback-${submissionId}`);
  const feedback = feedbackInput ? feedbackInput.value.trim() : '';

  try {
    const res = await fetch(`${API.tasks}/submissions/${submissionId}/review`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${state.token}`,
      },
      body: JSON.stringify({ status, feedback }),
    });

    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.message || 'Erro ao avaliar comprovação.');
    }

    showToast(data.message, status === 'APPROVED' ? 'success' : 'info');
    if (data.leveledUp) {
      showToast(`🏆 O Herói subiu para o NÍVEL ${data.newLevel}!`, 'gold');
    }

    loadParentSubmissions();
    loadParentTasks();
  } catch (err) {
    showToast(err.message, 'error');
  }
}

// ========================================================
// 10. GESTÃO DE PERFIL REAL & FAMÍLIA
// ========================================================
async function handleUpdateRealProfile(e) {
  e?.preventDefault();
  const name = document.getElementById('child-real-name').value.trim();
  const phone = document.getElementById('child-real-phone').value.trim();
  const school_or_work = document.getElementById('child-real-school').value.trim();
  const profile_photo_url = document.getElementById('child-real-photo').value.trim();

  try {
    const res = await fetch(`${API.character}/update-profile`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${state.token}`,
      },
      body: JSON.stringify({ name, phone, school_or_work, profile_photo_url }),
    });

    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.message || 'Erro ao atualizar perfil.');
    }

    state.user = data.user;
    localStorage.setItem('liraquest_user', JSON.stringify(data.user));
    closeEditProfileModal();
    renderChildProfileInfo();
    updateNavbar();
    showToast('Dados cadastrais atualizados com sucesso!', 'success');
  } catch (err) {
    showToast(err.message, 'error');
  }
}

async function loadChildFamilyData() {
  try {
    const res = await fetch(`${API.family}/my-family`, {
      headers: { Authorization: `Bearer ${state.token}` },
    });
    const data = await res.json();

    const infoBox = document.getElementById('child-family-info');
    const joinForm = document.getElementById('child-family-join-form');

    if (res.ok && data.success && data.hasFamily) {
      infoBox.style.display = 'block';
      joinForm.style.display = 'none';
      document.getElementById('child-family-name-display').innerText = data.family.name;
      document.getElementById('child-family-code-display').innerText = data.family.invite_code;
    } else {
      infoBox.style.display = 'none';
      joinForm.style.display = 'block';
    }
  } catch (err) {
    console.error('Erro ao consultar família do filho:', err);
  }
}

async function handleJoinFamily() {
  const codeInput = document.getElementById('child-invite-code-input');
  const invite_code = codeInput.value.trim();

  if (!invite_code) {
    showToast('Digite o código de convite da família.', 'warning');
    return;
  }

  try {
    const res = await fetch(`${API.family}/join`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${state.token}`,
      },
      body: JSON.stringify({ invite_code }),
    });

    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.message || 'Erro ao entrar na família.');
    }

    showToast(data.message, 'success');
    codeInput.value = '';
    loadChildFamilyData();
  } catch (err) {
    showToast(err.message, 'error');
  }
}

async function handleCreateFamily() {
  const nameInput = document.getElementById('parent-new-family-name');
  const name = nameInput.value.trim();

  if (!name) {
    showToast('Informe o nome da família.', 'warning');
    return;
  }

  try {
    const res = await fetch(`${API.family}/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${state.token}`,
      },
      body: JSON.stringify({ name }),
    });

    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.message || 'Erro ao criar família.');
    }

    showToast(data.message, 'success');
    nameInput.value = '';
    loadParentDashboard();
  } catch (err) {
    showToast(err.message, 'error');
  }
}

async function loadAdminDashboard() {
  if (!state.user || !state.token) return;
  document.getElementById('admin-user-name').innerText = state.user.name;
  document.getElementById('admin-user-email').innerText = state.user.email;

  const usersListContainer = document.getElementById('admin-users-list');
  if (usersListContainer) {
    usersListContainer.innerHTML = '<div class="loading-spinner">Carregando usuários do MySQL Hostinger...</div>';
    try {
      const res = await fetch(`${API.auth}/users`, {
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

// ========================================================
// 11. TOASTS / NOTIFICAÇÕES
// ========================================================
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

// ========================================================
// 12. INICIALIZAÇÃO DA APLICAÇÃO
// ========================================================
document.addEventListener('DOMContentLoaded', () => {
  initRouter();

  const loginForm = document.getElementById('login-form');
  if (loginForm) loginForm.addEventListener('submit', handleLogin);

  const regForm = document.getElementById('register-form');
  if (regForm) regForm.addEventListener('submit', handleRegister);

  const heroCreateForm = document.getElementById('hero-create-form');
  if (heroCreateForm) heroCreateForm.addEventListener('submit', handleCreateCharacter);

  const profileForm = document.getElementById('child-profile-form');
  if (profileForm) profileForm.addEventListener('submit', handleUpdateRealProfile);

  const createTaskForm = document.getElementById('create-task-form');
  if (createTaskForm) createTaskForm.addEventListener('submit', handleCreateTask);

  const submitProofForm = document.getElementById('submit-proof-form');
  if (submitProofForm) submitProofForm.addEventListener('submit', handleSubmitProof);
});
