# 🗄️ LiraQuest — Arquitetura e Mapa do Banco de Dados (MySQL)

Este documento descreve todas as tabelas criadas no banco de dados MySQL de produção na Hostinger, seus propósitos, colunas e relacionamentos.

---

## 📌 Padrão de Nomenclatura e Identificadores (UUID / GUID Obrigatório)
- **Chaves Primárias (`id`) & Estrangeiras (`*_id`):** Todas as tabelas utilizam obrigatoriamente identificadores únicos do tipo **UUID** (UUIDv4) para evitar previsibilidade e garantir compatibilidade distribuída.
- **Identificadores Amigáveis (`code`):** Tabelas de catálogo imutável (`definition_*`) utilizam chave primária UUID e possuem uma coluna adicional `code` (string única, ex: `'str'`, `'guardiao_do_lar'`) para facilitar buscas e referências legíveis por código.
- **Tabelas SQL:** `snake_case` minúsculo.
- **Modelos Sequelize:** `PascalCase` nos arquivos JavaScript/Node.js com `tableName` e `underscored: true` configurados.
- **Divisão Arquitetural:** 
  1. `definition_*` (Catálogo global imutável)
  2. `characters` & `character_*` (Instâncias vivas do jogador / Multi-Classe)
  3. `families` & `family_*` (Núcleo social e familiar)
  4. `tasks`, `events`, `battles` (Gameplay e gamificação)

---

## 1. Módulo de Contas e Usuários

### 👤 `family_users`
Armazena a conta de acesso ao sistema (Mundo Real).

| Coluna | Tipo | Nulo | Descrição |
|:---|:---|:---|:---|
| `id` | `UUID` (PK) | Não | Identificador único do usuário |
| `name` | `VARCHAR(100)` | Não | Nome real do usuário |
| `email` | `VARCHAR(150)` | Não | E-mail de login (Único) |
| `password` | `VARCHAR(255)` | Não | Hash seguro bcrypt |
| `role` | `ENUM('ADMIN','PARENT','CHILD')` | Não | Papel no sistema (Padrão: `CHILD`) |
| `phone` | `VARCHAR(30)` | Sim | Telefone de contato real |
| `school_or_work` | `VARCHAR(150)` | Sim | Instituição de estudo ou trabalho |
| `profile_photo_url` | `VARCHAR(255)` | Sim | URL da foto real do usuário |
| `created_at` / `updated_at` | `DATETIME` | Não | Timestamps |

### 📈 `user_progress`
Armazena o estado vivo, saldos do mundo real e estatísticas do usuário no Terminal do Usuário (relação 1:1 com `family_users`).

| Coluna | Tipo | Nulo | Descrição |
|:---|:---|:---|:---|
| `id` | `UUID` (PK) | Não | Identificador único do progresso |
| `user_id` | `UUID` (FK) | Não | Referência a `family_users.id` (Único / 1:1) |
| `adventure_energy` | `INT` | Não | ⚡ Energia de Aventura para batalhas/masmorras |
| `family_tokens` | `INT` | Não | 🏠 Fichas do Lar para recompensas da vida real |
| `tasks_done_total` | `INT` | Não | 📊 Total acumulado de tarefas aprovadas |
| `tasks_done_today` | `INT` | Não | 📅 Tarefas aprovadas no dia de hoje |
| `streak_days` | `INT` | Não | 🔥 Dias consecutivos com tarefas completadas |
| `best_streak_days` | `INT` | Não | 🏆 Maior streak histórica alcançada |
| `last_active_date` | `DATEONLY` | Sim | 📆 Data da última tarefa aprovada ('YYYY-MM-DD') |
| `created_at` / `updated_at` | `DATETIME` | Não | Timestamps |

---


## 2. Módulo Familiar (Clãs)

### 🏰 `families`
Armazena os clãs/famílias criados pelos Guardiões (Pais).

| Coluna | Tipo | Nulo | Descrição |
|:---|:---|:---|:---|
| `id` | `UUID` (PK) | Não | Identificador único da família |
| `name` | `VARCHAR(100)` | Não | Nome da família (ex: "Clã Lira") |
| `invite_code` | `VARCHAR(10)` | Não | Código único para entrada de membros |
| `created_by` | `UUID` (FK) | Não | Referência a `family_users.id` (Guardião criador) |
| `created_at` / `updated_at` | `DATETIME` | Não | Timestamps |

### 👥 `family_members`
Associa os usuários às suas famílias e define seu papel familiar.

| Coluna | Tipo | Nulo | Descrição |
|:---|:---|:---|:---|
| `id` | `UUID` (PK) | Não | Identificador único da adesão |
| `family_id` | `UUID` (FK) | Não | Referência a `families.id` |
| `user_id` | `UUID` (FK) | Não | Referência a `family_users.id` |
| `role_in_family` | `ENUM('GUARDIAN','MEMBER')` | Não | Papel dentro do clã |
| `joined_at` | `DATETIME` | Não | Data de entrada na família |
| `created_at` / `updated_at` | `DATETIME` | Não | Timestamps |

---

## 3. Módulo de Catálogo Global (`definition_*`)

### ⚡ `definition_attributes`
Catálogo dos 6 atributos fundamentais do RPG LiraQuest.

| Coluna | Tipo | Nulo | Descrição |
|:---|:---|:---|:---|
| `id` | `UUID` (PK) | Não | Identificador único UUID |
| `code` | `VARCHAR(20)` (Unique) | Não | Código legível (`str`, `agi`, `con`, `int`, `cha`, `luk`) |
| `name` | `VARCHAR(50)` | Não | Nome do atributo (ex: Força, Agilidade) |
| `description` | `TEXT` | Sim | Explicação temática do atributo |
| `combat_role` | `VARCHAR(255)` | Não | Impacto no combate tático / raids |
| `real_life_role` | `VARCHAR(255)` | Não | Conexão com tarefas e hábitos reais |
| `created_at` / `updated_at` | `DATETIME` | Não | Timestamps |

### 🛡️ `definition_classes`
Catálogo das 6 classes de heróis disponíveis.

| Coluna | Tipo | Nulo | Descrição |
|:---|:---|:---|:---|
| `id` | `UUID` (PK) | Não | Identificador único UUID |
| `code` | `VARCHAR(50)` (Unique) | Não | Código da classe (ex: `guardiao_do_lar`) |
| `name` | `VARCHAR(100)` | Não | Nome da classe |
| `description` | `TEXT` | Sim | Resumo do arquétipo |
| `primary_attribute_id` | `UUID` (FK) | Não | Atributo principal (`definition_attributes.id`) |
| `secondary_attribute_id` | `UUID` (FK) | Não | Atributo secundário (`definition_attributes.id`) |
| `combat_role` | `VARCHAR(100)` | Não | Papel em combate (Tanque, Mago, Curandeiro, etc.) |
| `real_life_focus` | `VARCHAR(255)` | Não | Foco de hábitos na vida real |
| `icon` | `VARCHAR(100)` | Sim | Ícone identificador |
| `created_at` / `updated_at` | `DATETIME` | Não | Timestamps |

### 🔮 `definition_skills`
Habilidades e magias da Árvore de Talentos de cada classe (Tiers I, II e III).

| Coluna | Tipo | Nulo | Descrição |
|:---|:---|:---|:---|
| `id` | `UUID` (PK) | Não | Identificador único da habilidade |
| `code` | `VARCHAR(50)` (Unique) | Não | Código único da habilidade |
| `class_id` | `UUID` (FK) | Não | Referência a `definition_classes.id` |
| `tier` | `INT` | Não | Tier da habilidade (1 = Básico, 2 = Veterano, 3 = Mestre) |
| `name` | `VARCHAR(100)` | Não | Nome da habilidade |
| `description` | `TEXT` | Sim | Efeito detalhado da habilidade |
| `mana_cost` | `INT` | Não | Custo de Mana (MP) |
| `cooldown_turns` | `INT` | Não | Tempo de recarga em turnos |
| `required_skill_id` | `UUID` (FK) | Sim | Pré-requisito na Árvore de Talentos |
| `xp_cost_to_unlock` | `INT` | Não | Custo em XP para aprender |
| `damage_multiplier` | `FLOAT` | Não | Multiplicador de dano base |
| `heal_amount` | `INT` | Não | Valor base de cura |
| `effect_type` | `VARCHAR(50)` | Sim | Tipo de efeito (`SHIELD`, `MAGIC_DAMAGE`, `HEAL`, etc.) |
| `icon` | `VARCHAR(100)` | Sim | Ícone de combate |
| `created_at` / `updated_at` | `DATETIME` | Não | Timestamps |

### 🗡️ `definition_items`
Catálogo de itens da Loja do Reino (equipamentos, consumíveis e recompensas reais).

| Coluna | Tipo | Nulo | Descrição |
|:---|:---|:---|:---|
| `id` | `UUID` (PK) | Não | Identificador único UUID |
| `code` | `VARCHAR(50)` (Unique) | Não | Código único do item |
| `name` | `VARCHAR(100)` | Não | Nome do item |
| `description` | `TEXT` | Sim | Descrição do item |
| `type` | `ENUM(...)` | Não | `WEAPON`, `ARMOR`, `ACCESSORY`, `POTION`, `REAL_WORLD` |
| `price_gold` | `INT` | Não | Custo em moedas de ouro |
| `stat_bonuses` | `JSON` | Sim | Bônus aplicados aos atributos (ex: `{"str": 2}`) |
| `icon` | `VARCHAR(100)` | Sim | Ícone do item |
| `created_at` / `updated_at` | `DATETIME` | Não | Timestamps |

### 🐉 `definition_monsters`
Catálogo de monstros e chefes para o motor de combate Phaser e Raids.

| Coluna | Tipo | Nulo | Descrição |
|:---|:---|:---|:---|
| `id` | `UUID` (PK) | Não | Identificador único UUID |
| `code` | `VARCHAR(50)` (Unique) | Não | Código único do monstro |
| `name` | `VARCHAR(100)` | Não | Nome do monstro |
| `description` | `TEXT` | Sim | Descrição e história do monstro |
| `is_boss` | `BOOLEAN` | Não | `true` se for Chefe de Raid |
| `max_hp` | `INT` | Não | Pontos de vida máximos |
| `attack_power` | `INT` | Não | Poder de ataque |
| `defense` | `INT` | Não | Defesa física |
| `speed` | `INT` | Não | Velocidade para ordem de iniciativa |
| `xp_reward` | `INT` | Não | XP concedido ao derrotar |
| `gold_reward` | `INT` | Não | Ouro concedido ao derrotar |
| `sprite_key` | `VARCHAR(100)` | Sim | Chave do sprite visual |
| `created_at` / `updated_at` | `DATETIME` | Não | Timestamps |

### 📋 `definition_tasks`
Catálogo oficial das 42 tarefas padrão da vida real (Domestic, Study, Health, Creative, Social).

| Coluna | Tipo | Nulo | Descrição |
|:---|:---|:---|:---|
| `id` | `UUID` (PK) | Não | Identificador único UUID |
| `slug` | `VARCHAR(100)` (Unique) | Não | Identificador legível (ex: `'arrumar-cama'`) |
| `name` | `VARCHAR(150)` | Não | Nome da missão exibido no app |
| `description` | `TEXT` | Sim | Instruções práticas |
| `category` | `ENUM(...)` | Não | `DOMESTIC`, `STUDY`, `HEALTH`, `CREATIVE`, `SOCIAL` |
| `difficulty` | `ENUM(...)` | Não | `EASY`, `MEDIUM`, `HARD` |
| `allowed_profile` | `ENUM(...)` | Não | `ALL`, `CHILD_ONLY`, `ADULT_ONLY` |
| `reward_xp` | `INT` | Não | XP concedido ao completar |
| `reward_gold` | `INT` | Não | Ouro concedido ao completar |
| `reward_energy` | `INT` | Não | ⚡ Energia de Aventura concedida |
| `estimated_time` | `VARCHAR(50)` | Sim | Tempo estimado (ex: `'5-10 min'`) |
| `requires_proof` | `BOOLEAN` | Não | Se exige foto/texto como prova |
| `created_at` / `updated_at` | `DATETIME` | Não | Timestamps |


---

## 4. Módulo de Personagem (`characters` e `character_*`)

### ⚔️ `characters`
Identidade de RPG do jogador no Mundo do Jogo.

| Coluna | Tipo | Nulo | Descrição |
|:---|:---|:---|:---|
| `id` | `UUID` (PK) | Não | Identificador único do personagem |
| `user_id` | `UUID` (FK) | Não | Referência a `family_users.id` (1 personagem por usuário) |
| `name` | `VARCHAR(100)` | Não | Nome do herói no jogo |
| `gender` | `ENUM('MALE','FEMALE','OTHER')` | Não | Sexo do personagem |
| `avatar_type` | `ENUM('PHOTO','SPRITE')` | Não | Tipo de avatar escolhido |
| `avatar_value` | `VARCHAR(255)` | Não | URL da foto ou ID do sprite MUGEN |
| `current_class_id` | `UUID` (FK) | Sim | Classe ativa atualmente (`definition_classes.id`) |
| `gold` | `INT` | Não | Ouro acumulado pelo herói |
| `is_in_infirmary` | `BOOLEAN` | Não | Flag se está internado na Enfermaria Real |
| `infirmary_until` | `DATETIME` | Sim | Data e hora de liberação da enfermaria |
| `created_at` / `updated_at` | `DATETIME` | Não | Timestamps |

### 📈 `character_classes`
Progresso individual de cada classe jogada (Sistema Multi-Classe).

| Coluna | Tipo | Nulo | Descrição |
|:---|:---|:---|:---|
| `id` | `UUID` (PK) | Não | Identificador do registro |
| `character_id` | `UUID` (FK) | Não | Referência a `characters.id` |
| `class_id` | `UUID` (FK) | Não | Referência a `definition_classes.id` |
| `level` | `INT` | Não | Nível alcançado nesta classe específica |
| `xp` | `INT` | Não | Experiência acumulada nesta classe |
| `created_at` / `updated_at` | `DATETIME` | Não | Timestamps |
| *Constraint* | `UNIQUE(character_id, class_id)` | | Garante 1 registro por classe por herói |

### 📊 `character_attributes`
Valores atuais dos 6 atributos do personagem.

| Coluna | Tipo | Nulo | Descrição |
|:---|:---|:---|:---|
| `id` | `UUID` (PK) | Não | Identificador do registro |
| `character_id` | `UUID` (FK) | Não | Referência a `characters.id` |
| `attribute_id` | `UUID` (FK) | Não | Referência a `definition_attributes.id` |
| `base_value` | `INT` | Não | Valor base (inicia em 10) |
| `bonus_value` | `INT` | Não | Bônus de equipamentos ou buffs |
| `created_at` / `updated_at` | `DATETIME` | Não | Timestamps |
| *Constraint* | `UNIQUE(character_id, attribute_id)` | | 1 valor por atributo por herói |

### 📜 `character_skills`
Habilidades desbloqueadas na Árvore de Talentos pelo herói.

| Coluna | Tipo | Nulo | Descrição |
|:---|:---|:---|:---|
| `id` | `UUID` (PK) | Não | Identificador |
| `character_id` | `UUID` (FK) | Não | Referência a `characters.id` |
| `skill_id` | `UUID` (FK) | Não | Referência a `definition_skills.id` |
| `is_equipped` | `BOOLEAN` | Não | `true` se está equipada no deck de combate |
| `unlocked_at` | `DATETIME` | Não | Data em que foi aprendida com XP |
| `created_at` / `updated_at` | `DATETIME` | Não | Timestamps |
| *Constraint* | `UNIQUE(character_id, skill_id)` | | Habilidade única por herói |

### 🎒 `character_inventory`
Inventário e equipamentos ativos do herói.

| Coluna | Tipo | Nulo | Descrição |
|:---|:---|:---|:---|
| `id` | `UUID` (PK) | Não | Identificador |
| `character_id` | `UUID` (FK) | Não | Referência a `characters.id` |
| `item_id` | `UUID` (FK) | Não | Referência a `definition_items.id` |
| `quantity` | `INT` | Não | Quantidade do item |
| `is_equipped` | `BOOLEAN` | Não | Se o item está equipado |
| `created_at` / `updated_at` | `DATETIME` | Não | Timestamps |

---

## 5. Módulo de Gameplay (Tarefas, Provas e Raids)

### 📋 `tasks`
Missões da vida real criadas pelos Pais (Guardiões).

| Coluna | Tipo | Nulo | Descrição |
|:---|:---|:---|:---|
| `id` | `UUID` (PK) | Não | Identificador da tarefa |
| `family_id` | `UUID` (FK) | Não | Família dona da missão |
| `created_by` | `UUID` (FK) | Não | Usuário pai que criou |
| `assigned_to` | `UUID` (FK) | Sim | Usuário filho designado (ou aberto) |
| `title` | `VARCHAR(150)` | Não | Título da missão |
| `description` | `TEXT` | Sim | Detalhes e instruções |
| `xp_reward` | `INT` | Não | XP concedido ao herói |
| `gold_reward` | `INT` | Não | Ouro concedido ao herói |
| `energy_reward` | `INT` | Não | ⚡ Energia de Aventura concedida ao herói |
| `token_reward` | `INT` | Não | 🏠 Fichas do Lar concedidas ao usuário real |
| `category` | `ENUM('DOMESTIC','STUDY','HEALTH','CREATIVE','SOCIAL','GERAL')` | Não | Categoria da missão |
| `difficulty` | `ENUM('EASY','MEDIUM','HARD')` | Não | Dificuldade da tarefa |
| `allowed_profile` | `ENUM('ALL','CHILD_ONLY','ADULT_ONLY')` | Não | Perfil com permissão de visualizar |
| `requires_proof` | `BOOLEAN` | Não | Se exige foto/texto como prova |
| `estimated_time` | `VARCHAR(50)` | Sim | Tempo estimado de execução (ex: '15-20 min') |
| `is_active` | `BOOLEAN` | Não | Status da tarefa |
| `created_at` / `updated_at` | `DATETIME` | Não | Timestamps |

### 📸 `task_submissions`
Envios de comprovação remota (foto + texto) pelos filhos para aprovação dos pais.

| Coluna | Tipo | Nulo | Descrição |
|:---|:---|:---|:---|
| `id` | `UUID` (PK) | Não | Identificador da submissão |
| `task_id` | `UUID` (FK) | Não | Referência a `tasks.id` |
| `user_id` | `UUID` (FK) | Não | Usuário que enviou a prova |
| `character_id` | `UUID` (FK) | Sim | Personagem que receberá as recompensas |
| `proof_text` | `TEXT` | Sim | Relato da conclusão da tarefa |
| `proof_photo_url` | `VARCHAR(255)` | Sim | URL da foto anexada como evidência |
| `status` | `ENUM('PENDING','APPROVED','REJECTED')` | Não | Estado da avaliação |
| `feedback` | `TEXT` | Sim | Mensagem de feedback do avaliador |
| `reviewed_by` | `UUID` (FK) | Sim | Usuário pai que avaliou |
| `reviewed_at` | `DATETIME` | Sim | Data e hora da avaliação |
| `created_at` / `updated_at` | `DATETIME` | Não | Timestamps |

### 🎉 `events`
Eventos sazonais e gincanas da família (Natal, Férias, etc.).

| Coluna | Tipo | Nulo | Descrição |
|:---|:---|:---|:---|
| `id` | `UUID` (PK) | Não | Identificador do evento |
| `family_id` | `UUID` (FK) | Sim | Família do evento (ou global) |
| `title` | `VARCHAR(150)` | Não | Nome do evento |
| `description` | `TEXT` | Sim | Regras e temática |
| `start_date` / `end_date` | `DATETIME` | Não | Período de vigência |
| `is_active` | `BOOLEAN` | Não | Flag ativo |
| `created_at` / `updated_at` | `DATETIME` | Não | Timestamps |

### ⚔️ `battles`
Histórico de batalhas e Raids cooperativas familiares.

| Coluna | Tipo | Nulo | Descrição |
|:---|:---|:---|:---|
| `id` | `UUID` (PK) | Não | Identificador da batalha |
| `family_id` | `UUID` (FK) | Não | Família participante |
| `monster_id` | `UUID` (FK) | Não | Monstro enfrentado (`definition_monsters.id`) |
| `status` | `ENUM('IN_PROGRESS','VICTORY','DEFEAT')` | Não | Resultado da batalha |
| `battle_log` | `JSON` | Sim | Log completo de ações dos turnos |
| `created_at` / `updated_at` | `DATETIME` | Não | Timestamps |
