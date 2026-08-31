# LiraQuest - Conceito Central & Documentação do Produto

## 🏰 1. Visão Geral
**LiraQuest (`liraquest.com.br`)** é uma plataforma de RPG e gamificação familiar em tempo real, criada para transformar as rotinas, estudos e tarefas da vida real em uma grande jornada heroica e lúdica para pais e filhos.

A aplicação une:
* **Gamificação de Hábitos**: Pais criam missões e tarefas de casa (arrumar quarto, estudar, leitura, escovar dentes) que concedem Ouro e Pontos de Experiência (XP).
* **Progressão de Personagens**: Os filhos evoluem de nível, aprimoram 5 atributos e desbloqueiam habilidades na Árvore de Talentos.
* **Loja Real do Reino**: Ouro acumulado pode ser trocado por recompensas da vida real (passeios, tempo de videogame, brinquedos) ou por equipamentos que melhoram os atributos do herói no jogo.
* **Foco AFK / Pomodoro**: Temporizador de foco para estudos e leitura com recompensas proporcionais ao tempo focado.
* **Motor Arcade MUGEN 2D (Pixi.js v8)**: Combate em tempo real com personagens icônicos (Capitão América, Homem-Aranha, Kenshin, Colossus, etc.) via parser automático de arquivos `.air`.
* **Raid Cooperativa Multiplayer (2 a 4 Jogadores)**: Pais e filhos jogam juntos em tempo real via WebSockets (Socket.IO) com sistema de iniciativa por turnos contra Chefes Colossais.
* **Motor de Livro-Jogo Solo**: Sistema de aventuras narrativas em nós com múltiplas escolhas e testes de atributos.
* **Radar do Reino**: Mapa de localidades (Casa, Vizinhança, Especial) que contextualiza as missões no mundo do jogo.

---

## 🎮 2. Mecânicas de Gameplay

### 2.1 Classes de Heróis (6 Classes)
| Classe | Emoji | Especialidade |
|:---|:---|:---|
| **Guerreiro** | ⚔️ | Dano físico corpo a corpo, alta vitalidade |
| **Mago** | 🔥 | Magias elementais de longo alcance, alto consumo de MP |
| **Paladino** | 🛡️ | Tanque protetor com escudos sagrados e auras de grupo |
| **Curandeira** | ✨ | Suporte vital que cura e revitaliza membros da família |
| **Arqueiro** | 🏹 | Atirador de precisão com ataques à distância de custo zero |
| **Ladino** | 🗡️ | Especialista em golpes críticos e esquivas rápidas |

### 2.2 Atributos do Herói (5 Atributos)
| Atributo | Efeito no Jogo |
|:---|:---|
| **Força** (`strength`) | Aumenta o dano físico dos ataques |
| **Sabedoria** (`wisdom`) | Aumenta o poder mágico e eficiência de cura |
| **Vitalidade** (`vitality`) | Aumenta o HP máximo do herói |
| **Agilidade** (`agility`) | Determina a iniciativa no combate e chance de esquiva |
| **Vínculo** (`heartBond`) | Atributo cooperativo — fortalece toda a equipe em Raids |

### 2.3 Sistema de Combate no Grid Tático (10 Posições)
* O campo de batalha possui **10 posições lineares (0 a 9)**.
* **Heróis** começam na posição **[3]** e o **Monstro** na posição **[6]** (3 casas de distância).
* **Alcance de Ataques:**
  * *Golpe Rápido / Golpe Forte*: Alcance 1 (lado a lado, distância = 1).
  * *Disparo à Distância / Flechas*: Alcance 2 a 5 casas.
  * *Magias e Especiais*: Variável conforme a Árvore de Talentos.
* **IA do Monstro**: Se a distância for > 1, o monstro avança 1 casa por turno em direção ao herói. Se adjacente, desfere o golpe calculado com `monsterAttack + random(12)`.
* **Fila de Iniciativa**: `[ 1º Herói A ] ➔ [ 2º Herói B ] ➔ [ Chefe Boss ]`
  * Cada jogador atua no seu próprio aparelho. Ações são transmitidas instantaneamente via WebSocket para todos os navegadores na sala.

### 2.4 Enfermaria do Reino
* Quando um herói chega a **0 HP** em combate, é internado na Enfermaria Real por **1 hora** de tempo real.
* Os **Pais (Líderes)** possuem passe de alta médica imediata: podem liberar qualquer herói a qualquer momento.

### 2.5 Árvore de Talentos (3 Tiers)
* **Grau I** (Tier 1): Habilidades básicas da classe, custo menor de XP.
* **Grau II Plus** (Tier 2): Habilidades intermediárias, requerem habilidade do Tier 1 como pré-requisito.
* **Grau III Mestre** (Tier 3): Habilidades épicas de classe, máximo poder.
* Cada habilidade possui um custo em XP para desbloquear e pode ser equipada em um slot de combate (`isEquipped`).

### 2.6 Motor de Livro-Jogo Solo (Aventuras Narrativas)
* Aventuras compostas por **Nós Narrativos** (`family_story_nodes`) conectados por **Escolhas** (`family_story_choices`).
* Cada escolha pode ter um **teste de atributo** opcional (ex: `strength` vs dificuldade `15`).
* Resultado do teste: roteado para `successNodeId` ou `failureNodeId`.
* Nós finais marcados com `isEnding: true` e `endingType: VICTORY | DEFEAT | NEUTRAL`.

### 2.7 Centro de Foco AFK / Pomodoro
* Herói inicia um timer de foco vinculado a uma tarefa ou missão livre.
* Sistema registra `startedAt` e `endsAt` na tabela `family_active_missions`.
* Ao completar, XP + Ouro são creditados e o sistema verifica subida de nível.

---

## 👨‍👩‍👧‍👦 3. Perfis e Permissões de Usuários
* **👑 Líder da Família (Pais — `isParent: true`)**: Criam tarefas, aprovam missões, cadastram itens na loja, dão alta na enfermaria, gerenciam o reino e têm acesso ao **Painel do Mestre**.
* **🛡️ Herói Aventureiro (Filhos — `isParent: false`)**: Cumprem tarefas, usam o Foco AFK, compram itens na loja, jogam aventuras solo, batalham na Arena 1v1 e participam de Raids cooperativas.

---

## 🏗️ 4. Arquitetura Técnica

### Stack Fullstack Unificado (1 Repositório)
* **Frontend:** Vue 3 (Composition API / `<script setup>`), Tailwind CSS v4, Vite, Pinia, Pixi.js v8.
* **Backend & Realtime:** Express, Socket.IO (WebSockets), Sequelize (MySQL).
* **Banco de Dados:** MySQL na Hostinger — tabelas prefixadas com `family_*`.
* **Deploy:**
  * Arquivo de entrada: `server.js` (Hostinger) → inicia `server.ts` na porta 3000.
  * Build: `npm run build` → `generateMugenRegistry.ts` + Vue-TSC + Vite.
  * Repositório: `https://github.com/xzsidney/liraquest.git` (Branch: `main`).

### Motor MUGEN 2D (Pixi.js v8)
* **Script:** `scripts/generateMugenRegistry.ts` — executado no build para mapear sprites.
* **Componente:** `src/components/family/SpriteFighter.vue` — renderiza sprites em Pixi.js.
* **Personagens disponíveis:** `capamerica`, `spiderman`, `colossus`, `kenshin`.
* Sprites carregados via `avatarUrl` com prefixo `sprite:` (ex: `sprite:capamerica`).

---

## 📱 5. Views e Telas Implementadas

### Telas da Área da Família (`/familia/...`)
| View | Arquivo | Descrição |
|:---|:---|:---|
| Ficha do Herói | `FamilyHeroSheetView.vue` | Atributos, classe, avatar, habilidades equipadas, equipamentos |
| Radar do Reino | `FamilyKingdomRadarView.vue` | Mapa de localidades da casa e vizinhança |
| Mural de Tarefas | `FamilyTasksView.vue` | Lista de missões disponíveis para cumprir |
| Missão Ativa | `FamilyActiveMissionView.vue` | Timer de foco AFK / Pomodoro ativo |
| Contos & Aventuras | `FamilyAdventuresView.vue` | Seleção de aventuras de Livro-Jogo |
| Aventura em Jogo | *(roteada por node)* | Narração + escolhas interativas |
| Arena de Batalha | `FamilyBattleView.vue` | Combate 1v1 e Raid com Grid de 10 posições |
| Sala de Grupo | `FamilyPartyRoomView.vue` | Lobby de convite e montagem de grupo para Raids |
| Raid Cooperativa | `FamilyRaidView.vue` | Combate multiplayer em tempo real via Socket.IO |
| Loja do Reino | `FamilyShopView.vue` | Compra de itens com Ouro acumulado |
| Enfermaria | `FamilyInfirmaryView.vue` | Heróis internados e alta médica |
| Feed do Clã | `FamilyFeedView.vue` | Mural de atividades e conquistas recentes |
| Painel do Mestre | `FamilyMasterView.vue` | Aprovação de tarefas e gestão do reino |

---

## 🎯 6. Próximos Passos e Roadmap

### Em Desenvolvimento
* **Raid Cooperativa (FamilyRaidView):** Ajustar Linha do Tempo Visual de Iniciativa + Sincronização de turnos por aparelho ("⚡ É SUA VEZ!").

### Backlog Futuro
* Sistema completo de **Conquistas** com desbloqueio automático.
* **Notificações Push** quando tarefa é aprovada ou Raid é iniciada.
* Editor de Aventuras para os pais criarem suas próprias histórias de Livro-Jogo.
* Expansão do Radar com mais localidades e missões contextuais.
* Sistema de **Pets** com bônus passivos para o herói.
