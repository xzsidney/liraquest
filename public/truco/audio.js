// =============================================================================
// TRUCO PAULISTA - SISTEMA DE ÁUDIO PROCEDURAL (Web Audio API)
// Não requer arquivos externos de áudio - 100% autônomo e de alta qualidade
// =============================================================================

class TrucoAudio {
  constructor() {
    this.ctx = null;
    this.muted = false;
  }

  init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  toggleMute() {
    this.muted = !this.muted;
    return this.muted;
  }

  // Som suave de carta sendo distribuída / deslizada
  playCardSlide() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    // Filtro ruído passa-banda para simular atrito de papel
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(320, t);
    osc.frequency.exponentialRampToValueAtTime(140, t + 0.12);

    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(900, t);
    filter.Q.setValueAtTime(3, t);

    gain.gain.setValueAtTime(0.01, t);
    gain.gain.linearRampToValueAtTime(0.12, t + 0.03);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.14);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(t);
    osc.stop(t + 0.15);
  }

  // Som de carta jogada na mesa (batida seca ou slam pesado de manilha)
  playCardPlay(isSlam = false) {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    if (isSlam) {
      // Pancadão na madeira clássico de truco
      osc.type = 'sine';
      osc.frequency.setValueAtTime(180, t);
      osc.frequency.exponentialRampToValueAtTime(45, t + 0.25);

      gain.gain.setValueAtTime(0.4, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.28);

      // Adiciona clique de impacto
      const clickOsc = this.ctx.createOscillator();
      const clickGain = this.ctx.createGain();
      clickOsc.type = 'triangle';
      clickOsc.frequency.setValueAtTime(600, t);
      clickOsc.frequency.exponentialRampToValueAtTime(80, t + 0.08);
      clickGain.gain.setValueAtTime(0.3, t);
      clickGain.gain.exponentialRampToValueAtTime(0.001, t + 0.09);

      clickOsc.connect(clickGain);
      clickGain.connect(this.ctx.destination);
      clickOsc.start(t);
      clickOsc.stop(t + 0.1);
    } else {
      // Toque sutil de carta na mesa
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(260, t);
      osc.frequency.exponentialRampToValueAtTime(90, t + 0.12);

      gain.gain.setValueAtTime(0.2, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.13);
    }

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(t);
    osc.stop(t + (isSlam ? 0.3 : 0.15));
  }

  // Efeito dramático de TRUCO / AUMENTO DE APOSTA!
  playTrucoAlert(level = 3) {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;

    // Duas notas tensas ascendentes
    const baseFreq = level >= 9 ? 220 : 180;
    const notes = [baseFreq, baseFreq * 1.414, baseFreq * 2];

    notes.forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const noteTime = t + idx * 0.09;

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(freq, noteTime);

      gain.gain.setValueAtTime(0, noteTime);
      gain.gain.linearRampToValueAtTime(0.22, noteTime + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, noteTime + 0.35);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(noteTime);
      osc.stop(noteTime + 0.36);
    });

    // Sub-bass thump para impacto na mesa
    const subOsc = this.ctx.createOscillator();
    const subGain = this.ctx.createGain();
    subOsc.type = 'sine';
    subOsc.frequency.setValueAtTime(120, t + 0.18);
    subOsc.frequency.exponentialRampToValueAtTime(35, t + 0.55);

    subGain.gain.setValueAtTime(0.35, t + 0.18);
    subGain.gain.exponentialRampToValueAtTime(0.001, t + 0.6);

    subOsc.connect(subGain);
    subGain.connect(this.ctx.destination);
    subOsc.start(t + 0.18);
    subOsc.stop(t + 0.62);
  }

  // Som de vitória de vaza/rodada
  playRoundWin() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    [523.25, 659.25, 783.99].forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const st = t + idx * 0.08;

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, st);

      gain.gain.setValueAtTime(0.01, st);
      gain.gain.linearRampToValueAtTime(0.18, st + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, st + 0.25);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(st);
      osc.stop(st + 0.26);
    });
  }

  // Som de vaza perdida
  playRoundLoss() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    [392.00, 329.63, 261.63].forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const st = t + idx * 0.09;

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, st);

      gain.gain.setValueAtTime(0.01, st);
      gain.gain.linearRampToValueAtTime(0.15, st + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, st + 0.22);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(st);
      osc.stop(st + 0.23);
    });
  }

  // Som de empate (canga)
  playCanga() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(440, t);
    osc.frequency.setValueAtTime(415.3, t + 0.12);

    gain.gain.setValueAtTime(0.15, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.35);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(t);
    osc.stop(t + 0.36);
  }

  // Fanfarra épica de campeão da partida
  playMatchVictory() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;

    const chords = [
      { t: 0.0, f: 523.25 }, // C5
      { t: 0.15, f: 659.25 }, // E5
      { t: 0.30, f: 783.99 }, // G5
      { t: 0.45, f: 1046.50 }, // C6
      { t: 0.75, f: 880.00 }, // A5
      { t: 0.90, f: 1046.50 }, // C6
    ];

    const now = this.ctx.currentTime;
    chords.forEach((c) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const startTime = now + c.t;

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(c.f, startTime);

      gain.gain.setValueAtTime(0.01, startTime);
      gain.gain.linearRampToValueAtTime(0.22, startTime + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.5);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(startTime);
      osc.stop(startTime + 0.55);
    });
  }

  // Som de derrota da partida
  playMatchDefeat() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;

    const chords = [
      { t: 0.0, f: 392.00 },
      { t: 0.25, f: 369.99 },
      { t: 0.50, f: 329.63 },
      { t: 0.85, f: 246.94 },
    ];

    const now = this.ctx.currentTime;
    chords.forEach((c) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const startTime = now + c.t;

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(c.f, startTime);

      gain.gain.setValueAtTime(0.01, startTime);
      gain.gain.linearRampToValueAtTime(0.18, startTime + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.6);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(startTime);
      osc.stop(startTime + 0.65);
    });
  }

  // Toque suave de botão
  playClick() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(650, t);
    osc.frequency.exponentialRampToValueAtTime(300, t + 0.05);

    gain.gain.setValueAtTime(0.1, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.06);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(t);
    osc.stop(t + 0.07);
  }
}

window.trucoAudio = new TrucoAudio();
