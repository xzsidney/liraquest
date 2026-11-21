// =============================================================================
// GAME.JS - BRIDGE DE COMPATIBILIDADE PARA O MOTOR MODULAR DO TRUCO PAULISTA
// A arquitetura foi refatorada e desacoplada em módulos em public/truco/src/
// =============================================================================

import { TrucoGame } from './src/TrucoGame.js';
import { BOT_SIGNALS, BOT_QUOTES, BOT_PERSONALITIES } from './src/ai/Personalities.js';
import { defaultAudio } from './src/audio/AudioManager.js';

export {
  TrucoGame,
  BOT_SIGNALS,
  BOT_QUOTES,
  BOT_PERSONALITIES,
  defaultAudio
};

if (typeof window !== 'undefined') {
  window.TrucoGame = TrucoGame;
  window.BOT_SIGNALS = BOT_SIGNALS;
  window.trucoAudio = defaultAudio;
}
