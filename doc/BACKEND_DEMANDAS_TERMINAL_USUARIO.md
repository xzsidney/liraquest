# 📡 Demandas do Backend — Suporte ao Terminal do Usuário (LiraQuest)
### Documento Técnico para o Desenvolvedor Backend

Este documento descreve os modelos, rotas e regras de negócio que o **backend** precisa fornecer para alimentar a interface do **Terminal do Usuário (Painel da Vida Real)** conforme especificado em `doc/FRONTEND_TERMINAL_USUARIO.md`.

---

## 🎯 1. Resumo das Demandas

1. **Criar a Tabela/Modelo `UserProgress` (`user_progress`):**
   - Armazenar o saldo de `family_tokens` (Fichas do Lar), `adventure_energy` (Energia de Aventura), `tasks_done_total`, `tasks_done_today`, `streak_days`, `best_streak_days` e `last_active_date`.
2. **Criar a Rota Unificada `GET /api/progress/dashboard`:**
   - Retornar em uma única requisição todos os dados de progresso e listas de tarefas divididas (`pending`, `approved_today`, `history`).
3. **Ajustar a Aprovação de Tarefas (`POST /api/tasks/submissions/:submissionId/review`):**
   - Ao aprovar (`APPROVED`), além de creditar XP e Ouro no `Character`, creditar `token_reward` e `energy_reward` no `UserProgress` do filho, atualizar o contador de tarefas e computar o streak diário.
4. **Endpoint de Reset / Atualização de Streak:**
   - Recalcular `tasks_done_today` e a sequência de dias consecutivos com base no `last_active_date`.

---

## 🗄️ 2. Estrutura do Banco de Dados: `user_progress`

```sql
user_progress
├── id                 UUID (PK, UUIDv4)
├── user_id            UUID (FK -> family_users.id, UNIQUE)
├── family_tokens      INTEGER (Default: 0) — Fichas do Lar para gastar na Loja da Família
├── adventure_energy   INTEGER (Default: 0) — Energia para entrar nas Masmorras/Raids
├── tasks_done_total   INTEGER (Default: 0) — Total histórico de tarefas aprovadas
├── tasks_done_today   INTEGER (Default: 0) — Tarefas aprovadas na data atual
├── streak_days        INTEGER (Default: 0) — Sequência de dias consecutivos com tarefas
├── best_streak_days   INTEGER (Default: 0) — Maior sequência já atingida
├── last_active_date   DATE (Nullable)      — Última data em que realizou tarefas
├── created_at         DATETIME
└── updated_at         DATETIME
```

---

## 🛣️ 3. Especificação do Endpoint Unificado

### `GET /api/progress/dashboard`
- **Autenticação:** Obrigatória (`Bearer <JWT>`)
- **Controlador sugerido:** `server/controllers/progressController.js`
- **Rota:** `server/routes/progressRoutes.js` vinculada no `server.js` em `/api/progress`

#### Formato do JSON de Resposta:
```json
{
  "success": true,
  "progress": {
    "adventure_energy": 5,
    "family_tokens": 120,
    "tasks_done_total": 47,
    "tasks_done_today": 2,
    "streak_days": 4,
    "best_streak_days": 11,
    "last_active_date": "2026-08-31"
  },
  "tasks": {
    "pending": [
      {
        "id": "uuid-da-tarefa",
        "title": "Arrumar a Própria Cama",
        "description": "Esticar o lençol, ajeitar cobertor e travesseiros.",
        "category": "DOMESTIC",
        "difficulty": "EASY",
        "xp_reward": 10,
        "gold_reward": 5,
        "energy_reward": 1,
        "token_reward": 5,
        "estimated_time": "5 min",
        "requires_proof": true,
        "submission_status": null
      }
    ],
    "approved_today": [
      {
        "id": "uuid-submissao",
        "task_title": "Escovar os Dentes",
        "category": "HEALTH",
        "xp_reward": 10,
        "gold_reward": 5,
        "energy_reward": 1,
        "token_reward": 5,
        "approved_at": "2026-08-31T10:15:00Z"
      }
    ],
    "history": [
      {
        "id": "uuid-submissao",
        "task_title": "Varrer um Cômodo",
        "status": "APPROVED",
        "xp_reward": 35,
        "gold_reward": 20,
        "energy_reward": 2,
        "token_reward": 15,
        "feedback": null,
        "created_at": "2026-08-30T16:20:00Z"
      }
    ]
  }
}
```

---

## ⚡ 4. Lógica de Atualização no `taskController.js` (Review)

Ao processar `reviewSubmission` com `status === 'APPROVED'`:

```javascript
// 1. Obter ou criar UserProgress do autor da tarefa
let userProgress = await UserProgress.findOne({ where: { user_id: submission.user_id } });
if (!userProgress) {
  userProgress = await UserProgress.create({
    id: randomUUID().toLowerCase(),
    user_id: submission.user_id,
  });
}

// 2. Incrementar moedas da vida real e energia
const energyGain = submission.task.energy_reward || 0;
const tokenGain = submission.task.token_reward || 0;

// 3. Atualizar Streak e contadores diários
const todayStr = new Date().toISOString().split('T')[0];
const lastDateStr = userProgress.last_active_date
  ? new Date(userProgress.last_active_date).toISOString().split('T')[0]
  : null;

let newStreak = userProgress.streak_days;
let tasksToday = userProgress.tasks_done_today;

if (lastDateStr !== todayStr) {
  // Novo dia
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split('T')[0];

  if (lastDateStr === yesterdayStr) {
    newStreak += 1;
  } else if (!lastDateStr) {
    newStreak = 1;
  } else {
    // Quebrou a sequência
    newStreak = 1;
  }
  tasksToday = 1;
} else {
  // Já pontuou hoje
  tasksToday += 1;
}

const bestStreak = Math.max(userProgress.best_streak_days, newStreak);

await userProgress.update({
  adventure_energy: userProgress.adventure_energy + energyGain,
  family_tokens: userProgress.family_tokens + tokenGain,
  tasks_done_total: userProgress.tasks_done_total + 1,
  tasks_done_today: tasksToday,
  streak_days: newStreak,
  best_streak_days: bestStreak,
  last_active_date: new Date(),
});
```

---

## 📌 5. Compatibilidade e Resiliência no Frontend

O frontend será construído com suporte nativo ao novo endpoint `GET /api/progress/dashboard` e possuirá um mecanismo de **fallback transparente**:
- Caso o endpoint `/api/progress/dashboard` retorne 404 (durante a fase de desenvolvimento do backend), o frontend consultará os endpoints existentes (`/api/tasks`, `/api/tasks/submissions/my`, `/api/character/me`) e simulará os saldos a partir dos dados do histórico, garantindo funcionamento ininterrupto para testes de interface.
