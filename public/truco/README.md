# 🃏 Truco Paulista (4 Jogadores 2v2 & 1v1 PvE)

Jogo completo de **Truco Paulista** em HTML5, CSS3 e JavaScript puro, com suporte a **4 Jogadores (2 vs 2 em Duplas: Você + 1 Robô parceiro contra 2 Robôs adversários)** e modo **1 vs 1 (Mano a Mano)**, inteligência artificial cooperativa e competitiva, sintetizador sonoro procedural (Web Audio API) e regras oficiais completas.

---

## 🚀 Como Jogar

Basta abrir o arquivo [index.html](file:///e:/11_Games/Zteste/truco-game/index.html) no navegador:
```powershell
Start-Process "e:\11_Games\Zteste\truco-game\index.html"
```

---

## 👥 Modo 4 Jogadores (2 vs 2 em Duplas)

- **Distribuição na Mesa:**
  - **Sul:** Você (Jogador Humano) — Dupla **Nós**
  - **Norte:** Tião (Robô Parceiro) — Dupla **Nós**
  - **Oeste:** Zé Truqueiro (Robô Oponente) — Dupla **Eles**
  - **Leste:** Tonho (Robô Oponente) — Dupla **Eles**
- **Sentido de Jogo:**
  - Tradicional anti-horário: Sul (Você) ➔ Leste (Tonho) ➔ Norte (Tião) ➔ Oeste (Zé).
- **Vaza de 4 Cartas:**
  - Cada um dos 4 participantes joga 1 carta na rodada.
  - A carta mais forte decide o ponto da vaza para a respectiva dupla.
  - **Empate entre Parceiros da mesma dupla:** Se Você e seu parceiro jogarem a maior carta empatados, a própria dupla leva a vaza!
  - **Empate entre Adversários (Canga):** Aplica-se a regra oficial de canga do Truco Paulista.
- **IA Cooperativa:**
  - O parceiro Tião detecta quando a sua carta já está vencendo a vaza com segurança e descarta uma carta fraca ("lixo") para poupar manilhas para as rodadas seguintes!
  - Ao receber um Truco adversário, Tião dá dicas no balão de fala se está armado com Zap/manilhas ou se está fraco.
- **Mão de 11 em Duplas:**
  - As 3 cartas do parceiro Tião são reveladas na tela para você analisar ambas as mãos antes de decidir se joga valendo 3 pontos ou corre entregando 1 ponto.

---

## 🎛️ Modos Alternáveis
No topo da tela há um seletor rápido:
- `👥 2 vs 2 (4 Jogadores)`: Jogo em duplas completo.
- `👤 1 vs 1`: Duelo clássico mano a mano contra o Zé Truqueiro.

---

## 🃏 Regras Oficiais do Truco Paulista

- **Manilhas:** Definidas pela carta seguinte ao **Vira**:
  `4 ➔ 5 ➔ 6 ➔ 7 ➔ Q ➔ J ➔ K ➔ A ➔ 2 ➔ 3 ➔ 4`
- **Força dos Naipes das Manilhas:**
  1. ♣ **Paus** (*Zap / Gato*)
  2. ♥ **Copas** (*Copeta*)
  3. ♠ **Espadas** (*Espadilha*)
  4. ♦ **Ouros** (*Picafumo*)
- **Cartas Comuns:** `4 < 5 < 6 < 7 < Q < J < K < A < 2 < 3`
- **Apostas:** Normal (1 pt), Truco (3 pts), Seis (6 pts), Nove (9 pts) e Doze (12 pts).
- **Mão de Ferro (11 x 11):** Todos os 4 jogadores jogam no escuro!
