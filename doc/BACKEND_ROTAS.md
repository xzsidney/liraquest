# LiraQuest - Mapeamento de Rotas do Backend & WebSockets

O backend do LiraQuest roda no servidor **Express** integrado com **Socket.IO** em tempo real.
- **Arquivo de entrada:** `server.ts` (modo dev) / `server.js` (modo produção Hostinger)
- **Porta:** `3000`
- **Prefixo da API REST:** `/api`
- **Arquivos de rotas:** `server/routes/authRoutes.ts` e `server/routes/familyRoutes.ts`
- **Controller:** `server/controllers/familyController.ts` e `server/controllers/authController.ts`
- **WebSockets:** `server/sockets/familySocketService.ts`

---

## 🔐 1. Rotas de Autenticação (`/api/auth/...`)

| Método | Rota | Auth | Ação |
|:---|:---|:---|:---|
| `POST` | `/api/auth/register` | Pública | Cria novo usuário (`FamilyUser`) com nome, e-mail, senha (bcrypt) e role (`ADMIN`, `PARENT`, `CHILD`) |
| `POST` | `/api/auth/login` | Pública | Autentica usuário, valida hash bcrypt e retorna JWT |
| `GET` | `/api/auth/me` | 🔒 JWT | Retorna dados do usuário autenticado |
| `GET` | `/api/auth/users` | 🔒 JWT (ADMIN) | Retorna a listagem de todos os usuários cadastrados (exclusivo para Administrador) |

**Middlewares:**
- `authenticateToken`: valida JWT no header `Authorization: Bearer <token>`.
- `authorizeRoles(...roles)`: validação RBAC baseada nos perfis permitidos.

---

## 🛡️ 2. Rotas de Personagens (`/api/family/...`)

### Personagens & Ficha do Herói
| Método | Rota | Auth | Ação |
|:---|:---|:---|:---|
| `GET` | `/api/family/members` | Pública | Lista todos os heróis com status, nível, HP, MP e Ouro |
| `GET` | `/api/family/my-characters` | 🔒 JWT | Lista os personagens pertencentes ao usuário logado |
| `GET` | `/api/family/character/me` | 🔒 JWT | Retorna o herói principal do usuário logado |
| `GET` | `/api/family/character/:id` | Pública | Retorna dados de um herói específico |
| `POST` | `/api/family/claim-character` | 🔒 JWT | Vincula um personagem pré-existente ao usuário |
| `POST` | `/api/family/create-character` | 🔒 JWT | Cria um novo herói para o usuário |
| `POST` | `/api/family/character/update-stats` | 🔒 JWT | Aprimora um atributo (`strength`, `wisdom`, `vitality`, `agility`, `heartBond`) |
| `POST` | `/api/family/character/update-avatar` | 🔒 JWT | Atualiza avatar ou sprite MUGEN (`sprite:capamerica`, etc.) |
| `POST` | `/api/family/character/change-class` | 🔒 JWT | Altera a classe do herói (`GUERREIRO`, `MAGO`, etc.) |
| `POST` | `/api/family/character/recover-infirmary` | 🔒 JWT | Libera alta médica imediata da Enfermaria (restrito a Líderes) |

### Árvore de Habilidades & Builds
| Método | Rota | Auth | Ação |
|:---|:---|:---|:---|
| `GET` | `/api/family/skills/tree` | 🔒 JWT | Retorna a árvore de talentos da classe do personagem logado |
| `POST` | `/api/family/skills/buy` | 🔒 JWT | Desbloqueia uma habilidade consumindo XP |
| `POST` | `/api/family/skills/equip` | 🔒 JWT | Equipa/desequipa uma habilidade no slot de combate |

### Tarefas & Mural de Missões
| Método | Rota | Auth | Ação |
|:---|:---|:---|:---|
| `GET` | `/api/family/tasks` | Pública | Retorna tarefas ativas e pendentes de aprovação |
| `POST` | `/api/family/tasks/complete` | Pública | Filho solicita aprovação de uma tarefa concluída |

### Batalhas & Masmorras
| Método | Rota | Auth | Ação |
|:---|:---|:---|:---|
| `GET` | `/api/family/battle/active` | Pública | Retorna a batalha atualmente em andamento (`IN_PROGRESS`) |

### Loja do Reino
| Método | Rota | Auth | Ação |
|:---|:---|:---|:---|
| `GET` | `/api/family/shop` | Pública | Lista itens disponíveis para resgate |
| `POST` | `/api/family/shop/buy` | Pública | Resgata um item debitando Ouro do herói |

### Radar da Casa & Localidades
| Método | Rota | Auth | Ação |
|:---|:---|:---|:---|
| `GET` | `/api/family/locations` | Pública | Retorna as localidades do Radar do Reino |

### Centro de Foco AFK / Missão Ativa (Pomodoro)
| Método | Rota | Auth | Ação |
|:---|:---|:---|:---|
| `POST` | `/api/family/missions/start` | 🔒 JWT | Inicia um timer de foco, criando um registro em `family_active_missions` |
| `GET` | `/api/family/missions/current` | 🔒 JWT | Retorna a missão ativa atual do personagem |
| `POST` | `/api/family/missions/complete` | 🔒 JWT | Conclui a missão, concede XP + Ouro e sobe nível se necessário |

### Contos & Livro-Jogo Solo
| Método | Rota | Auth | Ação |
|:---|:---|:---|:---|
| `GET` | `/api/family/stories` | Pública | Lista as aventuras disponíveis |
| `GET` | `/api/family/stories/:adventureId/node/:nodeId` | Pública | Retorna um nó narrativo com suas escolhas |
| `POST` | `/api/family/stories/choice` | 🔒 JWT | Executa uma escolha, aplica testes de atributo e retorna o próximo nó |

### Mural do Clã & Feed
| Método | Rota | Auth | Ação |
|:---|:---|:---|:---|
| `GET` | `/api/family/feed` | Pública | Retorna o feed de atividades recentes da família (logs aprovados) |

### Painel do Mestre / Pai (Admin)
| Método | Rota | Auth | Ação |
|:---|:---|:---|:---|
| `GET` | `/api/family/master/pending-tasks` | Pública | Lista tarefas aguardando aprovação dos pais |
| `POST` | `/api/family/master/tasks/approve` | Pública | Aprova tarefa, credita XP + Ouro no herói e dispara evento WebSocket |
| `POST` | `/api/family/master/tasks/reject` | Pública | Rejeita tarefa com observação |
| `POST` | `/api/family/master/tasks/create` | Pública | Cria nova tarefa no mural |

---

## ⚡ 3. Eventos de WebSockets (Socket.IO)

Todos os eventos ocorrem dentro da sala `"family_lira_room"`.
**Arquivo:** `server/sockets/familySocketService.ts`

### Conexão e Presença
| Evento (Client → Server) | Payload | Ação |
|:---|:---|:---|
| `family:join_room` | `{ characterId?, name? }` | Registra presença do herói na sala global; emite `family:presence_update` e `family:party_lobby_updated` |
| `family:send_reaction` | `{ characterId, characterName, emoji, text? }` | Broadcast de emoji flutuante na sala |

| Evento (Server → Client) | Payload | Quando |
|:---|:---|:---|
| `family:presence_update` | `OnlineMember[]` | Toda vez que alguém entra ou sai |
| `family:reaction_received` | `{ characterId, emoji, text, timestamp }` | Ao receber uma reação |

### Convocação de Raid & Grupo
| Evento (Client → Server) | Payload | Ação |
|:---|:---|:---|
| `family:create_party_lobby` | `{ leaderCharacter }` | Cria o grupo com o Líder e notifica todos |
| `family:send_party_invite` | `{ leaderName, leaderId, monsterName }` | Envia convite de Raid (banner dourado nas telas de todos) |
| `family:accept_party_invite` | `{ character }` | Aceita convite e entra no grupo |
| `family:leave_party_lobby` | `{ characterId }` | Sai da sala de espera do grupo |
| `family:start_party_battle` | `{ partyMembers[], isSolo? }` | Inicia combate; cria/reinicia `FamilyBattle` no banco; distribui heróis no grid |

| Evento (Server → Client) | Payload | Quando |
|:---|:---|:---|
| `family:party_lobby_updated` | `PartyMember[]` | Ao criar grupo ou aceitar convite |
| `family:party_invite_received` | `{ leaderName, leaderId, monsterName, timestamp }` | Ao enviar convite |
| `family:battle_party_started` | `{ battle, party, characters }` | Após iniciar o combate; redireciona todos para a tela de batalha |

### Combate no Grid Tático (10 Posições)
| Evento (Client → Server) | Payload | Ação |
|:---|:---|:---|
| `family:execute_battle_action` | `{ battleId, characterId, actionType, targetPosition?, skillId? }` | Executa `MOVE`, `ATTACK`, `SKILL` ou `DEFEND`; calcula dano; avança turno; IA do Monstro age automaticamente |

| Evento (Server → Client) | Payload | Quando |
|:---|:---|:---|
| `family:battle_updated` | `{ battle, lastAction, characters }` | Após cada ação de combate |
| `family:hero_knocked_out` | `{ characterId, characterName, inInfirmaryUntil }` | Quando HP de um herói chega a 0 |
| `family:battle_victory` | `{ rewardXp, rewardGold, message }` | Quando o HP do monstro chega a 0 |

### Notificações em Tempo Real
| Evento (Server → Client) | Payload | Quando |
|:---|:---|:---|
| `family:task_approved_event` | `{ characterName, taskTitle, rewardXp, rewardGold, characterId, timestamp }` | Ao pai aprovar uma tarefa via Painel do Mestre |
