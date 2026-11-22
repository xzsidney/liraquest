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
| `POST` | `/api/auth/login` | Pública | **Login Universal V2**: Autentica Pais e Filhos via credencial universal `{ identifier, password }` (onde `identifier` é o e-mail ou apelido heroico e a senha é validada via hash bcrypt). Retorna Token JWT assinado contendo `{ id, familyId, role, heroNickname }` e o perfil unificado. |
| `GET` | `/api/auth/me` | JWT | **Perfil Unificado**: Retorna a ficha viva completa do membro (nome real, apelido heroico, classe, nível, XP, ouro, energia, tokens, streak e os 6 atributos RPG `str/agi/con/int/cha/luk`) em um único JSON limpo. |
| `GET` | `/api/auth/children` | Pública | **Heróis Filhos para Consulta**: Retorna a lista simplificada de heróis crianças (Nome, Apelido, Classe, Nível). |
| `POST` | `/api/auth/register` | Pública | **Cadastro de Herói (Sempre do tipo FILHO)**: Cadastra um novo herói (`role: 'CHILD'`) vinculado a um clã existente através do `invite_code`. Recebe Nome Real, Apelido Heroico, Senha de Acesso (com hash bcrypt) e Classe inicial. *(Regra: Apenas usuários do tipo Pai podem criar clãs).* |
| `GET` | `/testeBD` (ou `/api/testeBD`) | Pública | Rota diagnóstica que testa a conexão com o banco MySQL e retorna status em JSON |

---

## 2. Módulo Familiar / Clã (`/api/family`)

| Método | Rota | Autenticação | Descrição |
|:---|:---|:---|:---|
| `GET` | `/api/family/members` | JWT (`PARENT` / `ADMIN`) | **CRUD Heróis**: Lista todos os heróis da família do usuário logado (excluindo senhas). |
| `POST` | `/api/family/members` | JWT (`PARENT` / `ADMIN`) | **CRUD Heróis**: Guardião recruta um novo herói (filho) com Nome Real, Apelido Heroico, Classe e PIN de acesso. |
| `PUT` | `/api/family/members/:id` | JWT (`PARENT` / `ADMIN`) | **CRUD Heróis**: Atualiza apelido heroico, classe ativa, skin cosmética ou redefine o PIN da criança. |
| `DELETE` | `/api/family/members/:id` | JWT (`PARENT` / `ADMIN`) | **CRUD Heróis**: Desativação lógica do herói no clã (`is_active: false`). |
| `POST` | `/api/family/create` | JWT (`PARENT` / `ADMIN`) | Cria uma nova família e gera código único (ex: `LIRA-7842`) |
| `POST` | `/api/family/join` | JWT | Ingressa em uma família através do código de convite |
| `GET` | `/api/family/my-family` | JWT | Retorna dados da família do usuário, membros e heróis vinculados |
| `GET` | `/api/family/analytics` | JWT (`PARENT` / `ADMIN`) | Retorna métricas do Painel do Clã para os pais. |



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

## 5. Módulo de Missões do Lar & Mestria em Força (`/api/tasks`)

| Método | Rota | Autenticação | Descrição |
|:---|:---|:---|:---|
| `GET` | `/api/tasks` | JWT | Lista as missões ativas da família do usuário. Para filhos, traz tarefas atribuídas ou abertas, com flags `today_pending` e `today_approved` baseadas nos envios do dia. |
| `POST` | `/api/tasks` | JWT (`PARENT` / `ADMIN`) | Cria uma nova missão do lar (`title`, `description`, `category`, `frequency`, `reward_str_xp`, `reward_xp`, `reward_gold`, `reward_tokens`). Vincula automaticamente ao clã (`family_id`). |
| `POST` | `/api/tasks/:id/submit` | JWT | Filho submete comprovação com foto (Base64) e anotações opcionais (`proof_image`, `member_notes`). Gera registro em `family_task_submissions` com status `PENDING`. |
| `GET` | `/api/tasks/submissions/pending` | JWT (`PARENT` / `ADMIN`) | Pais listam todas as comprovações pendentes do clã com dados da tarefa e do herói executor. |
| `POST` | `/api/tasks/submissions/:id/approve` | JWT (`PARENT` / `ADMIN`) | **Aprovação em 1 Clique**: Marca `status = 'APPROVED'`, registra o avaliador e credita no herói: `+reward_str_xp`, `+reward_gold`, `+reward_tokens` e `+reward_xp`. Se `xp_str >= 100`, evolui `str += 1`, decrementa 100 de `xp_str` e retorna flag `str_leveled_up: true`. |
| `POST` | `/api/tasks/submissions/:id/reject` | JWT (`PARENT` / `ADMIN`) | Marca `status = 'REJECTED'`, registra o avaliador e anexa o `parent_feedback` pedagógico para que o herói capriche mais. |



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
| `POST` | `/api/upload/task-proof` | JWT | Upload de foto de comprovação de tarefa da casa (Multipart/form-data com Multer, armazena em `/uploads/proofs/UUID.ext` e retorna a URL) |

---

## 8. Módulo de Progresso do Terminal do Usuário (`/api/progress`)

| Método | Rota | Autenticação | Descrição |
|:---|:---|:---|:---|
| `GET` | `/api/progress/me` | JWT | Retorna o registro de progresso (Energia, Fichas do Lar, Streak, estatísticas) |
| `GET` | `/api/progress/dashboard` | JWT | Retorna pacote unificado para o Terminal do Usuário (progress + tarefas pendentes + aprovadas hoje + histórico) |
| `POST` | `/api/progress/focus/finish` | JWT | Registra a conclusão de uma sessão de foco do Pomodoro gamificado (`minutes`, `subject`), creditando +3 de Energia de Aventura, +15 Ouro, +40 XP e +1 ponto de Inteligência (INT) permanente no Herói |

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

---

## 12. Módulo do Quiz & O Arqueiro do Saber (`/api/quiz`)

| Método | Rota | Autenticação | Descrição |
|:---|:---|:---|:---|
| `GET` | `/api/quiz/questions/random` | Pública | Retorna perguntas aleatórias com suas 4 alternativas embaralhadas, filtradas por `stage` (`fundamental_1`, `fundamental_2`, `ensino_medio`, `superior`) e opcionalmente `discipline` |
| `POST` | `/api/quiz/start` | JWT | Valida e debita 4 de Energia de Aventura (`adventure_energy`) para iniciar a sessão do Arqueiro do Saber ou Duelo 1v1 |
| `POST` | `/api/quiz/finish` | JWT | Registra desfecho da partida solo (`hits`, `misses`, `max_combo`, `score`, `stage`, `difficulty`), creditando Ouro no Herói (`Character.gold`), XP na classe ativa (`CharacterClass.xp`), verificando Level Up e aprimorando o atributo Inteligência (`INT`) do Herói |
| `POST` | `/api/quiz/duel/finish` | JWT | Registra desfecho do Duelo 1v1 em Tempo Real (`isWinner`, `isTie`, `score`, `hits`, `opponentName`, `stage`), creditando Ouro, XP e bônus de Inteligência (+2 INT para vencedor, +1 INT para empate/vice) no Herói |

---

## 13. WebSockets do Duelo de Arqueiros 1v1 (`/duel`)

Namespace dedicado para partidas 1v1 entre irmãos e membros do clã:
- `join_duel_lobby`: Jogador conecta à sala familiar com suas preferências de nível escolar individual (`stage`) e dados de usuário.
- `duel_lobby_updated`: Broadcast com a lista dos 2 duelistas, prontidão (`isReady`) e status da arena.
- `update_player_settings`: Atualiza a etapa de ensino escolhida pelo jogador durante o lobby.
- `player_toggle_ready`: Alterna status "Pronto para o Combate". Quando ambos estão prontos, dispara contagem regressiva de 3s.
- `duel_countdown_tick`: Envia pulsos de 3, 2, 1 para os navegadores sincronizarem a abertura da arena.
- `duel_started`: Inicia o duelo cronometrado (60 segundos) com perguntas independentes para cada jogador.
- `duel_score_update`: Disparado client-side a cada acerto, combo ou captura do Pássaro Dourado Relâmpago.
- `duel_scores_synced`: Sincroniza em tempo real a barra dinâmica estilo "Cabo de Guerra" e os pontos dos 2 jogadores.
- `duel_client_finished`: Emite resultado final de pontuação para apuração do vencedor.
- `duel_match_over`: Declaração oficial do vencedor, pódio e liberação para resgate de prêmios.
- `duel_request_rematch`: Reinicia a arena para uma nova revanche familiar.
- `duel_player_disconnected`: Notifica o oponente caso um dos duelistas perca a conexão.

---

## 14. Módulo do Livro-Jogo de Masmorras (`/api/dungeon`)

Endpoints do mini-game **Aventuras em Quest**, com carregamento de masmorras relacionais, 3 escolhas por cena, consumo de energia e entrega de recompensas:

| Método | Rota | Autenticação | Descrição |
|:---|:---|:---|:---|
| `GET` | `/api/dungeon/adventures` | Pública | Lista todas as masmorras ativas do reino com títulos, dificuldades, custos e prêmios |
| `GET` | `/api/dungeon/adventures/:id` | Pública | Retorna os dados completos da masmorra selecionada com todas as suas cenas e ações contendo as ramificações de Causa e Consequência (`success_scene_code` e `failure_scene_code`) |
| `GET` | `/api/dungeon/start` | JWT | Valida e consome 5 de Energia de Aventura (`UserProgress.adventure_energy`), inicializando a expedição na tabela `family_dungeon_runs` |
| `POST` | `/api/dungeon/finish` | JWT | Finaliza a expedição (`is_victory`, `final_hp`, `primary_attribute_used`, `choices_summary`, `bonus_gold_collected`), creditando Ouro no Herói (`Character.gold`), XP na classe ativa (`CharacterClass.xp`), checando Level Up e aprimorando permanentemente (+1) o atributo mais utilizado na run em `CharacterAttribute` |

---

## ⚔️ 13. Arena de Batalha 2D (Mini-Game Arcade RPG por Turnos)
Rotas dedicadas ao Jogo 4 do Arcade (`/battle.html`): combate tático por turnos com sprites clássicos da era de ouro (Capitão América, Ciclope, Homem-Aranha, Wolverine e Gambit), sincronização com a ficha de atributos do herói, motor de efeitos especiais PixiJS em WebGL (feixes de luz radiantes estilo RPG Maker) e fila visual de turnos (CTB queue).

| Método | Rota | Autenticação | Descrição |
|:---|:---|:---|:---|
| `POST` | `/api/battle/start` | JWT | Inicia a batalha 2D na Arena, consumindo 5 de Energia de Aventura (`UserProgress.adventure_energy`). Calcula estatísticas de combate a partir da ficha viva do Herói (CON, STR, INT, AGI, LUK, bônus de equipamentos), equipa até 3 habilidades adquiridas em `character_skills`, gera o deck tático com `animation_id` modular e calibra o adversário de acordo com o nível do herói. |
| `POST` | `/api/battle/finish` | JWT | Registra o desfecho da batalha (`VICTORY` ou `DEFEAT`). Em caso de vitória, credita +50 de Ouro (`Character.gold`) e +80 de XP (`Character.current_xp`), processando subida de nível (`Character.level`). |
| `GET` | `/api/battle/manifest/:hero` | Pública | Retorna o arquivo `manifest.json` do personagem e a lista completa de sprites PNG disponíveis na pasta para o Visualizador e Editor 2D (`/animator.html`). |
| `POST` | `/api/battle/manifest/:hero` | Pública | Salva as alterações de eixos (`bodyAxis`, `shieldAxis`), durações e sequências de frames no `manifest.json` do herói com backup automático (`manifest.backup.json`). |

---

## 🚀 14. Aventura 2D em Plataforma (Mini-Game Arcade Side-Scrolling)
Página dedicada ao Jogo 5 do Arcade (`/adventure.html`): jogo de ação e aventura de plataforma clássico em rolagem lateral com os 5 heróis (Capitão América, Ciclope, Homem-Aranha, Wolverine e Gambit). Utiliza a rota `/api/battle/finish` para premiar o jogador com ouro coletado (+ bônus de fase) e XP de aventura para evolução na família.

---

## 🃏 15. Módulo Standalone de Truco Paulista (`/truco`)

Módulo separado com interface mobile responsiva servido pelo backend Node.js:

| Método | Rota | Autenticação | Descrição |
|:---|:---|:---|:---|
| `GET` | `/truco` | Pública | Rota principal que entrega o jogo de Truco Paulista (`public/truco/index.html`) |
| `GET` | `/truco/*` | Pública | Entrega de assets estáticos e arquitetura modular ESM (`style.css`, `game.js`, `audio.js`, `src/main.js`, `src/core/*`, `src/ai/*`, `src/ui/*`, `src/audio/*`) e subrotas |
| `GET` | `/api/truco/profile` | JWT | Retorna dados do usuário autenticado no LiraQuest, perfil do Herói (`Character`) e saldo de Ouro para a mesa de Truco |
| `POST` | `/api/truco/finish` | JWT | Registra o desfecho da partida de Truco (`is_victory`, `game_mode`, `player_score`, `bot_score`), creditando +40 Ouro e +60 XP no Herói em caso de vitória (+10 Ouro e +15 XP em derrota) e checando subida de nível (`leveled_up`) |

---

## 🧟‍♂️ 16. Módulo Companheiro Narrativo de Marvel Zombies (`/zombi` e `/api/zombi`)

Módulo separado com interface web responsiva e persistência MySQL para apoiar partidas físicas de tabuleiro estilo campanha investigativa RPG (*Carmen Sandiego + Fort Hendrix*):

| Método | Rota | Autenticação | Descrição |
|:---|:---|:---|:---|
| `GET` | `/zombi` | Pública | Entrega o aplicativo companheiro (`public/zombi/index.html`) com suporte a 5 capítulos, alternância Modo Herói/Zumbi, 6 tokens investigativos, testes de D6 e Keypad de senha |
| `GET` | `/zombi/*` | Pública | Entrega de arquivos estáticos dedicados (`style.css`, `app.js`, imagens de recortes em `img/`) |
| `GET` | `/api/zombi/campaign` | Pública | Retorna a campanha ativa (`family_zombi_campaigns`) com todas as 5 missões (`family_zombi_missions`), os 6 tokens de cada missão (`family_zombi_tokens`) e o progresso salvo |
| `POST` | `/api/zombi/state` | Pública | Salva em tempo real no MySQL o capítulo atual, o modo ativo (`HERO` ou `ZOMBIE`), os tokens resolvidos e as pistas/flags adquiridas |
| `POST` | `/api/zombi/reset` | Pública | Reinicia o estado salvo de um capítulo específico ou da campanha completa |
| `GET` | `/api/zombi/characters` | Pública | Lista os 82 personagens oficiais com suporte a filtros via query params (`?box=...`, `?mode=hero|zombie|boss`, `?search=...`) para abastecer dropdowns e filtros rápidos |
| `GET` | `/api/zombi/characters/:code` | Pública | Retorna a ficha completa de um personagem específico por slug (`code`), incluindo todos os seus perfis (`super_hero`, `zombie_hero`, `boss_enemy`), ataques e habilidades |
| `GET` | `/zombi/characters.html` | Pública | Entrega a interface oficial do Companion Tático de Personagens com simulador de dados e gerenciador de HP de Boss |

---

## 🥗 17. Módulo Saúde, Nutrição & Hábitos Alimentares (Fase 2)
Rotas REST e WebSockets do Módulo Saúde (`client/src/modules/saude/` e `/api/nutrition`), integrando cardápio dinâmico com gramas, guia de preparo da cozinha, rotina diária (certinha vs flexível), validação de presença dos filhos com pontuação RPG e checklist de compras inteligente.

| Método | Rota | Autenticação | Descrição |
|:---|:---|:---|:---|
| `GET` | `/api/nutrition/today` | JWT | Retorna o cardápio do dia atual (`meal_date`), os 5 horários programados, os pratos com seus ingredientes e gramas, os filhos da casa e o status de check-in de cada um |
| `GET` | `/api/nutrition/week` | JWT | Retorna a grade semanal completa (Segunda a Domingo) com os pratos e horários associados |
| `POST` | `/api/nutrition/meal` | JWT (PARENT/ADMIN) | Cria ou edita um prato nobre com nome, modo de rotina, dicas de preparo da cozinha e array dinâmico de ingredientes com porções e tags funcionais |
| `DELETE` | `/api/nutrition/meal/:mealId` | JWT (PARENT/ADMIN) | Remove um prato do cardápio e seus ingredientes |
| `POST` | `/api/nutrition/checkin` | JWT (PARENT/ADMIN) | **Mecânica do Paulinho:** Validação de presença do herói na refeição. Se `no_horario`: credita +30 XP, +10 Moedas de Ouro e restaura 100% da Energia de Aventura. Se `atrasado`: credita +10 XP. Se `faltou`: registra advertência no histórico |
| `GET` | `/api/nutrition/shopping` | JWT | Retorna os itens de compras da família divididos em duas colunas: `mensal_abastecimento` e `semanal_feira` com contadores de progresso |
| `POST` | `/api/nutrition/shopping` | JWT | Adiciona um novo item à lista de compras com nome, quantidade/volume e categoria |
| `POST` | `/api/nutrition/shopping/toggle` | JWT | Alterna o status `is_purchased` (comprado/pendente) do item com salvamento instantâneo |
| `DELETE` | `/api/nutrition/shopping/:itemId` | JWT | Exclui um item da lista de compras da família |
| `GET` | `/api/nutrition/schedule` | JWT | Consulta os horários configurados das 5 refeições e o modo de rotina predominante (`certinho` ou `flexivel`) |
| `PUT` | `/api/nutrition/schedule` | JWT (PARENT/ADMIN) | Atualiza o modo de rotina da família e/ou os horários e minutos de alerta de cada refeição |

### 🔔 Eventos de WebSocket e Cron em Tempo Real
- **Serviço Node-Cron (`server/services/nutritionCron.js`):** Monitora minuto a minuto os horários ativos no MySQL.
- **Evento `nutrition:meal_alert` (Socket.IO):** Dispara alerta na tela quando faltam X minutos para a refeição (`PRE_ALERT`) ou na hora exata em que a refeição é servida (`MEAL_NOW`), preparando o terreno para envio automático via WhatsApp.

---

## 🎡 18. Módulo Diversão, Eventos & Vales da Família (Fase 4)
Rotas do Módulo Diversão (`client/src/modules/diversao/` e `/api/fun`), contemplando a agenda de eventos e aniversários do clã, votação democrática de passeios no celular e resgate de vales da vida real com Fichas do Lar.

| Método | Rota | Autenticação | Descrição |
|:---|:---|:---|:---|
| `GET` | `/api/fun/events` | JWT | Lista todos os eventos ativos da família com ordenação cronológica e contadores regressivos |
| `POST` | `/api/fun/events` | JWT (PARENT/ADMIN) | Cadastra novo evento, aniversário ou passeio com título, data, horário, ícone, categoria e recorrência anual |
| `PUT` | `/api/fun/events/:eventId` | JWT (PARENT/ADMIN) | Atualiza os detalhes de um evento da agenda familiar |
| `DELETE` | `/api/fun/events/:eventId` | JWT (PARENT/ADMIN) | Remove um evento do calendário do clã |
| `GET` | `/api/fun/polls` | JWT | Lista as votações de passeios (abertas e concluídas) com opções, contagem de votos, % e indicação do voto do usuário |
| `POST` | `/api/fun/polls` | JWT (PARENT/ADMIN) | Cria nova votação de passeio familiar com título e opções personalizadas com ícones |
| `POST` | `/api/fun/polls/:pollId/vote` | JWT | Registra ou atualiza o voto de qualquer membro da família na opção selecionada |
| `POST` | `/api/fun/polls/:pollId/close` | JWT (PARENT/ADMIN) | Encerra a votação, computa votos e proclama a opção campeã da família |
| `DELETE` | `/api/fun/polls/:pollId` | JWT (PARENT/ADMIN) | Exclui uma votação do clã |
| `GET` | `/api/rewards` | JWT | Consulta a vitrine de vales do lar disponíveis para troca com Fichas do Lar |
| `POST` | `/api/rewards/:rewardId/redeem` | JWT | Solicita o resgate de um vale da vida real, debitando Fichas do Lar (`user_progress.family_tokens`) |
| `GET` | `/api/rewards/redemptions/my` | JWT | Consulta os vales resgatados pelo usuário e seu status de visto |
| `GET` | `/api/rewards/redemptions/family` | JWT (PARENT/ADMIN) | Lista todos os pedidos de resgate da família para avaliação dos pais |
| `POST` | `/api/rewards/redemptions/:redemptionId/review` | JWT (PARENT/ADMIN) | Guardião dá o visto de liberação e confirma a entrega do vale na vida real |

---

## 💰 19. Módulo Financeiro, Contas & Tesouro do Clã (Fase 4)
Rotas do Módulo Financeiro (`client/src/modules/financeiro/` e `/api/finance`), integrando controle de contas domésticas dos pais, cofre coletivo dos grandes sonhos do clã e cofre/mesada gamificada dos filhos com educação financeira.

| Método | Rota | Autenticação | Descrição |
|:---|:---|:---|:---|
| `GET` | `/api/finance/bills` | JWT (PARENT/ADMIN) | Lista todas as contas domésticas do mês com sumário de totais (mês, pendente, pago e vencidas) |
| `POST` | `/api/finance/bills` | JWT (PARENT/ADMIN) | Cadastra nova conta com nome, categoria, valor em R$, data de vencimento, método e notas |
| `PUT` | `/api/finance/bills/:billId` | JWT (PARENT/ADMIN) | Atualiza informações de uma despesa doméstica |
| `PATCH` | `/api/finance/bills/:billId/toggle` | JWT (PARENT/ADMIN) | Alterna status entre `PAID` (Paga) e `PENDING` (Pendente), registrando data de quitação |
| `DELETE` | `/api/finance/bills/:billId` | JWT (PARENT/ADMIN) | Exclui uma despesa do controle doméstico |
| `GET` | `/api/finance/vaults` | JWT | Consulta as metas de sonhos do clã (Viagem, Reforma, Compras) com barras de progresso duplo (R$ e Missões) |
| `POST` | `/api/finance/vaults` | JWT (PARENT/ADMIN) | Cria uma nova meta de sonho coletivo da família |
| `POST` | `/api/finance/vaults/:vaultId/deposit` | JWT | Registra aporte financeiro em Reais no cofre do clã, recalculando % e comemorando ao bater 100% |
| `PUT` | `/api/finance/vaults/:vaultId` | JWT (PARENT/ADMIN) | Atualiza meta do cofre do clã |
| `DELETE` | `/api/finance/vaults/:vaultId` | JWT (PARENT/ADMIN) | Exclui uma meta familiar |
| `GET` | `/api/finance/child-vault` | JWT | Retorna o cofrinho do herói (saldo de ouro na bolsa, ouro poupado, mesada acumulada e meta). Se for pai, lista todos os filhos |
| `POST` | `/api/finance/child-vault/deposit` | JWT | Transfere moedas de ouro da bolsa de aventuras para a poupança trancada do cofrinho |
| `POST` | `/api/finance/child-vault/withdraw` | JWT | Transfere ouro da poupança de volta para a bolsa de combate |
| `POST` | `/api/finance/child-vault/convert` | JWT | Converte ouro poupado em saldo de mesada real em Reais (R$) com taxa combinada (10 Ouro = R$ 1,00) |
| `POST` | `/api/finance/child-vault/goal` | JWT | Atualiza o sonho pessoal de consumo do filho (título e valor em R$) |
| `POST` | `/api/finance/child-vault/pay` | JWT (PARENT/ADMIN) | Registra a quitação/pagamento da mesada entregue ao filho na vida real, dando baixa no saldo acumulado |

---

## 📱 20. Central de WhatsApp do Clã & Alarmes Automáticos (Fase 5 - Em Estudo / Oculto na UI)
> **Nota de Arquitetura:** A aba visual do WhatsApp foi desativada da UI do módulo de Saúde (`client/src/modules/saude/index.js`) a pedido do usuário para estudos posteriores sobre as exigências da Meta (necessidade de verificação de empresa com CNPJ, número exclusivo não registrado no app WhatsApp e modelos de mensagens aprovados). As rotas de backend `/api/whatsapp` e os alarmes via WebSocket e `alarmService.js` continuam disponíveis como infraestrutura.

Rotas da Central de Mensageria (`/api/whatsapp`), responsáveis pela transmissão oficial via Meta Cloud API / links diretos, cadastro individual de telefones dos heróis (`family_users.phone`), envio de convocações rápidas dos pais (mensagens programadas XPTO) e alarmes automáticos (Aviso Cozinha 11h15, Convocação Almoço 11h45, Lanche & Mana 16h00 e Jantar 19h45).

| Método | Rota | Autenticação | Descrição |
|:---|:---|:---|:---|
| `GET` | `/api/whatsapp/config` | JWT | Retorna a configuração de WhatsApp da família (status de conexão, credenciais da Meta, opções de notificação e lista dos heróis com telefones) |
| `POST` | `/api/whatsapp/config` | JWT (PARENT/ADMIN) | Salva número ou grupo adicional, credenciais da Meta Cloud API (`meta_phone_number_id`, `meta_access_token`) e preferências (`notify_meals`, `notify_hydration`) |
| `POST` | `/api/whatsapp/update-phone` | JWT (PARENT/ADMIN) | Atualiza o telefone celular de um membro individual da família no banco de dados (`family_users.phone`) |
| `POST` | `/api/whatsapp/send-template` | JWT (PARENT/ADMIN) | Dispara convocação rápida com mensagem programada XPTO (`BREAKFAST`, `KITCHEN`, `LUNCH`, `SNACK_WATER`, `DINNER`, `BEDTIME`) ou texto livre do pai para todos os heróis cadastrados |
| `POST` | `/api/whatsapp/test` | JWT (PARENT/ADMIN) | Dispara mensagem de teste nobre e épica para os números cadastrados |
| `POST` | `/api/whatsapp/alarm-test` | JWT (PARENT/ADMIN) | Permite simulação instantânea dos 4 alarmes programados (`KITCHEN`, `LUNCH`, `HYDRATION`, `DINNER`) |

### ⏰ Serviço de Alarme & Agendamento Contínuo (`server/services/alarmService.js`)
Monitora minuto a minuto (`* * * * *`) via `node-cron`:
1. **11h15 (Aviso Cozinha):** Cardápio real do almoço com ingredientes em gramas e dicas de preparo saudável sem óleo.
2. **11h45 (Convocação Almoço):** Convocação dos heróis para o almoço em família antes dos filhos irem para a escola (Check-in liberado com +30 XP e +10 Ouro).
3. **16h00 (Lanche & Poção de Cura):** Lembrete de hidratação (1 copo de água pura) + fruta/iogurte da tarde para restaurar estamina.
4. **19h45 (Jantar do Clã):** Chamada para o jantar leve noturno e preparação para o descanso e sono restaurador dos heróis.
5. **Horários Dinâmicos:** Monitora as programações ativas cadastradas em `family_meal_schedules`, respeitando o modo de rotina do dia (`certinho` vs `flexivel`).

### 🔔 Eventos de WebSocket em Tempo Real (Socket.IO)
- `whatsapp:qr_generated`: Transmite a nova imagem Data URL do QR code gerado para a tela dos guardiões.
- `whatsapp:status`: Atualiza o status de pareamento (`CONNECTED` / `DISCONNECTED`) em tempo real.
- `whatsapp:message_sent`: Notifica o frontend quando uma mensagem temática é despachada para o WhatsApp.
- `alarm:trigger`: Dispara o alerta unificado na interface com toast e atualização de dados.

---

## 🔔 21. Notificações Web Push do Clã (PWA) (`/api/push`)
Rotas responsáveis pela entrega de alarmes e avisos direto na tela de bloqueio dos celulares Android e iOS em segundo plano (mesmo com navegador fechado), utilizando a tecnologia nativa de Service Worker e o protocolo VAPID / Web Push.

| Método | Rota | Autenticação | Descrição |
|:---|:---|:---|:---|
| `GET` | `/api/push/public-key` | JWT | Retorna a chave pública VAPID para o navegador subscrever o push |
| `POST` | `/api/push/subscribe` | JWT | Cadastra o endpoint e chaves criptográficas (`p256dh`, `auth`) do celular no banco (`family_push_subscriptions`) |
| `POST` | `/api/push/unsubscribe` | JWT | Cancela a inscrição de um aparelho |
| `GET` | `/api/push/status` | JWT | Retorna estatísticas de celulares conectados no clã e se o dispositivo atual está ativo |
| `POST` | `/api/push/test` | JWT | Dispara uma notificação de teste imediata com vibração para o próprio aparelho |
| `POST` | `/api/push/broadcast` | JWT (PARENT/ADMIN) | Dispara comunicado livre ou convocação programada (`BREAKFAST`, `KITCHEN`, `LUNCH`, `SNACK_WATER`, `DINNER`, `BEDTIME`) para todos os celulares da família |









