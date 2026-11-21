/**
 * MARVEL ZOMBIES - MOTOR UNIVERSAL DE CAMPANHA INVESTIGATIVA RPG
 * Conectado ao MySQL (/api/zombi/campaign & /api/zombi/state)
 */

let campaignData = null;
let currentMissionNumber = 1;
let isZombieMode = false;

// Estado em memória sincronizado com o banco de dados
let campaignState = {
  missions: {}, // { [missionNumber]: { completedTokens: [], flags: [] } }
  legacy_items: [],
};

let activeTokenObj = null;
let activeActionObj = null;
let keypadBuffer = '';

// ================= SINTETIZADOR DE ÁUDIO NATIVO (WEB AUDIO API) =================
let audioCtx = null;
function playTone(freq = 600, duration = 0.08) {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    if (!audioCtx) audioCtx = new AudioContext();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
    gain.gain.setValueAtTime(0.12, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration);
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start();
    osc.stop(audioCtx.currentTime + duration);
  } catch (_) {}
}

function soundSuccess() {
  playTone(523, 0.09);
  setTimeout(() => playTone(659, 0.09), 90);
  setTimeout(() => playTone(784, 0.18), 180);
}

function soundError() {
  playTone(220, 0.18);
  setTimeout(() => playTone(165, 0.25), 140);
}

// Prefixo de API inteligente: se aberto via arquivo local (file://), conecta no localhost:3000
const API_BASE = window.location.protocol === 'file:' ? 'http://localhost:3000' : '';

// ================= CARREGAMENTO INICIAL DO BANCO DE DADOS =================
async function loadCampaignFromDB() {
  const syncBadge = document.getElementById('syncStatus');
  try {
    syncBadge.textContent = '🔄 Sincronizando MySQL...';
    const res = await fetch(`${API_BASE}/api/zombi/campaign`);
    const data = await res.json();

    if (!data.success || !data.campaign) {
      throw new Error(data.message || 'Campanha não encontrada');
    }

    campaignData = data.campaign;
    currentMissionNumber = campaignData.current_mission_number || 1;
    isZombieMode = campaignData.active_mode === 'ZOMBIE';

    if (campaignData.campaign_state && typeof campaignData.campaign_state === 'object') {
      campaignState = {
        missions: campaignData.campaign_state.missions || {},
        legacy_items: campaignData.campaign_state.legacy_items || [],
      };
    }

    document.body.classList.toggle('zombie-mode', isZombieMode);
    syncBadge.textContent = '🟢 Banco MySQL Sincronizado';
    renderAll();
  } catch (err) {
    console.error('Erro ao carregar do banco:', err);
    syncBadge.textContent = '⚠️ Modo Offline / Local';
  }
}

async function persistStateToDB() {
  const syncBadge = document.getElementById('syncStatus');
  try {
    syncBadge.textContent = '💾 Salvando no MySQL...';
    const res = await fetch(`${API_BASE}/api/zombi/state`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        current_mission_number: currentMissionNumber,
        active_mode: isZombieMode ? 'ZOMBIE' : 'HERO',
        campaign_state: campaignState,
      }),
    });
    if (res.ok) {
      syncBadge.textContent = '🟢 Salvo no MySQL';
    }
  } catch (e) {
    syncBadge.textContent = '⚠️ Salvo Localmente';
  }
}

function getMissionProgress(missionNum) {
  if (!campaignState.missions[missionNum]) {
    campaignState.missions[missionNum] = {
      completedTokens: [],
      flags: [],
    };
  }
  return campaignState.missions[missionNum];
}

function getCurrentMission() {
  if (!campaignData || !campaignData.missions) return null;
  return (
    campaignData.missions.find((m) => m.mission_number === currentMissionNumber) ||
    campaignData.missions[0]
  );
}

// ================= RENDERIZAÇÃO COMPLETA DA INTERFACE =================
function renderAll() {
  if (!campaignData) return;

  // 1. Botão de Modo (Heróis Vivos vs Heróis Zumbis)
  const modeIcon = document.getElementById('modeIcon');
  const modeName = document.getElementById('modeName');
  if (isZombieMode) {
    modeIcon.innerText = '🧟';
    modeName.innerText = 'Modo: Heróis Zumbis';
  } else {
    modeIcon.innerText = '🛡️';
    modeName.innerText = 'Modo: Heróis Vivos';
  }

  // 2. Barra dos 5 Capítulos
  const chaptersBar = document.getElementById('chaptersBar');
  chaptersBar.innerHTML = campaignData.missions
    .map((m) => {
      const mProg = getMissionProgress(m.mission_number);
      const isDone = mProg.flags.includes('mission_complete');
      const isActive = m.mission_number === currentMissionNumber;
      const shortTitle = m.title.replace(/^CAPÍTULO \d+:\s*/i, '');
      return `
        <button class="chapter-tab ${isActive ? 'active' : ''} ${isDone ? 'completed' : ''}"
                onclick="selectMission(${m.mission_number})">
          <div class="ch-tab-num">
            <span>CAPÍTULO ${m.mission_number}</span>
            <span>${isDone ? '✓' : ''}</span>
          </div>
          <div class="ch-tab-name">${shortTitle}</div>
        </button>
      `;
    })
    .join('');

  // 3. Cabeçalho da Missão Atual
  const mission = getCurrentMission();
  if (!mission) return;

  const prog = getMissionProgress(mission.mission_number);

  document.getElementById('missionTag').textContent = `${campaignData.title} • Ato ${mission.mission_number} de ${campaignData.missions.length}`;
  document.getElementById('missionMapBadge').textContent = `Mapa Oficial: ${mission.rulebook_map_code}`;
  document.getElementById('missionTitle').textContent = mission.title;
  document.getElementById('missionLocation').textContent = `📍 ${mission.location_name}`;
  document.getElementById('loreMission').textContent = isZombieMode
    ? mission.lore_zombie
    : mission.lore_hero;

  document.getElementById('tilesInline').textContent = `Tiles: ${mission.tiles_needed}`;
  document.getElementById('setupNotesText').innerHTML = `<strong>Tiles Necessários:</strong> ${mission.tiles_needed}<br>${mission.setup_notes || ''}`;

  const btnViewMap = document.getElementById('btnViewMap');
  if (mission.map_image_url) {
    btnViewMap.style.display = 'inline-block';
  } else {
    btnViewMap.style.display = 'none';
  }

  // 4. Painel de Pistas & Inventário do Capítulo
  const invGroup = document.getElementById('inventoryGroup');
  const badges = Array.isArray(mission.inventory_badges) ? mission.inventory_badges : [];
  invGroup.innerHTML =
    `<span class="inv-label">Pistas & Requisitos:</span>` +
    badges
      .map((b) => {
        const acquired = prog.flags.includes(b.key);
        return `<span class="inv-badge ${acquired ? 'acquired' : ''}">${b.label}</span>`;
      })
      .join('');

  document.getElementById('progressCounter').textContent = `${prog.completedTokens.length} / ${mission.tokens.length} Tokens Concluídos`;

  // 5. Grelha dos 6 Tokens
  const grid = document.getElementById('tokensGrid');
  grid.innerHTML = mission.tokens
    .map((token) => {
      const isCompleted = prog.completedTokens.includes(token.token_number);
      const reqs = Array.isArray(token.requires_flags) ? token.requires_flags : [];
      const allReqsMet = reqs.every((flag) => prog.flags.includes(flag));
      const isLocked = !isCompleted && token.initial_status === 'LOCKED' && !allReqsMet;

      let cardStateClass = '';
      let badgeClass = 'badge-open';
      let badgeText = 'Disponível';
      let btnText = `🔍 ${token.unlock_action_label || 'Investigar Token ' + token.token_number}`;
      let btnDisabled = '';

      if (isCompleted) {
        cardStateClass = 'cleared';
        badgeClass = 'badge-done';
        badgeText = 'Concluído';
        btnText = '✓ Investigado';
        btnDisabled = 'disabled';
      } else if (isLocked) {
        cardStateClass = 'locked';
        badgeClass = 'badge-locked';
        badgeText = 'Bloqueado';
        btnText = '🔒 Acesso Trancado';
        btnDisabled = 'disabled';
      } else if (token.initial_status === 'LOCKED' && allReqsMet) {
        badgeClass = 'badge-open';
        badgeText = 'Liberado!';
        btnText = `🔓 ${token.unlock_action_label || 'Acessar Token ' + token.token_number}`;
      }

      const desc = isZombieMode ? token.room_desc_zombie : token.room_desc_hero;

      const cropBannerHtml = token.crop_image_url
        ? `<div class="token-crop-banner"><img src="${token.crop_image_url}" alt="${token.title}"></div>`
        : '';

      let bannerHtml = '';
      if (isLocked && token.lock_banner_text) {
        bannerHtml = `<div class="req-banner">${token.lock_banner_text}</div>`;
      } else if (!isCompleted && token.token_number === 4) {
        bannerHtml = `<div class="req-banner risk-banner">🎲 <strong>Alto Risco (Push Your Luck):</strong> Opcional. Pode conceder bônus valiosos ou disparar armadilha!</div>`;
      }

      return `
        <article class="token-card ${cardStateClass}">
          <div class="card-top">
            <div class="card-top-left">
              <div class="token-pill">${token.token_number}</div>
              <div>
                <span class="token-role-label">${token.token_role}</span>
                <span class="token-tile-loc">${token.tile_location || ''}</span>
              </div>
            </div>
            <span class="token-state-badge ${badgeClass}">${badgeText}</span>
          </div>
          ${cropBannerHtml}
          <div class="card-content">
            <div>
              <h3 class="room-title">${token.title}</h3>
              <p class="room-desc">${desc}</p>
              ${bannerHtml}
            </div>
            <button class="card-btn" onclick="openTokenModal(${token.token_number})" ${btnDisabled}>
              ${btnText}
            </button>
          </div>
        </article>
      `;
    })
    .join('');

  // 6. Banner de Vitória do Capítulo
  const victoryBanner = document.getElementById('chapterVictoryBanner');
  const isMissionComplete = prog.flags.includes('mission_complete');
  if (isMissionComplete) {
    victoryBanner.style.display = 'flex';
    const btnNext = document.getElementById('btnNextChapter');
    if (currentMissionNumber < campaignData.missions.length) {
      btnNext.style.display = 'inline-block';
      btnNext.textContent = `Ir para o Capítulo ${currentMissionNumber + 1} ➔`;
    } else {
      btnNext.style.display = 'none';
    }
  } else {
    victoryBanner.style.display = 'none';
  }
}

// ================= AÇÕES DE NAVEGAÇÃO E MODO =================
function toggleHeroMode() {
  isZombieMode = !isZombieMode;
  document.body.classList.toggle('zombie-mode', isZombieMode);
  playTone(440, 0.08);
  renderAll();
  persistStateToDB();
}

function selectMission(missionNum) {
  currentMissionNumber = Number(missionNum);
  playTone(520, 0.06);
  renderAll();
  persistStateToDB();
}

function goToNextMission() {
  if (campaignData && currentMissionNumber < campaignData.missions.length) {
    selectMission(currentMissionNumber + 1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}

function toggleSetupBox() {
  const body = document.getElementById('setupDrawerBody');
  const arrow = document.getElementById('setupArrow');
  if (body.style.display === 'none') {
    body.style.display = 'block';
    arrow.textContent = '▲';
  } else {
    body.style.display = 'none';
    arrow.textContent = '▼';
  }
}

// ================= INTERAÇÃO COM MODAL DO TOKEN =================
function openTokenModal(tokenNumber) {
  const mission = getCurrentMission();
  if (!mission) return;

  const token = mission.tokens.find((t) => t.token_number === tokenNumber);
  if (!token) return;

  activeTokenObj = token;
  playTone(600, 0.06);

  document.getElementById('mRoleTag').textContent = `${token.token_role} • ${token.tile_location || ''}`;
  document.getElementById('mTitle').textContent = `TOKEN ${token.token_number}: ${token.title}`;
  document.getElementById('mLore').textContent = isZombieMode
    ? token.modal_lore_zombie
    : token.modal_lore_hero;

  const mChoices = document.getElementById('mChoices');
  const mDiceBox = document.getElementById('mDiceBox');
  const mKeypadBox = document.getElementById('mKeypadBox');
  const mResolution = document.getElementById('mResolution');
  const mCancelBtn = document.getElementById('mCancelBtn');

  mDiceBox.style.display = 'none';
  mKeypadBox.style.display = 'none';
  mResolution.style.display = 'none';
  mChoices.style.display = 'flex';
  mCancelBtn.style.display = 'block';
  mChoices.innerHTML = '';

  const actions = Array.isArray(token.actions_json) ? token.actions_json : [];
  actions.forEach((act) => {
    const btn = document.createElement('div');
    btn.className = 'choice-option';
    const actTitle = isZombieMode ? act.title_zombie || act.title_hero : act.title_hero;
    btn.innerHTML = `
      <div class="choice-title">${actTitle}</div>
      <div class="choice-subtitle">${act.subtitle || ''}</div>
    `;
    btn.onclick = () => triggerTokenAction(act);
    mChoices.appendChild(btn);
  });

  document.getElementById('modalInvestigate').classList.add('visible');
}

function triggerTokenAction(action) {
  activeActionObj = action;
  document.getElementById('mChoices').style.display = 'none';
  document.getElementById('mCancelBtn').style.display = 'none';

  if (action.type === 'direct') {
    applyActionGrants(action, true);
    const title = isZombieMode
      ? action.outcome_title_zombie || action.outcome_title_hero
      : action.outcome_title_hero;
    const desc = isZombieMode
      ? action.outcome_desc_zombie || action.outcome_desc_hero
      : action.outcome_desc_hero;
    showOutcomeBox(title, desc);
  } else if (action.type === 'dice') {
    document.getElementById('mDiceBox').style.display = 'block';
    document.getElementById('mDiceResult').textContent = '-';
    document.getElementById('mDiceCritique').textContent = 'Role 1d6 ou clique no botão do dado da mesa.';
  } else if (action.type === 'keypad') {
    keypadBuffer = '';
    updateKeypadUI();
    document.getElementById('keypadFeedback').textContent = 'Digite a senha de 3 dígitos...';
    document.getElementById('keypadFeedback').style.color = '#94a3b8';
    document.getElementById('mKeypadBox').style.display = 'block';
  }
}

// ================= DESAFIO DE DADOS 1D6 =================
function rollChallengeDice() {
  const resElem = document.getElementById('mDiceResult');
  let count = 0;
  const timer = setInterval(() => {
    const val = Math.floor(Math.random() * 6) + 1;
    resElem.textContent = val;
    playTone(400 + val * 60, 0.04);
    count++;
    if (count > 8) {
      clearInterval(timer);
      resolveDiceValue(val);
    }
  }, 55);
}

function resolveDiceValue(val) {
  if (!activeActionObj || !activeActionObj.dice_outcomes) return;

  document.getElementById('mDiceResult').textContent = val;
  document.getElementById('mDiceCritique').textContent = `Resultado final: ${val}`;

  let tier = 'low';
  if (val >= 4) tier = 'high';
  else if (val >= 2) tier = 'mid';

  const outcome = activeActionObj.dice_outcomes[tier];
  applyActionGrants(activeActionObj, true);

  const desc = isZombieMode
    ? outcome.desc_zombie || outcome.desc_hero
    : outcome.desc_hero;

  showOutcomeBox(outcome.title, desc, tier !== 'low');
}

// ================= TECLADO NUMÉRICO (KEYPAD) =================
function pressKeypad(digit) {
  if (keypadBuffer.length < 3) {
    keypadBuffer += digit;
    playTone(650 + keypadBuffer.length * 90, 0.05);
    updateKeypadUI();
  }
}

function clearKeypad() {
  keypadBuffer = '';
  playTone(320, 0.06);
  updateKeypadUI();
}

function updateKeypadUI() {
  const disp = document.getElementById('keypadDisplay');
  const chars = keypadBuffer.split('');
  disp.textContent = [chars[0] || '_', chars[1] || '_', chars[2] || '_'].join(' ');
}

function submitKeypad() {
  if (!activeActionObj) return;
  const expected = String(activeActionObj.keypad_code || '').trim();

  if (keypadBuffer === expected) {
    document.getElementById('mKeypadBox').style.display = 'none';
    applyActionGrants(activeActionObj, true);
    const title = isZombieMode
      ? activeActionObj.outcome_title_zombie || activeActionObj.outcome_title_hero
      : activeActionObj.outcome_title_hero;
    const desc = isZombieMode
      ? activeActionObj.outcome_desc_zombie || activeActionObj.outcome_desc_hero
      : activeActionObj.outcome_desc_hero;
    showOutcomeBox(title, desc, true);
  } else {
    soundError();
    const fb = document.getElementById('keypadFeedback');
    fb.textContent = '❌ SENHA INCORRETA! Verifique as pistas obtidas no capítulo!';
    fb.style.color = '#ef4444';
    keypadBuffer = '';
    setTimeout(updateKeypadUI, 600);
  }
}

// ================= APLICAÇÃO DE RECOMPENSAS E FLAGS =================
function applyActionGrants(action, markTokenCleared = true) {
  const mission = getCurrentMission();
  if (!mission || !activeTokenObj) return;

  const prog = getMissionProgress(mission.mission_number);

  // Adicionar flags concedidas pela ação
  if (Array.isArray(action.grants_flags)) {
    action.grants_flags.forEach((f) => {
      if (!prog.flags.includes(f)) {
        prog.flags.push(f);
      }
    });
  }

  // Marcar token como concluído (se for a ação principal ou se não for apenas ação secundária sem flag em token com múltiplas ações)
  const isMainAction =
    (Array.isArray(action.grants_flags) && action.grants_flags.length > 0) ||
    activeTokenObj.token_number === 4;

  if (markTokenCleared && isMainAction) {
    if (!prog.completedTokens.includes(activeTokenObj.token_number)) {
      prog.completedTokens.push(activeTokenObj.token_number);
    }
  }

  renderAll();
  persistStateToDB();
}

function showOutcomeBox(title, desc, isGood = true) {
  if (isGood) soundSuccess();
  else soundError();

  const box = document.getElementById('mResolution');
  document.getElementById('mOutcomeTitle').textContent = title;
  document.getElementById('mOutcomeDesc').innerHTML = desc;
  box.style.display = 'block';
}

function closeModal() {
  document.getElementById('modalInvestigate').classList.remove('visible');
}

// ================= MODAIS AUXILIARES E RESET =================
function openPremiseModal() {
  if (!campaignData) return;
  document.getElementById('pTitle').textContent = campaignData.title;
  document.getElementById('pHeroText').textContent = campaignData.premise_hero;
  document.getElementById('pZombieText').textContent = campaignData.premise_zombie;
  document.getElementById('modalPremise').classList.add('visible');
}

function closePremiseModal() {
  document.getElementById('modalPremise').classList.remove('visible');
}

function openMapModal() {
  const mission = getCurrentMission();
  if (!mission || !mission.map_image_url) return;
  document.getElementById('mapModalTitle').textContent = `Mapa Oficial - ${mission.rulebook_map_code}`;
  document.getElementById('mapModalImg').src = mission.map_image_url;
  document.getElementById('modalMap').classList.add('visible');
}

function closeMapModal() {
  document.getElementById('modalMap').classList.remove('visible');
}

async function resetCurrentMission() {
  if (!confirm(`Deseja reiniciar a investigação do Capítulo ${currentMissionNumber}?`)) {
    return;
  }
  campaignState.missions[currentMissionNumber] = {
    completedTokens: [],
    flags: [],
  };
  renderAll();
  await persistStateToDB();
}

// Inicializar ao abrir a página
window.addEventListener('DOMContentLoaded', loadCampaignFromDB);
