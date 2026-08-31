# LiraQuest - Mapeamento do Banco de Dados

O banco de dados do LiraQuest utiliza o padrão **MySQL / Sequelize** com tabelas nomeadas obrigatoriamente em `snake_case` com prefixo `family_`.

---

## 👤 0. Tabela de Autenticação

### `users` (Usuários do Sistema)
| Coluna | Tipo | Descrição |
| :--- | :--- | :--- |
| `id` | `STRING(36)` (PK) | UUID do usuário |
| `email` | `STRING` | E-mail de login |
| `password_hash` | `STRING` | Hash da senha (bcrypt) |
| `created_at` / `updated_at` | `DATE` | Auditoria |

**Relacionamentos:**
- `User` → `hasMany` → `FamilyCharacter` (via `userId`)

---

## 🗄️ 1. Tabelas de Personagens e Usuários

### `family_characters` (Heróis da Família)
Armazena a ficha, status, classe, atributos e avatar MUGEN de cada membro da família.

| Coluna | Tipo | Descrição |
| :--- | :--- | :--- |
| `id` | `STRING(36)` (PK) | UUID do herói |
| `user_id` | `STRING(36)` (FK → `users.id`) | Usuário proprietário |
| `name` | `STRING(100)` | Nome do herói |
| `character_class` | `STRING(50)` | `GUERREIRO`, `MAGO`, `PALADINO`, `CURANDEIRA`, `ARQUEIRO`, `LADINO` |
| `title` | `STRING(100)` | Título especial do herói (ex: "O Protetor") |
| `avatar_url` | `STRING(255)` | URL da foto ou sprite MUGEN (`sprite:capamerica`) |
| `level` | `INTEGER` | Nível atual (Padrão: 1) |
| `current_xp` | `INTEGER` | XP acumulado |
| `next_level_xp` | `INTEGER` | XP necessário para o próximo nível (Padrão: 100) |
| `gold` | `INTEGER` | Moedas de Ouro |
| `hp_current` | `INTEGER` | Vida atual (Padrão: 100) |
| `hp_max` | `INTEGER` | Vida máxima (Padrão: 100) |
| `mp_current` | `INTEGER` | Mana atual (Padrão: 50) |
| `mp_max` | `INTEGER` | Mana máxima (Padrão: 50) |
| `strength` | `INTEGER` | Força — aumenta dano físico (Padrão: 10) |
| `vitality` | `INTEGER` | Vitalidade — aumenta HP máximo (Padrão: 10) |
| `agility` | `INTEGER` | Agilidade — iniciativa e esquiva (Padrão: 10) |
| `wisdom` | `INTEGER` | Sabedoria — dano mágico e cura (Padrão: 10) |
| `heart_bond` | `INTEGER` | Vínculo afetivo — atributo especial cooperativo (Padrão: 10) |
| `equipped_weapon` | `STRING(100)` | Arma equipada (Padrão: "Espada de Madeira") |
| `equipped_armor` | `STRING(100)` | Armadura equipada (Padrão: "Túnica de Linho") |
| `equipped_pet` | `STRING(100)` | Pet de acompanhamento (nullable) |
| `is_parent` | `BOOLEAN` | Define se o herói é um Líder (Pai) |
| `order_index` | `INTEGER` | Ordem de exibição na UI |
| `in_infirmary_until` | `DATE` | Timestamp de alta médica da Enfermaria |
| `created_at` / `updated_at` | `DATE` | Auditoria |

---

## 📋 2. Tabelas de Tarefas e Gamificação

### `family_tasks` (Mural de Missões da Família)
| Coluna | Tipo | Descrição |
| :--- | :--- | :--- |
| `id` | `STRING(36)` (PK) | UUID da tarefa |
| `title` | `STRING(150)` | Título da missão |
| `description` | `TEXT` | Detalhes e instruções |
| `category` | `ENUM` | `CHORE`, `STUDY`, `VIRTUE`, `HEALTH` |
| `reward_xp` | `INTEGER` | XP concedido (Padrão: 50) |
| `reward_gold` | `INTEGER` | Ouro concedido (Padrão: 10) |
| `icon` | `STRING(50)` | Emoji ícone da tarefa |
| `cooldown_hours` | `INTEGER` | Horas de recarga antes de ser feita novamente (Padrão: 24) |
| `is_active` | `BOOLEAN` | Se a tarefa está disponível no mural |
| `created_at` / `updated_at` | `DATE` | Auditoria |

**Relacionamentos:**
- `FamilyTask` → `hasMany` → `FamilyTaskLog` (via `taskId`)

### `family_task_logs` (Histórico de Conclusões de Tarefas)
| Coluna | Tipo | Descrição |
| :--- | :--- | :--- |
| `id` | `STRING(36)` (PK) | UUID do registro |
| `character_id` | `STRING(36)` (FK → `family_characters.id`) | Herói que executou |
| `task_id` | `STRING(36)` (FK → `family_tasks.id`) | Tarefa executada |
| `status` | `ENUM` | `PENDING_APPROVAL`, `APPROVED`, `REJECTED` |
| `requested_at` | `DATE` | Momento do pedido de aprovação |
| `approved_at` | `DATE` | Momento da aprovação (nullable) |
| `approved_by_user_id` | `STRING(36)` | Usuário (Pai) que aprovou (nullable) |
| `notes` | `TEXT` | Observações do Pai ao aprovar/rejeitar (nullable) |
| `created_at` / `updated_at` | `DATE` | Auditoria |

### `family_active_missions` (Centro de Foco AFK / Pomodoro)
| Coluna | Tipo | Descrição |
| :--- | :--- | :--- |
| `id` | `STRING(36)` (PK) | UUID da missão ativa |
| `character_id` | `STRING(36)` (FK → `family_characters.id`) | Herói em foco |
| `task_id` | `STRING(36)` | ID da tarefa vinculada (nullable) |
| `title` | `STRING(150)` | Título da missão de foco |
| `category` | `STRING(50)` | Categoria do foco (Padrão: `STUDY`) |
| `duration_minutes` | `INTEGER` | Duração total do timer em minutos |
| `started_at` | `DATE` | Quando o foco foi iniciado |
| `ends_at` | `DATE` | Timestamp de término calculado |
| `status` | `ENUM` | `IN_PROGRESS`, `COMPLETED`, `CANCELLED` |
| `reward_xp` | `INTEGER` | XP a conceder na conclusão (Padrão: 50) |
| `reward_gold` | `INTEGER` | Ouro a conceder na conclusão (Padrão: 15) |
| `focus_score` | `INTEGER` | Pontuação de foco atingida (Padrão: 100) |
| `stages` | `JSON` | Estágios/checkpoints intermediários da missão |
| `created_at` / `updated_at` | `DATE` | Auditoria |

**Relacionamentos:**
- `FamilyCharacter` → `hasMany` → `FamilyActiveMission` (via `characterId`)

### `family_achievements` (Conquistas do Reino)
| Coluna | Tipo | Descrição |
| :--- | :--- | :--- |
| `id` | `STRING(36)` (PK) | UUID da conquista |
| `title` | `STRING(100)` | Nome da conquista |
| `description` | `STRING(255)` | Descrição do critério |
| `icon` | `STRING(50)` | Emoji ícone |
| `category` | `STRING(50)` | Categoria (Padrão: `GENERAL`) |
| `reward_xp` | `INTEGER` | XP de recompensa (Padrão: 50) |
| `reward_gold` | `INTEGER` | Ouro de recompensa (Padrão: 20) |
| `required_count` | `INTEGER` | Quantidade necessária para desbloquear (Padrão: 1) |
| `created_at` / `updated_at` | `DATE` | Auditoria |

---

## 🛍️ 3. Tabela da Loja do Reino

### `family_shop_items` (Itens da Loja)
| Coluna | Tipo | Descrição |
| :--- | :--- | :--- |
| `id` | `STRING(36)` (PK) | UUID do item |
| `name` | `STRING(150)` | Nome do item |
| `description` | `TEXT` | Detalhes do item |
| `item_type` | `ENUM` | `GAME_EQUIPMENT`, `GAME_POTION`, `GAME_PET`, `REAL_REWARD` |
| `cost_gold` | `INTEGER` | Preço em Ouro (Padrão: 50) |
| `stats_json` | `JSON` | Bônus de atributos concedidos (nullable) |
| `icon` | `STRING(50)` | Emoji ícone |
| `stock` | `INTEGER` | Quantidade disponível (-1 = ilimitado) |
| `is_available` | `BOOLEAN` | Se o item está visível na loja |
| `created_at` / `updated_at` | `DATE` | Auditoria |

---

## ⚔️ 4. Tabelas de Batalhas e Raids

### `family_battles` (Batalhas 1v1 e Raids Multiplayer)
| Coluna | Tipo | Descrição |
| :--- | :--- | :--- |
| `id` | `STRING(36)` (PK) | UUID da batalha |
| `title` | `STRING(150)` | Nome do combate |
| `monster_name` | `STRING(100)` | Nome do Chefe |
| `monster_avatar` | `STRING(255)` | URL do avatar do Chefe |
| `monster_hp_current` | `INTEGER` | HP atual do Chefe (Padrão: 500) |
| `monster_hp_max` | `INTEGER` | HP máximo do Chefe (Padrão: 500) |
| `monster_attack` | `INTEGER` | Poder de ataque do Chefe (Padrão: 20) |
| `monster_defense` | `INTEGER` | Defesa do Chefe (Padrão: 5) |
| `reward_xp` | `INTEGER` | XP concedido na vitória (Padrão: 150) |
| `reward_gold` | `INTEGER` | Ouro concedido na vitória (Padrão: 50) |
| `status` | `ENUM` | `IN_PROGRESS`, `VICTORY`, `DEFEAT` |
| `current_turn_order` | `JSON` | Fila de iniciativa (ex: `["id_heroi_a", "id_heroi_b", "MONSTER"]`) |
| `active_turn_index` | `INTEGER` | Índice do turno atual na fila (Padrão: 0) |
| `battle_logs` | `JSON` | Histórico de mensagens de combate em tempo real |
| `grid_positions` | `JSON` | Posição de cada herói e do monstro no Grid (0 a 9) |
| `created_at` / `updated_at` | `DATE` | Auditoria |

**Relacionamentos:**
- `FamilyBattle` → `hasMany` → `FamilyBattleParticipant` (via `battleId`)

### `family_battle_participants` (Participantes de Cada Batalha)
| Coluna | Tipo | Descrição |
| :--- | :--- | :--- |
| `id` | `STRING(36)` (PK) | UUID do registro |
| `battle_id` | `STRING(36)` (FK → `family_battles.id`) | Batalha vinculada |
| `character_id` | `STRING(36)` (FK → `family_characters.id`) | Herói participante |
| `turn_order` | `INTEGER` | Posição na fila de iniciativa (Padrão: 0) |
| `is_defending` | `BOOLEAN` | Se o herói está em postura defensiva |
| `current_status` | `JSON` | Status especiais ativos (buffs, debuffs, etc.) |
| `created_at` / `updated_at` | `DATE` | Auditoria |

---

## 🌟 5. Tabelas da Árvore de Talentos

### `family_class_skills` (Habilidades por Classe — Definição)
| Coluna | Tipo | Descrição |
| :--- | :--- | :--- |
| `id` | `STRING(36)` (PK) | UUID da habilidade |
| `character_class` | `STRING(50)` | Classe proprietária (`GUERREIRO`, `MAGO`, etc.) |
| `tier` | `INTEGER` | Grau da árvore (1 = Grau I, 2 = Grau II Plus, 3 = Grau III Mestre) |
| `name` | `STRING(100)` | Nome da magia/golpe |
| `description` | `TEXT` | Efeito da habilidade |
| `icon` | `STRING(50)` | Emoji ícone (Padrão: `⚡`) |
| `cost_xp` | `INTEGER` | Custo em XP para desbloquear (Padrão: 50) |
| `required_skill_id` | `STRING(36)` | ID da habilidade pré-requisito (nullable) |
| `effect_type` | `STRING(50)` | Tipo do efeito (`DAMAGE`, `HEAL`, `BUFF`, `SHIELD`, `STUN`) |
| `power` | `INTEGER` | Poder base de dano ou cura (Padrão: 20) |
| `cost_mp` | `INTEGER` | Custo de Mana para usar em combate (Padrão: 10) |
| `order_index` | `INTEGER` | Ordem de exibição na árvore |
| `created_at` / `updated_at` | `DATE` | Auditoria |

**Relacionamentos:**
- `FamilyClassSkill` → `hasMany` → `FamilyCharacterSkill` (via `skillId`)

### `family_character_skills` (Habilidades Desbloqueadas por Personagem)
| Coluna | Tipo | Descrição |
| :--- | :--- | :--- |
| `id` | `STRING(36)` (PK) | UUID do registro |
| `character_id` | `STRING(36)` (FK → `family_characters.id`) | Herói proprietário |
| `skill_id` | `STRING(36)` (FK → `family_class_skills.id`) | Habilidade desbloqueada |
| `unlocked_at` | `DATE` | Data de desbloqueio |
| `is_equipped` | `BOOLEAN` | Se a skill está equipada no slot de combate |
| `created_at` / `updated_at` | `DATE` | Auditoria |

---

## 🗺️ 6. Tabelas de Localidades (Radar do Reino)

### `family_locations` (Localidades do Radar / Mundo)
| Coluna | Tipo | Descrição |
| :--- | :--- | :--- |
| `id` | `STRING(36)` (PK) | UUID da localidade |
| `name` | `STRING(100)` | Nome do local |
| `category` | `ENUM` | `HOUSE`, `NEIGHBORHOOD`, `SPECIAL` |
| `description` | `TEXT` | Descrição narrativa do local |
| `icon` | `STRING(50)` | Emoji ícone (Padrão: `🏠`) |
| `bg_image_url` | `STRING(255)` | URL da imagem de fundo |
| `order_index` | `INTEGER` | Ordem de exibição no radar |
| `is_unlocked` | `BOOLEAN` | Se a localidade está desbloqueada para os heróis |
| `created_at` / `updated_at` | `DATE` | Auditoria |

---

## 📖 7. Tabelas do Motor de Livro-Jogo (Aventuras Solo)

### `family_story_adventures` (Aventuras Disponíveis)
| Coluna | Tipo | Descrição |
| :--- | :--- | :--- |
| `id` | `STRING(36)` (PK) | UUID da aventura |
| `title` | `STRING(150)` | Título da aventura |
| `summary` | `TEXT` | Sinopse para a tela de seleção |
| `cover_image_url` | `STRING(255)` | URL da capa |
| `initial_node_id` | `STRING(50)` | ID do primeiro nó narrativo |
| `recommended_level` | `INTEGER` | Nível mínimo sugerido (Padrão: 1) |
| `reward_xp` | `INTEGER` | XP total da aventura (Padrão: 80) |
| `reward_gold` | `INTEGER` | Ouro total da aventura (Padrão: 25) |
| `is_active` | `BOOLEAN` | Se a aventura está disponível |
| `created_at` / `updated_at` | `DATE` | Auditoria |

**Relacionamentos:**
- `FamilyStoryAdventure` → `hasMany` → `FamilyStoryNode` (via `adventureId`)

### `family_story_nodes` (Nós Narrativos de Cada Aventura)
| Coluna | Tipo | Descrição |
| :--- | :--- | :--- |
| `id` | `STRING(36)` (PK) | UUID do registro |
| `adventure_id` | `STRING(36)` (FK → `family_story_adventures.id`) | Aventura pai |
| `node_id` | `STRING(50)` | Identificador de texto do nó (ex: `"start"`, `"node_2"`) |
| `title` | `STRING(150)` | Título da cena |
| `narration` | `TEXT` | Texto narrado ao jogador |
| `speaker_name` | `STRING(100)` | Nome do personagem falante (nullable) |
| `speaker_avatar` | `STRING(255)` | Avatar do personagem falante (nullable) |
| `bg_image_url` | `STRING(255)` | Imagem de fundo da cena |
| `is_ending` | `BOOLEAN` | Se este nó é um final da história |
| `ending_type` | `ENUM` | `VICTORY`, `DEFEAT`, `NEUTRAL` (nullable) |
| `reward_xp` | `INTEGER` | XP de recompensa neste nó (Padrão: 0) |
| `reward_gold` | `INTEGER` | Ouro de recompensa neste nó (Padrão: 0) |
| `created_at` / `updated_at` | `DATE` | Auditoria |

**Relacionamentos:**
- `FamilyStoryNode` → `hasMany` → `FamilyStoryChoice` (via `nodeId` do registro)

### `family_story_choices` (Escolhas de Cada Nó Narrativo)
| Coluna | Tipo | Descrição |
| :--- | :--- | :--- |
| `id` | `STRING(36)` (PK) | UUID da escolha |
| `node_record_id` | `STRING(36)` (FK → `family_story_nodes.id`) | Nó pai desta escolha |
| `text` | `STRING(255)` | Texto do botão de escolha |
| `target_node_id` | `STRING(50)` | Nó de destino padrão ao escolher |
| `test_attribute` | `STRING(50)` | Atributo testado (ex: `strength`, `wisdom`) — nullable |
| `difficulty` | `INTEGER` | Dificuldade do teste de atributo (Padrão: 0) |
| `success_node_id` | `STRING(50)` | Nó se o teste for bem-sucedido (nullable) |
| `failure_node_id` | `STRING(50)` | Nó se o teste falhar (nullable) |
| `order_index` | `INTEGER` | Ordem de exibição dos botões |
| `created_at` / `updated_at` | `DATE` | Auditoria |

---

## 📊 Resumo das Tabelas

| # | Tabela SQL | Modelo Sequelize |
|:---|:---|:---|
| 1 | `users` | `User` |
| 2 | `family_characters` | `FamilyCharacter` |
| 3 | `family_tasks` | `FamilyTask` |
| 4 | `family_task_logs` | `FamilyTaskLog` |
| 5 | `family_active_missions` | `FamilyActiveMission` |
| 6 | `family_achievements` | `FamilyAchievement` |
| 7 | `family_shop_items` | `FamilyShopItem` |
| 8 | `family_battles` | `FamilyBattle` |
| 9 | `family_battle_participants` | `FamilyBattleParticipant` |
| 10 | `family_class_skills` | `FamilyClassSkill` |
| 11 | `family_character_skills` | `FamilyCharacterSkill` |
| 12 | `family_locations` | `FamilyLocation` |
| 13 | `family_story_adventures` | `FamilyStoryAdventure` |
| 14 | `family_story_nodes` | `FamilyStoryNode` |
| 15 | `family_story_choices` | `FamilyStoryChoice` |
