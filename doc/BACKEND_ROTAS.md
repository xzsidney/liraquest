# LiraQuest - Mapeamento de Rotas do Backend & WebSockets

O backend do LiraQuest roda no servidor Express integrado com suporte a WebSockets em tempo real (Socket.IO).

---

## 🌐 1. Rotas da API REST (`/api/...`)

### 🛡️ Personagens & Ficha (`/api/family/characters`)
* **`GET /api/family/characters`**: Lista todos os heróis da família com status, nível, HP, MP e Ouro.
* **`POST /api/family/characters/:id/avatar`**: Atualiza o avatar ou sprite MUGEN (`sprite:capamerica`, etc.).
* **`POST /api/family/characters/:id/class`**: Altera a classe do herói (`GUERREIRO`, `MAGO`, etc.).
* **`POST /api/family/characters/:id/stats`**: Aprimora um atributo (`strength`, `wisdom`, `vitality`, `agility`).
* **`POST /api/family/characters/:id/recover`**: Libera alta médica imediata da Enfermaria Real.

### 📋 Tarefas & Missões (`/api/family/tasks`)
* **`GET /api/family/tasks`**: Retorna as tarefas ativas e pendentes de aprovação.
* **`POST /api/family/tasks`**: Cria nova tarefa no mural (restrito aos Pais).
* **`POST /api/family/tasks/:id/complete`**: Filho marca a tarefa como concluída.
* **`POST /api/family/tasks/:id/approve`**: Pais aprovam a tarefa e creditam XP + Ouro no herói.

### 🛍️ Loja do Reino (`/api/family/rewards`)
* **`GET /api/family/rewards`**: Lista itens disponíveis para resgate.
* **`POST /api/family/rewards/:id/purchase`**: Resgata o prêmio debitando o Ouro da ficha do herói.

---

## ⚡ 2. Eventos de WebSockets (Socket.IO)

### Conexão e Presença
* `family:join_room`: Registra a presença do herói no Reino Online.
* `family:presence_update`: Transmite a lista de quem está conectado agora.
* `family:send_reaction`: Emojis e reações flutuantes em tempo real.

### Convocação de Raid & Batalha
* `family:create_party_lobby`: Cria sala de Raid com o Líder.
* `family:send_party_invite`: Envia convite de Raid em tempo real que abre o banner brilhante na tela de todos os convidados.
* `family:accept_party_invite`: Aceita o convite e entra no grupo da Raid.
* `family:leave_party_lobby`: Sai da sala de espera.
* `family:start_party_battle`: Inicia o combate cooperativo e distribui os heróis no Grid de 10 posições.

### Combate no Grid Tático
* `family:execute_battle_action`: Executa um movimento (`MOVE`) ou ataque (`ATTACK`, `SKILL`, `DEFEND`).
* `family:battle_updated`: Transmite em tempo real a nova posição no grid, o dano causado e o próximo turno da fila de iniciativa.
* `family:hero_knocked_out`: Notifica nocaute de um herói (0 HP) e internação na enfermaria.
* `family:battle_victory`: Comemora a vitória da família e concede XP e Ouro para todos os membros participantes.
