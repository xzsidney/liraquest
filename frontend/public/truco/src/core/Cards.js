// =============================================================================
// CARDS.JS - MÓDULO DE DEFINIÇÃO DE CARTAS E BARALHO DO TRUCO PAULISTA
// Regras puras: baralho de 40 cartas, sequência de manilhas e poderes
// =============================================================================

export const SUITS = [
  { id: 'ouros', name: 'Ouros', symbol: '♦', color: 'red', manilhaRank: 1, manilhaName: 'PICAFUMO' },
  { id: 'espadas', name: 'Espadas', symbol: '♠', color: 'black', manilhaRank: 2, manilhaName: 'ESPADILHA' },
  { id: 'copas', name: 'Copas', symbol: '♥', color: 'red', manilhaRank: 3, manilhaName: 'COPETA' },
  { id: 'paus', name: 'Paus', symbol: '♣', color: 'black', manilhaRank: 4, manilhaName: 'ZAP' }
];

export const CARD_VALUES = ['4', '5', '6', '7', 'Q', 'J', 'K', 'A', '2', '3'];

export const BASE_RANKS = {
  '4': 1, '5': 2, '6': 3, '7': 4,
  'Q': 5, 'J': 6, 'K': 7,
  'A': 8, '2': 9, '3': 10
};

// Sequência circular de Manilhas no Truco Paulista:
// 4 -> 5 -> 6 -> 7 -> Q -> J -> K -> A -> 2 -> 3 -> 4
export const MANILHA_SEQUENCE = {
  '4': '5', '5': '6', '6': '7', '7': 'Q',
  'Q': 'J', 'J': 'K', 'K': 'A', 'A': '2',
  '2': '3', '3': '4'
};

/**
 * Constrói o baralho limpo de 40 cartas do Truco Paulista
 * @returns {Array<Object>} Lista com as 40 cartas
 */
export function buildDeck() {
  const deck = [];
  CARD_VALUES.forEach(val => {
    SUITS.forEach(s => {
      deck.push({
        value: val,
        suit: s.id,
        suitSymbol: s.symbol,
        suitName: s.name,
        color: s.color,
        id: `${val}_${s.id}`,
        played: false,
        covered: false
      });
    });
  });
  return deck;
}

/**
 * Embaralha um array de cartas utilizando o algoritmo Fisher-Yates
 * @param {Array<Object>} deck 
 * @returns {Array<Object>} Baralho embaralhado
 */
export function shuffleDeck(deck) {
  const cloned = [...deck];
  for (let i = cloned.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [cloned[i], cloned[j]] = [cloned[j], cloned[i]];
  }
  return cloned;
}

/**
 * Obtém o valor da manilha a partir do valor da carta Vira
 * @param {string} viraValue 
 * @returns {string} Valor da manilha (ex: se vira é '7', manilha é 'Q')
 */
export function getManilhaValue(viraValue) {
  return MANILHA_SEQUENCE[viraValue] || null;
}

/**
 * Enriquece uma lista de cartas com atributos de força e poder de manilha
 * @param {Array<Object>} cards 
 * @param {string} manilhaValue 
 */
export function enrichCards(cards, manilhaValue) {
  if (!cards) return;
  cards.forEach(card => {
    card.isManilha = (card.value === manilhaValue);
    const suitObj = SUITS.find(s => s.id === card.suit);
    card.manilhaRank = card.isManilha ? suitObj.manilhaRank : 0;
    card.manilhaName = card.isManilha ? suitObj.manilhaName : null;

    if (card.isManilha) {
      card.power = 100 + card.manilhaRank; // 101 a 104 (Picafumo, Espadilha, Copeta, Zap)
    } else {
      card.power = BASE_RANKS[card.value]; // 1 a 10 (4 a 3)
    }
    card.played = false;
    card.covered = false;
  });
}
