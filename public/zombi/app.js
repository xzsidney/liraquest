/**
 * MARVEL ZOMBIES - COMPANHEIRO DE CAMPANHA RPG
 * Script Interativo (Áudio, Enigmas, Teclado Numérico, Dependências)
 */

// ESTADO DO JOGO
const state = {
  chapter: 1,
  completedObjs: new Set(),
  alarmTriggered: false,
  inventory: [],
  discoveredCode: false, // Se encontrou a senha no Obj 1
  keypadInput: '',
  secretCode: '739', // Código para abrir a porta do metrô
};

// ================= SISTEMA DE ÁUDIO SINTETIZADO (WEB AUDIO API) =================
let audioCtx = null;

function initAudio() {
  if (!audioCtx) {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (AudioContext) {
      audioCtx = new AudioContext();
    }
  }
}

// Som de Bipe do Teclado Numérico
function playBeep(freq = 600, duration = 0.08) {
  try {
    initAudio();
    if (!audioCtx) return;
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
    gain.gain.setValueAtTime(0.15, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration);
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start();
    osc.stop(audioCtx.currentTime + duration);
  } catch (e) {
    console.log('Audio não suportado ou bloqueado', e);
  }
}

// Som de Acesso Permitido
function playGrantedSound() {
  playBeep(523, 0.1);
  setTimeout(() => playBeep(659, 0.1), 100);
  setTimeout(() => playBeep(784, 0.2), 200);
}

// Som de Acesso Negado (Erro)
function playDeniedSound() {
  playBeep(220, 0.2);
  setTimeout(() => playBeep(180, 0.3), 150);
}

// Som de Sirene de Alarme
function playAlarmSound() {
  playBeep(880, 0.15);
  setTimeout(() => playBeep(600, 0.2), 150);
  setTimeout(() => playBeep(880, 0.2), 350);
}

// ================= SETUP DO TABULEIRO =================
function toggleSetup() {
  const content = document.getElementById('setup-content');
  const icon = document.getElementById('setup-toggle-icon');
  if (content.style.display === 'block') {
    content.style.display = 'none';
    icon.textContent = '▼';
  } else {
    content.style.display = 'block';
    icon.textContent = '▲';
  }
}

function openMapModal() {
  document.getElementById('map-modal').classList.add('active');
}

function closeMapModal() {
  document.getElementById('map-modal').classList.remove('active');
}

// ================= MODAL DE HISTÓRIA / EVENTO =================
function openStoryModal(tag, title, text, interactiveHtml) {
  document.getElementById('modal-tag').textContent = tag;
  document.getElementById('modal-title').textContent = title;
  document.getElementById('modal-text').innerHTML = text;
  document.getElementById('modal-interactive-slot').innerHTML = interactiveHtml || '';
  document.getElementById('result-banner').style.display = 'none';
  document.getElementById('story-modal').classList.add('active');
}

function closeStoryModal() {
  document.getElementById('story-modal').classList.remove('active');
  updateHUD();
}

function showResult(title, desc, isSuccess = true) {
  const banner = document.getElementById('result-banner');
  const titleEl = document.getElementById('result-title');
  const descEl = document.getElementById('result-desc');

  banner.className = 'result-banner ' + (isSuccess ? 'success' : 'danger');
  titleEl.textContent = title;
  descEl.innerHTML = desc;
  banner.style.display = 'block';
  document.getElementById('modal-interactive-slot').innerHTML = '';

  if (isSuccess) {
    playGrantedSound();
  } else {
    playDeniedSound();
  }
}

// ================= INTERAÇÃO COM OS OBJETIVOS =================
function interactObjective(id) {
  initAudio();

  // OBJETIVO 1: TERMINAL OSCORP (REVELA SENHA)
  if (id === 1) {
    const text = `
      Ao quebrar a porta do escritório dos fundos, as telas verdes da Oscorp ainda mostram linhas de comando da S.H.I.E.L.D.
      <br><br>
      Há um arquivo criptografado de evacuação: <em>"Acesso de Quarentena da Linha 6 do Metrô"</em>.
      <br><br>
      Você pode tentar usar o intelecto corrompido de Tony Stark ou o instinto de rastreio para decifrar a chave!
    `;

    const html = `
      <div style="background: #0f121b; border: 1px dashed var(--gold-imperial); border-radius: 8px; padding: 14px; text-align: center; margin-top: 10px;">
        <strong style="color: var(--gold-bright);">🎲 TESTE DE INTELIGÊNCIA / DADOS:</strong>
        <p style="font-size: 0.85rem; margin-top: 4px; color: var(--text-secondary);">Role 1 dado pelo Herói Zumbi interagindo:</p>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-top: 12px;">
          <button class="btn-action" style="background: #334155;" onclick="resolveObj1(false)">
            ❌ Tirei 1 ou 2<br><small>(Tentativa Lenta)</small>
          </button>
          <button class="btn-action" style="background: #059669;" onclick="resolveObj1(true)">
            ✔️ Tirei 3 ou mais<br><small>(Sucesso Imediato!)</small>
          </button>
        </div>
      </div>
    `;

    openStoryModal('OBJETIVO 1 • LABORATÓRIO', 'Terminal da Oscorp', text, html);
  }

  // OBJETIVO 2: ACESSO AO METRÔ (COM ENIGMA E SENHA)
  else if (id === 2) {
    // Verificar se o jogador já descobriu a senha ou se está bloqueado
    if (!state.discoveredCode) {
      playDeniedSound();
      alert('⚠️ ACESSO NEGADO!\n\nA porta de titânio do metrô está bloqueada eletronicamente.\n\nInvestigue primeiro o Terminal da Oscorp (Objetivo 1) para encontrar a senha de liberação!');
      return;
    }

    // Se já descobriu, abre o Teclado Numérico Interativo
    openKeypad();
  }

  // OBJETIVO 3: BLINDADO STARK (TESTE DE FORÇA)
  else if (id === 3) {
    const text = `
      O furgão blindado das Indústrias Stark foi amassado por um impacto colossal. Entre os destroços, você enxerga um estojo selado a vácuo com uma Bateria de Íons Stark.
      <br><br>
      Uma válvula de gás de contenção está prestes a romper com a pressão da lataria!
    `;

    const html = `
      <div style="background: #0f121b; border: 1px dashed var(--gold-imperial); border-radius: 8px; padding: 14px; text-align: center; margin-top: 10px;">
        <strong style="color: var(--gold-bright);">🎲 TESTE DE FORÇA BRUTA:</strong>
        <p style="font-size: 0.85rem; margin-top: 4px; color: var(--text-secondary);">Role 2 dados na mesa física. Você precisa de pelo menos um 4+:</p>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-top: 12px;">
          <button class="btn-action" style="background: #7f1d1d;" onclick="resolveObj3(false)">
            💥 Nenhum 4+<br><small>(Cano Rompido)</small>
          </button>
          <button class="btn-action" style="background: #059669;" onclick="resolveObj3(true)">
            🛡️ Teve pelo menos um 4+<br><small>(Remoção Perfeita)</small>
          </button>
        </div>
      </div>
    `;

    openStoryModal('OBJETIVO 3 • BECO', 'Blindado da Caravana Stark', text, html);
  }

  // OBJETIVO 4: AGENTE DA S.H.I.E.L.D. (DILEMA MORAL)
  else if (id === 4) {
    const text = `
      Atrás das barricadas improvisadas, a Agente Sharon Carter empunha uma pistola de choque com as mãos trêmulas. O pulsar do sangue em suas veias é como música para a sua Fome Zumbi!
      <br><br>
      <strong>O que seu Herói decide fazer?</strong>
    `;

    const html = `
      <div style="display: flex; flex-direction: column; gap: 10px; margin-top: 10px;">
        <button class="btn-action" style="background: #881337; text-align: left; padding: 14px;" onclick="resolveObj4('devour')">
          <strong style="color: #fecaca; display: block; font-size: 1rem;">🩸 Opção A: Ceder à Fome e Devorar!</strong>
          <span style="font-size: 0.8rem; color: #cbd5e1;">Zera a Fome do herói e ganha +5 XP imediatos. Mas Sharon é eliminada para sempre.</span>
        </button>
        <button class="btn-action" style="background: #1e3a8a; text-align: left; padding: 14px;" onclick="resolveObj4('interrogate')">
          <strong style="color: #93c5fd; display: block; font-size: 1rem;">🗣️ Opção B: Reter a Fome e Interrogar!</strong>
          <span style="font-size: 0.8rem; color: #cbd5e1;">Aumenta a Fome em +1 pelo esforço sobre-humano, mas descobre os planos do Capitão América vivo!</span>
        </button>
      </div>
    `;

    openStoryModal('OBJETIVO 4 • BARRICADA', 'Encontro com Sharon Carter', text, html);
  }
}

// ================= RESOLUÇÃO DOS OBJETIVOS =================

// Resolução 1 (Terminal Oscorp)
function resolveObj1(fast) {
  state.discoveredCode = true;
  markObjCompleted(1);

  // Adicionar item e liberar Objetivo 2
  addInventoryItem('Memorando da Oscorp', 'Contém o código de acesso [ 7 - 3 - 9 ] para a porta do metrô.');

  // Atualizar visual do Objetivo 2 (Desbloqueado!)
  const card2 = document.getElementById('obj-card-2');
  const tag2 = document.getElementById('tag-obj-2');
  const btn2 = document.getElementById('btn-obj-2');
  const alert2 = document.getElementById('alert-dep-2');

  card2.classList.remove('locked');
  tag2.className = 'tag-status available';
  tag2.textContent = 'Senha Obtida';
  
  btn2.className = 'btn-action';
  btn2.innerHTML = '🔢 Digitar Senha no Painel do Metrô';

  alert2.className = 'dependency-alert solved';
  alert2.innerHTML = '🔓 <strong>SENHA ENCONTRADA:</strong> O código registrado no terminal é <strong>[ 7 - 3 - 9 ]</strong>! Agora você pode abrir o teclado numérico do Objetivo 2!';

  if (fast) {
    showResult(
      '🎉 SUCESSO: Códigos Descobertos!',
      `Você quebrou o firewall com perfeição!
       <br>• O herói que interagiu ganha <strong>+5 XP</strong> no tabuleiro.
       <br>• <strong>Código Revelado:</strong> <span style="color: var(--gold-bright); font-size: 1.1rem; font-weight: 900;">7 - 3 - 9</span>.
       <br>• A escadaria do metrô (Objetivo 2) agora pode ser acessada!`,
      true
    );
  } else {
    triggerAlarm();
    showResult(
      '⚠️ CÓDIGO EXTRAÍDO (Mas o Alarme Soou!)',
      `O terminal disparou um alerta silencioso antes de liberar o arquivo!
       <br>• <strong>Código Revelado:</strong> <span style="color: var(--gold-bright); font-size: 1.1rem; font-weight: 900;">7 - 3 - 9</span>.
       <br>• O herói ganha <strong>+3 XP</strong>.
       <br>• <strong>Efeito na Mesa:</strong> Adicione <strong>1 Guard</strong> no Ponto de Spawn mais próximo!`,
      false
    );
  }
}

// Resolução 3 (Blindado Stark)
function resolveObj3(success) {
  markObjCompleted(3);

  if (success) {
    addInventoryItem('Bateria Stark de Íons', 'Pode ser usada na Missão 2 para energizar os elevadores da Torre.');
    showResult(
      '⚡ SUCESSO: Núcleo de Energia Resgatado!',
      `Com calma cirúrgica, você desativa o dispositivo de segurança sem detonar os tanques!
       <br>• O herói ganha <strong>+5 XP</strong>.
       <br>• <em>Bateria Stark de Íons</em> guardada na sua mochila de campanha!`,
      true
    );
  } else {
    showResult(
      '💥 DETONAÇÃO DEFENSIVA!',
      `A válvula estoura ao ser puxada, espalhando gás paralisante na sala!
       <br>• <strong>Efeito na Mesa:</strong> Todos os heróis na mesma zona sofrem <strong>1 Ferimento</strong>!
       <br>• Você ainda consegue resgatar a <em>Bateria Avariada</em> (+3 XP).`,
      false
    );
    addInventoryItem('Bateria Stark Danificada', 'Fornece energia instável para a próxima fase.');
  }
}

// Resolução 4 (Sharon Carter)
function resolveObj4(choice) {
  markObjCompleted(4);

  if (choice === 'devour') {
    addInventoryItem('Memórias de Sharon', 'Você absorveu as lembranças táticas da S.H.I.E.L.D. ao devorá-la.');
    showResult(
      '🩸 DELEITE SANGUINÁRIO!',
      `A Fome foi insuportável! Sharon foi devorada num frenesi brutal.
       <br>• O herói que atacou <strong>zera sua barra de Fome para 0</strong> e recebe <strong>+5 XP</strong>!
       <br>• <strong>Impacto de Campanha:</strong> A S.H.I.E.L.D. não tentará mais negociar com seu grupo.`,
      false
    );
  } else {
    addInventoryItem('Fita Gravada de Sharon', 'Contém o plano dos Vingadores Vivos para evacuar a cidade de helicóptero.');
    showResult(
      '🤝 INFORMAÇÃO CRÍTICA OBTIDA!',
      `Você segurou a mandíbula por um fio de lucidez! Aterrorizada, Sharon entrega um gravador militar.
       <br>• O herói aumenta sua <strong>Fome em +1</strong>, mas recebe <strong>+5 XP</strong>.
       <br>• Você descobre a rota secreta dos heróis sobreviventes para o Capítulo 2!`,
      true
    );
  }
}

// ================= TECLADO NUMÉRICO (KEYPAD) =================
function openKeypad() {
  state.keypadInput = '';
  updateKeypadDisplay();
  document.getElementById('keypad-feedback').textContent = 'Aguardando 3 dígitos...';
  document.getElementById('keypad-feedback').style.color = 'var(--text-muted)';
  document.getElementById('keypad-modal').classList.add('active');
}

function closeKeypad() {
  document.getElementById('keypad-modal').classList.remove('active');
  updateHUD();
}

function pressKey(digit) {
  if (state.keypadInput.length < 3) {
    state.keypadInput += digit;
    playBeep(700 + state.keypadInput.length * 100, 0.05);
    updateKeypadDisplay();
  }
}

function clearKey() {
  state.keypadInput = '';
  playBeep(350, 0.05);
  updateKeypadDisplay();
  document.getElementById('keypad-feedback').textContent = 'Display limpo.';
  document.getElementById('keypad-feedback').style.color = 'var(--text-muted)';
}

function updateKeypadDisplay() {
  const display = document.getElementById('keypad-display');
  const len = state.keypadInput.length;
  if (len === 0) display.textContent = '_ _ _';
  else if (len === 1) display.textContent = state.keypadInput[0] + ' _ _';
  else if (len === 2) display.textContent = state.keypadInput[0] + ' ' + state.keypadInput[1] + ' _';
  else if (len === 3) display.textContent = state.keypadInput.split('').join(' ');
}

function submitKey() {
  if (state.keypadInput.length !== 3) {
    playDeniedSound();
    document.getElementById('keypad-feedback').textContent = 'Digite os 3 dígitos antes de confirmar!';
    document.getElementById('keypad-feedback').style.color = 'var(--blood-glow)';
    return;
  }

  // Verificar código
  if (state.keypadInput === state.secretCode) {
    playGrantedSound();
    document.getElementById('keypad-feedback').textContent = '✅ CÓDIGO CORRETO! ACESSO LIBERADO!';
    document.getElementById('keypad-feedback').style.color = 'var(--toxic-green)';

    setTimeout(() => {
      closeKeypad();
      markObjCompleted(2);
      addInventoryItem('Chave Mestra dos Trilhos', 'Permite navegar livremente pelo túnel do metrô no Capítulo 2.');
      
      openStoryModal(
        'PORTA DO METRÔ DESTRAVADA!',
        'Descida aos Trilhos Escuros',
        `Com um estalo hidráulico pesado, as trancas de titânio se recolhem e a porta desliza para o lado!
         <br><br>
         O vento frio do subsolo sopra o cheiro de civis escondidos nas plataformas.
         <br><br>
         • <strong>Efeito na Mesa:</strong> Remova o token da porta ou vire para o lado aberto.
         <br>• O herói que abriu ganha <strong>+5 XP</strong>!
         <br>• A rota de fuga da Missão 1 está totalmente desimpedida!`,
        ''
      );
    }, 600);

  } else {
    playDeniedSound();
    triggerAlarm();
    document.getElementById('keypad-feedback').textContent = '❌ CÓDIGO INVÁLIDO! ALARME DISPARADO!';
    document.getElementById('keypad-feedback').style.color = 'var(--blood-glow)';
    state.keypadInput = '';
    setTimeout(updateKeypadDisplay, 800);
  }
}

// ================= GESTÃO DE ESTADO & HUD =================
function markObjCompleted(id) {
  state.completedObjs.add(id);

  const card = document.getElementById('obj-card-' + id);
  const tag = document.getElementById('tag-obj-' + id);
  const btn = document.getElementById('btn-obj-' + id);

  if (card) card.classList.add('completed');
  if (tag) {
    tag.className = 'tag-status done';
    tag.textContent = 'Resolvido';
  }
  if (btn) {
    btn.className = 'btn-action btn-done';
    btn.innerHTML = '✔️ Concluído';
    btn.onclick = null;
  }

  updateHUD();
}

function triggerAlarm() {
  if (!state.alarmTriggered) {
    state.alarmTriggered = true;
    playAlarmSound();
    const alarmHud = document.getElementById('hud-alarm');
    alarmHud.className = 'hud-value status-alarm';
    alarmHud.textContent = '🚨 DISPARADO';
  }
}

function addInventoryItem(name, desc) {
  if (!state.inventory.some(i => i.name === name)) {
    state.inventory.push({ name, desc });
    renderInventory();
  }
}

function renderInventory() {
  const container = document.getElementById('inventory-container');
  if (state.inventory.length === 0) {
    container.innerHTML = '<div class="empty-inv">Nenhum item ou código descoberto ainda.</div>';
    return;
  }

  container.innerHTML = state.inventory.map(item => `
    <div class="inv-item-pill">
      <span class="inv-item-name">📦 ${item.name}</span>
      <span class="inv-item-desc">${item.desc}</span>
    </div>
  `).join('');
}

function updateHUD() {
  const count = state.completedObjs.size;
  document.getElementById('hud-progress').textContent = `${count} / 4 Concluídos`;

  const finishBtn = document.getElementById('btn-finish-chapter');
  if (count >= 4) {
    finishBtn.style.display = 'block';
  }
}

function finishChapter() {
  playGrantedSound();
  alert(
    `🎉 PARABÉNS! CAPÍTULO 1 CONCLUÍDO COM SUCESSO!\n\n` +
    `📦 Itens de Campanha Salvos: ${state.inventory.map(i => i.name).join(', ')}\n` +
    `🚨 Alarme: ${state.alarmTriggered ? 'Disparado (Haverá mais patrulhas no Cap 2)' : 'Furtivo (Vantagem de surpresa)'}\n\n` +
    `Seus heróis descem pelas escadas do metrô em direção à Torre dos Vingadores (Capítulo 2)!`
  );
}
