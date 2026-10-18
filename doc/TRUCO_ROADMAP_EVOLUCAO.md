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

### 🧠 ETAPA 2: Motor Tático Posicional da IA (Pé, Para-Pé e Fazer a Primeira)
**Objetivo:** Eliminar jogadas ingênuas e fazer os bots jogarem com a disciplina tática dos grandes truqueiros.

1. **A Regra de Ouro da 1ª Vaza:**
   - No Truco Paulista, ganhar a 1ª vaza garante vantagem matemática decisiva (quem faz a 1ª precisa apenas empatar as seguintes).
   - O **Pé** (último a jogar) avalia se a vaza já pertence ao parceiro: se sim, joga o menor lixo; se pertence ao adversário, gasta a menor carta necessária para matar a vaza ou cangar.
2. **O Papel Protetor do Para-Pé (3º jogador):**
   - Se o parceiro abriu com carta baixa e o 2º jogador superou, o Para-pé não joga carta média: ele joga a sua maior carta para espremer o Pé adversário.
3. **Canga Estratégica (Empate):**
   - Se a 1ª vaza empatou, a agressividade na 2ª vaza sobe para 100% (quem fizer a 2ª leva tudo).
   - Se a dupla já venceu a 1ª vaza, a IA busca empatar a 2ª de propósito para fechar a rodada imediatamente.

---

### 🪤 ETAPA 3: Motor de Malandragem & Macetes Avançados
**Objetivo:** Implementar artimanhas psicológicas clássicas da mesa de baralho.

1. **Tática da "Cama de Gato":**
   - Quando o bot ou a dupla possui duas cartas imbatíveis (ex: Zap + Copeta ou Zap + 3), na 1ª vaza eles descartam lixo intencionalmente, induzindo o adversário a cantar Truco.
   - Ao receber o Truco adversário, a IA aceita com alta probabilidade ou aumenta para Seis, descarregando as manilhas nas vazas 2 e 3.
2. **Tática do "Casal Maior":**
   - Algoritmo que detecta quando as duas maiores manilhas da mesa estão na mesma dupla. A IA adota postura de tranquilidade, não gastando ambas na mesma vaza.
3. **IA de Blefe Ponderado:**
   - Capacidade de trucar na 3ª vaza mesmo com carta fraca quando o oponente demonstra fraqueza ou corre com facilidade.

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
