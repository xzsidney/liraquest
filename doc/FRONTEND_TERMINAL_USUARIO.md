# 🖥️ LiraQuest — Especificação do Terminal do Usuário (Frontend)
### Documento de Referência para Desenvolvimento de Interface

> **Para quem é este documento:** Este arquivo é o guia completo para o desenvolvedor frontend construir o painel do **Terminal do Usuário** (o lado da vida real do LiraQuest). Ele descreve o que exibir, de onde vem cada dado, quais chamadas de API fazer e como os componentes devem se comportar.

---

## 🎯 O Que É o Terminal do Usuário?

O Terminal do Usuário é o **painel da vida real** — a tela que o filho (ou pai) vê quando abre o app no dia a dia. Não é o RPG, não é o avatar. É o mundo real gamificado.

**Objetivo da tela:** Mostrar as tarefas do dia, o progresso do usuário, suas moedas acumuladas e o histórico do que já foi feito — tudo de forma visual, motivadora e clara.

---

## 🧭 Estrutura da Tela (Layout Geral)

```
┌──────────────────────────────────────────────────────┐
│  NAVBAR (Logo + nome + badge de perfil + logout)      │
├──────────────┬───────────────────────────────────────┤
│              │                                        │
│   SIDEBAR    │         PAINEL PRINCIPAL               │
│   (Perfil    │  [Aba: Missões] [Aba: Estudos]         │
│   + Saldos   │  [Aba: Histórico] [Aba: Meu Perfil]   │
│   + Streak)  │                                        │
│              │                                        │
└──────────────┴───────────────────────────────────────┘
```

---

## 📡 API: A Chamada Principal do Dashboard

Ao carregar o Terminal do Usuário, fazer **uma única chamada** que retorna tudo:

```
GET /api/progress/dashboard
Authorization: Bearer <TOKEN>
```

**Resposta esperada:**
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
    "pending": [ ...lista de tarefas ativas sem submissão aprovada... ],
    "approved_today": [ ...tarefas aprovadas hoje... ],
    "history": [ ...últimas 10 submissões do usuário... ]
  }
}
```

> **Não faça múltiplas chamadas separadas ao carregar o painel.** Use este endpoint unificado para performance.

---

## 🔲 COMPONENTE 1 — Sidebar do Perfil

A sidebar fica fixa à esquerda e exibe o estado vivo do usuário.

### 📸 Foto e Identificação

| Elemento | Dado | Origem |
|:---|:---|:---|
| Foto de perfil | `user.profile_photo_url` | `localStorage` (já carregado no login) |
| Nome | `user.name` | `localStorage` |
| Badge de perfil | `user.role` → formatar: `CHILD` = `⚔️ Herói`, `PARENT` = `🛡️ Guardião` | `localStorage` |

### 💰 Saldos (os dois mais importantes da tela)

#### Fichas do Lar 🏠
```
ELEMENTO:  Card com ícone de moeda dourada
VALOR:     progress.family_tokens
LABEL:     "Fichas do Lar"
COR:       Dourado Imperial (#d4af37)
TOOLTIP:   "Troque por recompensas reais na Loja da Família"
```

#### Energia de Aventura ⚡
```
ELEMENTO:  Card com ícone de raio azul
VALOR:     progress.adventure_energy
LABEL:     "Energia de Aventura"
COR:       Azul Real (#2563eb)
TOOLTIP:   "Use esta energia para jogar no Terminal do Avatar"
```

> **IMPORTANTE:** Estes dois saldos são os principais motivadores do filho completar tarefas. Devem ser os elementos MAIS visíveis da sidebar.

### 🔥 Streak (Sequência de Dias)

```
ELEMENTO:  Ícone de chama + número
VALOR:     progress.streak_days dias seguidos
SUBLABEL:  "Recorde: X dias" (progress.best_streak_days)
COR:       Laranja / Dourado quando streak >= 3
REGRA:     Se streak = 0, exibir "Comece hoje! 💪"
```

### 📊 Mini Estatísticas

| Label | Valor |
|:---|:---|
| Hoje | `progress.tasks_done_today` tarefas |
| Total | `progress.tasks_done_total` tarefas |

---

## 🔲 COMPONENTE 2 — Abas do Painel Principal

Quatro abas de navegação:

```
[📋 Missões]  [📚 Estudos]  [📜 Histórico]  [👤 Meu Perfil]
```

---

## 🔲 ABA 1 — Missões (Padrão ao abrir)

### Seção A — Missões Pendentes

**Dado:** `tasks.pending` da resposta do dashboard

Para cada tarefa, exibir um **card de missão** com:

| Campo do Card | Dado | Visual |
|:---|:---|:---|
| Título | `task.title` | Texto principal, destaque |
| Categoria | `task.category` | Badge colorido: `🏠 DOMESTIC`, `📚 STUDY`, `💪 HEALTH`, `🎨 CREATIVE`, `🤝 SOCIAL` |
| Dificuldade | `task.difficulty` | Badge: `🟢 Fácil`, `🟡 Médio`, `🔴 Difícil` |
| Recompensas | `task.xp_reward` XP + `task.gold_reward` 💰 + `task.energy_reward` ⚡ + `task.token_reward` 🏠 | Linha de ícones + valores |
| Tempo estimado | `task.estimated_time` | Ícone de relógio + texto (ex: "15-20 min") |
| Descrição | `task.description` | Texto menor, colapsável |

**Botão de Ação:**
- Se a tarefa ainda não tem submissão: botão `"✅ Marcar como Feita"` → abre modal de comprovação
- Se tem submissão `PENDING`: badge `"⏳ Aguardando aprovação dos pais..."` (botão desabilitado)
- Se tem submissão `REJECTED`: botão `"↩️ Tentar Novamente"` + exibir feedback do pai

**Estado vazio:** Se `tasks.pending` estiver vazio → exibir:
```
🎉 Todas as missões do dia foram concluídas!
    Vá para o Terminal do Avatar e use sua Energia!
    [Botão: ⚔️ Acessar Avatar]
```

---

### Seção B — Missões Aprovadas Hoje

**Dado:** `tasks.approved_today`

Lista compacta (menor que a seção A) mostrando as conquistas do dia:
- Exibir com ícone de ✅ e cor verde suave
- Mostrar o XP e Ouro recebidos em cada uma

---

### Modal de Comprovação (ao clicar "Marcar como Feita")

```
TÍTULO: "Comprovando: [nome da tarefa]"

CAMPO 1 (Textarea):
  Label: "Conta como foi! (obrigatório)"
  Placeholder: "Descreva o que você fez..."

CAMPO 2 (File input — opcional):
  Label: "📸 Foto de prova (opcional)"
  Aceita: image/*
  Limite: 5MB

BOTÃO:  "📤 Enviar para os Pais"

API:
  POST /api/tasks/:taskId/submit
  Body: { proof_text, proof_photo_url }
  Auth: Bearer token

APÓS SUCESSO:
  - Fechar modal
  - Toast: "📸 Enviado! Aguarde a aprovação dos seus pais."
  - Mover card da tarefa de "Pendentes" para "Aguardando aprovação"
  - NÃO creditar saldos ainda (só acontece quando o pai aprovar)
```

---

## 🔲 ABA 2 — Estudos (Foco do Herói)

> **Propósito:** Temporizador Pomodoro gamificado. Quando o filho estuda, o avatar "treina" em modo AFK.

### Timer Principal

```
EXIBIÇÃO:  Relógio digital grande no centro (MM:SS)
           Padrão: 25:00
BOTÃO:     "▶️ Iniciar Sessão" / "⏸️ Pausar"
BOTÃO 2:   "🔄 Reiniciar"
STATUS:    Texto motivacional (ex: "🔥 Foco total! Seu Avatar está treinando...")

AO TERMINAR (00:00):
  - Som/vibração (se disponível)
  - Toast de parabéns
  - Exibir: "+ X ⚡ Energia ganhos!" (bônus de energia — definido pelo backend futuramente)
  - Botão: "Iniciar Nova Sessão"
```

> **Nota para o dev:** Por enquanto o timer é 100% no frontend (sem persistência no servidor). A integração com o backend para creditar energia virá na próxima fase.

### Histórico de Sessões do Dia (opcional, v2)
Mini cards mostrando as sessões completadas hoje.

---

## 🔲 ABA 3 — Histórico

**Dado:** `tasks.history` (últimas 10 submissões)

Para cada item no histórico, exibir:

| Campo | Dado | Visual |
|:---|:---|:---|
| Nome da tarefa | `submission.task.title` | Texto |
| Status | `submission.status` | Badge: `✅ APROVADA` (verde), `⏳ PENDENTE` (amarelo), `❌ REJEITADA` (vermelho) |
| Data | `submission.created_at` | Formatada: "há X dias" ou "hoje às HH:MM" |
| Recompensas (se aprovada) | XP + Ouro + Energia + Tokens | Linha compacta de ícones |
| Feedback do pai (se rejeitada) | `submission.feedback` | Caixa de texto destacada em vermelho suave |

**API para carregar mais:**
```
GET /api/tasks/submissions/my
Authorization: Bearer <TOKEN>
```

---

## 🔲 ABA 4 — Meu Perfil

### Seção A — Dados Pessoais (visualização)

| Campo | Dado | Editável |
|:---|:---|:---|
| Nome | `user.name` | ✅ Via modal |
| E-mail | `user.email` | ❌ Somente leitura |
| Telefone | `user.phone` | ✅ Via modal |
| Escola / Trabalho | `user.school_or_work` | ✅ Via modal |
| Foto de perfil | `user.profile_photo_url` | ✅ Upload direto |

**Botão:** `✏️ Editar Perfil` → Abre modal com formulário

**API de atualização:**
```
PUT /api/character/update-profile
Body: { name, phone, school_or_work, profile_photo_url }
Authorization: Bearer <TOKEN>
```

**Upload de foto:**
```
POST /api/upload/profile-photo
Body: FormData com campo "photo" (multipart)
Authorization: Bearer <TOKEN>
```

---

### Seção B — Link para o Terminal do Avatar

```
CARD ESPECIAL (destaque visual — bordô + dourado):

Título:    "⚔️ Terminal do Avatar"
Subtítulo: "Acesse seu herói e use sua Energia de Aventura"
Info:      "⚡ X Energia disponível"
Botão:     "Entrar no Reino" → navigateTo('avatar')

SE SEM AVATAR:
Botão:     "✨ Criar seu Herói" → openHeroCreationWizard()
```

---

## 🎨 Guia Visual Obrigatório

### Paleta de Cores

| Elemento | Cor |
|:---|:---|
| Botões principais / destaque | Bordô `#800020` |
| Cards / fundos profundos | Azul Real `#0f172a`, `#121722` |
| Ouro / Fichas do Lar / XP | Dourado `#d4af37` |
| Energia de Aventura | Azul elétrico `#2563eb` |
| Streak ativo (≥ 3 dias) | Laranja `#f97316` |
| Aprovado / sucesso | Verde `#10b981` |
| Pendente / alerta | Amarelo `#f59e0b` |
| Rejeitado / erro | Vermelho `#ef4444` |

### Fontes
- **Títulos e labels de destaque:** `Cinzel` (serif, estilo medieval)
- **Corpo e textos:** `Plus Jakarta Sans` (sans-serif, moderno)

### Regras de UX Obrigatórias

1. **Nunca bloquear o filho de forma frustrante.** Se não há tarefas, mostrar mensagem motivacional, não uma tela vazia fria.
2. **Saldos sempre visíveis.** Fichas do Lar e Energia de Aventura devem aparecer na sidebar o tempo todo, nunca escondidos.
3. **Feedback imediato.** Após qualquer ação (enviar prova, editar perfil), exibir Toast de confirmação.
4. **Streak em destaque.** Se o streak for ≥ 3, adicionar animação de chama 🔥 pulsante.
5. **Recompensas visíveis nos cards.** O filho precisa ver claramente o que vai ganhar ANTES de fazer a tarefa — isso é o principal motivador.

---

## 🔗 IDs de Elementos HTML Existentes (Referência)

Os elementos abaixo já existem no [`index.html`](file:///E:/11_Games/LiraQuest/public/index.html) e no [`app.js`](file:///E:/11_Games/LiraQuest/public/app.js):

| ID | Onde fica | Uso |
|:---|:---|:---|
| `view-child` | `index.html` | Container principal do Terminal do Usuário |
| `child-user-name` | sidebar | Nome do usuário |
| `child-user-email` | sidebar | Email do usuário |
| `child-sidebar-photo-box` | sidebar | Foto de perfil |
| `child-nav-tasks` | abas | Botão da aba Missões |
| `child-nav-studies` | abas | Botão da aba Estudos |
| `child-panel-tasks` | painel | Conteúdo da aba Missões |
| `child-panel-studies` | painel | Conteúdo da aba Estudos |
| `study-timer-display` | aba estudos | Display MM:SS do timer |
| `btn-study-start` | aba estudos | Botão iniciar/pausar |
| `child-edit-profile-modal` | modal | Modal de edição de perfil |

> **Novos IDs a criar para o progresso:**
> - `sidebar-energy-value` → `progress.adventure_energy`
> - `sidebar-tokens-value` → `progress.family_tokens`
> - `sidebar-streak-value` → `progress.streak_days`
> - `sidebar-tasks-today` → `progress.tasks_done_today`
> - `sidebar-tasks-total` → `progress.tasks_done_total`

---

## 📅 Ordem de Implementação Sugerida

```
1. [ ] Exibir saldos (energy + tokens) na sidebar — aguarda backend
2. [ ] Exibir streak na sidebar — aguarda backend
3. [ ] Atualizar cards de tarefa com novos campos (difficulty, energy, tokens)
4. [ ] Melhorar modal de comprovação
5. [ ] Implementar aba Histórico com dados da API
6. [ ] Adicionar mini-estatísticas (tarefas hoje / total)
7. [ ] Card de link para o Terminal do Avatar com energia disponível
```
