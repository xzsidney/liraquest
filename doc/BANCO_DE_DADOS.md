# LiraQuest - Mapeamento do Banco de Dados

O banco de dados do LiraQuest utiliza o padrão **MySQL / Sequelize** com tabelas nomeadas obrigatoriamente em `snake_case`.

---

## 🗄️ 1. Tabelas de Personagens e Usuários

### `family_characters` (Heróis da Família)
Armazena a ficha, status, classe, atributos e avatar MUGEN de cada membro da família.

| Coluna | Tipo | Descrição |
| :--- | :--- | :--- |
| `id` | `UUID` (PK) | Identificador único do herói |
| `user_id` | `UUID` (FK) | Usuário proprietário do herói |
| `name` | `STRING` | Nome do herói (ex: Sidney Lira, Arthur Lira) |
| `character_class`| `ENUM` | `GUERREIRO`, `MAGO`, `PALADINO`, `CURANDEIRA`, `ARQUEIRO`, `LADINO` |
| `avatar_url` | `STRING` | URL da foto ou prefixo MUGEN (`sprite:capamerica`, `sprite:spiderman`, etc.) |
| `is_parent` | `BOOLEAN` | Define se o herói pertence aos pais (Líderes) |
| `level` | `INTEGER` | Nível atual do herói (Padrão: 1) |
| `current_xp` | `INTEGER` | XP acumulado |
| `next_level_xp` | `INTEGER` | XP necessário para o próximo nível |
| `gold` | `INTEGER` | Moedas de ouro acumuladas |
| `hp_current` | `INTEGER` | Vida atual |
| `hp_max` | `INTEGER` | Vida máxima |
| `mp_current` | `INTEGER` | Mana atual |
| `mp_max` | `INTEGER` | Mana máxima |
| `strength` | `INTEGER` | Força (Aumenta dano físico) |
| `wisdom` | `INTEGER` | Sabedoria (Aumenta dano mágico e cura) |
| `vitality` | `INTEGER` | Vitalidade (Aumenta HP máximo) |
| `agility` | `INTEGER` | Agilidade (Iniciativa e esquiva) |
| `in_infirmary_until` | `DATE` | Timestamp de alta médica da enfermaria |
| `created_at` / `updated_at` | `DATE` | Auditoria |

---

## 📋 2. Tabelas de Tarefas e Gamificação

### `family_tasks` (Mural de Missões da Família)
| Coluna | Tipo | Descrição |
| :--- | :--- | :--- |
| `id` | `UUID` (PK) | Identificador da tarefa |
| `title` | `STRING` | Título da missão (ex: "Arrumar a Cama", "Fazer Lição de Casa") |
| `description` | `TEXT` | Detalhes e instruções |
| `category` | `ENUM` | `ESTUDO`, `CASA`, `SAUDE`, `COMPORTAMENTO`, `ESPECIAL` |
| `reward_xp` | `INTEGER` | Pontos de XP concedidos |
| `reward_gold` | `INTEGER` | Moedas de Ouro concedidas |
| `assigned_to` | `UUID` (FK) | Herói atribuído (ou nulo para todos) |
| `status` | `ENUM` | `PENDING`, `COMPLETED`, `APPROVED` |
| `due_date` | `DATE` | Data limite de entrega |

### `family_rewards` (Loja Real do Reino)
| Coluna | Tipo | Descrição |
| :--- | :--- | :--- |
| `id` | `UUID` (PK) | Identificador da recompensa |
| `title` | `STRING` | Nome do prêmio (ex: "1 Hora de Videogame", "Passeio no Parque") |
| `description` | `TEXT` | Detalhes da recompensa |
| `cost_gold` | `INTEGER` | Preço em moedas de ouro |
| `icon` | `STRING` | Emoji ou ícone ilustrativo |
| `stock` | `INTEGER` | Quantidade disponível (-1 para infinito) |

---

## ⚔️ 3. Tabelas de Batalhas e Raids

### `family_battles` (Batalhas 1v1 e Raids Multiplayer)
| Coluna | Tipo | Descrição |
| :--- | :--- | :--- |
| `id` | `UUID` (PK) | Identificador da batalha |
| `title` | `STRING` | Nome do combate (ex: "Raid contra O Golem da Bagunça") |
| `monster_name` | `STRING` | Nome do Chefe |
| `monster_avatar` | `STRING` | Avatar do Chefe |
| `monster_hp_current` | `INTEGER` | HP atual do Chefe |
| `monster_hp_max` | `INTEGER` | HP máximo do Chefe |
| `monster_attack` | `INTEGER` | Poder de ataque do Chefe |
| `monster_defense`| `INTEGER` | Defesa do Chefe |
| `status` | `ENUM` | `IN_PROGRESS`, `VICTORY`, `DEFEAT` |
| `current_turn_order` | `JSON` | Fila de iniciativa (ex: `["id_sidney", "id_filho", "MONSTER"]`) |
| `active_turn_index` | `INTEGER` | Índice da fila do turno atual |
| `grid_positions` | `JSON` | Posição de cada herói e do monstro no Grid de 10 casas |
| `battle_logs` | `JSON` | Histórico dos golpes e ações em tempo real |
| `reward_xp` | `INTEGER` | XP total concedido na vitória |
| `reward_gold` | `INTEGER` | Ouro total concedido na vitória |

### `family_skills` (Árvore de Talentos & Magias)
| Coluna | Tipo | Descrição |
| :--- | :--- | :--- |
| `id` | `UUID` (PK) | Identificador da habilidade |
| `class_key` | `STRING` | Classe proprietária (`GUERREIRO`, `MAGO`, etc.) |
| `tier` | `INTEGER` | Nível/Andar da árvore de talentos (1 a 4) |
| `name` | `STRING` | Nome da magia/golpe |
| `description` | `TEXT` | Efeito da habilidade |
| `cost_mp` | `INTEGER` | Custo de Mana |
| `power` | `INTEGER` | Dano base ou poder de cura |
| `effect_type` | `ENUM` | `DAMAGE`, `HEAL`, `BUFF`, `SHIELD`, `STUN` |
| `icon` | `STRING` | Ícone emoji |
