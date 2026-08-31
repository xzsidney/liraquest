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

### Exemplo: `POST /api/family/join`
- **Body:**
  ```json
  {
    "invite_code": "LIRA-7842"
  }
  ```
- **Resposta Sucesso (200):**
  ```json
  {
    "success": true,
    "message": "Você ingressou na família \"Clã Lira\" com sucesso!",
    "family": { "id": "uuid...", "name": "Clã Lira", "invite_code": "LIRA-7842" }
  }
  ```

---

## 4. Módulo de Personagem & Herói (`/api/character`)

| Método | Rota | Autenticação | Descrição |
|:---|:---|:---|:---|
| `GET` | `/api/character/me` | JWT | Retorna o herói, classe ativa, nível, atributos e habilidades do usuário |
| `POST` | `/api/character/create` | JWT | Cria o herói (Nome, Sexo, Avatar, Classe Inicial com atributos base) |
| `PUT` | `/api/character/update-profile` | JWT | Salva dados reais do usuário (Telefone, Escola/Trabalho, Foto) |
| `POST` | `/api/character/change-class` | JWT | Alterna classe ativa preservando o progresso (Multi-Classe) |

### Exemplo: `POST /api/character/create`
- **Body:**
  ```json
  {
    "name": "Davi Valente",
    "gender": "MALE",
    "avatar_type": "SPRITE",
    "avatar_value": "hero_warrior",
    "initial_class_id": "6cacfc3a-d5fa-4860-bc50-c2c2bcf91359"
  }
  ```
- **Resposta Sucesso (201):**
  ```json
  {
    "success": true,
    "message": "⚔️ O Herói \"Davi Valente\" (Guardião do Lar) nasceu no reino de LiraQuest!",
    "character": {
      "id": "uuid...",
      "name": "Davi Valente",
      "gold": 50,
      "current_class": { "name": "Guardião do Lar" },
      "attributes": [ ... ],
      "skills": [ ... ]
    }
  }
  ```

---

## 5. Módulos Futuros (Fases 3 & 4)

### 📋 Tarefas & Missões (`/api/tasks`) — *Fase 3*
- `GET /api/tasks`: Lista as missões disponíveis para a família do usuário.
- `POST /api/tasks`: Cria uma nova missão (Pais).
- `POST /api/tasks/:taskId/submit`: Filho envia prova da missão realizada (foto + texto).
- `POST /api/tasks/submissions/:submissionId/review`: Pai aprova ou rejeita a prova enviada.

### 🎮 WebSockets em Tempo Real (Socket.IO) — *Fase 4*
- `join_family_room`: Conexão com o clã familiar em tempo real.
- `task_submitted` & `task_approved`: Notificações instantâneas familiares.
- `raid_lobby_join`, `raid_start`, `raid_hero_action`, `raid_turn_update`: Batalhas Phaser 2D em tempo real.
