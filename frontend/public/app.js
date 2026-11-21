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
  rewards: '/api/rewards',
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

function getAvatarDisplay(avatarKey) {
  if (!avatarKey) return '⚔️';
  const found = AVATAR_OPTIONS.find((a) => a.key === avatarKey);
  return found ? found.icon : '⚔️';
}

function escapeQuotes(str) {
  if (!str) return '';
  return String(str).replace(/'/g, "\\'").replace(/"/g, '&quot;');
}

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
// 1. ROTEAMENTO & NAVEGAÇÃO (HTML5 History Mode Limpo)
// ========================================================
function navigateTo(route) {
  state.currentRoute = route;
  const targetPath = route === 'home' ? '/' : `/${route}`;
  
  if (window.location.pathname !== targetPath || window.location.hash) {
    window.history.pushState({ route }, '', targetPath);
  }
  renderRoute();
}

function initRouter() {
  // 1. Identificar rota da URL (suporta tanto /rota limpo quanto #rota residual antigo)
  const hashRoute = window.location.hash.replace('#', '').trim();
  let pathRoute = window.location.pathname.replace(/^\/+|\/+$/g, '').trim();
  
  if (pathRoute === 'index.html' || pathRoute === '') {
    pathRoute = '';
  }

  // Se veio com flag do Arcade salva e o usuário está autenticado, abre direto no Terminal do Avatar
  const savedAvatarTab = localStorage.getItem('liraquest_avatar_tab');
  let route = hashRoute || pathRoute;
  if (!route) {
    if (savedAvatarTab && state.token && state.user) {
      route = 'avatar';
    } else {
      route = 'home';
    }
  } else if (route === 'index.html') {
    route = savedAvatarTab && state.token && state.user ? 'avatar' : 'home';
  }

  state.currentRoute = route;

  // Normalizar a URL removendo qualquer '#' ou 'index.html' residual
  const targetPath = route === 'home' ? '/' : `/${route}`;
  if (window.location.hash || window.location.pathname !== targetPath) {
    window.history.replaceState({ route }, '', targetPath);
  }

  // 2. Escutar navegação de Voltar/Avançar do navegador
  window.addEventListener('popstate', (event) => {
    let currentPath = window.location.pathname.replace(/^\/+|\/+$/g, '').trim();
    if (currentPath === 'index.html') currentPath = '';
    const r = event.state?.route || currentPath || 'home';
    state.currentRoute = r;
    renderRoute();
  });

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
      navigateTo('login');
      return;
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

  if (state.token && state.user) {
    if (navAuthGuest) navAuthGuest.style.display = 'none';
    if (navAuthLogged) navAuthLogged.style.display = 'flex';
    if (navUserName) navUserName.innerText = state.user.name;

    // Atualiza foto do menu móvel
    const mobilePhotoBox = document.getElementById('nav-mobile-photo-box');
    if (mobilePhotoBox) {
      if (state.user.profile_photo_url) {
        mobilePhotoBox.innerHTML = `<img src="${state.user.profile_photo_url}" alt="Foto" style="width: 100%; height: 100%; object-fit: cover;" onerror="this.parentElement.innerHTML='👤';">`;
      } else {
        mobilePhotoBox.innerHTML = '👤';
      }
    }
  } else {
    if (navAuthGuest) navAuthGuest.style.display = 'flex';
    if (navAuthLogged) navAuthLogged.style.display = 'none';
  }
}

// ─── CONTROLE DO MENU GAVETA DESLIZANTE (MOBILE DRAWER) ────
function openMobileDrawer() {
  const drawerOverlay = document.getElementById('mobile-drawer-overlay');
  if (!drawerOverlay) return;

  // Sincronizar dados do usuário no Drawer
  if (state.user) {
    const nameEl = document.getElementById('drawer-user-name');
    const roleBadgeEl = document.getElementById('drawer-user-role-badge');
    const rankEl = document.getElementById('drawer-user-rank');
    const photoBox = document.getElementById('drawer-user-photo');
    const childStatsRow = document.getElementById('drawer-child-stats-row');
    const menuChild = document.getElementById('drawer-menu-child');
    const menuParent = document.getElementById('drawer-menu-parent');

    if (nameEl) nameEl.innerText = state.user.name || 'Herói';
    if (roleBadgeEl) {
      roleBadgeEl.innerText = formatRoleName(state.user.role);
      roleBadgeEl.className = `role-badge badge-${state.user.role.toLowerCase()}`;
    }

    if (photoBox) {
      if (state.user.profile_photo_url) {
        photoBox.innerHTML = `<img src="${state.user.profile_photo_url}" alt="Foto" style="width: 100%; height: 100%; object-fit: cover; border-radius: 10px;" onerror="this.parentElement.innerHTML='👤';">`;
      } else {
        photoBox.innerHTML = '👤';
      }
    }

    if (state.user.role === 'CHILD') {
      if (rankEl) rankEl.style.display = 'block';
      if (childStatsRow) childStatsRow.style.display = 'grid';
      if (menuChild) menuChild.style.display = 'flex';
      if (menuParent) menuParent.style.display = 'none';

      // Sincronizar saldos
      const tokensEl = document.getElementById('drawer-tokens-val');
      const energyEl = document.getElementById('drawer-energy-val');
      if (tokensEl) tokensEl.innerText = `🎟️ ${state.progress?.family_tokens || 0}`;
      if (energyEl) energyEl.innerText = `⚡ ${state.progress?.adventure_energy || 0}`;
    } else {
      if (rankEl) rankEl.style.display = 'none';
      if (childStatsRow) childStatsRow.style.display = 'none';
      if (menuChild) menuChild.style.display = 'none';
      if (menuParent) menuParent.style.display = 'flex';
    }
  }

  drawerOverlay.classList.add('open');
}

function closeMobileDrawer(e) {
  const drawerOverlay = document.getElementById('mobile-drawer-overlay');
  if (drawerOverlay) {
    drawerOverlay.classList.remove('open');
  }
}

function forceAppRefresh() {
  showToast('Limpando cache e atualizando o Reino...', 'info');
  if ('caches' in window) {
    caches.keys().then((names) => {
      names.forEach((name) => caches.delete(name));
    });
  }
  if (window.localStorage) {
    // Mantem apenas a sessao se houver, mas limpa estados defasados
  }
  setTimeout(() => {
    const cleanUrl = window.location.origin + window.location.pathname + '?nocache=' + Date.now() + window.location.hash;
    window.location.replace(cleanUrl);
  }, 400);
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
  const tabs = ['tasks', 'hero-dashboard', 'shop', 'studies', 'history', 'profile'];

  tabs.forEach((t) => {
    const navBtn = document.getElementById(`child-nav-${t}`);
    const mobileBtn = document.getElementById(`mobile-child-nav-${t}`);
    const panel = document.getElementById(`child-panel-${t}`);
    
    if (navBtn) {
      if (t === tab) {
        navBtn.classList.add('active');
      } else {
        navBtn.classList.remove('active');
      }
    }

    if (mobileBtn) {
      if (t === tab) {
        mobileBtn.classList.add('active');
      } else {
        mobileBtn.classList.remove('active');
      }
    }

    if (panel) {
      panel.style.display = t === tab ? 'block' : 'none';
    }
  });

  if (tab === 'tasks') {
    renderChildTasksBoard();
  } else if (tab === 'hero-dashboard') {
    loadChildHeroDashboard();
  } else if (tab === 'shop') {
    loadChildRewardsShop();
  } else if (tab === 'history') {
    renderChildHistoryTab();
  } else if (tab === 'profile') {
    renderChildProfileInfo();
  }
}

async function loadChildHeroDashboard() {
  if (!state.token) return;

  try {
    const res = await fetch(`${API.character}/hero-dashboard`, {
      headers: { Authorization: `Bearer ${state.token}` },
    });
    const data = await res.json();

    if (!res.ok || !data.success) {
      console.warn('Não foi possível carregar o Painel do Herói:', data.message);
      return;
    }

    const { user, heroProgress } = data;

    // Atualizar Elementos da Interface
    const setText = (id, val) => {
      const el = document.getElementById(id);
      if (el) el.innerText = val;
    };

    setText('hero-dash-user-name', user.name || 'Jovem Herói');
    setText('hero-dash-rank-badge', heroProgress.rankBadge);
    setText('hero-dash-rank-title', heroProgress.rankTitle);
    setText('child-mobile-rank', heroProgress.rankTitle);
    setText('hero-dash-level-number', heroProgress.level);
    setText('hero-dash-total-xp', `${heroProgress.totalXp} XP`);
    setText('hero-dash-xp-progress-text', `${heroProgress.currentLevelXp} / ${heroProgress.nextLevelXp} XP (${heroProgress.xpProgressPct}%)`);
    setText('hero-dash-next-level-label', `Próximo Nível: Nv. ${heroProgress.level + 1}`);

    const xpFill = document.getElementById('hero-dash-xp-fill');
    if (xpFill) {
      xpFill.style.width = `${heroProgress.xpProgressPct}%`;
    }

    setText('hero-dash-tokens', heroProgress.token_balance);
    setText('hero-dash-gold', heroProgress.totalGoldEarned);
    setText('hero-dash-energy', heroProgress.energy_balance);
    setText('hero-dash-streak', `${heroProgress.current_streak}d`);
    setText('hero-dash-best-streak', `${heroProgress.longest_streak}d`);

    setText('hero-dash-tasks-today', heroProgress.tasks_completed_today);
    setText('hero-dash-tasks-total', heroProgress.tasks_completed_total);
    setText('hero-dash-approval-rate', `${heroProgress.approvalRate}%`);
  } catch (err) {
    console.error('Erro ao carregar Painel do Herói:', err);
  }
}

function updateChildSidebarStats() {
  const p = state.progress || {};
  
  // Saldos
  const tokensEl = document.getElementById('sidebar-tokens-value');
  const energyEl = document.getElementById('sidebar-energy-value');
  const mobileTokensEl = document.getElementById('child-mobile-tokens');
  const mobileEnergyEl = document.getElementById('child-mobile-energy');

  const tokensVal = p.family_tokens ?? 0;
  const energyVal = p.adventure_energy ?? 0;

  if (tokensEl) tokensEl.innerText = tokensVal;
  if (energyEl) energyEl.innerText = energyVal;
  if (mobileTokensEl) mobileTokensEl.innerText = tokensVal;
  if (mobileEnergyEl) mobileEnergyEl.innerText = energyVal;

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

  // Informações na Sidebar & Header Mobile
  const nameEl = document.getElementById('child-user-name');
  const emailEl = document.getElementById('child-user-email');
  const mobileNameEl = document.getElementById('child-mobile-name');

  if (nameEl) nameEl.innerText = state.user.name;
  if (emailEl) emailEl.innerText = state.user.email;
  if (mobileNameEl) mobileNameEl.innerText = state.user.name || 'Jovem Herói';

  const sidebarPhotoBox = document.getElementById('child-sidebar-photo-box');
  const mobilePhotoBox = document.getElementById('child-mobile-photo-box');

  if (state.user.profile_photo_url) {
    const photoHtml = `<img src="${state.user.profile_photo_url}" alt="Foto" class="user-square-photo-img" onerror="this.parentElement.innerHTML='👤';">`;
    if (sidebarPhotoBox) sidebarPhotoBox.innerHTML = photoHtml;
    if (mobilePhotoBox) mobilePhotoBox.innerHTML = `<img src="${state.user.profile_photo_url}" alt="Foto" style="width: 100%; height: 100%; object-fit: cover; border-radius: 10px;" onerror="this.parentElement.innerHTML='👤';">`;
  } else {
    if (sidebarPhotoBox) sidebarPhotoBox.innerHTML = '👤';
    if (mobilePhotoBox) mobilePhotoBox.innerHTML = '👤';
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

async function handleAccessAvatar() {
  if (state.character) {
    navigateTo('avatar');
    return;
  }

  try {
    const res = await fetch(`${API.character}/me`, {
      headers: { Authorization: `Bearer ${state.token}` },
    });
    const data = await res.json();
    if (res.ok && data.success && data.hasCharacter && data.character) {
      state.character = data.character;
      navigateTo('avatar');
      return;
    }
  } catch (e) {
    console.error('Erro ao verificar personagem:', e);
  }

  openHeroCreationWizard();
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
  const tabs = ['sheet', 'arcade', 'tasks', 'shop'];
  
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

  if (tab === 'arcade') {
    loadArcadeHub();
  } else if (tab === 'tasks') {
    loadChildTasks();
    loadChildSubmissionsHistory();
  } else if (tab === 'shop') {
    loadShopItems();
  }
}

// ========================================================
// 🕹️ ARCADE DO REINO VIRTUAL & JOGO ESCONDE-ESCONDE CAMALEÃO
// ========================================================

let chameleonGameInstance = null;
let currentChameleonColor = '#ef4444';
let chameleonSocket = null;
let isMultiplayerActive = false;
let currentRoomId = null;
let currentLobbyPlayers = [];
let amISeeker = false;

function loadArcadeHub() {
  const energyBalanceEl = document.getElementById('arcade-energy-balance');
  if (energyBalanceEl) {
    energyBalanceEl.innerText = state.progress?.adventure_energy || 0;
  }
}

function openChameleonGameArena() {
  try { localStorage.setItem('liraquest_avatar_tab', 'arcade'); } catch (e) {}
  window.location.href = '/game.html';
}

function openArcherGameArena() {
  try { localStorage.setItem('liraquest_avatar_tab', 'arcade'); } catch (e) {}
  window.location.href = '/archer.html';
}

function openDungeonGameArena() {
  try { localStorage.setItem('liraquest_avatar_tab', 'arcade'); } catch (e) {}
  window.location.href = '/dungeon.html';
}

function openBattleArena() {
  try { localStorage.setItem('liraquest_avatar_tab', 'arcade'); } catch (e) {}
  window.location.href = '/battle.html';
}

function openAdventureGameArena() {
  try { localStorage.setItem('liraquest_avatar_tab', 'arcade'); } catch (e) {}
  window.location.href = '/adventure.html';
}

window.openChameleonGameArena = openChameleonGameArena;
window.openArcherGameArena = openArcherGameArena;
window.openDungeonGameArena = openDungeonGameArena;
window.openBattleArena = openBattleArena;
window.openAdventureGameArena = openAdventureGameArena;

function closeChameleonGameArena() {
  if (chameleonGameInstance) {
    chameleonGameInstance.stop();
  }
  if (chameleonSocket) {
    chameleonSocket.disconnect();
    chameleonSocket = null;
  }
  document.getElementById('chameleon-game-view').style.display = 'none';
  document.getElementById('arcade-hub-view').style.display = 'block';
  loadArcadeHub();
}

function backToStartScreen() {
  document.getElementById('chameleon-multiplayer-screen').style.display = 'none';
  document.getElementById('chameleon-start-screen').style.display = 'flex';
  if (chameleonSocket) {
    chameleonSocket.disconnect();
    chameleonSocket = null;
  }
}

function selectChameleonColor(color, btn) {
  currentChameleonColor = color;
  document.querySelectorAll('.color-picker-btn').forEach((b) => b.classList.remove('selected'));
  if (btn) btn.classList.add('selected');

  if (chameleonGameInstance) {
    chameleonGameInstance.setPlayerColor(color);
    if (!chameleonGameInstance.isRunning) {
      chameleonGameInstance.drawIdlePreview(color);
    }
  }

  if (chameleonSocket && chameleonSocket.connected) {
    chameleonSocket.emit('select_color', { color });
  }
}

// ─── LOBBY MULTIPLAYER FAMILIAR & SOCKET.IO ──────────────
function openChameleonMultiplayerLobby() {
  document.getElementById('chameleon-start-screen').style.display = 'none';
  document.getElementById('chameleon-multiplayer-screen').style.display = 'flex';
  document.getElementById('chameleon-roulette-box').style.display = 'none';

  // Identifica a sala da família
  const familyId = state.user?.family_id || 'familia_liraquest';
  currentRoomId = `room_${familyId}`;

  // Conectar ao Socket.IO namespace
  if (typeof io !== 'undefined') {
    if (chameleonSocket) chameleonSocket.disconnect();

    chameleonSocket = io('/chameleon');

    chameleonSocket.on('connect', () => {
      chameleonSocket.emit('join_lobby', {
        roomId: currentRoomId,
        user: state.user,
        color: currentChameleonColor,
      });
    });

    chameleonSocket.on('lobby_updated', ({ players, hostId }) => {
      currentLobbyPlayers = players;
      renderChameleonLobbyPlayers(players, hostId);
    });

    chameleonSocket.on('seeker_chosen', ({ seekerId, seekerName, players }) => {
      amISeeker = chameleonSocket.id === seekerId;
      animateSeekerRoulette(players, seekerName, seekerId);
    });

    chameleonSocket.on('match_started', ({ timeLimit, players }) => {
      document.getElementById('chameleon-multiplayer-screen').style.display = 'none';
      if (!chameleonGameInstance) {
        chameleonGameInstance = new ChameleonGameEngine('chameleon-canvas');
      }
      isMultiplayerActive = true;
      chameleonGameInstance.startMultiplayer(players, amISeeker, chameleonSocket);
    });

    chameleonSocket.on('player_moved', (data) => {
      if (chameleonGameInstance && chameleonGameInstance.isRunning) {
        chameleonGameInstance.updateRemotePlayer(data);
      }
    });

    chameleonSocket.on('chameleon_caught', ({ targetId, targetName }) => {
      if (chameleonGameInstance) {
        chameleonGameInstance.markPlayerCaught(targetId);
      }
      showToast(`🚨 ${targetName} foi capturado pela lanterna!`, 'warning');
    });

    chameleonSocket.on('game_over_seeker_win', ({ seekerId }) => {
      if (chameleonGameInstance) {
        const iWon = amISeeker;
        chameleonGameInstance.endGame(iWon, true, iWon ? 'SEEKER_WIN' : 'ALL_CAUGHT');
      }
    });

    chameleonSocket.on('game_over_chameleons_win', () => {
      if (chameleonGameInstance) {
        const iWon = !amISeeker && !chameleonGameInstance.player.isCaught;
        chameleonGameInstance.endGame(iWon, true, amISeeker ? 'TIME_EXPIRED_SEEKER' : 'CHAMELEON_SURVIVED');
      }
    });
  } else {
    showToast('Recarregue a página para ativar o multiplayer.', 'info');
  }
}

function renderChameleonLobbyPlayers(players, hostId) {
  const container = document.getElementById('chameleon-lobby-players');
  if (!container) return;

  container.innerHTML = players
    .map((p) => {
      const isHost = p.id === hostId;
      const isMe = chameleonSocket && p.id === chameleonSocket.id;
      return `
        <div style="background: rgba(30, 41, 59, 0.85); border: 2px solid ${p.color}; border-radius: 14px; padding: 10px 14px; display: flex; align-items: center; gap: 10px; min-width: 140px;">
          <div style="width: 18px; height: 18px; border-radius: 50%; background: ${p.color}; box-shadow: 0 0 8px ${p.color};"></div>
          <div>
            <div style="font-weight: 800; color: #ffffff; font-size: 0.9rem;">
              ${p.name} ${isMe ? '<span style="color: #60a5fa; font-size: 0.75rem;">(Você)</span>' : ''}
            </div>
            <div style="font-size: 0.75rem; color: #94a3b8;">
              ${isHost ? '👑 Líder da Sala' : 'Pronto'}
            </div>
          </div>
        </div>
      `;
    })
    .join('');

  const spinBtn = document.getElementById('btn-spin-chameleon');
  if (spinBtn && chameleonSocket) {
    spinBtn.disabled = chameleonSocket.id !== hostId && players.length > 1;
    if (chameleonSocket.id !== hostId && players.length > 1) {
      spinBtn.innerText = '⏳ Aguardando o Líder Sortear...';
      spinBtn.style.opacity = '0.7';
    } else {
      spinBtn.innerText = '🎰 Sortear Caçador & Iniciar!';
      spinBtn.style.opacity = '1';
    }
  }
}

function triggerSeekerLottery() {
  if (chameleonSocket && chameleonSocket.connected) {
    chameleonSocket.emit('start_spin_lottery');
  }
}

function animateSeekerRoulette(players, finalSeekerName, finalSeekerId) {
  const rouletteBox = document.getElementById('chameleon-roulette-box');
  const rouletteName = document.getElementById('chameleon-roulette-name');
  const spinBtn = document.getElementById('btn-spin-chameleon');

  if (rouletteBox) rouletteBox.style.display = 'block';
  if (spinBtn) spinBtn.style.display = 'none';

  let count = 0;
  const names = players.map((p) => p.name);
  const interval = setInterval(() => {
    count++;
    if (rouletteName) {
      rouletteName.innerText = names[count % names.length];
      rouletteName.style.color = '#93c5fd';
    }
    if (count > 20) {
      clearInterval(interval);
      if (rouletteName) {
        rouletteName.innerText = `🔦 ${finalSeekerName.toUpperCase()}!`;
        rouletteName.style.color = '#fde047';
      }
      showToast(`🎰 O Caçador da rodada é: ${finalSeekerName}! 10s para se esconder!`, 'info');
    }
  }, 120);
}

async function startChameleonGameSession(mode = 'SOLO') {
  if (mode === 'MULTIPLAYER') {
    openChameleonMultiplayerLobby();
    return;
  }

  try {
    const res = await fetch(`${API.character}/minigames/chameleon/start`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${state.token}`,
      },
    });

    const data = await res.json();
    if (!res.ok || !data.success) {
      showToast(data.message || 'Energia insuficiente para jogar!', 'warning');
      return;
    }

    // Atualizar saldo de energia local
    if (state.progress) {
      state.progress.adventure_energy = data.energy_remaining;
    }
    updateChildSidebarStats();
    loadArcadeHub();

    const energyDisplay = document.getElementById('chameleon-energy-display');
    if (energyDisplay) {
      energyDisplay.innerText = `${data.energy_remaining} ⚡`;
    }

    // Esconde overlays e inicia o jogo
    document.getElementById('chameleon-start-screen').style.display = 'none';
    document.getElementById('chameleon-multiplayer-screen').style.display = 'none';
    document.getElementById('chameleon-end-screen').style.display = 'none';

    if (!chameleonGameInstance) {
      chameleonGameInstance = new ChameleonGameEngine('chameleon-canvas');
    }
    isMultiplayerActive = false;
    chameleonGameInstance.start(currentChameleonColor);
  } catch (err) {
    showToast('Erro ao iniciar partida.', 'error');
  }
}

function handleDpadInput(dir, isPressed, e) {
  if (e) {
    if (typeof e.preventDefault === 'function') e.preventDefault();
  }
  if (chameleonGameInstance) {
    chameleonGameInstance.setDpadKey(dir, isPressed);
  }
}

// ─── MOTOR 2D DO JOGO ESCONDE-ESCONDE CAMALEÃO ───────────
class ChameleonGameEngine {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    this.ctx = this.canvas.getContext('2d');
    this.width = this.canvas.width;
    this.height = this.canvas.height;
    this.isRunning = false;
    this.isMultiplayer = false;
    this.socket = null;
    this.animationFrameId = null;

    // Teclas pressionadas
    this.keys = { up: false, down: false, left: false, right: false };
    this.bindControls();

    // 4 Zonas de Plataformas Coloridas
    this.platforms = [
      { id: 'red', color: '#ef4444', name: 'Rubi', x: 40, y: 40, w: 330, h: 180 },
      { id: 'blue', color: '#3b82f6', name: 'Safira', x: 430, y: 40, w: 330, h: 180 },
      { id: 'green', color: '#22c55e', name: 'Esmeralda', x: 40, y: 280, w: 330, h: 180 },
      { id: 'yellow', color: '#eab308', name: 'Ouro', x: 430, y: 280, w: 330, h: 180 },
    ];

    // Jogador (Camaleão)
    this.player = {
      x: 400,
      y: 250,
      radius: 14,
      color: '#ef4444',
      speed: 4.5,
      isCamouflaged: false,
      isSeeker: false,
      angle: 0,
      isCaught: false,
    };

    // Buscador com Lanterna (IA)
    this.seeker = {
      x: 100,
      y: 100,
      radius: 16,
      angle: 0,
      speed: 2.3,
      alertSpeed: 3.8,
      isAlert: false,
      flashlightRadius: 260,
      flashlightAngleSpread: Math.PI / 3.4, // ~53 graus
      waypoints: [
        { x: 100, y: 100 },
        { x: 700, y: 100 },
        { x: 700, y: 400 },
        { x: 100, y: 400 },
        { x: 400, y: 250 },
      ],
      currentWaypointIdx: 0,
    };

    this.remotePlayers = new Map(); // socketId -> player
    // Cristais de Bônus 💎
    this.crystals = [];
    this.crystalsCollected = 0;
    this.maxCrystals = 5;

    // Toque Contínuo Mobile (Touch 360°)
    this.touchTarget = { x: 0, y: 0, active: false };

    // Tempo de Jogo
    this.timeLimitSeconds = 45;
    this.timeRemaining = 45;
    this.timerInterval = null;
    this.crystalSpawnInterval = null;
  }

  bindControls() {
    window.addEventListener('keydown', (e) => {
      if (!this.isRunning) return;
      if (['ArrowUp', 'KeyW'].includes(e.code)) { this.keys.up = true; e.preventDefault(); }
      if (['ArrowDown', 'KeyS'].includes(e.code)) { this.keys.down = true; e.preventDefault(); }
      if (['ArrowLeft', 'KeyA'].includes(e.code)) { this.keys.left = true; e.preventDefault(); }
      if (['ArrowRight', 'KeyD'].includes(e.code)) { this.keys.right = true; e.preventDefault(); }
    });

    window.addEventListener('keyup', (e) => {
      if (['ArrowUp', 'KeyW'].includes(e.code)) this.keys.up = false;
      if (['ArrowDown', 'KeyS'].includes(e.code)) this.keys.down = false;
      if (['ArrowLeft', 'KeyA'].includes(e.code)) this.keys.left = false;
      if (['ArrowRight', 'KeyD'].includes(e.code)) this.keys.right = false;
    });

    // Função auxiliar para mapear coordenadas da tela para o canvas 800x500 com escala responsiva
    const getCanvasPos = (clientX, clientY) => {
      const rect = this.canvas.getBoundingClientRect();
      const scaleX = this.width / rect.width;
      const scaleY = this.height / rect.height;
      return {
        x: (clientX - rect.left) * scaleX,
        y: (clientY - rect.top) * scaleY,
      };
    };

    // Rotação da lanterna pelo mouse no computador
    this.canvas.addEventListener('mousemove', (e) => {
      if (!this.isRunning) return;
      const pos = getCanvasPos(e.clientX, e.clientY);
      if (this.player.isSeeker) {
        this.player.angle = Math.atan2(pos.y - this.player.y, pos.x - this.player.x);
      }
    });

    // Suporte a Toque Direto no Celular (Touch / Drag 360° Contínuo)
    const handleTouchStartMove = (e) => {
      if (!this.isRunning || !e.touches || e.touches.length === 0) return;
      e.preventDefault();
      const touch = e.touches[0];
      const pos = getCanvasPos(touch.clientX, touch.clientY);
      this.touchTarget = { x: pos.x, y: pos.y, active: true };
      if (this.player.isSeeker) {
        this.player.angle = Math.atan2(pos.y - this.player.y, pos.x - this.player.x);
      }
    };

    const handleTouchEnd = (e) => {
      this.touchTarget.active = false;
    };

    this.canvas.addEventListener('touchstart', handleTouchStartMove, { passive: false });
    this.canvas.addEventListener('touchmove', handleTouchStartMove, { passive: false });
    this.canvas.addEventListener('touchend', handleTouchEnd, { passive: false });
    this.canvas.addEventListener('touchcancel', handleTouchEnd, { passive: false });
  }

  setDpadKey(dir, isPressed) {
    if (dir === 'UP') this.keys.up = isPressed;
    if (dir === 'DOWN') this.keys.down = isPressed;
    if (dir === 'LEFT') this.keys.left = isPressed;
    if (dir === 'RIGHT') this.keys.right = isPressed;
  }

  setPlayerColor(color) {
    this.player.color = color;
  }

  start(color) {
    this.stop();
    this.isRunning = true;
    this.isMultiplayer = false;
    this.player.isSeeker = false;
    this.player.isCaught = false;
    this.player.color = color || currentChameleonColor;
    this.player.x = 400;
    this.player.y = 250;
    this.seeker.x = 100;
    this.seeker.y = 100;
    this.seeker.isAlert = false;
    this.seeker.currentWaypointIdx = 0;
    this.crystals = [];
    this.crystalsCollected = 0;
    this.timeRemaining = this.timeLimitSeconds;

    this.spawnCrystal();
    this.updateHUD();

    // Iniciar temporizador
    this.timerInterval = setInterval(() => {
      if (!this.isRunning) return;
      this.timeRemaining--;
      this.updateHUD();

      if (this.timeRemaining <= 0) {
        this.endGame(true);
      }
    }, 1000);

    // Spawner de Cristais
    this.crystalSpawnInterval = setInterval(() => {
      if (!this.isRunning) return;
      if (this.crystals.length < this.maxCrystals) {
        this.spawnCrystal();
      }
    }, 8000);

    // Loop do Canvas
    this.loop();
  }

  startMultiplayer(playersList, isSeeker, socket) {
    this.stop();
    this.isRunning = true;
    this.isMultiplayer = true;
    this.socket = socket;
    this.player.isSeeker = isSeeker;
    this.player.isCaught = false;
    this.player.color = currentChameleonColor;
    this.player.x = isSeeker ? 100 : 400;
    this.player.y = isSeeker ? 100 : 250;
    this.remotePlayers.clear();

    playersList.forEach((p) => {
      if (socket && p.id !== socket.id) {
        this.remotePlayers.set(p.id, {
          id: p.id,
          name: p.name,
          color: p.color,
          x: p.x,
          y: p.y,
          angle: p.angle || 0,
          isSeeker: p.isSeeker,
          isCaught: p.isCaught || false,
          isCamouflaged: false,
        });
      }
    });

    this.crystals = [];
    this.crystalsCollected = 0;
    this.timeRemaining = this.timeLimitSeconds;
    this.updateHUD();

    this.timerInterval = setInterval(() => {
      if (!this.isRunning) return;
      this.timeRemaining--;
      this.updateHUD();

      if (this.timeRemaining <= 0) {
        this.endGame(!this.player.isSeeker, true);
      }
    }, 1000);

    this.loop();
  }

  updateRemotePlayer(data) {
    const p = this.remotePlayers.get(data.id);
    if (p) {
      p.x = data.x;
      p.y = data.y;
      p.angle = data.angle;
      p.isCamouflaged = data.isCamouflaged;
    }
  }

  markPlayerCaught(socketId) {
    if (this.socket && this.socket.id === socketId) {
      this.player.isCaught = true;
    }
    const p = this.remotePlayers.get(socketId);
    if (p) p.isCaught = true;
  }

  stop() {
    this.isRunning = false;
    if (this.animationFrameId) cancelAnimationFrame(this.animationFrameId);
    if (this.timerInterval) clearInterval(this.timerInterval);
    if (this.crystalSpawnInterval) clearInterval(this.crystalSpawnInterval);
    this.keys = { up: false, down: false, left: false, right: false };
  }

  spawnCrystal() {
    const x = Math.floor(Math.random() * (this.width - 120)) + 60;
    const y = Math.floor(Math.random() * (this.height - 120)) + 60;
    this.crystals.push({ x, y, radius: 10, pulse: 0 });
  }

  updateHUD() {
    const timerEl = document.getElementById('chameleon-timer-display');
    const crystalsEl = document.getElementById('chameleon-crystals-display');
    if (timerEl) timerEl.innerText = this.timeRemaining;
    if (crystalsEl) crystalsEl.innerText = `${this.crystalsCollected}`;
  }

  loop() {
    if (!this.isRunning) return;
    this.update();
    this.draw();
    this.animationFrameId = requestAnimationFrame(() => this.loop());
  }

  update() {
    if (this.player.isCaught) return;

    // 1. Movimento do Jogador Local
    let dx = 0;
    let dy = 0;
    const speed = this.player.isSeeker ? 3.5 : this.player.speed;

    if (this.keys.up) dy -= speed;
    if (this.keys.down) dy += speed;
    if (this.keys.left) dx -= speed;
    if (this.keys.right) dx += speed;

    // Movimento por Toque no Celular (Touch / Drag 360°)
    if (this.touchTarget && this.touchTarget.active) {
      const tdx = this.touchTarget.x - this.player.x;
      const tdy = this.touchTarget.y - this.player.y;
      const tdist = Math.hypot(tdx, tdy);

      if (this.player.isSeeker) {
        this.player.angle = Math.atan2(tdy, tdx);
        if (tdist > 14) {
          dx = (tdx / tdist) * speed;
          dy = (tdy / tdist) * speed;
        }
      } else {
        if (tdist > 8) {
          dx = (tdx / tdist) * Math.min(speed, tdist);
          dy = (tdy / tdist) * Math.min(speed, tdist);
        }
      }
    } else {
      // Normaliza velocidade diagonal do teclado
      if (dx !== 0 && dy !== 0) {
        dx *= 0.7071;
        dy *= 0.7071;
      }
    }

    this.player.x = Math.max(this.player.radius + 10, Math.min(this.width - this.player.radius - 10, this.player.x + dx));
    this.player.y = Math.max(this.player.radius + 10, Math.min(this.height - this.player.radius - 10, this.player.y + dy));

    // Se estiver se movendo pelo teclado e for caçador sem mouse/toque, atualiza o ângulo
    if (this.player.isSeeker && !this.touchTarget?.active && (dx !== 0 || dy !== 0)) {
      this.player.angle = Math.atan2(dy, dx);
    }

    // 2. Verificar Camuflagem
    this.player.isCamouflaged = false;
    if (!this.player.isSeeker) {
      for (const p of this.platforms) {
        if (
          this.player.x >= p.x &&
          this.player.x <= p.x + p.w &&
          this.player.y >= p.y &&
          this.player.y <= p.y + p.h
        ) {
          if (p.color.toLowerCase() === this.player.color.toLowerCase()) {
            this.player.isCamouflaged = true;
            break;
          }
        }
      }

      // Se for iluminado diretamente pelo cone de luz da lanterna, perde a camuflagem (é revelado!)
      if (this.player.isCamouflaged) {
        if (!this.isMultiplayer) {
          const distToSeeker = Math.hypot(this.player.x - this.seeker.x, this.player.y - this.seeker.y);
          const angleToPlayer = Math.atan2(this.player.y - this.seeker.y, this.player.x - this.seeker.x);
          let angleDiff = Math.abs(this.seeker.angle - angleToPlayer);
          while (angleDiff > Math.PI) angleDiff = Math.abs(angleDiff - 2 * Math.PI);
          if (distToSeeker <= this.seeker.flashlightRadius && angleDiff <= this.seeker.flashlightAngleSpread / 2) {
            this.player.isCamouflaged = false;
          }
        } else {
          for (const [id, rp] of this.remotePlayers.entries()) {
            if (rp.isSeeker) {
              const distToSeeker = Math.hypot(this.player.x - rp.x, this.player.y - rp.y);
              const angleToPlayer = Math.atan2(this.player.y - rp.y, this.player.x - rp.x);
              let angleDiff = Math.abs(rp.angle - angleToPlayer);
              while (angleDiff > Math.PI) angleDiff = Math.abs(angleDiff - 2 * Math.PI);
              if (distToSeeker <= 260 && angleDiff <= (Math.PI / 3.4) / 2) {
                this.player.isCamouflaged = false;
              }
            }
          }
        }
      }
    }

    // Emitir posição no multiplayer
    if (this.isMultiplayer && this.socket && this.socket.connected) {
      this.socket.emit('player_move', {
        x: this.player.x,
        y: this.player.y,
        angle: this.player.angle,
        isCamouflaged: this.player.isCamouflaged,
      });
    }

    // 3. Coleta de Cristais (apenas camaleão)
    if (!this.player.isSeeker) {
      for (let i = this.crystals.length - 1; i >= 0; i--) {
        const c = this.crystals[i];
        c.pulse += 0.05;
        const dist = Math.hypot(this.player.x - c.x, this.player.y - c.y);
        if (dist < this.player.radius + c.radius) {
          this.crystals.splice(i, 1);
          this.crystalsCollected++;
          this.updateHUD();
          showToast('💎 Cristal Coletado! (+5 Ouro de bônus)', 'info');
        }
      }
    }

    // 4. Modo Multiplayer: Checagem de Captura
    if (this.isMultiplayer && this.socket && this.socket.connected) {
      if (this.player.isSeeker) {
        // Se eu sou o Caçador, verifico se colidi com algum camaleão
        for (const [id, rp] of this.remotePlayers.entries()) {
          if (!rp.isSeeker && !rp.isCaught) {
            const dist = Math.hypot(this.player.x - rp.x, this.player.y - rp.y);
            if (dist <= 32) {
              this.markPlayerCaught(id);
              this.socket.emit('tag_chameleon', { targetSocketId: id });
              showToast(`🎯 Você capturou ${rp.name}!`, 'success');
            }
          }
        }
      } else {
        // Se eu sou Camaleão, verifico se o Caçador encostou em mim
        for (const [id, rp] of this.remotePlayers.entries()) {
          if (rp.isSeeker && !this.player.isCaught) {
            const dist = Math.hypot(this.player.x - rp.x, this.player.y - rp.y);
            if (dist <= 32) {
              this.markPlayerCaught(this.socket.id);
              this.socket.emit('tag_chameleon', { targetSocketId: this.socket.id });
            }
          }
        }
      }
    }

    // 5. Modo Solo vs IA
    if (!this.isMultiplayer) {
      const distToPlayer = Math.hypot(this.player.x - this.seeker.x, this.player.y - this.seeker.y);
      const angleToPlayer = Math.atan2(this.player.y - this.seeker.y, this.player.x - this.seeker.x);

      let angleDiff = Math.abs(this.seeker.angle - angleToPlayer);
      while (angleDiff > Math.PI) angleDiff = Math.abs(angleDiff - 2 * Math.PI);

      const isPlayerInLightCone =
        distToPlayer <= this.seeker.flashlightRadius &&
        angleDiff <= this.seeker.flashlightAngleSpread / 2;

      if (isPlayerInLightCone) {
        this.seeker.isAlert = true;
        this.seeker.angle = angleToPlayer;
      } else if (distToPlayer < 45 && !this.player.isCamouflaged) {
        this.seeker.isAlert = true;
        this.seeker.angle = angleToPlayer;
      } else {
        this.seeker.isAlert = false;
      }

      const currentSpeed = this.seeker.isAlert ? this.seeker.alertSpeed : this.seeker.speed;

      if (this.seeker.isAlert) {
        this.seeker.x += Math.cos(this.seeker.angle) * currentSpeed;
        this.seeker.y += Math.sin(this.seeker.angle) * currentSpeed;
      } else {
        const targetWp = this.seeker.waypoints[this.seeker.currentWaypointIdx];
        const distWp = Math.hypot(targetWp.x - this.seeker.x, targetWp.y - this.seeker.y);
        const targetAngle = Math.atan2(targetWp.y - this.seeker.y, targetWp.x - this.seeker.x);

        this.seeker.angle += (targetAngle - this.seeker.angle) * 0.08;
        this.seeker.x += Math.cos(targetAngle) * currentSpeed;
        this.seeker.y += Math.sin(targetAngle) * currentSpeed;

        if (distWp < 20) {
          this.seeker.currentWaypointIdx = (this.seeker.currentWaypointIdx + 1) % this.seeker.waypoints.length;
        }
      }

      if (distToPlayer <= this.player.radius + this.seeker.radius) {
        this.endGame(false);
      }
    }
  }

  draw() {
    this.ctx.clearRect(0, 0, this.width, this.height);

    // 1. Fundo Escuro Nobre
    this.ctx.fillStyle = '#0b0f19';
    this.ctx.fillRect(0, 0, this.width, this.height);

    // 2. Plataformas Coloridas
    for (const p of this.platforms) {
      this.ctx.fillStyle = p.color;
      this.ctx.globalAlpha = 0.85;
      this.ctx.beginPath();
      this.ctx.roundRect(p.x, p.y, p.w, p.h, 16);
      this.ctx.fill();

      this.ctx.lineWidth = 3;
      this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
      this.ctx.stroke();

      this.ctx.globalAlpha = 0.5;
      this.ctx.fillStyle = '#ffffff';
      this.ctx.font = 'bold 13px Inter, sans-serif';
      this.ctx.fillText(p.name, p.x + 16, p.y + 26);
    }
    this.ctx.globalAlpha = 1.0;

    // 3. Cristais 💎
    for (const c of this.crystals) {
      const scale = 1 + Math.sin(c.pulse) * 0.15;
      this.ctx.save();
      this.ctx.translate(c.x, c.y);
      this.ctx.scale(scale, scale);
      this.ctx.font = '20px serif';
      this.ctx.textAlign = 'center';
      this.ctx.textBaseline = 'middle';
      this.ctx.fillText('💎', 0, 0);
      this.ctx.restore();
    }

    // 4. Renderizar Caçador (Local ou IA)
    if (!this.isMultiplayer) {
      this.drawFlashlight(this.seeker.x, this.seeker.y, this.seeker.angle, this.seeker.isAlert);
      this.drawSeekerBody(this.seeker.x, this.seeker.y, this.seeker.angle, this.seeker.isAlert, 'Patrulha IA');
    } else if (this.player.isSeeker) {
      this.drawFlashlight(this.player.x, this.player.y, this.player.angle, true);
      this.drawSeekerBody(this.player.x, this.player.y, this.player.angle, true, 'Você (Caçador)');
    }

    // 5. Renderizar Jogadores Remotos no Multiplayer
    if (this.isMultiplayer) {
      for (const [id, rp] of this.remotePlayers.entries()) {
        if (rp.isSeeker) {
          this.drawFlashlight(rp.x, rp.y, rp.angle, true);
          this.drawSeekerBody(rp.x, rp.y, rp.angle, true, rp.name);
        } else {
          this.drawChameleonBody(rp.x, rp.y, rp.color, rp.isCamouflaged, rp.isCaught, rp.name);
        }
      }
    }

    // 6. Renderizar Jogador Local (Camaleão)
    if (!this.player.isSeeker) {
      this.drawChameleonBody(
        this.player.x,
        this.player.y,
        this.player.color,
        this.player.isCamouflaged,
        this.player.isCaught,
        'Você'
      );
    }
  }

  drawFlashlight(x, y, angle, isAlert) {
    this.ctx.save();
    this.ctx.beginPath();
    this.ctx.moveTo(x, y);
    const startAngle = angle - this.seeker.flashlightAngleSpread / 2;
    const endAngle = angle + this.seeker.flashlightAngleSpread / 2;
    this.ctx.arc(x, y, this.seeker.flashlightRadius, startAngle, endAngle);
    this.ctx.closePath();

    const grad = this.ctx.createRadialGradient(x, y, 10, x, y, this.seeker.flashlightRadius);
    if (isAlert) {
      grad.addColorStop(0, 'rgba(239, 68, 68, 0.85)');
      grad.addColorStop(0.7, 'rgba(239, 68, 68, 0.35)');
      grad.addColorStop(1, 'rgba(239, 68, 68, 0)');
    } else {
      grad.addColorStop(0, 'rgba(253, 224, 71, 0.75)');
      grad.addColorStop(0.7, 'rgba(253, 224, 71, 0.25)');
      grad.addColorStop(1, 'rgba(253, 224, 71, 0)');
    }
    this.ctx.fillStyle = grad;
    this.ctx.fill();
    this.ctx.restore();
  }

  drawSeekerBody(x, y, angle, isAlert, label) {
    this.ctx.save();
    this.ctx.beginPath();
    this.ctx.arc(x, y, 16, 0, Math.PI * 2);
    this.ctx.fillStyle = isAlert ? '#dc2626' : '#475569';
    this.ctx.fill();
    this.ctx.lineWidth = 3;
    this.ctx.strokeStyle = '#ffffff';
    this.ctx.stroke();

    this.ctx.fillStyle = '#fde047';
    this.ctx.beginPath();
    this.ctx.arc(x + Math.cos(angle) * 14, y + Math.sin(angle) * 14, 6, 0, Math.PI * 2);
    this.ctx.fill();

    this.ctx.font = 'bold 11px Inter, sans-serif';
    this.ctx.fillStyle = '#ffffff';
    this.ctx.textAlign = 'center';
    this.ctx.fillText(label, x, y - 22);
    this.ctx.restore();
  }

  drawChameleonBody(x, y, color, isCamouflaged, isCaught, label) {
    this.ctx.save();
    if (isCaught) {
      this.ctx.font = '22px serif';
      this.ctx.textAlign = 'center';
      this.ctx.fillText('👻', x, y + 6);
      this.ctx.font = '11px Inter, sans-serif';
      this.ctx.fillStyle = '#94a3b8';
      this.ctx.fillText(`${label} (Pego)`, x, y - 18);
    } else if (isCamouflaged) {
      // 100% Invisível / Camuflado: Não desenha absolutamente nada (nem borda, nem nome!)
      this.ctx.restore();
      return;
    } else {
      this.ctx.beginPath();
      this.ctx.arc(x, y, 14, 0, Math.PI * 2);
      this.ctx.fillStyle = color;
      this.ctx.fill();
      this.ctx.lineWidth = 3;
      this.ctx.strokeStyle = '#ffffff';
      this.ctx.stroke();

      this.ctx.font = '11px Inter, sans-serif';
      this.ctx.fillStyle = '#ffffff';
      this.ctx.textAlign = 'center';
      this.ctx.fillText(label, x, y - 18);
    }
    this.ctx.restore();
  }

  drawIdlePreview(color) {
    this.player.color = color;
    this.draw();
  }

  async endGame(isVictory, isMultiplayerMatch = false, reason = '') {
    this.stop();

    const endScreen = document.getElementById('chameleon-end-screen');
    const iconEl = document.getElementById('chameleon-result-icon');
    const titleEl = document.getElementById('chameleon-result-title');
    const descEl = document.getElementById('chameleon-result-desc');
    const goldEl = document.getElementById('chameleon-reward-gold');
    const xpEl = document.getElementById('chameleon-reward-xp');

    try {
      const res = await fetch(`${API.character}/minigames/chameleon/complete`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${state.token}`,
        },
        body: JSON.stringify({
          survivedSeconds: this.timeLimitSeconds - this.timeRemaining,
          crystalsCollected: this.crystalsCollected,
          isVictory,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        if (isMultiplayerMatch) {
          if (reason === 'SEEKER_WIN') {
            if (iconEl) iconEl.innerText = '🏆';
            if (titleEl) { titleEl.innerText = 'VITÓRIA DO CAÇADOR!'; titleEl.style.color = '#fde047'; }
            if (descEl) descEl.innerText = 'Você encontrou e capturou todos os camaleões da família antes do tempo acabar!';
          } else if (reason === 'ALL_CAUGHT') {
            if (iconEl) iconEl.innerText = '🚨';
            if (titleEl) { titleEl.innerText = 'O CAÇADOR VENCEU!'; titleEl.style.color = '#ef4444'; }
            if (descEl) descEl.innerText = 'Todos os heróis camaleões foram capturados pela lanterna!';
          } else if (reason === 'CHAMELEON_SURVIVED') {
            if (iconEl) iconEl.innerText = '🎉';
            if (titleEl) { titleEl.innerText = 'VITÓRIA DOS CAMALEÕES!'; titleEl.style.color = '#4ade80'; }
            if (descEl) descEl.innerText = 'Você sobreviveu à caçada da família por 45 segundos e escapou da lanterna!';
          } else if (reason === 'TIME_EXPIRED_SEEKER') {
            if (iconEl) iconEl.innerText = '⏳';
            if (titleEl) { titleEl.innerText = 'O TEMPO ACABOU!'; titleEl.style.color = '#94a3b8'; }
            if (descEl) descEl.innerText = 'Os camaleões conseguiram se esconder e escaparam da sua lanterna!';
          } else {
            if (iconEl) iconEl.innerText = isVictory ? '🎉' : '🚨';
            if (titleEl) { titleEl.innerText = isVictory ? 'RODADA CONCLUÍDA!' : 'FIM DA RODADA!'; titleEl.style.color = isVictory ? '#fde047' : '#ef4444'; }
            if (descEl) descEl.innerText = `Partida finalizada!`;
          }
        } else {
          // Modo Solo
          if (isVictory) {
            if (iconEl) iconEl.innerText = '🎉';
            if (titleEl) { titleEl.innerText = 'VITÓRIA ÉPICA!'; titleEl.style.color = '#fde047'; }
            if (descEl) descEl.innerText = `Você sobreviveu à patrulha por 45 segundos e coletou ${this.crystalsCollected} cristais!`;
          } else {
            if (iconEl) iconEl.innerText = '🚨';
            if (titleEl) { titleEl.innerText = 'VOCÊ FOI CAPTURADO!'; titleEl.style.color = '#ef4444'; }
            if (descEl) descEl.innerText = `A lanterna encontrou você aos ${this.timeLimitSeconds - this.timeRemaining}s de fuga.`;
          }
        }

        if (goldEl) goldEl.innerText = `💰 +${data.reward.goldEarned} Ouro`;
        if (xpEl) xpEl.innerText = `⭐ +${data.reward.xpEarned} XP`;

        if (endScreen) endScreen.style.display = 'flex';

        await loadCharacterData();
      }
    } catch (err) {
      showToast('Erro ao registrar resultado da partida.', 'error');
    }
  }
}

function handleAvatarBack() {
  if (state.user?.role === 'PARENT' || state.user?.role === 'ADMIN') {
    navigateTo('parent');
  } else {
    navigateTo('child');
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

    const backBtn = document.getElementById('avatar-back-btn');
    if (backBtn) {
      if (state.user?.role === 'PARENT' || state.user?.role === 'ADMIN') {
        backBtn.innerText = '🛡️ Voltar ao Painel dos Pais';
      } else {
        backBtn.innerText = '👤 Voltar ao Perfil do Filho';
      }
    }

    // Renderizar Ficha Completa do Herói
    renderHeroHUD(char);

    // Restaurar aba se voltou do Arcade ou manter atual
    const savedTab = localStorage.getItem('liraquest_avatar_tab');
    if (savedTab) {
      state.avatarActiveTab = savedTab;
      localStorage.removeItem('liraquest_avatar_tab');
    }

    // Abrir aba ativa
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
async function openHeroCreationWizard() {
  const modal = document.getElementById('hero-creation-modal');
  modal.style.display = 'flex';

  if (!state.classesCatalog || state.classesCatalog.length === 0) {
    await fetchClassesCatalog();
  }

  const avatarGrid = document.getElementById('wizard-avatar-grid');
  if (avatarGrid) {
    avatarGrid.innerHTML = AVATAR_OPTIONS.map(
      (av) => `
        <div class="avatar-option ${state.selectedWizardAvatar === av.key ? 'selected' : ''}" onclick="selectWizardAvatar('${av.key}', event)">
          <span class="avatar-option-icon">${av.icon}</span>
          <span class="avatar-option-label">${av.label}</span>
        </div>
      `
    ).join('');
  }

  const classesGrid = document.getElementById('wizard-classes-grid');
  if (classesGrid && state.classesCatalog && state.classesCatalog.length > 0) {
    if (!state.selectedWizardClassId) {
      state.selectedWizardClassId = state.classesCatalog[0].id;
    }

    classesGrid.innerHTML = state.classesCatalog
      .map(
        (cls) => `
          <div class="class-choice-card ${state.selectedWizardClassId === cls.id ? 'selected' : ''}" onclick="selectWizardClass('${cls.id}', event)">
            <div class="class-choice-header">
              <span class="class-choice-icon">${getClassIcon(cls.code)}</span>
              <div>
                <div class="class-choice-title">${cls.name}</div>
                <div class="class-choice-role">${cls.combat_role || 'Herói'}</div>
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
}

function closeHeroCreationWizard() {
  document.getElementById('hero-creation-modal').style.display = 'none';
}

function selectWizardAvatar(avatarKey, ev) {
  state.selectedWizardAvatar = avatarKey;
  const avatarGrid = document.getElementById('wizard-avatar-grid');
  avatarGrid.querySelectorAll('.avatar-option').forEach((el) => el.classList.remove('selected'));
  if (ev && ev.currentTarget) {
    ev.currentTarget.classList.add('selected');
  }
}

function selectWizardClass(classId, ev) {
  state.selectedWizardClassId = classId;
  const classesGrid = document.getElementById('wizard-classes-grid');
  classesGrid.querySelectorAll('.class-choice-card').forEach((el) => el.classList.remove('selected'));
  if (ev && ev.currentTarget) {
    ev.currentTarget.classList.add('selected');
  }
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

async function fetchClassesCatalog() {
  try {
    const res = await fetch(`${API.catalog}/classes`);
    const data = await res.json();
    if (data.success && data.classes) {
      state.classesCatalog = data.classes;
    }
  } catch (err) {
    console.error('Erro ao buscar catálogo de classes:', err);
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
      if (data.character) {
        state.character = data.character;
        showToast('Seu herói já está criado no Reino!', 'info');
        closeHeroCreationWizard();
        navigateTo('avatar');
        return;
      }
      throw new Error(data.message || 'Erro ao criar herói.');
    }

    showToast(data.message, 'success');
    closeHeroCreationWizard();
    navigateTo('avatar');
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
// 9. TERMINAL DO GUARDIÃO (PAINEL DOS PAIS - PARENT ROLE)
// ========================================================

state.parentActiveTab = 'submissions';
state.parentTasksList = [];
state.parentSelectedCategoryFilter = 'ALL';

function switchParentTerminalTab(tab) {
  state.parentActiveTab = tab;
  const tabs = ['submissions', 'tasks', 'shop', 'clan-dashboard', 'clan', 'profile'];

  tabs.forEach((t) => {
    const btn = document.getElementById(`parent-nav-${t}`);
    const mobileBtn = document.getElementById(`mobile-parent-nav-${t}`);
    const panel = document.getElementById(`parent-panel-${t}`);

    if (btn) {
      if (t === tab) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    }

    if (mobileBtn) {
      if (t === tab) {
        mobileBtn.classList.add('active');
      } else {
        mobileBtn.classList.remove('active');
      }
    }

    if (panel) {
      panel.style.display = t === tab ? 'block' : 'none';
    }
  });

  if (tab === 'submissions') {
    loadParentSubmissions();
    loadParentReviewedHistory();
  }
  if (tab === 'tasks') loadParentTasks();
  if (tab === 'shop') loadParentRewardsShop();
  if (tab === 'clan-dashboard') loadClanAnalyticsDashboard();
  if (tab === 'clan') loadParentFamilyData();
  if (tab === 'profile') renderParentProfileInfo();
}

// Compatibilidade legada
function switchParentTab(tab) {
  switchParentTerminalTab(tab);
}

async function loadParentDashboard() {
  await loadParentTerminalDashboard();
}

async function loadParentTerminalDashboard() {
  if (!state.user || !state.token) return;

  // Atualizar dados de perfil na Sidebar do Pai
  const nameEl = document.getElementById('parent-user-name');
  const emailEl = document.getElementById('parent-user-email');
  const photoBox = document.getElementById('parent-sidebar-photo-box');

  if (nameEl) nameEl.innerText = state.user.name;
  if (emailEl) emailEl.innerText = state.user.email;
  if (photoBox) {
    if (state.user.profile_photo_url) {
      photoBox.innerHTML = `<img src="${state.user.profile_photo_url}" alt="Guardião" style="width: 100%; height: 100%; object-fit: cover; border-radius: 12px;">`;
    } else {
      photoBox.innerHTML = '🛡️';
    }
  }

  // Carregar dados de clã, tarefas e pendências
  await loadParentFamilyData();
  await loadParentSubmissions();
  await loadParentTasks();
  await loadParentReviewedHistory();
  renderParentProfileInfo();
}

// ─────────────────────────────────────────────────────────
// 🏰 GESTÃO DE CLÃ FAMILIAR & HERÓIS DOS FILHOS
// ─────────────────────────────────────────────────────────
async function loadParentFamilyData() {
  try {
    const res = await fetch(`${API.family}/my-family`, {
      headers: { Authorization: `Bearer ${state.token}` },
    });
    const data = await res.json();

    if (res.ok && data.success && data.hasFamily) {
      const fam = data.family;
      const members = fam.members || [];
      const code = fam.invite_code || '----';

      // Atualizar Sidebar
      const clanNameEl = document.getElementById('parent-sidebar-clan-name');
      const inviteCodeEl = document.getElementById('parent-sidebar-invite-code');
      const membersCountEl = document.getElementById('parent-sidebar-members-count');

      if (clanNameEl) clanNameEl.innerText = fam.name;
      if (inviteCodeEl) inviteCodeEl.innerText = code;
      if (membersCountEl) membersCountEl.innerText = `${members.length} Membro(s)`;

      // Atualizar Banner na Aba Clã
      const codeLarge = document.getElementById('parent-clan-invite-code-large');
      const titleLarge = document.getElementById('parent-clan-title-large');
      if (codeLarge) codeLarge.innerText = code;
      if (titleLarge) titleLarge.innerText = fam.name;

      // Atualizar Card de Clã na Aba Meu Perfil
      const profClanName = document.getElementById('parent-clan-name-display');
      const profClanCode = document.getElementById('parent-clan-code-display');
      if (profClanName) profClanName.innerText = fam.name;
      if (profClanCode) profClanCode.innerText = code;

      // Renderizar Grid de Filhos & Heróis
      renderParentChildrenGrid(members);
    }
  } catch (err) {
    console.error('Erro ao carregar dados do clã familiar:', err);
  }
}

function renderParentChildrenGrid(members) {
  const container = document.getElementById('parent-children-grid');
  if (!container) return;

  const children = members.filter((m) => m.user && m.user.role === 'CHILD');

  if (children.length === 0) {
    container.innerHTML = `
      <div style="grid-column: 1/-1; background: rgba(15, 23, 42, 0.6); border: 1px dashed var(--border-card); border-radius: 16px; padding: 28px; text-align: center;">
        <span style="font-size: 2.2rem; display: block; margin-bottom: 8px;">👥</span>
        <h4 style="color: #ffffff; font-size: 1.1rem; margin-bottom: 6px;">Nenhum herói conectado ainda</h4>
        <p style="color: var(--text-muted); font-size: 0.85rem; max-width: 420px; margin: 0 auto 16px auto;">
          Envie o código do clã acima para seus filhos criarem suas contas e começarem a cumprir missões!
        </p>
        <button class="btn btn-gold btn-sm" onclick="copyClanInviteCode()">📋 Copiar Código de Convite</button>
      </div>
    `;
    return;
  }

  container.innerHTML = children
    .map((m) => {
      const u = m.user;
      const hero = u.character;
      const avatarIcon = hero ? getAvatarDisplay(hero.avatar_value) : '⚔️';
      const className = hero?.current_class_id ? 'Herói Ativo' : 'Aventureiro';
      const level = hero?.level || 1;

      return `
        <div style="background: rgba(15, 23, 42, 0.75); border: 1px solid var(--border-card); border-radius: 16px; padding: 18px; display: flex; flex-direction: column; justify-content: space-between;">
          <div>
            <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 12px;">
              <div class="avatar-circle" style="width: 48px; height: 48px; font-size: 1.3rem; border: 2px solid var(--accent); background: rgba(0,0,0,0.5);">
                ${avatarIcon}
              </div>
              <div style="overflow: hidden;">
                <strong style="color: #ffffff; font-size: 1rem; display: block; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
                  ${u.name}
                </strong>
                <span style="color: #c084fc; font-size: 0.8rem;">${hero ? `Herói: ${hero.name}` : 'Sem Herói Desperto'}</span>
              </div>
            </div>

            ${hero ? `
              <div style="background: rgba(0,0,0,0.25); padding: 10px; border-radius: 10px; margin-bottom: 12px;">
                <div style="display: flex; justify-content: space-between; font-size: 0.8rem; margin-bottom: 4px;">
                  <span style="color: #fde047; font-weight: 700;">Nível ${level}</span>
                  <span style="color: var(--text-muted);">${className}</span>
                </div>
                <div style="display: flex; gap: 8px; flex-wrap: wrap; margin-top: 6px;">
                  <span class="reward-pill-gold" style="font-size: 0.75rem;">💰 ${hero.gold || 0} Ouro</span>
                  <span class="reward-pill-energy" style="font-size: 0.75rem;">⚡ Pronto</span>
                </div>
              </div>
            ` : `
              <div style="background: rgba(239,68,68,0.1); border: 1px solid rgba(239,68,68,0.25); padding: 8px; border-radius: 8px; margin-bottom: 12px; font-size: 0.78rem; color: #fca5a5;">
                ⚠️ Ainda não criou seu herói no reino.
              </div>
            `}
          </div>

          <div style="border-top: 1px solid rgba(255,255,255,0.06); padding-top: 10px; font-size: 0.78rem; color: var(--text-muted); display: flex; justify-content: space-between;">
            <span>E-mail: ${u.email}</span>
            <span class="role-badge" style="background: rgba(34,197,94,0.15); color: #4ade80; font-size: 0.7rem;">Membro</span>
          </div>
        </div>
      `;
    })
    .join('');
}

function copyClanInviteCode() {
  const code = document.getElementById('parent-sidebar-invite-code')?.innerText || 'LIRA-XXXX';
  if (!code || code === '----') {
    showToast('Código de convite ainda não disponível.', 'warning');
    return;
  }

  navigator.clipboard.writeText(code).then(() => {
    showToast(`📋 Código ${code} copiado! Envie aos seus filhos via WhatsApp.`, 'success');
  }).catch(() => {
    showToast(`Código do Clã: ${code}`, 'info');
  });
}

// ─────────────────────────────────────────────────────────
// 📊 PAINEL DO CLÃ (DASHBOARD ANALÍTICO & CONTROLE FAMILIAR)
// ─────────────────────────────────────────────────────────
// 📊 PAINEL DO CLÃ: DASHBOARD ANALÍTICO & PEDAGÓGICO
// ─────────────────────────────────────────────────────────
window._clanAnalyticsData = null;
window._selectedClanMemberId = 'ALL';

async function loadClanAnalyticsDashboard() {
  if (!state.token) return;

  try {
    const res = await fetch(`${API.family}/analytics`, {
      headers: { Authorization: `Bearer ${state.token}` },
    });
    const data = await res.json();

    if (!res.ok || !data.success) {
      console.warn('Não foi possível carregar o painel do clã:', data.message);
      return;
    }

    window._clanAnalyticsData = data;

    // Preencher dropdown de filtro por membro se ainda não estiver preenchido
    const filterSelect = document.getElementById('clan-dash-member-filter');
    if (filterSelect) {
      const currentVal = window._selectedClanMemberId || 'ALL';
      const children = (data.members || []).filter((m) => m.role === 'CHILD');
      filterSelect.innerHTML = `
        <option value="ALL" style="background: #0f172a; color: #fff;">🏰 Todos os Heróis</option>
        ${children
          .map(
            (c) =>
              `<option value="${c.id}" ${c.id === currentVal ? 'selected' : ''} style="background: #0f172a; color: #fff;">⚔️ ${c.name}</option>`
          )
          .join('')}
      `;
    }

    renderFilteredClanDashboard();
  } catch (err) {
    console.error('Erro ao carregar dashboard analítico do clã:', err);
  }
}

function onClanMemberFilterChange(memberId) {
  window._selectedClanMemberId = memberId || 'ALL';
  renderFilteredClanDashboard();
}
window.onClanMemberFilterChange = onClanMemberFilterChange;

function renderFilteredClanDashboard() {
  const data = window._clanAnalyticsData;
  if (!data) return;

  const {
    clanStats,
    topPerformer,
    needsAttention,
    members,
    weeklyHabits,
    categoryDistribution,
    catCountsByChild,
    childrenComparison,
    categoryMatrix,
    treasuryStatement,
    clanAchievements,
    pedagogicalInsights,
  } = data;

  const selectedMemberId = window._selectedClanMemberId || 'ALL';

  // 1. Atualizar Contadores Globais (Pai e Filho)
  const updateText = (id, val) => {
    const el = document.getElementById(id);
    if (el) el.innerText = val;
  };

  updateText('clan-dash-online-count', `${clanStats.onlineMembersCount} / ${clanStats.totalMembers}`);
  updateText('child-clan-dash-online-count', `${clanStats.onlineMembersCount} / ${clanStats.totalMembers}`);

  updateText('clan-dash-tasks-count', clanStats.totalClanTasks);
  updateText('child-clan-dash-tasks-count', clanStats.totalClanTasks);

  updateText('clan-dash-gold-count', `${clanStats.totalClanGold}`);
  updateText('child-clan-dash-gold-count', `${clanStats.totalClanGold}`);

  updateText('clan-dash-streak-count', `${clanStats.maxClanStreak}d`);
  updateText('child-clan-dash-streak-count', `${clanStats.maxClanStreak}d`);

  // 2. Gráfico de Hábitos Semanais
  renderWeeklyHabitsChart(weeklyHabits, selectedMemberId);

  // 3. Distribuição por Categorias
  renderCategoryDistribution(categoryDistribution, catCountsByChild, selectedMemberId);

  // 4. Relatório Pedagógico Dinâmico
  renderPedagogicalInsights(pedagogicalInsights);

  // 5. Comparativo Entre Heróis (Quem Fez o Quê)
  renderChildrenComparison(childrenComparison, categoryMatrix, clanStats.totalClanTasks);

  // 6. Extrato do Tesouro Familiar & Resgates
  renderTreasuryStatement(treasuryStatement);

  // 7. Conquistas & Insígnias do Clã
  renderClanAchievements(clanAchievements);

  // 7. Renderizar Card 1: Campeão da Casa (Mais Tarefas)
  const renderTopCard = (containerId) => {
    const el = document.getElementById(containerId);
    if (!el) return;

    if (!topPerformer || topPerformer.total_approved_tasks === 0) {
      el.innerHTML = `
        <div>
          <span style="font-size: 0.8rem; color: #fbbf24; font-weight: 700; text-transform: uppercase;">👑 Campeão da Casa</span>
          <h3 style="font-size: 1.25rem; color: #ffffff; margin: 6px 0;">Em Disputa Aberta!</h3>
          <p style="font-size: 0.85rem; color: var(--text-muted); line-height: 1.4;">
            Nenhum herói concluiu missões ainda. Quem cumprir a primeira tarefa assumirá a liderança do ranking da casa!
          </p>
        </div>
        <div style="margin-top: 14px;">
          <span class="role-badge" style="background: rgba(245,158,11,0.2); color: #fbbf24; border: 1px solid rgba(245,158,11,0.4);">
            ⚔️ Liderança Disponível
          </span>
        </div>
      `;
      return;
    }

    const avatarIcon = topPerformer.hero ? getAvatarDisplay(topPerformer.hero.avatar_value) : '👑';
    const streak = topPerformer.progress?.current_streak || 0;

    el.innerHTML = `
      <div>
        <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 8px;">
          <span style="font-size: 0.8rem; color: #fbbf24; font-weight: 700; text-transform: uppercase;">👑 Campeão da Casa</span>
          <span class="role-badge" style="background: rgba(245,158,11,0.25); color: #fde047; border: 1px solid rgba(245,158,11,0.5);">
            🏆 Mais Produtivo
          </span>
        </div>
        <div style="display: flex; align-items: center; gap: 14px; margin-bottom: 12px;">
          <div class="avatar-circle" style="width: 52px; height: 52px; font-size: 1.5rem; background: rgba(0,0,0,0.5); border: 2px solid var(--gold);">
            ${avatarIcon}
          </div>
          <div>
            <h3 style="font-size: 1.25rem; color: #ffffff; margin: 0;">${topPerformer.name}</h3>
            <span style="color: #c084fc; font-size: 0.82rem;">${topPerformer.hero ? `Herói: ${topPerformer.hero.name} • Nível ${topPerformer.hero.level}` : 'Herói do Clã'}</span>
          </div>
        </div>
        <div style="display: flex; gap: 8px; flex-wrap: wrap;">
          <span class="reward-pill-xp" style="font-size: 0.8rem;">⭐ ${topPerformer.total_approved_tasks} Missões Concluídas</span>
          <span class="reward-pill-gold" style="font-size: 0.8rem;">💰 ${topPerformer.hero?.gold || 0} Ouro</span>
          <span style="background: rgba(249,115,22,0.2); color: #fb923c; padding: 4px 10px; border-radius: 20px; font-size: 0.8rem; font-weight: 700;">🔥 Streak: ${streak} dias</span>
        </div>
      </div>
      <p style="font-size: 0.8rem; color: #4ade80; margin-top: 14px; margin-bottom: 0;">
        ✨ Parabéns pelo empenho exemplar nos hábitos da casa!
      </p>
    `;
  };

  renderTopCard('clan-dash-top-performer-card');
  renderTopCard('child-clan-dash-top-performer-card');

  // 8. Renderizar Card 2: Herói em Foco (Menos Tarefas / Apoio)
  const renderAttentionCard = (containerId) => {
    const el = document.getElementById(containerId);
    if (!el) return;

    if (!needsAttention || needsAttention.id === topPerformer?.id) {
      el.innerHTML = `
        <div>
          <span style="font-size: 0.8rem; color: #93c5fd; font-weight: 700; text-transform: uppercase;">🌱 Equilíbrio do Clã</span>
          <h3 style="font-size: 1.25rem; color: #ffffff; margin: 6px 0;">Todos no Mesmo Ritmo!</h3>
          <p style="font-size: 0.85rem; color: var(--text-muted); line-height: 1.4;">
            Todos os membros da família estão avançando juntos em perfeita harmonia. Continuem com a cooperação diária!
          </p>
        </div>
        <div style="margin-top: 14px;">
          <span class="role-badge" style="background: rgba(34,197,94,0.15); color: #4ade80; border: 1px solid rgba(34,197,94,0.3);">
            ✨ Família Unida
          </span>
        </div>
      `;
      return;
    }

    const avatarIcon = needsAttention.hero ? getAvatarDisplay(needsAttention.hero.avatar_value) : '🌱';

    el.innerHTML = `
      <div>
        <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 8px;">
          <span style="font-size: 0.8rem; color: #93c5fd; font-weight: 700; text-transform: uppercase;">🌱 Herói em Foco</span>
          <span class="role-badge" style="background: rgba(59,130,246,0.2); color: #93c5fd; border: 1px solid rgba(59,130,246,0.4);">
            🤝 Precisa de Apoio
          </span>
        </div>
        <div style="display: flex; align-items: center; gap: 14px; margin-bottom: 12px;">
          <div class="avatar-circle" style="width: 52px; height: 52px; font-size: 1.5rem; background: rgba(0,0,0,0.5); border: 2px solid #3b82f6;">
            ${avatarIcon}
          </div>
          <div>
            <h3 style="font-size: 1.25rem; color: #ffffff; margin: 0;">${needsAttention.name}</h3>
            <span style="color: #93c5fd; font-size: 0.82rem;">${needsAttention.hero ? `Herói: ${needsAttention.hero.name}` : 'Aventureiro'}</span>
          </div>
        </div>
        <div style="display: flex; gap: 8px; flex-wrap: wrap;">
          <span style="background: rgba(255,255,255,0.08); color: #cbd5e1; padding: 4px 10px; border-radius: 20px; font-size: 0.8rem;">📋 ${needsAttention.total_approved_tasks} Missões Feitas</span>
          <span style="background: rgba(245,158,11,0.15); color: #fde047; padding: 4px 10px; border-radius: 20px; font-size: 0.8rem;">🎯 Pronto para novos desafios</span>
        </div>
      </div>
      <p style="font-size: 0.8rem; color: #93c5fd; margin-top: 14px; margin-bottom: 0;">
        💡 Dica: Que tal realizar uma missão rápida hoje juntos para subir de nível e ganhar ouro?
      </p>
    `;
  };

  renderAttentionCard('clan-dash-needs-attention-card');
  renderAttentionCard('child-clan-dash-needs-attention-card');

  // 9. Renderizar Lista de Membros com Presença Online
  const renderMembersList = (containerId) => {
    const el = document.getElementById(containerId);
    if (!el) return;

    el.innerHTML = members
      .map((m) => {
        const isParent = m.role === 'PARENT' || m.role === 'ADMIN';
        const avatarIcon = m.hero ? getAvatarDisplay(m.hero.avatar_value) : isParent ? '🛡️' : '👤';
        const roleBadge = isParent
          ? '<span class="role-badge badge-parent" style="font-size: 0.72rem;">🛡️ Guardião</span>'
          : '<span class="role-badge badge-child" style="font-size: 0.72rem;">⚔️ Herói Filho</span>';

        const presenceBadge = m.presence.is_online
          ? '<span style="background: rgba(34,197,94,0.2); color: #4ade80; border: 1px solid rgba(34,197,94,0.4); padding: 4px 10px; border-radius: 12px; font-size: 0.75rem; font-weight: 700;">🟢 Online agora</span>'
          : `<span style="background: rgba(148,163,184,0.1); color: #94a3b8; border: 1px solid rgba(148,163,184,0.2); padding: 4px 10px; border-radius: 12px; font-size: 0.75rem;">${m.presence.label}</span>`;

        return `
          <div style="background: rgba(15, 23, 42, 0.7); border: 1px solid var(--border-card); border-radius: 14px; padding: 14px 18px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px;">
            <div style="display: flex; align-items: center; gap: 14px;">
              <div class="avatar-circle" style="width: 44px; height: 44px; font-size: 1.3rem; border: 2px solid rgba(212,175,55,0.4); background: rgba(0,0,0,0.5);">
                ${avatarIcon}
              </div>
              <div>
                <div style="display: flex; align-items: center; gap: 8px;">
                  <strong style="color: #ffffff; font-size: 0.98rem;">${m.name}</strong>
                  ${roleBadge}
                </div>
                <span style="font-size: 0.78rem; color: var(--text-muted);">${m.hero ? `Herói: ${m.hero.name} (Nv. ${m.hero.level})` : m.email}</span>
              </div>
            </div>

            <div style="display: flex; align-items: center; gap: 16px; flex-wrap: wrap;">
              ${!isParent ? `
                <div style="text-align: right; font-size: 0.8rem;">
                  <span style="color: #cbd5e1; display: block;">Hoje: <strong>${m.progress?.tasks_completed_today || 0}</strong> | Total: <strong>${m.total_approved_tasks || 0}</strong> missões</span>
                  <span style="color: #fde047;">💰 ${m.hero?.gold || 0} Ouro • 🔥 ${m.progress?.current_streak || 0}d streak</span>
                </div>
              ` : ''}
              <div>
                ${presenceBadge}
              </div>
            </div>
          </div>
        `;
      })
      .join('');
  };

  renderMembersList('clan-dash-members-list');
  renderMembersList('child-clan-dash-members-list');
}

// ─────────────────────────────────────────────────────────
// HELPERS DE RENDERIZAÇÃO DO PAINEL DO CLÃ
// ─────────────────────────────────────────────────────────

function renderWeeklyHabitsChart(weeklyHabits, selectedMemberId) {
  const container = document.getElementById('clan-dash-weekly-chart');
  if (!container) return;

  if (!weeklyHabits || weeklyHabits.length === 0) {
    container.innerHTML = `<p style="font-size: 0.85rem; color: var(--text-muted); text-align: center; margin: auto;">Nenhum dado semanal disponível.</p>`;
    return;
  }

  const dayData = weeklyHabits.map((d) => {
    let count = 0;
    if (!selectedMemberId || selectedMemberId === 'ALL') {
      count = d.total || 0;
    } else {
      const ch = (d.children || []).find((c) => c.id === selectedMemberId);
      count = ch ? ch.count : 0;
    }
    return { ...d, displayCount: count };
  });

  const maxVal = Math.max(4, ...dayData.map((d) => d.displayCount));

  container.innerHTML = `
    <div style="display: flex; align-items: flex-end; justify-content: space-between; width: 100%; height: 160px; gap: 8px; padding-top: 20px; padding-bottom: 4px;">
      ${dayData
        .map((d) => {
          const heightPct = d.displayCount > 0 ? Math.max(16, Math.round((d.displayCount / maxVal) * 100)) : 6;
          const isHighlight = d.displayCount > 0;
          const barBg = isHighlight
            ? 'linear-gradient(180deg, #fbbf24 0%, #d4af37 40%, #1e3a8a 100%)'
            : 'rgba(255, 255, 255, 0.06)';
          const borderStyle = isHighlight
            ? '1px solid rgba(251, 191, 36, 0.6)'
            : '1px solid rgba(255, 255, 255, 0.08)';
          const glow = isHighlight ? 'box-shadow: 0 0 10px rgba(212, 175, 55, 0.3);' : '';

          return `
            <div style="flex: 1; display: flex; flex-direction: column; align-items: center; height: 100%; justify-content: flex-end; position: relative;">
              <span style="font-size: 0.78rem; font-weight: 700; color: ${isHighlight ? '#fde047' : 'rgba(255,255,255,0.3)'}; margin-bottom: 6px;">
                ${d.displayCount}
              </span>
              <div title="${d.date}: ${d.displayCount} missões concluídas" style="width: 100%; max-width: 36px; height: ${heightPct}%; background: ${barBg}; border: ${borderStyle}; border-radius: 8px 8px 3px 3px; ${glow} transition: height 0.4s ease; cursor: pointer;"></div>
              <span style="font-size: 0.75rem; color: ${isHighlight ? '#ffffff' : 'var(--text-muted)'}; font-weight: ${isHighlight ? '700' : '400'}; margin-top: 8px;">
                ${d.dayLabel}
              </span>
            </div>
          `;
        })
        .join('')}
    </div>
  `;
}

function renderCategoryDistribution(categoryDistribution, catCountsByChild, selectedMemberId) {
  const container = document.getElementById('clan-dash-category-distribution');
  if (!container) return;

  if (!categoryDistribution || categoryDistribution.length === 0) {
    container.innerHTML = `<p style="font-size: 0.85rem; color: var(--text-muted);">Nenhuma missão registrada ainda.</p>`;
    return;
  }

  let list = categoryDistribution;
  if (selectedMemberId && selectedMemberId !== 'ALL' && catCountsByChild && catCountsByChild[selectedMemberId]) {
    const childStats = catCountsByChild[selectedMemberId];
    const childTotal = childStats.total || 1;
    list = categoryDistribution.map((cat) => {
      const count = childStats[cat.category] || 0;
      const pct = childStats.total > 0 ? Math.round((count / childTotal) * 100) : 0;
      return { ...cat, count, percentage: pct };
    });
  }

  container.innerHTML = list
    .map(
      (cat) => `
      <div style="margin-bottom: 6px;">
        <div style="display: flex; justify-content: space-between; font-size: 0.82rem; margin-bottom: 4px;">
          <span style="color: #cbd5e1; display: flex; align-items: center; gap: 6px;">
            <span>${cat.icon}</span> ${cat.label}
          </span>
          <span style="font-weight: 700; color: ${cat.color};">${cat.count} (${cat.percentage}%)</span>
        </div>
        <div style="width: 100%; height: 7px; background: rgba(255,255,255,0.08); border-radius: 4px; overflow: hidden;">
          <div style="width: ${cat.percentage}%; height: 100%; background: ${cat.color}; border-radius: 4px; transition: width 0.4s ease;"></div>
        </div>
      </div>
    `
    )
    .join('');
}

function renderPedagogicalInsights(insights) {
  const container = document.getElementById('clan-dash-pedagogical-insights');
  if (!container) return;

  if (!insights || insights.length === 0) {
    container.innerHTML = `
      <div style="background: rgba(0, 0, 0, 0.35); border-left: 4px solid #fbbf24; border-radius: 10px; padding: 12px 14px;">
        <strong style="color: #ffffff; font-size: 0.88rem; display: block; margin-bottom: 4px;">✨ Rotina Familiar Ativa</strong>
        <p style="font-size: 0.82rem; color: #cbd5e1; margin: 0; line-height: 1.4;">
          Continue validando as tarefas dos heróis para gerar orientações personalizadas de reforço positivo!
        </p>
      </div>
    `;
    return;
  }

  container.innerHTML = insights
    .map(
      (item) => `
      <div style="background: rgba(0, 0, 0, 0.4); border-left: 4px solid ${item.color || '#fbbf24'}; border-radius: 10px; padding: 12px 14px;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px; flex-wrap: wrap; gap: 4px;">
          <strong style="color: #ffffff; font-size: 0.88rem; display: flex; align-items: center; gap: 6px;">
            <span>${item.icon}</span> ${item.title}
          </strong>
          <span style="font-size: 0.68rem; color: ${item.color || '#fbbf24'}; background: rgba(255,255,255,0.06); padding: 2px 8px; border-radius: 6px; font-weight: 700; text-transform: uppercase;">
            ${item.badge}
          </span>
        </div>
        <p style="font-size: 0.82rem; color: #cbd5e1; margin: 0; line-height: 1.45;">
          ${item.text}
        </p>
      </div>
    `
    )
    .join('');
}

function renderTreasuryStatement(treasury) {
  if (!treasury) return;

  const updateText = (id, val) => {
    const el = document.getElementById(id);
    if (el) el.innerText = val;
  };

  updateText('clan-dash-treasury-gold', `${treasury.totalGoldEarned} 🪙`);
  updateText('clan-dash-treasury-tokens-earned', `${treasury.totalTokensEarned} 🏠`);
  updateText('clan-dash-treasury-tokens-spent', `${treasury.totalTokensSpent} 🎁`);
  updateText('clan-dash-treasury-tokens-balance', `${treasury.currentVaultTokens} 💎`);

  const listContainer = document.getElementById('clan-dash-recent-redemptions-list');
  if (!listContainer) return;

  const redemptions = treasury.recentRedemptions || [];
  if (redemptions.length === 0) {
    listContainer.innerHTML = `
      <div style="background: rgba(0, 0, 0, 0.25); border-radius: 8px; padding: 12px; text-align: center;">
        <span style="font-size: 0.82rem; color: var(--text-muted);">
          Nenhum vale foi resgatado ainda na Loja do Lar. Conforme os heróis trocarem Fichas do Lar, o extrato aparecerá aqui!
        </span>
      </div>
    `;
    return;
  }

  listContainer.innerHTML = redemptions
    .map((r) => {
      const statusLabel =
        r.status === 'DELIVERED'
          ? 'Entregue'
          : r.status === 'APPROVED'
          ? 'Aprovado'
          : r.status === 'PENDING'
          ? 'Aguardando Aprovação'
          : 'Cancelado';

      const statusColor =
        r.status === 'DELIVERED'
          ? '#4ade80'
          : r.status === 'APPROVED'
          ? '#60a5fa'
          : r.status === 'PENDING'
          ? '#fde047'
          : '#ef4444';

      const statusBg =
        r.status === 'DELIVERED'
          ? 'rgba(34, 197, 94, 0.15)'
          : r.status === 'APPROVED'
          ? 'rgba(59, 130, 246, 0.15)'
          : r.status === 'PENDING'
          ? 'rgba(245, 158, 11, 0.15)'
          : 'rgba(239, 68, 68, 0.15)';

      const dateFormatted = new Date(r.createdAt).toLocaleDateString('pt-BR');

      return `
        <div style="background: rgba(0, 0, 0, 0.3); border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 10px; padding: 10px 14px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px;">
          <div style="display: flex; align-items: center; gap: 12px;">
            <div style="width: 36px; height: 36px; border-radius: 8px; background: rgba(0,0,0,0.4); display: flex; align-items: center; justify-content: center; font-size: 1.3rem;">
              ${r.rewardIcon}
            </div>
            <div>
              <strong style="color: #ffffff; font-size: 0.88rem; display: block;">${r.rewardTitle}</strong>
              <span style="font-size: 0.74rem; color: var(--text-muted);">${r.userName} • ${dateFormatted}</span>
            </div>
          </div>
          <div style="display: flex; align-items: center; gap: 12px;">
            <span style="color: #fbbf24; font-weight: 700; font-size: 0.84rem;">${r.tokenCost} Fichas</span>
            <span style="background: ${statusBg}; color: ${statusColor}; border: 1px solid ${statusColor}44; padding: 3px 8px; border-radius: 6px; font-size: 0.72rem; font-weight: 700;">
              ${statusLabel}
            </span>
          </div>
        </div>
      `;
    })
    .join('');
}

function renderClanAchievements(achievements) {
  const container = document.getElementById('clan-dash-achievements-grid');
  if (!container) return;

  if (!achievements || achievements.length === 0) {
    container.innerHTML = `<p style="font-size: 0.85rem; color: var(--text-muted);">Carregando insígnias do clã...</p>`;
    return;
  }

  container.innerHTML = achievements
    .map((a) => {
      const isUnlocked = a.unlocked;
      const border = isUnlocked ? '1px solid rgba(212, 175, 55, 0.55)' : '1px solid rgba(255, 255, 255, 0.08)';
      const bg = isUnlocked
        ? 'linear-gradient(135deg, rgba(212, 175, 55, 0.15), rgba(15, 23, 42, 0.85))'
        : 'rgba(0, 0, 0, 0.35)';

      return `
        <div style="background: ${bg}; border: ${border}; border-radius: 14px; padding: 14px; display: flex; flex-direction: column; justify-content: space-between; position: relative;">
          <div style="display: flex; align-items: flex-start; gap: 12px; margin-bottom: 12px;">
            <div style="font-size: 1.8rem; background: rgba(0,0,0,0.5); border-radius: 12px; width: 44px; height: 44px; display: flex; align-items: center; justify-content: center; border: 1px solid ${isUnlocked ? 'var(--gold)' : 'rgba(255,255,255,0.1)'};">
              ${a.icon}
            </div>
            <div style="flex: 1;">
              <div style="display: flex; justify-content: space-between; align-items: center;">
                <strong style="color: ${isUnlocked ? '#fde047' : '#ffffff'}; font-size: 0.92rem;">${a.title}</strong>
                ${isUnlocked ? '<span style="color: #4ade80; font-size: 0.72rem; font-weight: 700;">✨ CONCLUÍDO</span>' : ''}
              </div>
              <p style="font-size: 0.76rem; color: var(--text-muted); margin: 3px 0 0 0; line-height: 1.35;">${a.description}</p>
            </div>
          </div>
          <div>
            <div style="display: flex; justify-content: space-between; font-size: 0.72rem; color: #cbd5e1; margin-bottom: 4px;">
              <span>Progresso do Clã</span>
              <span style="font-weight: 700; color: ${isUnlocked ? '#fde047' : '#94a3b8'};">${a.current} / ${a.target}</span>
            </div>
            <div style="width: 100%; height: 6px; background: rgba(255,255,255,0.1); border-radius: 3px; overflow: hidden;">
              <div style="width: ${a.progressPercentage}%; height: 100%; background: ${isUnlocked ? 'linear-gradient(90deg, #d4af37, #fde047)' : '#3b82f6'}; border-radius: 3px; transition: width 0.4s ease;"></div>
            </div>
          </div>
        </div>
      `;
    })
    .join('');
}

// ─────────────────────────────────────────────────────────
// ⚔️ COMPARATIVO ENTRE HERÓIS (QUEM FEZ O QUÊ)
// ─────────────────────────────────────────────────────────
window._clanComparisonSubTab = 'cards';

function switchClanComparisonSubTab(tab) {
  window._clanComparisonSubTab = tab;
  const btnCards = document.getElementById('btn-comp-view-cards');
  const btnMatrix = document.getElementById('btn-comp-view-matrix');
  const viewCards = document.getElementById('clan-comp-cards-view');
  const viewMatrix = document.getElementById('clan-comp-matrix-view');

  if (tab === 'cards') {
    if (btnCards) btnCards.className = 'btn btn-sm btn-gold';
    if (btnMatrix) btnMatrix.className = 'btn btn-sm btn-secondary';
    if (viewCards) viewCards.style.display = 'grid';
    if (viewMatrix) viewMatrix.style.display = 'none';
  } else {
    if (btnCards) btnCards.className = 'btn btn-sm btn-secondary';
    if (btnMatrix) btnMatrix.className = 'btn btn-sm btn-gold';
    if (viewCards) viewCards.style.display = 'none';
    if (viewMatrix) viewMatrix.style.display = 'block';
  }
}
window.switchClanComparisonSubTab = switchClanComparisonSubTab;

function renderChildrenComparison(childrenComparison, categoryMatrix, totalClanTasks) {
  renderChildrenCardsComparison(childrenComparison, totalClanTasks);
  renderCategoryMatrixComparison(categoryMatrix, childrenComparison, totalClanTasks);
}

function renderChildrenCardsComparison(childrenComparison, totalClanTasks) {
  const container = document.getElementById('clan-comp-cards-view');
  if (!container) return;

  if (!childrenComparison || childrenComparison.length === 0) {
    container.innerHTML = `
      <div style="grid-column: 1 / -1; text-align: center; padding: 20px; color: var(--text-muted);">
        Nenhum filho cadastrado no clã até o momento.
      </div>
    `;
    return;
  }

  // Ordenar filhos por total de tarefas concluídas (decrescente)
  const sorted = [...childrenComparison].sort((a, b) => b.tasksTotal - a.tasksTotal);

  container.innerHTML = sorted
    .map((ch, idx) => {
      const avatarIcon = ch.hero ? getAvatarDisplay(ch.hero.avatar_value) : '⚔️';
      const rankBadge =
        idx === 0 && ch.tasksTotal > 0
          ? '<span style="background: rgba(245,158,11,0.25); color: #fde047; border: 1px solid rgba(245,158,11,0.5); padding: 2px 8px; border-radius: 12px; font-size: 0.72rem; font-weight: 700;">👑 1º Lugar</span>'
          : `<span style="background: rgba(255,255,255,0.06); color: #cbd5e1; border: 1px solid rgba(255,255,255,0.1); padding: 2px 8px; border-radius: 12px; font-size: 0.72rem;">#${idx + 1}</span>`;

      const presenceBadge = ch.presence?.is_online
        ? '<span style="color: #4ade80; font-size: 0.7rem; font-weight: 700;">🟢 Online</span>'
        : `<span style="color: #94a3b8; font-size: 0.7rem;">⚪ ${ch.presence?.label || 'Offline'}</span>`;

      const cats = ch.categories || {};
      const recentList = ch.recentTasks || [];

      return `
        <div style="background: linear-gradient(135deg, rgba(30, 58, 138, 0.25), rgba(15, 23, 42, 0.85)); border: 1px solid rgba(212, 175, 55, 0.3); border-radius: 16px; padding: 18px; display: flex; flex-direction: column; justify-content: space-between;">
          <!-- CABEÇALHO DO FILHO -->
          <div>
            <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 12px;">
              <div style="display: flex; align-items: center; gap: 12px;">
                <div class="avatar-circle" style="width: 48px; height: 48px; font-size: 1.4rem; background: rgba(0,0,0,0.5); border: 2px solid var(--gold);">
                  ${avatarIcon}
                </div>
                <div>
                  <div style="display: flex; align-items: center; gap: 6px;">
                    <strong style="color: #ffffff; font-size: 1.05rem;">${ch.name}</strong>
                  </div>
                  <span style="color: #c084fc; font-size: 0.8rem;">
                    ${ch.hero ? `Herói: ${ch.hero.name} (Nv. ${ch.hero.level})` : 'Aventureiro'}
                  </span>
                </div>
              </div>
              <div style="text-align: right; display: flex; flex-direction: column; align-items: flex-end; gap: 4px;">
                ${rankBadge}
                ${presenceBadge}
              </div>
            </div>

            <!-- BARRA DE CONTRIBUIÇÃO NA CASA -->
            <div style="background: rgba(0,0,0,0.3); border-radius: 10px; padding: 10px 12px; margin-bottom: 14px;">
              <div style="display: flex; justify-content: space-between; font-size: 0.78rem; margin-bottom: 6px;">
                <span style="color: #cbd5e1;">Produtividade no Clã:</span>
                <strong style="color: #fbbf24;">${ch.tasksTotal} missões (${ch.contributionPercent}%)</strong>
              </div>
              <div style="width: 100%; height: 7px; background: rgba(255,255,255,0.08); border-radius: 4px; overflow: hidden;">
                <div style="width: ${ch.contributionPercent}%; height: 100%; background: linear-gradient(90deg, #3b82f6, #fbbf24); border-radius: 4px;"></div>
              </div>
              <div style="display: flex; justify-content: space-between; font-size: 0.72rem; color: var(--text-muted); margin-top: 6px;">
                <span>📅 Esta semana: <strong style="color: #93c5fd;">${ch.tasksWeek}</strong></span>
                <span>🔥 Streak: <strong style="color: #fb923c;">${ch.progress?.current_streak || 0}d</strong></span>
                <span>💰 Ouro: <strong style="color: #fde047;">${ch.hero?.gold || 0}</strong></span>
              </div>
            </div>

            <!-- FOCO DE ÁREAS (QUAIS COISAS FEZ) -->
            <div style="margin-bottom: 14px;">
              <span style="font-size: 0.75rem; color: #cbd5e1; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; display: block; margin-bottom: 6px;">
                🎯 Áreas de Dedicação:
              </span>
              <div style="display: flex; flex-wrap: wrap; gap: 6px;">
                <span style="background: rgba(59,130,246,0.15); border: 1px solid rgba(59,130,246,0.3); color: #93c5fd; padding: 3px 8px; border-radius: 8px; font-size: 0.74rem;">
                  📚 Estudos: <strong>${cats.STUDY || 0}</strong>
                </span>
                <span style="background: rgba(16,185,129,0.15); border: 1px solid rgba(16,185,129,0.3); color: #6ee7b7; padding: 3px 8px; border-radius: 8px; font-size: 0.74rem;">
                  🧹 Casa: <strong>${cats.DOMESTIC || 0}</strong>
                </span>
                <span style="background: rgba(245,158,11,0.15); border: 1px solid rgba(245,158,11,0.3); color: #fde047; padding: 3px 8px; border-radius: 8px; font-size: 0.74rem;">
                  🏃‍♂️ Saúde: <strong>${cats.HEALTH || 0}</strong>
                </span>
                <span style="background: rgba(139,92,246,0.15); border: 1px solid rgba(139,92,246,0.3); color: #c4b5fd; padding: 3px 8px; border-radius: 8px; font-size: 0.74rem;">
                  🎨 Artes: <strong>${cats.CREATIVE || 0}</strong>
                </span>
              </div>
            </div>

            <!-- ÚLTIMAS MISSÕES REALIZADAS (QUEM FEZ O QUÊ) -->
            <div>
              <span style="font-size: 0.75rem; color: #cbd5e1; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; display: block; margin-bottom: 6px;">
                📜 Últimas Missões Concluídas:
              </span>
              <div style="display: flex; flex-direction: column; gap: 6px;">
                ${
                  recentList.length > 0
                    ? recentList
                        .map((t) => {
                          const dateStr = new Date(t.completedAt).toLocaleDateString('pt-BR', {
                            day: '2-digit',
                            month: '2-digit',
                          });
                          return `
                            <div style="background: rgba(0,0,0,0.25); border: 1px solid rgba(255,255,255,0.06); border-radius: 8px; padding: 6px 10px; display: flex; justify-content: space-between; align-items: center; font-size: 0.78rem;">
                              <span style="color: #ffffff; display: flex; align-items: center; gap: 6px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; max-width: 200px;">
                                <span>${t.categoryIcon}</span> ${t.title}
                              </span>
                              <span style="color: var(--text-muted); font-size: 0.7rem; white-space: nowrap;">
                                ${dateStr}
                              </span>
                            </div>
                          `;
                        })
                        .join('')
                    : '<span style="font-size: 0.75rem; color: var(--text-muted); font-style: italic;">Nenhuma missão recente concluída.</span>'
                }
              </div>
            </div>
          </div>
        </div>
      `;
    })
    .join('');
}

function renderCategoryMatrixComparison(categoryMatrix, childrenComparison, totalClanTasks) {
  const container = document.getElementById('clan-comp-matrix-view');
  if (!container) return;

  if (!categoryMatrix || !childrenComparison || childrenComparison.length === 0) {
    container.innerHTML = `<p style="font-size: 0.85rem; color: var(--text-muted);">Carregando matriz comparativa...</p>`;
    return;
  }

  const childHeaders = childrenComparison
    .map(
      (ch) => `
      <th style="padding: 10px 14px; text-align: center; color: #ffffff; font-size: 0.85rem; border-bottom: 2px solid rgba(212,175,55,0.3); white-space: nowrap;">
        <div style="display: flex; flex-direction: column; align-items: center; gap: 4px;">
          <span>⚔️ ${ch.name}</span>
          <span style="font-size: 0.7rem; color: #fbbf24; font-weight: normal;">${ch.tasksTotal} missões (${ch.contributionPercent}%)</span>
        </div>
      </th>
    `
    )
    .join('');

  const rows = categoryMatrix
    .map((row) => {
      const childCells = childrenComparison
        .map((ch) => {
          const childCount = (ch.categories && ch.categories[row.category]) || 0;
          const isLeader = row.leaderName && row.leaderName === ch.name && childCount > 0;
          const bgHighlight = isLeader ? 'background: rgba(245, 158, 11, 0.12);' : '';
          const badge = isLeader ? '<span style="color: #fbbf24; font-size: 0.75rem; margin-left: 4px;">👑</span>' : '';

          return `
            <td style="padding: 10px 14px; text-align: center; font-size: 0.88rem; color: ${childCount > 0 ? '#ffffff' : 'var(--text-muted)'}; border-bottom: 1px solid rgba(255,255,255,0.06); ${bgHighlight}">
              <strong>${childCount}</strong>${badge}
            </td>
          `;
        })
        .join('');

      return `
        <tr style="transition: background 0.2s ease;">
          <td style="padding: 10px 14px; border-bottom: 1px solid rgba(255,255,255,0.06); color: #cbd5e1; font-size: 0.85rem; font-weight: 600; display: flex; align-items: center; gap: 8px;">
            <span style="font-size: 1.1rem;">${row.icon}</span>
            <span>${row.label}</span>
          </td>
          <td style="padding: 10px 14px; text-align: center; font-size: 0.88rem; color: ${row.color}; font-weight: 700; border-bottom: 1px solid rgba(255,255,255,0.06);">
            ${row.totalClan}
          </td>
          ${childCells}
          <td style="padding: 10px 14px; text-align: center; font-size: 0.8rem; color: #fbbf24; border-bottom: 1px solid rgba(255,255,255,0.06); font-weight: 600;">
            ${row.leaderName ? `👑 ${row.leaderName}` : '<span style="color: var(--text-muted);">-</span>'}
          </td>
        </tr>
      `;
    })
    .join('');

  const totalCells = childrenComparison
    .map(
      (ch) => `
      <td style="padding: 12px 14px; text-align: center; font-size: 0.95rem; color: #fde047; font-weight: 800; border-top: 2px solid rgba(212,175,55,0.3); background: rgba(0,0,0,0.3);">
        ${ch.tasksTotal} (${ch.contributionPercent}%)
      </td>
    `
    )
    .join('');

  container.innerHTML = `
    <table style="width: 100%; border-collapse: collapse; min-width: 600px; background: rgba(0,0,0,0.2); border-radius: 12px; overflow: hidden;">
      <thead>
        <tr style="background: rgba(15, 23, 42, 0.9);">
          <th style="padding: 10px 14px; text-align: left; color: var(--text-muted); font-size: 0.78rem; text-transform: uppercase; border-bottom: 2px solid rgba(212,175,55,0.3);">
            Área / Hábito
          </th>
          <th style="padding: 10px 14px; text-align: center; color: var(--text-muted); font-size: 0.78rem; text-transform: uppercase; border-bottom: 2px solid rgba(212,175,55,0.3);">
            Total Clã
          </th>
          ${childHeaders}
          <th style="padding: 10px 14px; text-align: center; color: var(--text-muted); font-size: 0.78rem; text-transform: uppercase; border-bottom: 2px solid rgba(212,175,55,0.3);">
            Destaque na Área
          </th>
        </tr>
      </thead>
      <tbody>
        ${rows}
      </tbody>
      <tfoot>
        <tr style="background: rgba(128, 0, 32, 0.25);">
          <td style="padding: 12px 14px; font-weight: 800; color: #ffffff; font-size: 0.9rem; border-top: 2px solid rgba(212,175,55,0.3);">
            ⭐ TOTAL DE MISSÕES
          </td>
          <td style="padding: 12px 14px; text-align: center; font-size: 1rem; color: #fbbf24; font-weight: 800; border-top: 2px solid rgba(212,175,55,0.3);">
            ${totalClanTasks || 0}
          </td>
          ${totalCells}
          <td style="padding: 12px 14px; text-align: center; font-size: 0.8rem; color: #4ade80; font-weight: 700; border-top: 2px solid rgba(212,175,55,0.3);">
            ✨ Cooperação
          </td>
        </tr>
      </tfoot>
    </table>
  `;
}



// ─────────────────────────────────────────────────────────
// 🔍 VALIDADOR DE PROVAS PENDENTES (AVALIAÇÃO EM TEMPO REAL)
// ─────────────────────────────────────────────────────────
async function loadParentSubmissions() {
  const container = document.getElementById('parent-submissions-list');
  const sidebarBadge = document.getElementById('parent-sidebar-pending-count');
  const navBadge = document.getElementById('parent-nav-pending-badge');
  if (!container) return;

  try {
    const res = await fetch(`${API.tasks}/submissions/pending`, {
      headers: { Authorization: `Bearer ${state.token}` },
    });
    const data = await res.json();

    if (res.ok && data.success) {
      const count = data.count || 0;

      // Atualizar contadores
      if (sidebarBadge) sidebarBadge.innerText = count;
      if (navBadge) {
        navBadge.innerText = count;
        navBadge.style.display = count > 0 ? 'inline-block' : 'none';
      }
      const mobileBadge = document.getElementById('mobile-parent-pending-badge');
      if (mobileBadge) {
        mobileBadge.innerText = count;
        mobileBadge.style.display = count > 0 ? 'inline-block' : 'none';
      }

      if (data.submissions.length === 0) {
        container.innerHTML = `
          <div style="grid-column: 1/-1; background: linear-gradient(135deg, rgba(34, 197, 94, 0.1), rgba(15, 23, 42, 0.7)); border: 1px solid rgba(34, 197, 94, 0.3); border-radius: 18px; padding: 32px; text-align: center;">
            <span style="font-size: 2.8rem; display: block; margin-bottom: 10px;">🎉</span>
            <h3 style="font-size: 1.3rem; color: #ffffff; margin-bottom: 6px;">Tudo em dia!</h3>
            <p style="color: var(--text-muted); font-size: 0.95rem; max-width: 450px; margin: 0 auto;">
              Nenhuma comprovação aguardando aprovação no momento. Quando seus filhos cumprirem missões, as fotos e relatos aparecerão aqui.
            </p>
          </div>
        `;
        return;
      }

      container.innerHTML = data.submissions
        .map((s) => {
          const catMeta = getCategoryMeta(s.task?.category || 'DOMESTIC');
          const timeStr = s.createdAt ? new Date(s.createdAt).toLocaleString([], { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }) : '';
          const heroName = s.character ? s.character.name : 'Aventureiro';
          const avatarIcon = s.character ? getAvatarDisplay(s.character.avatar_value) : '⚔️';

          return `
            <div class="submission-card" id="submission-card-${s.id}">
              
              <!-- Header do Filho -->
              <div class="submission-header">
                <div class="avatar-circle" style="width: 46px; height: 46px; font-size: 1.3rem; border: 2px solid var(--accent); background: rgba(0,0,0,0.5);">
                  ${avatarIcon}
                </div>
                <div style="overflow: hidden; flex: 1;">
                  <strong style="color: #ffffff; font-size: 1.05rem; display: block;">${s.submitter?.name || 'Filho'}</strong>
                  <span style="font-size: 0.8rem; color: #c084fc;">Herói: ${heroName} • 📅 ${timeStr}</span>
                </div>
                <span class="task-category-badge ${catMeta.class}">${catMeta.label}</span>
              </div>

              <!-- Detalhes da Missão -->
              <div style="margin-bottom: 12px;">
                <h4 style="font-size: 1.15rem; color: #ffffff; margin-bottom: 4px;">${s.task?.title}</h4>
                ${s.task?.description ? `<p style="font-size: 0.85rem; color: var(--text-muted); line-height: 1.4;">${s.task.description}</p>` : ''}
              </div>

              <!-- Relato do Filho -->
              ${s.proof_text ? `
                <div style="background: rgba(0,0,0,0.35); border-left: 3px solid var(--gold); padding: 10px 14px; border-radius: 8px; margin-bottom: 12px;">
                  <span style="font-size: 0.75rem; color: #fbbf24; font-weight: 700; display: block; margin-bottom: 2px;">Relato do Filho:</span>
                  <p style="font-size: 0.9rem; color: #f8fafc; font-style: italic; margin: 0;">"${s.proof_text}"</p>
                </div>
              ` : ''}

              <!-- Foto de Evidência -->
              ${s.proof_photo_url ? `
                <div style="margin-bottom: 14px; text-align: center;">
                  <img src="${s.proof_photo_url}" class="submission-photo" alt="Evidência da Missão" onclick="openPhotoLightbox('${s.proof_photo_url}', '${s.task?.title.replace(/'/g, "\\'")}')" title="Clique para ampliar a foto" style="cursor: zoom-in; max-height: 200px; border-radius: 12px; border: 1px solid rgba(212,175,55,0.35); object-fit: cover; width: 100%;">
                  <span style="font-size: 0.72rem; color: #93c5fd; margin-top: 4px; display: block;">🔍 Clique na foto para ver em alta resolução</span>
                </div>
              ` : ''}

              <!-- Recompensas que Serão Liberadas -->
              <div style="background: rgba(15, 23, 42, 0.7); border: 1px solid var(--border-card); border-radius: 10px; padding: 10px 12px; margin-bottom: 14px;">
                <span style="font-size: 0.75rem; color: var(--text-muted); display: block; margin-bottom: 6px;">Liberará para o Herói:</span>
                <div style="display: flex; gap: 8px; flex-wrap: wrap;">
                  <span class="reward-pill-xp">⭐ +${s.task?.xp_reward || 0} XP</span>
                  <span class="reward-pill-gold">💰 +${s.task?.gold_reward || 0} Ouro</span>
                  <span class="reward-pill-energy">⚡ +${s.task?.energy_reward || 1} Energia</span>
                  <span class="reward-pill-tokens">🏠 +${s.task?.token_reward || 10} Fichas</span>
                </div>
              </div>

              <!-- Campo de Feedback dos Pais -->
              <div class="form-group" style="margin-bottom: 12px;">
                <label class="form-label" style="font-size: 0.8rem;" for="feedback-${s.id}">Comentário de Incentivo / Feedback:</label>
                <input type="text" id="feedback-${s.id}" class="form-input" placeholder="Ex: Excelente trabalho! Ficou muito bem organizado." style="font-size: 0.88rem; padding: 10px 12px;">
              </div>

              <!-- Botões de Ação do Guardião -->
              <div style="display: flex; gap: 10px;">
                <button class="btn btn-success" style="flex: 1; padding: 12px; font-weight: 800;" onclick="handleReviewSubmission('${s.id}', 'APPROVED')">
                  ✅ Aprovar Missão
                </button>
                <button class="btn btn-danger" style="flex: 1; padding: 12px; font-weight: 800;" onclick="handleReviewSubmission('${s.id}', 'REJECTED')">
                  ❌ Solicitar Ajuste
                </button>
              </div>

            </div>
          `;
        })
        .join('');
    }
  } catch (err) {
    console.error('Erro ao carregar comprovações pendentes:', err);
  }
}

async function handleReviewSubmission(submissionId, status) {
  const feedbackInput = document.getElementById(`feedback-${submissionId}`);
  const feedback = feedbackInput ? feedbackInput.value.trim() : '';

  if (status === 'REJECTED' && !feedback) {
    showToast('Ao solicitar ajuste, digite um comentário explicando o motivo para seu filho.', 'warning');
    if (feedbackInput) feedbackInput.focus();
    return;
  }

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

    if (status === 'APPROVED') {
      showToast(data.message || '🎉 Missão Aprovada! Recompensas creditadas com sucesso!', 'success');
      if (data.leveledUp) {
        showToast(`🏆 O Herói subiu para o NÍVEL ${data.newLevel}!`, 'gold');
      }
    } else {
      showToast('Missão devolvida com orientações para o filho ajustar.', 'info');
    }

    // Recarregar listas
    await loadParentSubmissions();
    await loadParentReviewedHistory();
    await loadParentFamilyData();
  } catch (err) {
    showToast(err.message, 'error');
  }
}

async function loadParentReviewedHistory(forceShow = false) {
  const container = document.getElementById('parent-reviewed-history-list');
  if (!container) return;

  // Se o usuário optou por manter o histórico oculto (persistente)
  const isHidden = localStorage.getItem('liraquest_hide_reviewed_history') === 'true';
  if (isHidden && !forceShow) {
    container.innerHTML = `
      <div style="background: rgba(15,23,42,0.6); border: 1px dashed rgba(255,255,255,0.15); border-radius: 12px; padding: 20px; text-align: center; color: var(--text-muted); font-size: 0.9rem;">
        🧹 Histórico de avaliações ocultado da tela.
        <div style="margin-top: 10px;">
          <button type="button" class="btn btn-secondary btn-sm" onclick="restoreReviewedHistoryView()">🔄 Reexibir Histórico</button>
        </div>
      </div>
    `;
    return;
  }

  try {
    const res = await fetch(`${API.tasks}/submissions/reviewed`, {
      headers: { Authorization: `Bearer ${state.token}` },
    });
    const data = await res.json();

    if (res.ok && data.success) {
      state.reviewedSubmissions = data.submissions || [];

      if (state.reviewedSubmissions.length === 0) {
        container.innerHTML = '<p style="color: var(--text-muted); font-size: 0.85rem; padding: 12px 0;">Nenhuma avaliação registrada ainda.</p>';
        return;
      }

      container.innerHTML = state.reviewedSubmissions
        .slice(0, 10)
        .map((s) => {
          const isApproved = s.status === 'APPROVED';
          const badgeStatus = isApproved
            ? '<span class="role-badge" style="background: rgba(34,197,94,0.2); color: #4ade80; border: 1px solid rgba(34,197,94,0.4);">✅ Aprovada</span>'
            : '<span class="role-badge" style="background: rgba(239,68,68,0.2); color: #f87171; border: 1px solid rgba(239,68,68,0.4);">❌ Ajustar</span>';

          const dateStr = s.reviewed_at ? new Date(s.reviewed_at).toLocaleDateString([], { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }) : '';
          const hasPhoto = Boolean(s.proof_photo_url);

          return `
            <div class="user-row reviewed-history-row" onclick="openReviewedDetailModal('${s.id}')" title="Clique para ver os detalhes da comprovação" style="background: rgba(15, 23, 42, 0.6); border: 1px solid rgba(255,255,255,0.08); padding: 12px 16px; border-radius: 12px; margin-bottom: 8px; cursor: pointer; transition: all 0.2s ease; display: flex; justify-content: space-between; align-items: center;">
              <div style="flex: 1; padding-right: 12px;">
                <div style="display: flex; align-items: center; gap: 8px; flex-wrap: wrap;">
                  <strong style="color: #ffffff; font-size: 0.95rem;">${s.task?.title || 'Missão'}</strong>
                  ${hasPhoto ? '<span style="font-size: 0.82rem; background: rgba(59,130,246,0.2); color: #93c5fd; border: 1px solid rgba(59,130,246,0.3); padding: 2px 8px; border-radius: 12px;">📸 Com Foto</span>' : ''}
                </div>
                <div style="font-size: 0.8rem; color: var(--text-muted); margin-top: 4px;">
                  Filho: <span style="color: #cbd5e1; font-weight: 600;">${s.submitter?.name || 'Filho'}</span> • ${dateStr}
                </div>
                ${s.feedback ? `<div style="font-size: 0.82rem; color: #cbd5e1; font-style: italic; margin-top: 4px;">💬 "${s.feedback}"</div>` : ''}
              </div>
              <div style="display: flex; align-items: center; gap: 10px;">
                <span class="btn-link" style="font-size: 0.82rem; color: #60a5fa; display: flex; align-items: center; gap: 4px;">
                  👁️ Ver Detalhes
                </span>
                ${badgeStatus}
              </div>
            </div>
          `;
        })
        .join('');
    }
  } catch (err) {
    console.error('Erro ao carregar histórico de avaliações:', err);
  }
}

function openReviewedDetailModal(submissionId) {
  try {
    console.log('🔍 Inspecionando comprovação ID:', submissionId);
    const s = (state.reviewedSubmissions || []).find((item) => String(item.id).toLowerCase() === String(submissionId).toLowerCase());
    if (!s) {
      console.warn('⚠️ Submissão não encontrada:', submissionId, state.reviewedSubmissions);
      showToast('Detalhes da missão não encontrados na lista.', 'warning');
      return;
    }

    const modal = document.getElementById('reviewed-detail-modal');
    if (!modal) {
      console.error('❌ Modal #reviewed-detail-modal não encontrado no DOM!');
      return;
    }

    const titleEl = document.getElementById('reviewed-detail-title');
    const subtitleEl = document.getElementById('reviewed-detail-subtitle');
    const badgeEl = document.getElementById('reviewed-detail-status-badge');
    const photoBoxEl = document.getElementById('reviewed-detail-photo-box');
    const photoEl = document.getElementById('reviewed-detail-photo');
    const proofTextEl = document.getElementById('reviewed-detail-proof-text');
    const xpEl = document.getElementById('reviewed-detail-xp');
    const goldEl = document.getElementById('reviewed-detail-gold');
    const energyEl = document.getElementById('reviewed-detail-energy');
    const feedbackBoxEl = document.getElementById('reviewed-detail-feedback-box');
    const feedbackTextEl = document.getElementById('reviewed-detail-feedback-text');

    if (titleEl) titleEl.innerText = s.task?.title || 'Missão Concluída';

    const dateStr = s.reviewed_at
      ? new Date(s.reviewed_at).toLocaleDateString([], { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })
      : 'Data não informada';
    if (subtitleEl) subtitleEl.innerText = `Filho: ${s.submitter?.name || 'Filho'} • Avaliada em ${dateStr}`;

    const isApproved = s.status === 'APPROVED';
    if (badgeEl) {
      badgeEl.innerText = isApproved ? '✅ Aprovada' : '❌ Ajustar';
      badgeEl.style.background = isApproved ? 'rgba(34,197,94,0.2)' : 'rgba(239,68,68,0.2)';
      badgeEl.style.color = isApproved ? '#4ade80' : '#f87171';
      badgeEl.style.borderColor = isApproved ? 'rgba(34,197,94,0.4)' : 'rgba(239,68,68,0.4)';
    }

    // Foto da Comprovação
    if (s.proof_photo_url && photoBoxEl && photoEl) {
      photoEl.src = s.proof_photo_url;
      photoEl.onerror = () => {
        if (photoBoxEl) photoBoxEl.style.display = 'none';
      };
      photoBoxEl.style.display = 'block';
    } else if (photoBoxEl) {
      photoBoxEl.style.display = 'none';
    }

    // Relato do Filho
    if (proofTextEl) {
      proofTextEl.innerText = s.proof_text || '(Nenhum relato em texto fornecido)';
    }

    // Recompensas
    if (xpEl) xpEl.innerText = `⭐ +${s.task?.xp_reward || 50} XP`;
    if (goldEl) goldEl.innerText = `💰 +${s.task?.gold_reward || 10} Ouro`;
    if (energyEl) energyEl.innerText = `⚡ +${s.task?.energy_reward || 2} Energia`;

    // Parecer do Pai
    if (feedbackBoxEl && feedbackTextEl) {
      if (s.feedback) {
        feedbackTextEl.innerText = `"${s.feedback}"`;
        feedbackBoxEl.style.display = 'block';
      } else {
        feedbackTextEl.innerText = isApproved ? 'Missão aprovada sem comentários adicionais.' : 'Ajustes solicitados sem comentários.';
        feedbackBoxEl.style.display = 'block';
      }
    }

    modal.style.display = 'flex';
  } catch (err) {
    console.error('❌ Erro ao abrir modal de detalhes:', err);
  }
}

function closeReviewedDetailModal() {
  const modal = document.getElementById('reviewed-detail-modal');
  if (modal) modal.style.display = 'none';
}

function clearReviewedHistoryView(e) {
  if (e && typeof e.stopPropagation === 'function') e.stopPropagation();
  localStorage.setItem('liraquest_hide_reviewed_history', 'true');
  const container = document.getElementById('parent-reviewed-history-list');
  if (container) {
    container.innerHTML = `
      <div style="background: rgba(15,23,42,0.6); border: 1px dashed rgba(255,255,255,0.15); border-radius: 12px; padding: 20px; text-align: center; color: var(--text-muted); font-size: 0.9rem;">
        🧹 Histórico de avaliações ocultado da tela.
        <div style="margin-top: 10px;">
          <button type="button" class="btn btn-secondary btn-sm" onclick="restoreReviewedHistoryView()">🔄 Reexibir Histórico</button>
        </div>
      </div>
    `;
  }
  showToast('🧹 Visualização do histórico limpa e salva!', 'info');
}

function restoreReviewedHistoryView() {
  localStorage.removeItem('liraquest_hide_reviewed_history');
  loadParentReviewedHistory(true);
  showToast('📜 Histórico de avaliações reexibido!', 'success');
}

window.openReviewedDetailModal = openReviewedDetailModal;
window.closeReviewedDetailModal = closeReviewedDetailModal;
window.clearReviewedHistoryView = clearReviewedHistoryView;
window.restoreReviewedHistoryView = restoreReviewedHistoryView;

// ========================================================
// 🏪 LOJA DO LAR & RECOMPENSAS DA FAMÍLIA (FILHOS & PAIS)
// ========================================================

state.parentShopSubtab = 'showcase';
state.childShopSubtab = 'showcase';
state.rewardsCatalog = [];

function switchChildShopSubtab(subtab) {
  state.childShopSubtab = subtab;
  const showcaseBtn = document.getElementById('child-subtab-btn-showcase');
  const vouchersBtn = document.getElementById('child-subtab-btn-my-vouchers');
  const showcasePanel = document.getElementById('child-shop-subpanel-showcase');
  const vouchersPanel = document.getElementById('child-shop-subpanel-my-vouchers');

  if (showcaseBtn) showcaseBtn.classList.toggle('active', subtab === 'showcase');
  if (vouchersBtn) vouchersBtn.classList.toggle('active', subtab === 'my-vouchers');

  if (showcasePanel) showcasePanel.style.display = subtab === 'showcase' ? 'block' : 'none';
  if (vouchersPanel) vouchersPanel.style.display = subtab === 'my-vouchers' ? 'block' : 'none';

  if (subtab === 'showcase') loadChildRewardsShop();
  if (subtab === 'my-vouchers') loadChildMyVouchers();
}

function switchParentShopSubtab(subtab) {
  state.parentShopSubtab = subtab;
  const tabs = ['showcase', 'redemptions', 'crud'];

  tabs.forEach((t) => {
    const btn = document.getElementById(`parent-subtab-btn-${t}`);
    const panel = document.getElementById(`parent-shop-subpanel-${t}`);
    if (btn) btn.classList.toggle('active', t === subtab);
    if (panel) panel.style.display = t === subtab ? 'block' : 'none';
  });

  if (subtab === 'showcase') loadParentRewardsShop();
  if (subtab === 'redemptions') loadParentRedemptions();
  if (subtab === 'crud') loadParentRewardsCrud();
}

// ─── CARREGAMENTO DE RECOMPENSAS (FILHO) ────────────────
async function loadChildRewardsShop() {
  const container = document.getElementById('child-shop-rewards-grid');
  const balanceEl = document.getElementById('child-shop-token-balance');
  if (!container) return;

  try {
    const res = await fetch(API.rewards, {
      headers: { Authorization: `Bearer ${state.token}` },
    });
    const data = await res.json();

    if (res.ok && data.success) {
      state.rewardsCatalog = data.rewards || [];
      const balance = data.token_balance || 0;
      if (balanceEl) balanceEl.innerText = balance;

      if (state.rewardsCatalog.length === 0) {
        container.innerHTML = `
          <div style="grid-column: 1/-1; background: rgba(15, 23, 42, 0.6); border: 1px dashed var(--border-card); border-radius: 16px; padding: 32px; text-align: center;">
            <span style="font-size: 2.5rem; display: block; margin-bottom: 8px;">🏪</span>
            <h4 style="color: #ffffff; font-size: 1.1rem; margin-bottom: 6px;">Nenhuma recompensa disponível no momento</h4>
            <p style="color: var(--text-muted); font-size: 0.85rem;">Peça para seus pais cadastrarem recompensas na Loja do Lar!</p>
          </div>
        `;
        return;
      }

      container.innerHTML = state.rewardsCatalog
        .map((r) => {
          const canAfford = balance >= r.token_cost;
          const diff = r.token_cost - balance;

          return `
            <div class="task-card" style="border-color: rgba(245, 158, 11, 0.3); display: flex; flex-direction: column; justify-content: space-between;">
              <div>
                <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 8px;">
                  <span style="font-size: 2rem;">${r.icon || '🎁'}</span>
                  <span class="reward-pill-token" style="font-size: 0.85rem; font-weight: 800;">
                    🎟️ ${r.token_cost} Fichas
                  </span>
                </div>
                <h4 style="font-size: 1.15rem; color: #ffffff; margin-bottom: 6px;">${r.title}</h4>
                <p style="font-size: 0.85rem; color: var(--text-muted); line-height: 1.4; margin-bottom: 14px;">
                  ${r.description || 'Recompensa especial da família.'}
                </p>
              </div>

              <div style="border-top: 1px solid rgba(255,255,255,0.06); padding-top: 12px; margin-top: 10px;">
                ${
                  canAfford
                    ? `
                  <button class="btn btn-gold" style="width: 100%; font-weight: 700;" onclick="openRewardRedeemModal('${r.id}', '${escapeQuotes(r.title)}', '${r.icon}', ${r.token_cost}, '${escapeQuotes(r.description || '')}')">
                    🎟️ Resgatar Vale
                  </button>
                `
                    : `
                  <button class="btn btn-secondary" style="width: 100%; opacity: 0.6; cursor: not-allowed;" disabled>
                    🔒 Faltam ${diff} Ficha(s)
                  </button>
                `
                }
              </div>
            </div>
          `;
        })
        .join('');
    }
  } catch (err) {
    console.error('Erro ao carregar loja de recompensas do filho:', err);
  }
}

// ─── MEUS VALES RESGATADOS (FILHO) ──────────────────────
async function loadChildMyVouchers() {
  const container = document.getElementById('child-shop-vouchers-list');
  if (!container) return;

  try {
    const res = await fetch(`${API.rewards}/redemptions/my`, {
      headers: { Authorization: `Bearer ${state.token}` },
    });
    const data = await res.json();

    if (res.ok && data.success) {
      const list = data.redemptions || [];
      if (list.length === 0) {
        container.innerHTML = `
          <div style="background: rgba(15, 23, 42, 0.6); border: 1px dashed var(--border-card); border-radius: 16px; padding: 32px; text-align: center;">
            <span style="font-size: 2.5rem; display: block; margin-bottom: 8px;">🎟️</span>
            <h4 style="color: #ffffff; font-size: 1.1rem; margin-bottom: 6px;">Você ainda não resgatou nenhum vale</h4>
            <p style="color: var(--text-muted); font-size: 0.85rem;">Cumpra missões diárias para ganhar Fichas do Lar e resgatar prêmios!</p>
          </div>
        `;
        return;
      }

      container.innerHTML = list
        .map((v) => {
          const r = v.reward || {};
          const isPending = v.status === 'PENDING';
          const isApproved = v.status === 'APPROVED';
          const isDelivered = v.status === 'DELIVERED';

          const badge = isPending
            ? '<span class="status-badge" style="background: rgba(245,158,11,0.2); color: #fde047; border: 1px solid rgba(245,158,11,0.4);">⏳ Aguardando Aprovação</span>'
            : isApproved
            ? '<span class="status-badge" style="background: rgba(34,197,94,0.2); color: #4ade80; border: 1px solid rgba(34,197,94,0.4);">✅ Vale Aprovado • Pronto para Uso</span>'
            : isDelivered
            ? '<span class="status-badge" style="background: rgba(59,130,246,0.2); color: #93c5fd; border: 1px solid rgba(59,130,246,0.4);">🎉 Utilizado / Entregue</span>'
            : '<span class="status-badge" style="background: rgba(239,68,68,0.2); color: #fca5a5; border: 1px solid rgba(239,68,68,0.4);">❌ Cancelado (Fichas Estornadas)</span>';

          const dateStr = new Date(v.created_at || v.createdAt).toLocaleDateString('pt-BR');

          return `
            <div style="background: rgba(15, 23, 42, 0.7); border: 1px solid var(--border-card); border-radius: 14px; padding: 18px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 14px;">
              <div style="display: flex; align-items: center; gap: 16px;">
                <span style="font-size: 2.2rem;">${r.icon || '🎁'}</span>
                <div>
                  <h4 style="font-size: 1.15rem; color: #ffffff; margin: 0 0 4px 0;">${r.title || 'Vale Recompensa'}</h4>
                  <span style="font-size: 0.82rem; color: var(--text-muted);">Resgatado em ${dateStr} por <strong>${v.token_cost} Fichas</strong></span>
                  ${v.notes ? `<p style="font-size: 0.8rem; color: #cbd5e1; margin: 4px 0 0 0;">💬 "${v.notes}"</p>` : ''}
                </div>
              </div>
              <div>${badge}</div>
            </div>
          `;
        })
        .join('');
    }
  } catch (err) {
    console.error('Erro ao carregar vales do filho:', err);
  }
}

// ─── CARREGAMENTO DE RECOMPENSAS (PAI) ──────────────────
async function loadParentRewardsShop() {
  const container = document.getElementById('parent-shop-rewards-grid');
  const balanceEl = document.getElementById('parent-shop-token-balance');
  if (!container) return;

  try {
    const res = await fetch(API.rewards, {
      headers: { Authorization: `Bearer ${state.token}` },
    });
    const data = await res.json();

    if (res.ok && data.success) {
      state.rewardsCatalog = data.rewards || [];
      const balance = data.token_balance || 0;
      if (balanceEl) balanceEl.innerText = balance;

      if (state.rewardsCatalog.length === 0) {
        container.innerHTML = `
          <div style="grid-column: 1/-1; background: rgba(15, 23, 42, 0.6); border: 1px dashed var(--border-card); border-radius: 16px; padding: 32px; text-align: center;">
            <span style="font-size: 2.5rem; display: block; margin-bottom: 8px;">🏪</span>
            <h4 style="color: #ffffff; font-size: 1.1rem; margin-bottom: 6px;">Nenhuma recompensa cadastrada</h4>
            <button class="btn btn-primary btn-sm" onclick="openCreateRewardModal()" style="margin-top: 10px;">➕ Cadastrar Primeira Recompensa</button>
          </div>
        `;
        return;
      }

      container.innerHTML = state.rewardsCatalog
        .filter((r) => r.is_active)
        .map((r) => {
          const canAfford = balance >= r.token_cost;
          return `
            <div class="task-card" style="border-color: rgba(245, 158, 11, 0.3); display: flex; flex-direction: column; justify-content: space-between;">
              <div>
                <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 8px;">
                  <span style="font-size: 2rem;">${r.icon || '🎁'}</span>
                  <span class="reward-pill-token" style="font-size: 0.85rem; font-weight: 800;">
                    🎟️ ${r.token_cost} Fichas
                  </span>
                </div>
                <h4 style="font-size: 1.15rem; color: #ffffff; margin-bottom: 6px;">${r.title}</h4>
                <p style="font-size: 0.85rem; color: var(--text-muted); line-height: 1.4; margin-bottom: 14px;">
                  ${r.description || 'Recompensa da família.'}
                </p>
              </div>

              <div style="border-top: 1px solid rgba(255,255,255,0.06); padding-top: 12px; margin-top: 10px;">
                ${
                  canAfford
                    ? `
                  <button class="btn btn-gold" style="width: 100%; font-weight: 700;" onclick="openRewardRedeemModal('${r.id}', '${escapeQuotes(r.title)}', '${r.icon}', ${r.token_cost}, '${escapeQuotes(r.description || '')}')">
                    🎟️ Resgatar Vale do Guardião
                  </button>
                `
                    : `
                  <button class="btn btn-secondary" style="width: 100%; opacity: 0.6; cursor: not-allowed;" disabled>
                    🔒 Custa ${r.token_cost} Fichas
                  </button>
                `
                }
              </div>
            </div>
          `;
        })
        .join('');
    }
  } catch (err) {
    console.error('Erro ao carregar loja dos pais:', err);
  }
}

// ─── RESGATES PENDENTES DO CLÃ (PAI) ────────────────────
async function loadParentRedemptions() {
  const container = document.getElementById('parent-shop-redemptions-list');
  const badge = document.getElementById('parent-shop-pending-redemptions-badge');
  const navBadge = document.getElementById('parent-nav-shop-badge');
  if (!container) return;

  try {
    const res = await fetch(`${API.rewards}/redemptions/family`, {
      headers: { Authorization: `Bearer ${state.token}` },
    });
    const data = await res.json();

    if (res.ok && data.success) {
      const list = data.redemptions || [];
      const pendingCount = list.filter((r) => r.status === 'PENDING').length;

      if (badge) {
        badge.innerText = pendingCount;
        badge.style.display = pendingCount > 0 ? 'inline-block' : 'none';
      }
      if (navBadge) {
        navBadge.innerText = pendingCount;
        navBadge.style.display = pendingCount > 0 ? 'inline-block' : 'none';
      }
      const mobileShopBadge = document.getElementById('mobile-parent-shop-badge');
      if (mobileShopBadge) {
        mobileShopBadge.innerText = pendingCount;
        mobileShopBadge.style.display = pendingCount > 0 ? 'inline-block' : 'none';
      }

      if (list.length === 0) {
        container.innerHTML = `
          <div style="background: rgba(15, 23, 42, 0.6); border: 1px dashed var(--border-card); border-radius: 16px; padding: 32px; text-align: center;">
            <span style="font-size: 2.5rem; display: block; margin-bottom: 8px;">📥</span>
            <h4 style="color: #ffffff; font-size: 1.1rem; margin-bottom: 6px;">Nenhum resgate pendente no momento</h4>
            <p style="color: var(--text-muted); font-size: 0.85rem;">Quando os membros da família resgatarem vales na Loja do Lar, os pedidos aparecerão aqui.</p>
          </div>
        `;
        return;
      }

      container.innerHTML = list
        .map((v) => {
          const r = v.reward || {};
          const u = v.user || {};
          const isPending = v.status === 'PENDING';
          const isApproved = v.status === 'APPROVED';
          const isDelivered = v.status === 'DELIVERED';

          const dateStr = new Date(v.created_at || v.createdAt).toLocaleDateString('pt-BR');

          return `
            <div style="background: rgba(15, 23, 42, 0.7); border: 1px solid var(--border-card); border-radius: 14px; padding: 18px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 14px;">
              <div style="display: flex; align-items: center; gap: 16px;">
                <span style="font-size: 2.2rem;">${r.icon || '🎁'}</span>
                <div>
                  <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 4px;">
                    <strong style="color: #ffffff; font-size: 1.1rem;">${r.title || 'Vale Recompensa'}</strong>
                    <span class="role-badge" style="font-size: 0.72rem;">${u.name || 'Membro'}</span>
                  </div>
                  <span style="font-size: 0.82rem; color: var(--text-muted);">
                    Solicitado por <strong>${u.name}</strong> • <strong>${v.token_cost} Fichas</strong> • Data: ${dateStr}
                  </span>
                </div>
              </div>

              <div style="display: flex; align-items: center; gap: 8px;">
                ${
                  isPending
                    ? `
                  <button class="btn btn-success btn-sm" onclick="handleReviewRedemption('${v.id}', 'APPROVED')">
                    ✅ Aprovar Vale
                  </button>
                  <button class="btn btn-danger btn-sm" onclick="handleReviewRedemption('${v.id}', 'CANCELLED')">
                    ❌ Cancelar & Estornar
                  </button>
                `
                    : isApproved
                    ? `
                  <span class="status-badge" style="background: rgba(34,197,94,0.2); color: #4ade80; border: 1px solid rgba(34,197,94,0.4);">
                    ✅ Aprovado
                  </span>
                  <button class="btn btn-primary btn-sm" onclick="handleReviewRedemption('${v.id}', 'DELIVERED')">
                    🎉 Marcar como Entregue
                  </button>
                `
                    : isDelivered
                    ? `
                  <span class="status-badge" style="background: rgba(59,130,246,0.2); color: #93c5fd; border: 1px solid rgba(59,130,246,0.4);">
                    🎉 Entregue
                  </span>
                `
                    : `
                  <span class="status-badge" style="background: rgba(239,68,68,0.2); color: #fca5a5; border: 1px solid rgba(239,68,68,0.4);">
                    ❌ Cancelado
                  </span>
                `
                }
              </div>
            </div>
          `;
        })
        .join('');
    }
  } catch (err) {
    console.error('Erro ao carregar resgates do clã:', err);
  }
}

// ─── CRUD DE RECOMPENSAS (PAI) ──────────────────────────
async function loadParentRewardsCrud() {
  const container = document.getElementById('parent-shop-crud-list');
  if (!container) return;

  try {
    const res = await fetch(API.rewards, {
      headers: { Authorization: `Bearer ${state.token}` },
    });
    const data = await res.json();

    if (res.ok && data.success) {
      state.rewardsCatalog = data.rewards || [];

      if (state.rewardsCatalog.length === 0) {
        container.innerHTML = `
          <div style="background: rgba(15, 23, 42, 0.6); border: 1px dashed var(--border-card); border-radius: 16px; padding: 32px; text-align: center;">
            <span style="font-size: 2.5rem; display: block; margin-bottom: 8px;">⚙️</span>
            <h4 style="color: #ffffff; font-size: 1.1rem; margin-bottom: 6px;">Nenhuma recompensa cadastrada</h4>
            <button class="btn btn-primary btn-sm" onclick="openCreateRewardModal()" style="margin-top: 10px;">➕ Cadastrar Recompensa</button>
          </div>
        `;
        return;
      }

      container.innerHTML = state.rewardsCatalog
        .map((r) => {
          return `
            <div style="background: rgba(15, 23, 42, 0.7); border: 1px solid var(--border-card); border-radius: 14px; padding: 16px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px;">
              <div style="display: flex; align-items: center; gap: 14px;">
                <span style="font-size: 2rem;">${r.icon || '🎁'}</span>
                <div>
                  <div style="display: flex; align-items: center; gap: 8px;">
                    <strong style="color: #ffffff; font-size: 1.05rem;">${r.title}</strong>
                    <span class="role-badge" style="font-size: 0.75rem;">🎟️ ${r.token_cost} Fichas</span>
                    ${!r.is_active ? '<span style="background: rgba(239,68,68,0.2); color: #fca5a5; font-size: 0.72rem; padding: 2px 6px; border-radius: 6px;">Pausada</span>' : ''}
                  </div>
                  <span style="font-size: 0.8rem; color: var(--text-muted);">${r.description || 'Sem descrição.'}</span>
                </div>
              </div>

              <div style="display: flex; gap: 6px;">
                <button class="btn btn-secondary btn-sm" onclick="openEditRewardModal('${r.id}')">✏️ Editar</button>
                <button class="btn btn-secondary btn-sm" onclick="handleToggleReward('${r.id}')">${r.is_active ? '⏸️ Pausar' : '▶️ Ativar'}</button>
                <button class="btn btn-danger btn-sm" onclick="handleDeleteReward('${r.id}')">🗑️</button>
              </div>
            </div>
          `;
        })
        .join('');
    }
  } catch (err) {
    console.error('Erro ao carregar lista de gestão de recompensas:', err);
  }
}

// ─── AÇÕES & MODAIS DE RESGATE E CRUD ───────────────────
function openRewardRedeemModal(rewardId, title, icon, cost, desc) {
  const targetInput = document.getElementById('reward-redeem-target-id');
  const titleEl = document.getElementById('reward-redeem-title');
  const iconEl = document.getElementById('reward-redeem-icon');
  const costEl = document.getElementById('reward-redeem-cost');
  const descEl = document.getElementById('reward-redeem-desc');

  if (targetInput) targetInput.value = rewardId;
  if (titleEl) titleEl.innerText = title;
  if (iconEl) iconEl.innerText = icon || '🎁';
  if (costEl) costEl.innerText = cost;
  if (descEl) descEl.innerText = desc || 'Você deseja resgatar este vale utilizando suas Fichas do Lar?';

  const modal = document.getElementById('reward-redeem-modal');
  if (modal) modal.style.display = 'flex';
}

function closeRewardRedeemModal() {
  const modal = document.getElementById('reward-redeem-modal');
  if (modal) modal.style.display = 'none';
}

async function handleConfirmRedeem() {
  const rewardId = document.getElementById('reward-redeem-target-id')?.value;
  const btn = document.getElementById('btn-confirm-redeem');
  if (!rewardId) return;

  if (btn) {
    btn.disabled = true;
    btn.innerText = 'Resgatando...';
  }

  try {
    const res = await fetch(`${API.rewards}/${rewardId}/redeem`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${state.token}`,
      },
    });

    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.message || 'Erro ao resgatar recompensa.');
    }

    closeRewardRedeemModal();
    showToast(data.message, 'success');

    // Recarregar loja e saldo
    if (state.user?.role === 'PARENT') {
      loadParentRewardsShop();
    } else {
      loadChildRewardsShop();
      loadChildHeroDashboard();
    }
  } catch (err) {
    showToast(err.message, 'error');
  } finally {
    if (btn) {
      btn.disabled = false;
      btn.innerText = '🎟️ Confirmar Resgate';
    }
  }
}

function openCreateRewardModal() {
  const idEl = document.getElementById('reward-crud-id');
  const modalTitle = document.getElementById('reward-crud-modal-title');
  const titleEl = document.getElementById('reward-crud-title');
  const descEl = document.getElementById('reward-crud-desc');
  const costEl = document.getElementById('reward-crud-cost');
  const catEl = document.getElementById('reward-crud-category');
  const iconEl = document.getElementById('reward-crud-icon');
  const profEl = document.getElementById('reward-crud-profile');

  if (idEl) idEl.value = '';
  if (modalTitle) modalTitle.innerText = '🎁 Nova Recompensa da Família';
  if (titleEl) titleEl.value = '';
  if (descEl) descEl.value = '';
  if (costEl) costEl.value = '25';
  if (catEl) catEl.value = 'ENTERTAINMENT';
  if (iconEl) iconEl.value = '🎁';
  if (profEl) profEl.value = 'ALL';

  const modal = document.getElementById('reward-crud-modal');
  if (modal) modal.style.display = 'flex';
}

function openEditRewardModal(rewardId) {
  const reward = state.rewardsCatalog.find((r) => r.id === rewardId);
  if (!reward) return;

  const idEl = document.getElementById('reward-crud-id');
  const modalTitle = document.getElementById('reward-crud-modal-title');
  const titleEl = document.getElementById('reward-crud-title');
  const descEl = document.getElementById('reward-crud-desc');
  const costEl = document.getElementById('reward-crud-cost');
  const catEl = document.getElementById('reward-crud-category');
  const iconEl = document.getElementById('reward-crud-icon');
  const profEl = document.getElementById('reward-crud-profile');

  if (idEl) idEl.value = reward.id;
  if (modalTitle) modalTitle.innerText = '✏️ Editar Recompensa';
  if (titleEl) titleEl.value = reward.title;
  if (descEl) descEl.value = reward.description || '';
  if (costEl) costEl.value = reward.token_cost;
  if (catEl) catEl.value = reward.category;
  if (iconEl) iconEl.value = reward.icon || '🎁';
  if (profEl) profEl.value = reward.allowed_profile || 'ALL';

  const modal = document.getElementById('reward-crud-modal');
  if (modal) modal.style.display = 'flex';
}

function closeRewardCrudModal() {
  const modal = document.getElementById('reward-crud-modal');
  if (modal) modal.style.display = 'none';
}

async function handleSaveRewardCrud(e) {
  e?.preventDefault();
  const rewardId = document.getElementById('reward-crud-id')?.value;
  const title = document.getElementById('reward-crud-title')?.value.trim();
  const description = document.getElementById('reward-crud-desc')?.value.trim();
  const token_cost = parseInt(document.getElementById('reward-crud-cost')?.value, 10) || 20;
  const category = document.getElementById('reward-crud-category')?.value;
  const icon = document.getElementById('reward-crud-icon')?.value.trim() || '🎁';
  const allowed_profile = document.getElementById('reward-crud-profile')?.value || 'ALL';

  const isEdit = Boolean(rewardId);
  const url = isEdit ? `${API.rewards}/${rewardId}` : API.rewards;
  const method = isEdit ? 'PUT' : 'POST';

  try {
    const res = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${state.token}`,
      },
      body: JSON.stringify({ title, description, token_cost, category, icon, allowed_profile }),
    });

    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.message || 'Erro ao salvar recompensa.');
    }

    closeRewardCrudModal();
    showToast(data.message, 'success');
    loadParentRewardsShop();
    loadParentRewardsCrud();
  } catch (err) {
    showToast(err.message, 'error');
  }
}

async function handleToggleReward(rewardId) {
  try {
    const res = await fetch(`${API.rewards}/${rewardId}/toggle`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${state.token}` },
    });
    const data = await res.json();
    if (!res.ok || !data.success) throw new Error(data.message);

    showToast(data.message, 'success');
    loadParentRewardsCrud();
    loadParentRewardsShop();
  } catch (err) {
    showToast(err.message, 'error');
  }
}

async function handleDeleteReward(rewardId) {
  if (!confirm('Tem certeza que deseja excluir esta recompensa da Loja do Lar?')) return;

  try {
    const res = await fetch(`${API.rewards}/${rewardId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${state.token}` },
    });
    const data = await res.json();
    if (!res.ok || !data.success) throw new Error(data.message);

    showToast('Recompensa excluída com sucesso!', 'success');
    loadParentRewardsCrud();
    loadParentRewardsShop();
  } catch (err) {
    showToast(err.message, 'error');
  }
}

async function handleReviewRedemption(redemptionId, status) {
  try {
    const res = await fetch(`${API.rewards}/redemptions/${redemptionId}/review`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${state.token}`,
      },
      body: JSON.stringify({ status }),
    });

    const data = await res.json();
    if (!res.ok || !data.success) throw new Error(data.message);

    showToast(data.message, 'success');
    loadParentRedemptions();
  } catch (err) {
    showToast(err.message, 'error');
  }
}

// ─────────────────────────────────────────────────────────
// 📋 CRUD COMPLETO DE MISSÕES (GESTÃO DE MISSÕES DA CASA)
// ─────────────────────────────────────────────────────────
async function loadParentTasks() {
  const container = document.getElementById('parent-tasks-list');
  const sidebarCount = document.getElementById('parent-sidebar-tasks-count');
  if (!container) return;

  try {
    const res = await fetch(`${API.tasks}?include_inactive=true`, {
      headers: { Authorization: `Bearer ${state.token}` },
    });
    const data = await res.json();

    if (res.ok && data.success) {
      state.parentTasksList = data.tasks || [];
      if (sidebarCount) sidebarCount.innerText = state.parentTasksList.filter((t) => t.is_active).length;

      renderParentTasksFiltered();
    }
  } catch (err) {
    console.error('Erro ao carregar tarefas dos pais:', err);
  }
}

function filterParentTasks(category, btnElement) {
  state.parentSelectedCategoryFilter = category;
  document.querySelectorAll('.parent-task-filter').forEach((b) => b.classList.remove('active'));
  if (btnElement) btnElement.classList.add('active');
  renderParentTasksFiltered();
}

function renderParentTasksFiltered() {
  const container = document.getElementById('parent-tasks-list');
  if (!container) return;

  let list = state.parentTasksList || [];
  if (state.parentSelectedCategoryFilter !== 'ALL') {
    list = list.filter((t) => t.category === state.parentSelectedCategoryFilter);
  }

  if (list.length === 0) {
    container.innerHTML = `
      <div style="grid-column: 1/-1; background: rgba(15, 23, 42, 0.6); border: 1px dashed var(--border-card); border-radius: 16px; padding: 32px; text-align: center;">
        <span style="font-size: 2.5rem; display: block; margin-bottom: 8px;">📋</span>
        <h4 style="color: #ffffff; font-size: 1.1rem; margin-bottom: 6px;">Nenhuma missão encontrada</h4>
        <p style="color: var(--text-muted); font-size: 0.85rem; max-width: 400px; margin: 0 auto 16px auto;">
          Clique no botão abaixo para lançar uma nova tarefa para a família!
        </p>
        <button class="btn btn-primary btn-sm" onclick="openTaskCrudModal()">➕ Lançar Nova Missão</button>
      </div>
    `;
    return;
  }

  container.innerHTML = list
    .map((t) => {
      const catMeta = getCategoryMeta(t.category);
      const diffMeta = getDifficultyMeta(t.difficulty || 'MEDIUM');
      const isActive = t.is_active !== false;

      return `
        <div class="task-card" style="opacity: ${isActive ? '1' : '0.65'}; border-color: ${isActive ? 'var(--border-card)' : 'rgba(239, 68, 68, 0.3)'};">
          <div>
            <div style="display: flex; justify-content: space-between; align-items: center; gap: 8px; margin-bottom: 10px; flex-wrap: wrap;">
              <span class="task-category-badge ${catMeta.class}">${catMeta.label}</span>
              <div style="display: flex; align-items: center; gap: 6px;">
                <span class="task-diff-badge ${diffMeta.class}">${diffMeta.label}</span>
                <span class="role-badge" style="background: ${isActive ? 'rgba(34,197,94,0.15)' : 'rgba(239,68,68,0.15)'}; color: ${isActive ? '#4ade80' : '#f87171'}; font-size: 0.7rem;">
                  ${isActive ? '🟢 Ativa' : '⏸️ Pausada'}
                </span>
              </div>
            </div>

            <h4 class="task-title">${t.title}</h4>
            <p class="task-desc">${t.description || 'Sem instruções adicionais.'}</p>
          </div>

          <div>
            <!-- Recompensas -->
            <div class="task-rewards-row" style="flex-wrap: wrap; gap: 6px; margin: 12px 0 14px 0;">
              <span class="reward-pill-xp">⭐ +${t.xp_reward || 0} XP</span>
              <span class="reward-pill-gold">💰 +${t.gold_reward || 0} Ouro</span>
              <span class="reward-pill-energy">⚡ +${t.energy_reward || 1} Energia</span>
              <span class="reward-pill-tokens">🏠 +${t.token_reward || 10} Fichas</span>
            </div>

            <!-- Tempo & Foto -->
            <div style="font-size: 0.75rem; color: var(--text-muted); display: flex; justify-content: space-between; margin-bottom: 12px;">
              <span>⏱️ ${t.estimated_time || '15-20 min'}</span>
              <span>${t.requires_proof ? '📷 Exige foto' : '📝 Apenas relato'}</span>
            </div>

            <!-- Barra de Ações do CRUD -->
            <div style="display: flex; gap: 6px; border-top: 1px solid rgba(255,255,255,0.06); padding-top: 10px;">
              <button class="btn btn-secondary btn-sm" style="flex: 1; padding: 6px 8px; font-size: 0.8rem;" onclick="openTaskCrudModal('${t.id}')">
                ✏️ Editar
              </button>
              <button class="btn btn-secondary btn-sm" style="padding: 6px 10px; font-size: 0.8rem; border-color: ${isActive ? 'rgba(245,158,11,0.4)' : 'rgba(34,197,94,0.4)'};" onclick="handleToggleTaskActive('${t.id}')" title="${isActive ? 'Pausar Missão' : 'Ativar Missão'}">
                ${isActive ? '⏸️ Pausar' : '▶️ Ativar'}
              </button>
              <button class="btn btn-danger btn-sm" style="padding: 6px 10px; font-size: 0.8rem;" onclick="handleDeleteTask('${t.id}')" title="Excluir Missão">
                🗑️
              </button>
            </div>
          </div>
        </div>
      `;
    })
    .join('');
}

// ─────────────────────────────────────────────────────────
// MODAL CRUD DE MISSÃO (CRIAR E EDITAR)
// ─────────────────────────────────────────────────────────
function openTaskCrudModal(taskId) {
  const modal = document.getElementById('task-crud-modal');
  const titleEl = document.getElementById('task-crud-modal-title');
  const idInput = document.getElementById('task-crud-id');
  const titleInput = document.getElementById('task-crud-title');
  const descInput = document.getElementById('task-crud-desc');
  const catInput = document.getElementById('task-crud-category');
  const diffInput = document.getElementById('task-crud-difficulty');
  const xpInput = document.getElementById('task-crud-xp');
  const goldInput = document.getElementById('task-crud-gold');
  const energyInput = document.getElementById('task-crud-energy');
  const tokensInput = document.getElementById('task-crud-tokens');
  const timeInput = document.getElementById('task-crud-time');
  const proofInput = document.getElementById('task-crud-proof');

  if (!modal) return;

  if (taskId) {
    const task = (state.parentTasksList || []).find((t) => t.id === taskId);
    if (!task) return;

    if (titleEl) titleEl.innerText = '✏️ Editar Missão Familiar';
    if (idInput) idInput.value = task.id;
    if (titleInput) titleInput.value = task.title;
    if (descInput) descInput.value = task.description || '';
    if (catInput) catInput.value = task.category || 'DOMESTIC';
    if (diffInput) diffInput.value = task.difficulty || 'MEDIUM';
    if (xpInput) xpInput.value = task.xp_reward || 50;
    if (goldInput) goldInput.value = task.gold_reward || 15;
    if (energyInput) energyInput.value = task.energy_reward || 2;
    if (tokensInput) tokensInput.value = task.token_reward || 15;
    if (timeInput) timeInput.value = task.estimated_time || '15-20 min';
    if (proofInput) proofInput.checked = task.requires_proof !== false;
  } else {
    if (titleEl) titleEl.innerText = '📋 Lançar Nova Missão Familiar';
    if (idInput) idInput.value = '';
    if (titleInput) titleInput.value = '';
    if (descInput) descInput.value = '';
    if (catInput) catInput.value = 'DOMESTIC';
    if (diffInput) diffInput.value = 'MEDIUM';
    if (xpInput) xpInput.value = '50';
    if (goldInput) goldInput.value = '15';
    if (energyInput) energyInput.value = '2';
    if (tokensInput) tokensInput.value = '15';
    if (timeInput) timeInput.value = '15-20 min';
    if (proofInput) proofInput.checked = true;
  }

  modal.style.display = 'flex';
}

function closeTaskCrudModal() {
  const modal = document.getElementById('task-crud-modal');
  if (modal) modal.style.display = 'none';
}

async function handleSaveTaskCrud(e) {
  e?.preventDefault();
  const id = document.getElementById('task-crud-id')?.value;
  const title = document.getElementById('task-crud-title')?.value.trim();
  const description = document.getElementById('task-crud-desc')?.value.trim();
  const category = document.getElementById('task-crud-category')?.value;
  const difficulty = document.getElementById('task-crud-difficulty')?.value;
  const xp_reward = Number(document.getElementById('task-crud-xp')?.value) || 50;
  const gold_reward = Number(document.getElementById('task-crud-gold')?.value) || 15;
  const energy_reward = Number(document.getElementById('task-crud-energy')?.value) || 2;
  const token_reward = Number(document.getElementById('task-crud-tokens')?.value) || 15;
  const estimated_time = document.getElementById('task-crud-time')?.value.trim() || '15-20 min';
  const requires_proof = document.getElementById('task-crud-proof')?.checked;
  const btn = document.getElementById('btn-save-task-crud');

  if (!title) {
    showToast('Informe o título da missão.', 'warning');
    return;
  }

  btn.disabled = true;
  btn.innerText = 'Salvando...';

  try {
    const isEdit = Boolean(id);
    const url = isEdit ? `${API.tasks}/${id}` : `${API.tasks}`;
    const method = isEdit ? 'PUT' : 'POST';

    const res = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${state.token}`,
      },
      body: JSON.stringify({
        title,
        description,
        category,
        difficulty,
        xp_reward,
        gold_reward,
        energy_reward,
        token_reward,
        estimated_time,
        requires_proof,
      }),
    });

    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.message || 'Erro ao salvar missão.');
    }

    showToast(data.message || '✨ Missão salva com sucesso!', 'success');
    closeTaskCrudModal();
    await loadParentTasks();
  } catch (err) {
    showToast(err.message, 'error');
  } finally {
    btn.disabled = false;
    btn.innerText = '✨ Salvar Missão no Mural';
  }
}

async function handleToggleTaskActive(taskId) {
  try {
    const res = await fetch(`${API.tasks}/${taskId}/toggle`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${state.token}` },
    });
    const data = await res.json();

    if (!res.ok || !data.success) {
      throw new Error(data.message || 'Erro ao alterar status da missão.');
    }

    showToast(data.message, 'success');
    await loadParentTasks();
  } catch (err) {
    showToast(err.message, 'error');
  }
}

async function handleDeleteTask(taskId) {
  const task = (state.parentTasksList || []).find((t) => t.id === taskId);
  const taskTitle = task ? task.title : 'esta missão';

  if (!confirm(`Tem certeza que deseja excluir a missão "${taskTitle}" do mural da família?`)) {
    return;
  }

  try {
    const res = await fetch(`${API.tasks}/${taskId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${state.token}` },
    });
    const data = await res.json();

    if (!res.ok || !data.success) {
      throw new Error(data.message || 'Erro ao excluir missão.');
    }

    showToast(data.message, 'success');
    await loadParentTasks();
  } catch (err) {
    showToast(err.message, 'error');
  }
}

// ─────────────────────────────────────────────────────────
// 📷 LIGHTBOX DE ZOOM DE FOTO
// ─────────────────────────────────────────────────────────
function openPhotoLightbox(url, title) {
  const modal = document.getElementById('photo-lightbox-modal');
  const img = document.getElementById('lightbox-img');
  const titleEl = document.getElementById('lightbox-title');

  if (img) img.src = url;
  if (titleEl && title) titleEl.innerText = `Evidência: ${title}`;
  if (modal) modal.style.display = 'flex';
}

function closePhotoLightbox() {
  const modal = document.getElementById('photo-lightbox-modal');
  if (modal) modal.style.display = 'none';
}

// ─────────────────────────────────────────────────────────
// 👤 PERFIL REAL DO GUARDIÃO
// ─────────────────────────────────────────────────────────
function renderParentProfileInfo() {
  if (!state.user) return;

  // Atualizar Sidebar do Pai
  const sideName = document.getElementById('parent-user-name');
  const sideEmail = document.getElementById('parent-user-email');
  const sidePhotoImg = document.getElementById('parent-sidebar-photo-img');
  const sidePhotoPlaceholder = document.getElementById('parent-sidebar-photo-placeholder');

  if (sideName) sideName.innerText = state.user.name;
  if (sideEmail) sideEmail.innerText = state.user.email;

  if (state.user.profile_photo_url) {
    if (sidePhotoImg) {
      sidePhotoImg.src = state.user.profile_photo_url;
      sidePhotoImg.style.display = 'block';
    }
    if (sidePhotoPlaceholder) sidePhotoPlaceholder.style.display = 'none';
  } else {
    if (sidePhotoImg) sidePhotoImg.style.display = 'none';
    if (sidePhotoPlaceholder) sidePhotoPlaceholder.style.display = 'block';
  }

  // Atualizar Card 1: Ficha Pessoal na Aba Meu Perfil
  const infoName = document.getElementById('info-parent-name');
  const infoEmail = document.getElementById('info-parent-email');
  const infoPhone = document.getElementById('info-parent-phone');
  const infoWork = document.getElementById('info-parent-work');
  const profPhotoImg = document.getElementById('parent-profile-photo-img');
  const profPhotoPlaceholder = document.getElementById('parent-profile-photo-placeholder');

  if (infoName) infoName.innerText = state.user.name || 'Guardião Sidney';
  if (infoEmail) infoEmail.innerText = state.user.email || 'pai@liraquest.com';
  if (infoPhone) infoPhone.innerText = state.user.phone || 'Não informado';
  if (infoWork) infoWork.innerText = state.user.school_or_work || 'Não informado';

  if (state.user.profile_photo_url) {
    if (profPhotoImg) {
      profPhotoImg.src = state.user.profile_photo_url;
      profPhotoImg.style.display = 'block';
    }
    if (profPhotoPlaceholder) profPhotoPlaceholder.style.display = 'none';
  } else {
    if (profPhotoImg) profPhotoImg.style.display = 'none';
    if (profPhotoPlaceholder) profPhotoPlaceholder.style.display = 'block';
  }

  // Preencher Inputs do Modal de Edição
  const modalName = document.getElementById('parent-modal-real-name');
  const modalPhone = document.getElementById('parent-modal-real-phone');
  const modalWork = document.getElementById('parent-modal-real-work');
  const modalPhoto = document.getElementById('parent-modal-real-photo');

  if (modalName) modalName.value = state.user.name || '';
  if (modalPhone) modalPhone.value = state.user.phone || '';
  if (modalWork) modalWork.value = state.user.school_or_work || '';
  if (modalPhoto) modalPhoto.value = state.user.profile_photo_url || '';
}

function openParentEditProfileModal() {
  renderParentProfileInfo();
  const modal = document.getElementById('parent-edit-profile-modal');
  if (modal) modal.style.display = 'flex';
}

function closeParentEditProfileModal() {
  const modal = document.getElementById('parent-edit-profile-modal');
  if (modal) modal.style.display = 'none';
}

async function handleDirectParentPhotoUpload(e) {
  const file = e.target.files?.[0];
  if (!file) return;

  if (file.size > 5 * 1024 * 1024) {
    showToast('A imagem deve ter no máximo 5MB.', 'warning');
    return;
  }

  const statusEl = document.getElementById('parent-direct-upload-status');
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
    renderParentProfileInfo();
    updateNavbar();
    showToast('Foto do Guardião atualizada com sucesso!', 'success');
  } catch (err) {
    showToast(err.message, 'error');
  } finally {
    if (statusEl) statusEl.innerText = '';
    e.target.value = '';
  }
}

async function handleParentModalPhotoUpload(e) {
  const file = e.target.files?.[0];
  if (!file) return;

  if (file.size > 5 * 1024 * 1024) {
    showToast('A imagem deve ter no máximo 5MB.', 'warning');
    return;
  }

  const loadingEl = document.getElementById('parent-modal-upload-loading');
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

    const photoInput = document.getElementById('parent-modal-real-photo');
    if (photoInput) photoInput.value = data.url;

    state.user = data.user;
    localStorage.setItem('liraquest_user', JSON.stringify(data.user));
    renderParentProfileInfo();
    updateNavbar();
    showToast('Foto carregada com sucesso!', 'success');
  } catch (err) {
    showToast(err.message, 'error');
  } finally {
    if (loadingEl) loadingEl.style.display = 'none';
    e.target.value = '';
  }
}

async function handleSaveParentRealProfile(e) {
  e?.preventDefault();
  const name = document.getElementById('parent-modal-real-name')?.value.trim();
  const phone = document.getElementById('parent-modal-real-phone')?.value.trim();
  const school_or_work = document.getElementById('parent-modal-real-work')?.value.trim();
  const profile_photo_url = document.getElementById('parent-modal-real-photo')?.value.trim();

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
      throw new Error(data.message || 'Erro ao atualizar perfil do Guardião.');
    }

    state.user = data.user;
    localStorage.setItem('liraquest_user', JSON.stringify(data.user));
    closeParentEditProfileModal();
    renderParentProfileInfo();
    updateNavbar();
    showToast('Dados do Guardião atualizados com sucesso!', 'success');
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

  const parentProfileForm = document.getElementById('parent-modal-profile-form') || document.getElementById('parent-real-profile-form');
  if (parentProfileForm) parentProfileForm.addEventListener('submit', handleSaveParentRealProfile);

  const taskCrudForm = document.getElementById('task-crud-form');
  if (taskCrudForm) taskCrudForm.addEventListener('submit', handleSaveTaskCrud);

  const rewardCrudForm = document.getElementById('reward-crud-form');
  if (rewardCrudForm) rewardCrudForm.addEventListener('submit', handleSaveRewardCrud);

  const createTaskForm = document.getElementById('create-task-form');
  if (createTaskForm) createTaskForm.addEventListener('submit', handleCreateTask);

  const submitProofForm = document.getElementById('submit-proof-form');
  if (submitProofForm) submitProofForm.addEventListener('submit', handleSubmitProof);
});

// Funções Globais de Abertura das Arenas do Arcade
window.openArcherGameArena = function() {
  try { localStorage.setItem('liraquest_avatar_tab', 'arcade'); } catch(e) {}
  window.location.href = '/archer.html';
};

window.openDuelGameArena = function() {
  try { localStorage.setItem('liraquest_avatar_tab', 'arcade'); } catch(e) {}
  window.location.href = '/duel.html';
};

window.openDungeonGameArena = function() {
  try { localStorage.setItem('liraquest_avatar_tab', 'arcade'); } catch(e) {}
  window.location.href = '/dungeon.html';
};


