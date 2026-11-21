// =============================================================================
// AUDIOMANAGER.JS - GESTOR CENTRALIZADO DE EFEITOS SONOROS PROCEDURAIS
// Web Audio API procedural: batidas na madeira, deslize de cartas e fanfarras
// =============================================================================

export class AudioManager {
  constructor() {
    this.ctx = null;
    this.muted = false;
  }

  init() {
    if (!this.ctx && typeof window !== 'undefined') {
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

  isMuted() {
    return this.muted;
  }

  playCardSlide() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

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

  playCardPlay(isSlam = false) {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    if (isSlam) {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(180, t);
      osc.frequency.exponentialRampToValueAtTime(45, t + 0.25);

      gain.gain.setValueAtTime(0.4, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.28);

      const snapOsc = this.ctx.createOscillator();
      const snapGain = this.ctx.createGain();
      snapOsc.type = 'square';
      snapOsc.frequency.setValueAtTime(800, t);
      snapOsc.frequency.exponentialRampToValueAtTime(120, t + 0.04);
      snapGain.gain.setValueAtTime(0.18, t);
      snapGain.gain.exponentialRampToValueAtTime(0.001, t + 0.05);

      snapOsc.connect(snapGain);
      snapGain.connect(this.ctx.destination);
      snapOsc.start(t);
      snapOsc.stop(t + 0.06);
    } else {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(260, t);
      osc.frequency.exponentialRampToValueAtTime(80, t + 0.12);

      gain.gain.setValueAtTime(0.2, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.13);
    }

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(t);
    osc.stop(t + (isSlam ? 0.3 : 0.15));
  }

  playTrucoAlert(betValue = 3) {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;

    const baseFreq = betValue === 3 ? 440 : (betValue === 6 ? 554 : (betValue === 9 ? 659 : 880));
    const t = this.ctx.currentTime;

    [0, 0.08, 0.16].forEach((delay, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(baseFreq * (1 + idx * 0.25), t + delay);

      gain.gain.setValueAtTime(0.25, t + delay);
      gain.gain.exponentialRampToValueAtTime(0.001, t + delay + 0.2);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(t + delay);
      osc.stop(t + delay + 0.22);
    });
  }

  playRoundWin() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const notes = [523.25, 659.25, 783.99]; // C5, E5, G5

    notes.forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, t + idx * 0.08);

      gain.gain.setValueAtTime(0.18, t + idx * 0.08);
      gain.gain.exponentialRampToValueAtTime(0.001, t + idx * 0.08 + 0.25);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(t + idx * 0.08);
      osc.stop(t + idx * 0.08 + 0.28);
    });
  }

  playRoundLoss() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const notes = [392.00, 349.23, 311.13]; // G4, F4, D#4

    notes.forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, t + idx * 0.1);

      gain.gain.setValueAtTime(0.15, t + idx * 0.1);
      gain.gain.exponentialRampToValueAtTime(0.001, t + idx * 0.1 + 0.3);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(t + idx * 0.1);
      osc.stop(t + idx * 0.1 + 0.32);
    });
  }

  playCanga() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc1 = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc1.type = 'sawtooth';
    osc1.frequency.setValueAtTime(440, t);
    osc2.type = 'sawtooth';
    osc2.frequency.setValueAtTime(444, t); // Efeito batimento

    gain.gain.setValueAtTime(0.2, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.35);

    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(this.ctx.destination);

    osc1.start(t);
    osc2.start(t);
    osc1.stop(t + 0.38);
    osc2.stop(t + 0.38);
  }

  playMatchVictory() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const melody = [
      { f: 523.25, d: 0.12 },
      { f: 659.25, d: 0.12 },
      { f: 783.99, d: 0.12 },
      { f: 1046.50, d: 0.4 }
    ];

    let curTime = t;
    melody.forEach(note => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(note.f, curTime);

      gain.gain.setValueAtTime(0.25, curTime);
      gain.gain.exponentialRampToValueAtTime(0.001, curTime + note.d);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(curTime);
      osc.stop(curTime + note.d + 0.05);

      curTime += note.d * 0.9;
    });
  }

  playMatchDefeat() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const melody = [
      { f: 440.00, d: 0.2 },
      { f: 415.30, d: 0.2 },
      { f: 392.00, d: 0.2 },
      { f: 349.23, d: 0.5 }
    ];

    let curTime = t;
    melody.forEach(note => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(note.f, curTime);

      gain.gain.setValueAtTime(0.2, curTime);
      gain.gain.exponentialRampToValueAtTime(0.001, curTime + note.d);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(curTime);
      osc.stop(curTime + note.d + 0.05);

      curTime += note.d * 0.85;
    });
  }

  playClick() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(800, t);
    osc.frequency.exponentialRampToValueAtTime(300, t + 0.04);

    gain.gain.setValueAtTime(0.08, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.04);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(t);
    osc.stop(t + 0.05);
  }
}

// Instância compartilhada compatível
export const defaultAudio = new AudioManager();
if (typeof window !== 'undefined') {
  window.trucoAudio = defaultAudio;
}
