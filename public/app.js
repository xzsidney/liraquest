// LiraQuest - Client-Side App & RPG State Management (Fase 2)

const API = {
  auth: '/api/auth',
  catalog: '/api/catalog',
  family: '/api/family',
  character: '/api/character',
};

const state = {
  token: localStorage.getItem('liraquest_token') || null,
  user: JSON.parse(localStorage.getItem('liraquest_user') || 'null'),
  currentRoute: 'home',
  character: null,
  classesCatalog: [],
  attributesCatalog: [],
  familyData: null,
  selectedWizardAvatar: 'hero_warrior',
  selectedWizardClassId: null,
  selectedSwitchClassId: null,
  childActiveTab: 'game',
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

  const views = ['home', 'register', 'login', 'admin', 'parent', 'child'];
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
}

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
// 4. DASHBOARD DO FILHO (PAINEL DO HERÓI)
// ========================================================
function switchChildTab(tab) {
  state.childActiveTab = tab;
  const btnGame = document.getElementById('tab-btn-game');
  const btnReal = document.getElementById('tab-btn-real');
  const tabGame = document.getElementById('child-tab-game');
  const tabReal = document.getElementById('child-tab-real');

  if (tab === 'game') {
    btnGame.classList.add('active');
    btnReal.classList.remove('active');
    tabGame.style.display = 'block';
    tabReal.style.display = 'none';
  } else {
    btnReal.classList.add('active');
    btnGame.classList.remove('active');
    tabReal.style.display = 'block';
    tabGame.style.display = 'none';
  }
}

async function loadChildDashboard() {
  if (!state.user || !state.token) return;

  document.getElementById('child-user-name').innerText = state.user.name;
  document.getElementById('child-user-email').innerText = state.user.email;

  // Carregar Catálogo se ainda não carregou
  if (state.classesCatalog.length === 0) {
    await fetchCatalogs();
  }

  // Preencher formulário de perfil do mundo real
  document.getElementById('child-real-name').value = state.user.name || '';
  document.getElementById('child-real-phone').value = state.user.phone || '';
  document.getElementById('child-real-school').value = state.user.school_or_work || '';
  document.getElementById('child-real-photo').value = state.user.profile_photo_url || '';

  // Carregar dados de família do filho
  loadChildFamilyData();

  // Carregar dados do Personagem
  await loadCharacterData();
}

async function loadCharacterData() {
  try {
    const res = await fetch(`${API.character}/me`, {
      headers: { Authorization: `Bearer ${state.token}` },
    });
    const data = await res.json();

    if (res.ok && data.success) {
      if (data.hasCharacter && data.character) {
        state.character = data.character;
        renderHeroHUD(data.character);
        document.getElementById('child-no-hero-view').style.display = 'none';
        document.getElementById('child-has-hero-view').style.display = 'block';
      } else {
        state.character = null;
        document.getElementById('child-no-hero-view').style.display = 'block';
        document.getElementById('child-has-hero-view').style.display = 'none';
      }
    }
  } catch (err) {
    console.error('Erro ao consultar personagem:', err);
    showToast('Erro ao carregar dados do herói.', 'error');
  }
}

function renderHeroHUD(char) {
  // Avatar
  const avatarBox = document.getElementById('hero-hud-avatar');
  const avatarObj = AVATAR_OPTIONS.find((a) => a.key === char.avatar_value);
  avatarBox.innerText = avatarObj ? avatarObj.icon : '⚔️';

  // Nome e Classe
  document.getElementById('hero-hud-name').innerText = char.name;
  document.getElementById('hero-hud-class').innerText = char.current_class ? char.current_class.name : 'Aventureiro';
  
  // Nível da classe ativa
  const currentClassProgress = char.classes_progress?.find((cp) => cp.class_id === char.current_class_id);
  const currentLevel = currentClassProgress ? currentClassProgress.level : 1;
  const currentXP = currentClassProgress ? currentClassProgress.xp : 0;
  const requiredXP = currentLevel * 100;

  document.getElementById('hero-hud-level').innerText = `Nível ${currentLevel}`;
  document.getElementById('hero-hud-xp-text').innerText = `${currentXP} / ${requiredXP} XP`;
  
  const xpPercent = Math.min(100, Math.round((currentXP / requiredXP) * 100));
  document.getElementById('hero-hud-xp-fill').style.width = `${Math.max(5, xpPercent)}%`;

  // Ouro
  document.getElementById('hero-hud-gold').innerText = `💰 ${char.gold} Ouro`;

  // 6 Atributos
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

  // Renderizar opções de avatares
  const avatarGrid = document.getElementById('wizard-avatar-grid');
  avatarGrid.innerHTML = AVATAR_OPTIONS.map(
    (av) => `
      <div class="avatar-option ${state.selectedWizardAvatar === av.key ? 'selected' : ''}" onclick="selectWizardAvatar('${av.key}')">
        <span class="avatar-option-icon">${av.icon}</span>
        <span class="avatar-option-label">${av.label}</span>
      </div>
    `
  ).join('');

  // Renderizar opções de classes
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
  avatarGrid.querySelectorAll('.avatar-option').forEach((el) => {
    el.classList.remove('selected');
  });
  event.currentTarget.classList.add('selected');
}

function selectWizardClass(classId) {
  state.selectedWizardClassId = classId;
  const classesGrid = document.getElementById('wizard-classes-grid');
  classesGrid.querySelectorAll('.class-choice-card').forEach((el) => {
    el.classList.remove('selected');
  });
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
  const nameInput = document.getElementById('wizard-hero-name');
  const genderSelect = document.getElementById('wizard-hero-gender');
  const btnSubmit = document.getElementById('btn-create-hero-submit');

  const name = nameInput.value.trim();
  const gender = genderSelect.value;
  const avatar_value = state.selectedWizardAvatar;
  const initial_class_id = state.selectedWizardClassId;

  if (!name) {
    showToast('Informe o nome do seu herói.', 'warning');
    return;
  }

  if (!initial_class_id) {
    showToast('Selecione uma classe inicial.', 'warning');
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
      body: JSON.stringify({
        name,
        gender,
        avatar_type: 'SPRITE',
        avatar_value,
        initial_class_id,
      }),
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
// 7. GESTÃO DE PERFIL REAL & FAMÍLIA
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
    updateNavbar();
    showToast('Dados do mundo real salvos com sucesso!', 'success');
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

// ========================================================
// 8. DASHBOARD DOS PAIS & ADMIN
// ========================================================
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
    } else {
      nameEl.innerText = 'Não cadastrada';
      codeEl.innerText = '--';
      countEl.innerText = '0';
      if (setupBox) setupBox.style.display = 'block';
    }
  } catch (err) {
    console.error('Erro ao consultar família do pai:', err);
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
// 9. TOASTS / NOTIFICAÇÕES
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
// 10. INICIALIZAÇÃO DA APLICAÇÃO
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
});
