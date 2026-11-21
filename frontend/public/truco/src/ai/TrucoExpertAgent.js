// =============================================================================
// TRUCOEXPERTAGENT.JS - CÉREBRO COORDENADOR DOS BOTS
// Integra DecisionEngine, TrucoStrategy, DifficultySelector e Personalities
// =============================================================================

import { DecisionEngine } from './DecisionEngine.js';
import { TrucoStrategy } from './TrucoStrategy.js';
import { DifficultyManager } from './DifficultySelector.js';
import { BOT_SIGNALS, BOT_QUOTES, BOT_PERSONALITIES } from './Personalities.js';

export class TrucoExpertAgent {
  constructor(game, initialDifficulty = 'normal') {
    this.game = game;
    this.difficultyManager = new DifficultyManager(initialDifficulty);
    this.decisionEngine = new DecisionEngine(this.difficultyManager.getConfig());
    this.trucoStrategy = new TrucoStrategy(this.difficultyManager.getConfig());
  }

  setDifficulty(levelKey) {
    this.difficultyManager.setLevel(levelKey);
    const cfg = this.difficultyManager.getConfig();
    this.decisionEngine.setDifficultyConfig(cfg);
    this.trucoStrategy.setDifficultyConfig(cfg);
  }

  getDifficulty() {
    return this.difficultyManager.getLevel();
  }

  getDifficultyConfig() {
    return this.difficultyManager.getConfig();
  }

  chooseCard(ctx) {
    return this.decisionEngine.chooseCard(ctx);
  }

  shouldTruco(ctx) {
    return this.trucoStrategy.shouldTruco(ctx);
  }

  respondToTruco(ctx) {
    return this.trucoStrategy.respondToTruco(ctx);
  }

  evaluateMao11(combinedCards, scoreDiff, role) {
    return this.trucoStrategy.evaluateMao11(combinedCards, scoreDiff, role);
  }

  getPartnerAdvice(partnerCards) {
    return this.trucoStrategy.getPartnerAdvice(partnerCards);
  }
}

export { BOT_SIGNALS, BOT_QUOTES, BOT_PERSONALITIES };
