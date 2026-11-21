// =============================================================================
// MAIN.JS - PONTO DE ENTRADA DO MOTOR DO TRUCO PAULISTA (LIRAQUEST)
// Arquitetura Modular: Clean Architecture, State Pattern & Strategy Pattern
// =============================================================================

import { TrucoGame } from './TrucoGame.js';
import * as Cards from './core/Cards.js';
import * as Rules from './core/Rules.js';
import { GameState, PLAYERS_CONFIG } from './core/GameState.js';
import { TrucoExpertAgent, BOT_SIGNALS, BOT_QUOTES, BOT_PERSONALITIES } from './ai/TrucoExpertAgent.js';
import { DifficultyManager, DIFFICULTY_LEVELS } from './ai/DifficultySelector.js';
import { Round1Strategy } from './ai/rounds/Round1Strategy.js';
import { Round2Strategy } from './ai/rounds/Round2Strategy.js';
import { Round3Strategy } from './ai/rounds/Round3Strategy.js';
import { TableRenderer } from './ui/TableRenderer.js';
import { ModalManager } from './ui/ModalManager.js';
import { SignalManager } from './ui/SignalManager.js';
import { AudioManager, defaultAudio } from './audio/AudioManager.js';

// Exportações ESM Modulares
export {
  TrucoGame,
  Cards,
  Rules,
  GameState,
  PLAYERS_CONFIG,
  TrucoExpertAgent,
  BOT_SIGNALS,
  BOT_QUOTES,
  BOT_PERSONALITIES,
  DifficultyManager,
  DIFFICULTY_LEVELS,
  Round1Strategy,
  Round2Strategy,
  Round3Strategy,
  TableRenderer,
  ModalManager,
  SignalManager,
  AudioManager,
  defaultAudio
};

// Retrocompatibilidade Global com window
if (typeof window !== 'undefined') {
  window.TrucoGame = TrucoGame;
  window.BOT_SIGNALS = BOT_SIGNALS;
  window.trucoAudio = defaultAudio;
  window.TrucoModules = {
    Cards,
    Rules,
    GameState,
    TrucoExpertAgent,
    DifficultyManager,
    Round1Strategy,
    Round2Strategy,
    Round3Strategy,
    TableRenderer,
    ModalManager,
    SignalManager,
    AudioManager
  };
}
