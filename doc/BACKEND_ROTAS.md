# 🛣️ LiraQuest — Mapa de Rotas do Backend & Realtime

Este documento cataloga todos os endpoints REST e eventos de WebSocket (Socket.IO) do **LiraQuest**, detalhando parâmetros, autenticação necessária e ações executadas.

---

## 🔒 Autenticação & Autorização (RBAC)
- **Header:** `Authorization: Bearer <TOKEN_JWT>`
- **Perfis (Roles):**
  - `ADMIN`: Administrador Geral da plataforma (Sidney).
  - `PARENT`: Guardião / Pais (gestão de família, criação e aprovação de tarefas).
  - `CHILD`: Herói / Filhos (cumprimento de tarefas, evolução de personagem, combate).

---

## 1. Módulo de Autenticação (`/api/auth`)

| Método | Rota | Autenticação | Descrição |
|:---|:---|:---|:---|
| `POST` | `/api/auth/register` | Pública | Cadastra um novo usuário (sempre `CHILD` por padrão) |
| `POST` | `/api/auth/login` | Pública | Autentica e retorna token JWT com dados do usuário |
| `GET` | `/api/auth/me` | JWT | Retorna os dados do usuário autenticado atual |
| `GET` | `/api/auth/users` | JWT (`ADMIN`) | Lista todos os usuários cadastrados no sistema |

---

## 2. Módulo de Catálogo Global (`/api/catalog`)

| Método | Rota | Autenticação | Descrição |
|:---|:---|:---|:---|
| `GET` | `/api/catalog/attributes` | Pública | Lista os 6 atributos fundamentais (`STR`, `AGI`, `CON`, `INT`, `CHA`, `LUK`) |
| `GET` | `/api/catalog/classes` | Pública | Lista as 6 classes com atributos primários, secundários e habilidades |
| `GET` | `/api/catalog/skills/:classId` | Pública | Lista as habilidades da Árvore de Talentos de uma classe específica |
| `GET` | `/api/catalog/items` | Pública | Lista os itens e recompensas disponíveis na Loja do Reino |
| `GET` | `/api/catalog/monsters` | Pública | Lista os monstros e chefes cadastrados |

---

## 3. Módulo Familiar / Clã (`/api/family`)

| Método | Rota | Autenticação | Descrição |
|:---|:---|:---|:---|
| `POST` | `/api/family/create` | JWT (`PARENT` / `ADMIN`) | Cria uma nova família e gera código único (ex: `LIRA-7842`) |
| `POST` | `/api/family/join` | JWT | Ingressa em uma família através do código de convite |
| `GET` | `/api/family/my-family` | JWT | Retorna dados da família do usuário, membros e heróis vinculados |

---

## 4. Módulo de Personagem & Herói (`/api/character`)

| Método | Rota | Autenticação | Descrição |
|:---|:---|:---|:---|
| `GET` | `/api/character/me` | JWT | Retorna o herói, classe ativa, nível, atributos e habilidades do usuário |
| `POST` | `/api/character/create` | JWT | Cria o herói (Nome, Sexo, Avatar, Classe Inicial com atributos base) |
| `PUT` | `/api/character/update-profile` | JWT | Salva dados reais do usuário (Telefone, Escola/Trabalho, Foto) |
| `POST` | `/api/character/change-class` | JWT | Alterna classe ativa preservando o progresso (Multi-Classe) |

---

## 5. Módulo de Missões & Gamificação (`/api/tasks`)

| Método | Rota | Autenticação | Descrição |
|:---|:---|:---|:---|
| `POST` | `/api/tasks` | JWT (`PARENT` / `ADMIN`) | Cria uma nova missão da vida real (`title`, `description`, `xp_reward`, `gold_reward`, `energy_reward`, `token_reward`, `category`, `difficulty`, `allowed_profile`, `requires_proof`, `estimated_time`, `assigned_to`) |
| `GET` | `/api/tasks` | JWT | Lista as missões ativas da família com status de submissão do filho |
| `POST` | `/api/tasks/:taskId/submit` | JWT | Filho submete comprovação remota (foto + texto) |
| `GET` | `/api/tasks/submissions/pending` | JWT (`PARENT` / `ADMIN`) | Pais listam evidências pendentes de avaliação no clã |
| `POST` | `/api/tasks/submissions/:submissionId/review` | JWT (`PARENT` / `ADMIN`) | Pais aprovam (creditando XP, Ouro, Level Up no herói + Energia de Aventura, Fichas do Lar, Streak e Contadores no `UserProgress`) ou rejeitam com feedback |
| `GET` | `/api/tasks/submissions/my` | JWT | Histórico de comprovações e feedbacks recebidos pelo filho |


---

## 6. Módulo da Loja do Reino (`/api/shop`)

| Método | Rota | Autenticação | Descrição |
|:---|:---|:---|:---|
| `GET` | `/api/shop/items` | JWT | Lista itens virtuais e recompensas do mundo real |
| `POST` | `/api/shop/buy` | JWT | Herói compra item consumindo saldo em ouro acumulado |

---

## 7. Módulo de Upload de Mídia (`/api/upload`)

| Método | Rota | Autenticação | Descrição |
|:---|:---|:---|:---|
| `POST` | `/api/upload/profile-photo` | JWT | Upload de foto real de perfil do usuário (Multipart/form-data com Multer, armazena em `/uploads/profiles/UUID.ext` e atualiza `profile_photo_url`) |

---

## 8. Módulo de Progresso do Terminal do Usuário (`/api/progress`)

| Método | Rota | Autenticação | Descrição |
|:---|:---|:---|:---|
| `GET` | `/api/progress/me` | JWT | Retorna o registro de progresso (Energia, Fichas do Lar, Streak, estatísticas) |
| `GET` | `/api/progress/dashboard` | JWT | Retorna pacote unificado para o Terminal do Usuário (progress + tarefas pendentes + aprovadas hoje + histórico) |

---


## 9. WebSockets em Tempo Real (Socket.IO) — *Fase 4*

### Eventos de Sala Familiar
- `join_family_room`: Conexão do usuário à sala exclusiva do seu clã familiar (`family_{id}`).
- `task_submitted`: Notificação instantânea para os pais quando um filho submete uma prova remota.
- `task_approved`: Notificação em tempo real com efeitos e fanfarra para o herói quando a missão é aprovada.

### Eventos de Raid & Combate Cooperativo (Phaser 2D)
- `raid_lobby_join`: Heróis entram no saguão de preparação da Raid contra o Chefe.
- `raid_start`: Início sincronizado do combate por turnos no grid tático.
- `raid_hero_action`: Envio da ação do turno do herói (ataque, habilidade, cura, poção).
- `raid_turn_update`: Broadcast para todos os participantes do estado do campo e dano causado.
- `raid_victory` / `raid_defeat`: Fim da batalha com distribuição sincronizada de recompensas.
