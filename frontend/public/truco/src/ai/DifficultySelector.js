// =============================================================================
// DIFFICULTYSELECTOR.JS - SELETOR E CALIBRADOR DE NÍVEIS DA IA
// Níveis: Iniciante (verde), Normal (amarelo) e Mestre (vermelho)
// =============================================================================

export const DIFFICULTY_LEVELS = {
  easy: {
    id: 'easy',
    name: 'Iniciante',
    emoji: '🟢',
    description: 'Robôs previsíveis que raramente blefam e jogam abertos.',
    bluffChance: 0.04,
    camaDeGatoChance: 0.0,
    readSignalsChance: 0.05,
    trucoAggressiveness: 0.40,
    perfectPlayPe: false,
    chamarSangueChance: 0.10
  },
  normal: {
    id: 'normal',
    name: 'Normal',
    emoji: '🟡',
    description: 'Clássico de boteco: malandragem moderada e blefes ocasionais.',
    bluffChance: 0.14,
    camaDeGatoChance: 0.50,
    readSignalsChance: 0.20,
    trucoAggressiveness: 0.65,
    perfectPlayPe: true,
    chamarSangueChance: 0.35
  },
  hard: {
    id: 'hard',
    name: 'Mestre',
    emoji: '🔴',
    description: 'Cartilha de 40 Anos de Boteco: Cama de Gato, leitura afiada e blefes certeiros.',
    bluffChance: 0.28,
    camaDeGatoChance: 0.75,
    readSignalsChance: 0.40,
    trucoAggressiveness: 0.85,
    perfectPlayPe: true,
    chamarSangueChance: 0.55
  }
};

export class DifficultyManager {
  constructor(initialLevel = 'normal') {
    this.currentLevel = initialLevel;
  }

  setLevel(levelKey) {
    if (DIFFICULTY_LEVELS[levelKey]) {
      this.currentLevel = levelKey;
    }
  }

  getLevel() {
    return this.currentLevel;
  }

  getConfig() {
    return DIFFICULTY_LEVELS[this.currentLevel] || DIFFICULTY_LEVELS.normal;
  }
}
