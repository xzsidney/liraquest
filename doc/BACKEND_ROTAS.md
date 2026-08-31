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

### Detalhes dos Endpoints de Autenticação

#### `POST /api/auth/register`
- **Body:**
  ```json
  {
    "name": "Nome Completo",
    "email": "usuario@liraquest.com",
    "password": "senhaSegura123"
  }
  ```
- **Resposta Sucesso (201):**
  ```json
  {
    "success": true,
    "message": "Conta criada com sucesso!",
    "token": "eyJhbGciOi...",
    "user": {
      "id": "uuid...",
      "name": "Nome Completo",
      "email": "usuario@liraquest.com",
      "role": "CHILD",
      "phone": null,
      "school_or_work": null,
      "profile_photo_url": null,
      "created_at": "..."
    }
  }
  ```

#### `POST /api/auth/login`
- **Body:**
  ```json
  {
    "email": "usuario@liraquest.com",
    "password": "senhaSegura123"
  }
  ```
- **Resposta Sucesso (200):**
  ```json
  {
    "success": true,
    "message": "Bem-vindo de volta, Nome!",
    "token": "eyJhbGciOi...",
    "user": { ... }
  }
  ```

---

## 2. Módulos Mapeados para as Próximas Fases

### 👨‍👩‍👧‍👦 Família & Clã (`/api/family`) — *Fase 2*
- `POST /api/family/create`: Cria um novo clã familiar e gera código de convite (Restrito a `PARENT` / `ADMIN`).
- `POST /api/family/join`: Entra em uma família existente utilizando o código de convite.
- `GET /api/family/my-family`: Retorna os dados da família do usuário e lista todos os membros e heróis vinculados.

### ⚔️ Personagem do Herói (`/api/character`) — *Fase 2*
- `GET /api/character/me`: Retorna o personagem do usuário autenticado (ou status indicando que ainda não foi criado).
- `POST /api/character/create`: Cria o personagem do herói (Nome, Sexo, Avatar Foto/Sprite).
- `PUT /api/character/update-profile`: Atualiza dados reais do perfil (Telefone, Escola/Trabalho, Foto).
- `POST /api/character/change-class`: Troca a classe ativa preservando o progresso da classe anterior.
- `POST /api/character/learn-skill`: Desbloqueia habilidade na Árvore de Talentos consumindo XP.

### 📚 Catálogo Global (`/api/catalog`) — *Fase 2*
- `GET /api/catalog/attributes`: Lista os 6 atributos (`STR`, `AGI`, `CON`, `INT`, `CHA`, `LUK`).
- `GET /api/catalog/classes`: Lista as 6 classes de heróis e seus atributos primários/secundários.
- `GET /api/catalog/skills/:classId`: Retorna a Árvore de Talentos completa de uma classe.
- `GET /api/catalog/items`: Lista os itens e recompensas disponíveis na Loja do Reino.

### 📋 Tarefas & Missões (`/api/tasks`) — *Fase 3*
- `GET /api/tasks`: Lista as missões disponíveis para a família do usuário.
- `POST /api/tasks`: Cria uma nova missão (Pais).
- `POST /api/tasks/:taskId/submit`: Filho envia prova da missão realizada (foto + texto).
- `POST /api/tasks/submissions/:submissionId/review`: Pai aprova ou rejeita a prova enviada (creditando XP e Ouro automaticamente se aprovada).

---

## 3. WebSockets em Tempo Real (Socket.IO) — *Fase 4*

### Eventos de Sala Familiar
- `join_family_room`: O cliente se conecta à sala de eventos do seu clã familiar (`family_{id}`).
- `task_submitted`: Notificação instantânea para os pais quando um filho submete uma prova.
- `task_approved`: Notificação instantânea com efeito sonoro e visual para o herói quando sua missão é aprovada.

### Eventos de Raid & Combate Cooperativo
- `raid_lobby_join`: Heróis entram no saguão de preparação da Raid contra o Chefe.
- `raid_start`: Início sincronizado do combate Phaser 2D em tempo real.
- `raid_hero_action`: Envio da ação do turno do herói (ataque, habilidade, cura, poção).
- `raid_turn_update`: Broadcast para todos os participantes do estado do campo, fila de iniciativa e dano causado.
- `raid_victory` / `raid_defeat`: Fim da batalha com distribuição sincronizada de recompensas.
