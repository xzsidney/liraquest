# 🃏 LiraQuest Truco — Plano Estratégico de Evolução Técnica e IA (Roadmap)

Este documento estabelece o planejamento detalhado para a evolução do minigame de **Truco Paulista** no ecossistema **LiraQuest**, partindo do protótipo estático até uma plataforma modular integrada com inteligência artificial avançada (sinais corporais e macetes clássicos) e suporte multiplayer em tempo real.

---

## 🗺️ Visão Geral das Etapas

```
┌────────────────────────────────────────────────────────────────────────┐
│ ETAPA 1: INTEGRAÇÃO ARQUITETURAL (HTML ➔ NODE.JS / LIRAQUEST HUB)       │
│ • Sessão unificada JWT (reconhece usuário logado, avatar e nome real) │
│ • Crédito de Ouro e XP no banco de dados da família após vitórias     │
│ • Card de acesso direto na Taverna / Arcade do LiraQuest               │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│ ETAPA 2: MOTOR TÁTICO POSICIONAL DA IA (MÃO, MEIO, PARA-PÉ E PÉ)      │
│ • "Fazer a primeira vaza" (70% do jogo)                                │
│ • Para-pé subindo a maior quando parceiro sai baixo                    │
│ • Pé poupando munição se o parceiro já garantiu a vaza                 │
│ • Agressividade máxima na 2ª vaza após empate (canga)                  │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│ ETAPA 3: MOTOR DE MALANDRAGEM & MACETES AVANÇADOS                     │
│ • "Cama de Gato": fingir fraqueza na 1ª para atrair Truco adversário   │
│ • "Casal Maior": gestão matemática de Zap + Copeta na mesma dupla      │
│ • "Chamar Sangue": queimar cartas médias (3/2) para extrair manilhas   │
│ • Blefes contextuais de Truco baseados em perfil dos oponentes         │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│ ETAPA 4: SISTEMA DE SINAIS VISUAIS & PSICOLÓGICOS (PvE & BOTECO)      │
│ • Animações faciais no avatar: Piscar (Zap), Bico (Copeta), etc.       │
│ • Frases de código com duplo sentido clássicas de truco                │
│ • Conspiração entre robôs adversários (jogador pode interceptar!)      │
│ • Parceria e dicas do robô Tião para o jogador humano                  │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│ ETAPA 5: MULTIPLAYER FAMILIAR EM TEMPO REAL (SOCKET.IO)               │
│ • Criação de salas familiares com código rápido (ex: CLAN-TRUCO-42)    │
│ • Sincronização em tempo real das cartas na mesa (WebSockets)          │
│ • Modo Duplas Cooperativo (Pais e Filhos jogando juntos contra bots)   │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 📌 Detalhamento das Etapas

### 🚀 ETAPA 1: Transição Arquitetural (Do HTML Puro ao Ecossistema Node.js)
**Objetivo:** Transformar o Truco em um módulo oficial conectado à conta do LiraQuest, mantendo a leveza do frontend sem frameworks pesados desnecessários.

1. **Sessão Unificada via Token JWT:**
   - Ao acessar `/truco`, o script verifica se existe o token `liraquest_token` no `localStorage`.
   - Caso positivo, requisita `GET /api/auth/me` e personaliza a mesa:
     - Substitui o avatar padrão `🧑` pela foto real do membro (`profile_photo_url`) ou avatar do herói.
     - Substitui o nome "Você" pelo nome real do jogador (ex: *"Sidney"*).
2. **Economia e Recompensas Reais:**
   - Criação do endpoint `POST /api/truco/finish`:
     - Valida o resultado da partida (vitória/derrota, pontos da mão de 12).
     - Credita Ouro Virtual (`Character.gold`) e Experiência (`UserProgress` e `Character.current_xp`).
     - Alimenta a streak diária da família e estatísticas lúdicas no Painel do Clã.
3. **Ponto de Entrada Central (Hub do LiraQuest):**
   - Adicionar o banner/card *"🃏 Truco Paulista da Família"* dentro da aba Arcade / Taverna (`/avatar` ou `/arcade`), permitindo navegação limpa sem quebrar o fluxo do app.

---

### 🧠 ETAPA 2: Motor Tático Posicional da IA (Pé, Para-Pé e Fazer a Primeira) [CONCLUÍDA ✅]
**Objetivo:** Eliminar jogadas ingênuas e fazer os bots jogarem com a disciplina tática dos grandes truqueiros.

1. **A Regra de Ouro da 1ª Vaza & Papel do Pé:**
   - No Truco Paulista, ganhar a 1ª vaza garante vantagem matemática decisiva (quem faz a 1ª precisa apenas empatar as seguintes).
   - O **Pé** (último a jogar) avalia se a vaza já pertence ao parceiro: se sim, joga o menor lixo; se pertence ao adversário, gasta a menor carta necessária para matar a vaza ou cangar.
2. **O Papel Protetor do Para-Pé (3º jogador):**
   - Se o parceiro abriu com carta baixa e o 2º jogador superou, o Para-pé não joga carta média: ele joga a sua maior carta ("chama na chincha") para espremer o Pé adversário a sangrar sua melhor manilha.
3. **Canga Estratégica (Empate) & Canga da Vitória:**
   - Se a 1ª vaza empatou, a agressividade na 2ª vaza sobe para 100% (quem fizer a 2ª leva tudo).
   - Se a dupla já venceu a 1ª vaza, o Pé ou o Para-Pé prioriza empatar a 2ª vaza de propósito (`tieCards[0]`), ativando a regra de fechamento imediato da mão com vitória da dupla!
4. **Indicadores Visuais de Posição na Mesa (UI/UX):**
   - Crachás estilizados em cada estação de jogador exibindo em tempo real: `MÃO` (amarelo), `MEIO` (azul), `PARA-PÉ` (roxo) e `PÉ` (verde esmeralda).
5. **Diálogos Táticos do Tião e Adversários:**
   - Chamadas contextuais avisando quem fecha a vaza ("Tô no Pé, parceiro!", "Tô de Para-Pé, vou arrochar a maior!", "Cangou a primeira, cai matando na segunda!").

---

### 🪤 ETAPA 3: Motor de Malandragem & Macetes Avançados [CONCLUÍDA ✅]
**Objetivo:** Implementar artimanhas psicológicas clássicas da mesa de baralho.

1. **Tática da "Cama de Gato":**
   - Quando o bot adversário possui cartas imbatíveis (Zap + Copeta/3 + 1 lixo), na 1ª vaza ele descarta o lixo intencionalmente fingindo fraqueza.
   - Ao receber o Truco do jogador humano, a IA aceita imediatamente (100%) ou retruca (Seis), desarmando a armadilha nas vazas 2 e 3 com o Zap!
   - Se o adversário não trucar, o bot armado ganha a 2ª vaza e canta Truco na 3ª antes de jogar a maior.
2. **Tática do "Casal Maior":**
   - Detecção em tempo real quando o Zap e a Copeta estão na mesma dupla.
   - A IA protege a dupla para jamais encavalar ou queimar ambas as manilhas na mesma vaza (se uma já está vencendo, a outra é guardada).
   - Selo dourado luminoso no placar: `👑 CASAL MAIOR (Zap + Copeta)`.
3. **Tática de "Chamar Sangue":**
   - Na 1ª vaza, o bot armado com manilha joga o 3 ou o 2 como isca para forçar o adversário a gastar sua manilha mais pesada para cobrir.
4. **IA de Blefe Ponderado & Rastreador Psicológico:**
   - Na 3ª vaza com o jogo empatado em 1 x 1, bots com cartas fracas (power <= 5) podem bolar um blefe descarado de Truco!
   - A probabilidade de blefe aumenta dinamicamente conforme o jogador humano foge/corre de trucos anteriores (`playerFoldsCount`).
   - Se o jogador humano correr do blefe, o bot comemora e revela a malandragem no chat. Se peitar e vencer, o bot reconhece o tiro pela culatra!

---

### 👁️ ETAPA 4: Sistema de Sinais Corporais & Frases em Código (PvE)
**Objetivo:** Criar uma mecânica inédita no mercado de jogos digitais, onde robôs conspiram e passam sinais autênticos.

| Sinal Físico Tradicional | Manilha Correspondente | Expressão no Avatar | Frase em Código |
| :--- | :--- | :--- | :--- |
| **Piscar olho esquerdo** | ♣ **ZAP** (Paus) | `😉` piscando por 1.8s | *"Tempo fechou por aqui..."* |
| **Bico com os lábios** | ♥ **COPETA** (Copas) | `😚` / `😋` por 1.8s | *"Esse café tá quente demais!"* |
| **Erguer uma sobrancelha** | ♠ **ESPADILHA** (Espadas) | `🤨` por 1.8s | *"Hum... jogo interessante..."* |
| **Coçar o queixo/orelha** | ♦ **PICAFUMO** (Ouros) | `🤔` por 1.8s | *"Coceira braba na orelha..."* |
| **Sorriso de canto** | 🃏 **Carta 3 (Seca)** | `😁` por 1.8s | *"A maré tá virando!"* |
| **Bocejo / Olhar pro teto** | 🗑️ **Só Lixo (Podre)** | `🥱` / `🙄` por 1.8s | *"Hoje tá devagar esse boteco..."* |

* **Mecânica de Interceptação:**
  - O jogador humano que estiver observando o avatar dos adversários pode antecipar manilhas antes da jogada.
  - O parceiro Tião piscará para o jogador humano para indicar a força da sua mão sem abrir as cartas.

---

### 🌐 ETAPA 5: Multiplayer Familiar Realtime (Socket.IO)
**Objetivo:** Permitir partidas em rede local ou via internet entre pais, filhos e irmãos.

1. **Arquitetura WebSocket (`/server/sockets/trucoSocket.js`):**
   - Salas privadas geradas por código de clã: `family_truco_<family_id>`.
   - Sincronização de estado da mesa, cartas viradas e apostas em tempo real.
2. **Modos Cooperativos e Competitivos:**
   - *Pai + Filho vs Máquina:* Cooperação contra bots táticos.
   - *Família 2v2:* 4 membros da família em seus respectivos celulares disputando o troféu do lar.

---

### 🎨 ETAPA 6: Cosméticos & Loja de Baralhos
**Objetivo:** Reinvestir o Ouro acumulado nas tarefas do LiraQuest.

1. **Baralhos Desbloqueáveis:**
   - Baralho Clássico de Boteco (Padrão).
   - Baralho Real Dourado (Bordas folheadas a ouro e naipes nobres).
   - Baralho Cósmico / Arcano (Efeitos estelares ao bater na mesa).
2. **Feltros & Mesas Personalizadas:**
   - Taverna de Lira, Salão Imperial de Mármore e Mesa Rústica de Madeira.
