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
| `GET` | `/testeBD` (ou `/api/testeBD`) | Pública | Rota diagnóstica que testa a conexão com o banco MySQL e retorna status em JSON |


---

## 2. Módulo de Catálogo Global (`/api/catalog`)

| Método | Rota | Autenticação | Descrição |
|:---|:---|:---|:---|
| `GET` | `/api/catalog/attributes` | Pública | Lista os 6 atributos fundamentais (`STR`, `AGI`, `CON`, `INT`, `CHA`, `LUK`) |
| `GET` | `/api/catalog/classes` | Pública | Lista as 6 classes com atributos primários, secundários e habilidades |
| `GET` | `/api/catalog/skills/:classId` | Pública | Lista as habilidades da Árvore de Talentos de uma classe específica |
| `GET` | `/api/catalog/items` | Pública | Lista os itens e recompensas disponíveis na Loja do Reino |
| `GET` | `/api/catalog/monsters` | Pública | Lista os monstros e chefes cadastrados |
| `GET` | `/api/catalog/tasks` | Pública | Lista o catálogo oficial de 42 tarefas padrão da vida real |


---

## 3. Módulo Familiar / Clã (`/api/family`)

| Método | Rota | Autenticação | Descrição |
|:---|:---|:---|:---|
| `POST` | `/api/family/create` | JWT (`PARENT` / `ADMIN`) | Cria uma nova família e gera código único (ex: `LIRA-7842`) |
| `POST` | `/api/family/join` | JWT | Ingressa em uma família através do código de convite |
| `GET` | `/api/family/my-family` | JWT | Retorna dados da família do usuário, membros e heróis vinculados |
| `GET` | `/api/family/analytics` | JWT (`PARENT` / `ADMIN`) | Retorna métricas enriquecidas do Painel do Clã: presença online em tempo real, Top Herói, Herói em Foco, totais consolidados, evolução de hábitos nos últimos 7 dias (`weeklyHabits`), distribuição por categorias (`categoryDistribution`), comparativo lado a lado entre heróis (`childrenComparison`), matriz comparativa de hábitos por categoria (`categoryMatrix`), extrato financeiro lúdico com resgates da Loja do Lar (`treasuryStatement`), insígnias coletivas (`clanAchievements`) e relatório pedagógico dinâmico (`pedagogicalInsights`). |



---

## 4. Módulo de Personagem & Herói (`/api/character`)

| Método | Rota | Autenticação | Descrição |
|:---|:---|:---|:---|
| `GET` | `/api/character/me` | JWT | Retorna o herói, classe ativa, nível, atributos e habilidades do usuário |
| `GET` | `/api/character/hero-dashboard` | JWT | Retorna o progresso real do usuário para o Painel do Herói (Level real, XP, Fichas, Ouro, Streak, Rank/Patente e métricas de hábitos da vida real) |
| `POST` | `/api/character/create` | JWT | Cria o herói (Nome, Sexo, Avatar, Classe Inicial com atributos base) |
| `PUT` | `/api/character/update-profile` | JWT | Salva dados reais do usuário (Telefone, Escola/Trabalho, Foto) |
| `POST` | `/api/character/change-class` | JWT | Alterna classe ativa preservando o progresso (Multi-Classe) |

---

## 5. Módulo de Missões & Gamificação (`/api/tasks`)

| Método | Rota | Autenticação | Descrição |
|:---|:---|:---|:---|
| `POST` | `/api/tasks` | JWT (`PARENT` / `ADMIN`) | Cria uma nova missão da vida real (`title`, `description`, `xp_reward`, `gold_reward`, `energy_reward`, `token_reward`, `category`, `difficulty`, `allowed_profile`, `requires_proof`, `estimated_time`, `assigned_to`) |
| `PUT` | `/api/tasks/:taskId` | JWT (`PARENT` / `ADMIN`) | Atualiza os dados de uma missão existente da família |
| `PATCH` | `/api/tasks/:taskId/toggle` | JWT (`PARENT` / `ADMIN`) | Alterna o status da missão entre Ativa e Pausada (`is_active: true/false`) |
| `DELETE` | `/api/tasks/:taskId` | JWT (`PARENT` / `ADMIN`) | Exclui a missão (ou desativa de forma suave se houver histórico de envios) |
| `GET` | `/api/tasks` | JWT | Lista as missões da família (suporta `?include_inactive=true` para o painel dos pais) |
| `POST` | `/api/tasks/:taskId/submit` | JWT | Filho submete comprovação remota (foto + texto) |
| `GET` | `/api/tasks/submissions/pending` | JWT (`PARENT` / `ADMIN`) | Pais listam evidências pendentes de avaliação no clã |
| `GET` | `/api/tasks/submissions/reviewed` | JWT (`PARENT` / `ADMIN`) | Pais consultam o histórico das últimas avaliações concluídas no clã |
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

## 9. Módulo da Loja do Lar & Recompensas da Família (`/api/rewards`)

| Método | Rota | Autenticação | Descrição |
|:---|:---|:---|:---|
| `GET` | `/api/rewards` | JWT | Lista as recompensas ativas da família e retorna saldo de Fichas do Lar do usuário (auto-seeda 10 recompensas padrão se vazio) |
| `POST` | `/api/rewards` | JWT (`PARENT` / `ADMIN`) | Cria uma nova recompensa da vida real (`title`, `description`, `token_cost`, `category`, `icon`, `allowed_profile`) |
| `PUT` | `/api/rewards/:rewardId` | JWT (`PARENT` / `ADMIN`) | Atualiza uma recompensa existente da família |
| `PATCH` | `/api/rewards/:rewardId/toggle` | JWT (`PARENT` / `ADMIN`) | Alterna o status ativo/pausado da recompensa (`is_active: true/false`) |
| `DELETE` | `/api/rewards/:rewardId` | JWT (`PARENT` / `ADMIN`) | Exclui uma recompensa do catálogo |
| `POST` | `/api/rewards/:rewardId/redeem` | JWT | Resgata um vale da vida real consumindo Fichas do Lar do usuário e gerando solicitação no clã |
| `GET` | `/api/rewards/redemptions/my` | JWT | Lista os vales resgatados pelo usuário atual |
| `GET` | `/api/rewards/redemptions/family` | JWT (`PARENT` / `ADMIN`) | Pais consultam todos os resgates solicitados pelos membros do clã |
| `POST` | `/api/rewards/redemptions/:redemptionId/review` | JWT (`PARENT` / `ADMIN`) | Pais avaliam o resgate (`APPROVED`, `DELIVERED` ou `CANCELLED` com estorno das fichas) |

---

## 10. WebSockets em Tempo Real (Socket.IO) — *Fase 4*

### Eventos de Sala Familiar
- `join_family_room`: Conexão do usuário à sala exclusiva do seu clã familiar (`family_{id}`).
- `task_submitted`: Notificação instantânea para os pais quando um filho submete uma prova remota.
- `task_approved`: Notificação em tempo real com efeitos e fanfarra para o herói quando a missão é aprovada.

### Eventos do Esconde-Esconde Camaleão Multiplayer (`/chameleon`)
- `join_lobby`: Jogador entra no Saguão do Clã com sua foto, nome e cor de bolinha.
- `lobby_updated`: Notifica todos os membros da sala com a lista atualizada de jogadores conectados.
- `select_color`: Altera a cor da bolinha em tempo real para todos no lobby.
- `start_spin_lottery`: O anfitrião da sala aciona o sorteio aleatório da Roleta da Sorte 🎰.
- `seeker_chosen`: Dispara o resultado do sorteio, elegendo aleatoriamente o Caçador e iniciando a contagem de 10s.
- `match_started`: Início da caçada em tempo real a 60 FPS com sincronização de coordenadas.
- `player_move` / `player_moved`: Broadcast contínuo de posição $(x,y)$, ângulo da lanterna e camuflagem.
- `tag_chameleon` / `chameleon_caught`: Notificação instantânea quando a lanterna colide com um camaleão.
- `game_over_seeker_win`: Finalização da partida com entrega de recompensas.

---

## 11. Módulo de Mini-Games do Arcade do Reino (`/api/character/minigames`)

| Método | Rota | Autenticação | Descrição |
|:---|:---|:---|:---|
| `POST` | `/api/character/minigames/chameleon/start` | JWT | Valida e debita 5 de Energia de Aventura (`adventure_energy`) para iniciar a partida do Esconde-Esconde Camaleão |
| `POST` | `/api/character/minigames/chameleon/complete` | JWT | Registra o desfecho da partida (`survivedSeconds`, `crystalsCollected`, `isVictory`), creditando Ouro e XP com segurança no Avatar |

