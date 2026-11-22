# 📜 LiraQuest — Regras de Negócio & Arquitetura V2

Documento oficial de produto, regras de negócio, arquitetura do monorepo e contrato de APIs REST da plataforma **LiraQuest (V2 Unificada)**.

---

## 1. Visão do Produto & Filosofia "Eu sou o Herói"

O **LiraQuest** é um ecossistema gamificado de rotina, hábitos familiares e RPG de mesa cooperativo em tempo real. Projetado para eliminar atritos domésticos e transformar responsabilidades cotidianas em progresso lúdico tangível, o aplicativo adota o princípio de **reforço positivo**: cumprir deveres acelera a jornada; eventuais falhas recebem orientação pedagógica sem punições destrutivas de recursos já conquistados.

### 1.1 A Entidade Unificada (`family_members`)
A arquitetura V2 elimina a divisão legada de dois terminais/entidades separadas (*Terminal do Usuário* vs. *Terminal do Avatar*).
- **O Usuário É o Herói:** Pais e filhos não controlam um personagem distante — cada membro familiar possui uma ficha atômica única na tabela `family_members`, unificando identidade real (`name`, `email`), credenciais de acesso (`password`, `role`), economia (`gold`, `family_tokens`, `adventure_energy`), consistência (`streak_days`), progressão (`level`, `xp`) e atributos D20 (`str`, `agi`, `con`, `int`, `cha`, `luk` + barras de mestria `xp_*`).
- **Hub Único (`Grande Salão` / `#/hub`):** Experiência mobile-first centralizada com o componente `HeroHUD` no topo (avatar/classe, Nível/XP, ⚡ Energia de Aventura, 🎟️ Fichas do Lar, 💰 Ouro e 🔥 Sequência), os **4 Portais da Vida Familiar** e a **Ficha Viva D20** em tempo real.

### 1.2 Isolamento Multi-Tenant
Embora nasça configurado para o **Clã Lira**, o backend isola os dados por família:
- Toda entidade operacional vincula-se a um clã via `family_id` (`UUIDv4`).
- Todas as consultas e operações autenticadas de listagem, submissão e avaliação filtram estritamente pelo `family_id` do usuário extraído do JWT, impedindo vazamento de dados, fotos ou tarefas entre clãs distintos.

---

## 2. Os 4 Pilares & Sistema de Mestria Orgânica por Atributo

No LiraQuest V2, as ações reais da casa alimentam diretamente os 4 Pilares e os 6 Atributos Fundamentais de RPG:

### 2.1 Os 4 Pilares da Vida Familiar

| Pilar | Portal no Hub | Atributo / Recurso Impactado | Status na V2 |
| :--- | :--- | :--- | :--- |
| 🧹 **Tarefas do Lar** | `#/tasks` | **Força (`STR`)**, XP Geral, Ouro e Fichas do Lar | ✅ **Implementado em Produção** |
| 📚 **Estudos & Saber** | `#/study` | **Inteligência (`INT`)**, XP Geral e Ouro | 🛠️ **Roadmap V2 (Protótipo UI)** |
| 🥗 **Saúde & Vitalidade** | `#/health` | **Constituição (`CON`)** e XP Geral | 🛠️ **Roadmap V2 (Protótipo UI)** |
| 🎡 **Empório & Lazer** | `#/shop` / `#/rpg` | **Fichas do Lar (`family_tokens`)**, Ouro (`gold`), Energia (`adventure_energy`) e D20 | 🛠️ **Roadmap V2 (Protótipo UI)** |

### 2.2 Os 6 Atributos Fundamentais (Ficha Viva D20)

| Código | Atributo | Origem na Vida Real | Papel no Universo RPG |
| :--- | :--- | :--- | :--- |
| `STR` | **Força** | Tarefas domésticas, organização e esforço físico | Impacto físico e combate corpo a corpo |
| `AGI` | **Agilidade** | Pontualidade, velocidade e reflexos | Iniciativa e esquiva |
| `CON` | **Constituição** | Alimentação saudável, hidratação e autocuidado | Pontos de Vida (HP) e vigor |
| `INT` | **Inteligência** | Estudos, leitura diária e sessões de foco | Poder tático, magia e resolução de enigmas |
| `CHA` | **Carisma** | Harmonia familiar, empatia e cooperação | Auras de grupo e suporte |
| `LUK` | **Sorte** | Dados, bônus e recompensas extras | Acertos críticos e drops de tesouro |

### 2.3 Regra de Ascensão por Mestria Orgânica
Implementada nativamente no backend (`backend/src/modules/tasks/tasksRoutes.js`) e exibida nas barras da Ficha Viva D20 (`HubView.js` e `TasksView.js`):
1. Cada atividade aprovada credita pontos de experiência na barra de mestria específica do atributo correspondente (`xp_str`, `xp_agi`, `xp_con`, `xp_int`, `xp_cha`, `xp_luk`).
2. **Limite de Ascensão (100 XP):** Sempre que a barra atinge ou supera **100 pontos** (`xp_<attr> >= 100`), o atributo sobe **`+1` permanentemente** e o excedente é preservado para o próximo nível de atributo:
   ```text
   enquanto (xp_str >= 100):
     str = str + 1
     xp_str = xp_str - 100
   ```
3. Quando ocorre subida de `STR` na aprovação de uma tarefa, o backend retorna `str_leveled_up: true`, `old_str` e `new_str`, e o frontend dispara o modal comemorativo de fanfarra (*"Mestria em Força Alcançada!"*).

### 2.4 Regra de Progressão do Nível Geral (`level` e `xp`)
- O requisito para subir do nível atual para o próximo é **`level * 100` XP**.
- Ao acumular XP suficiente (`xp >= level * 100`), `level` sobe **`+1`** em laço (`while`), mantendo o excedente de XP para o nível seguinte.

---

## 3. Perfis, Autenticação & Clã Fundador

### 3.1 Papéis e Controle de Acesso (RBAC)
O campo `role` em `family_members` define três níveis de autorização, aplicados pelos middlewares `authMiddleware` e `requireGuardian` (`backend/src/core/authMiddleware.js`):
- **`ADMIN`:** Mestre Guardião / Administrador do clã. Possui todas as permissões de Guardião.
- **`PARENT`:** Guardião (Pai/Mãe). Cria missões do lar, visualiza a fila completa de comprovações pendentes do clã, aprova entregas e envia feedbacks de melhoria.
- **`CHILD`:** Herói Aventureiro (Filho/Jovem). Visualiza missões abertas do clã ou atribuídas diretamente a si e envia comprovações fotográficas. Rotas protegidas por `requireGuardian` retornam HTTP `403` para este perfil.

### 3.2 Login Universal & Sessão JWT
- **Autenticação Unificada (`POST /api/auth/login`):** Pais e filhos utilizam a mesma tela (`LoginView.js`) e o mesmo endpoint. O campo `identifier` aceita **e-mail** (normalizado em minúsculas), **apelido heroico** (`hero_nickname`) ou **nome real** (`name`), com filtro opcional por `family_code` (se um `family_code` inexistente for informado, retorna HTTP `401`).
- **Segurança:** A senha é verificada via `bcryptjs.compare()` contra o hash armazenado no banco (`is_active = true`).
- **Token JWT:** Assinado com validade de `7d`, carregando `{ id, familyId, role, heroNickname }`, enviado pelo cliente no cabeçalho `Authorization: Bearer <token>`.

### 3.3 Cadastro Público & Ingresso em Clã
- **Regra de Cadastro (`POST /api/auth/register`):** O cadastro público cria **exclusivamente** membros com `role: 'CHILD'`. A fundação e gestão de clãs pertencem aos Guardiões (`PARENT`/`ADMIN`).
- **Dados do Cadastro:** Exige `name`, `hero_nickname` (fallback para `name`) e `password`; `email` e `invite_code` são opcionais. Caso `invite_code` seja omitido ou vazio, o herói é criado com `family_id: null` para vincular-se posteriormente no Hub.
- **Recursos Iniciais do Novo Herói:** `level: 1`, `xp: 0`, `adventure_energy: 10`, `family_tokens: 0`, `gold: 50`, `streak_days: 1`.
- **Arquétipos de Classe no Cadastro (`familyController.js`):**

| `class_code` | STR | AGI | CON | INT | CHA | LUK |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: |
| `rastreador_veloz` *(padrão)* | 12 | 16 | 11 | 10 | 10 | 14 |
| `artifice_criativo` | 14 | 11 | 12 | 16 | 11 | 10 |
| `guardiao_do_lar` | 16 | 10 | 15 | 10 | 12 | 10 |
| Outros códigos *(ex: `guerreiro_disciplina`)* | 10 | 10 | 10 | 10 | 10 | 10 |

- **Vínculo Pós-Login (`POST /api/family/join`):** Caso um herói ainda não possua `family_id`, o `HubView.js` exibe um banner dedicado para inserir o código do clã (ex: `LIRA-2026`), vincular-se imediatamente e receber um novo token JWT atualizado com o `familyId` do clã.

### 3.4 Clã Fundador (Clã Lira — Código `LIRA-2026`)
O script `backend/src/database/seed.js` garante a existência do **Clã Lira** (`invite_code: 'LIRA-2026'`) e dos 4 membros fundadores abaixo (com senhas armazenadas exclusivamente como hash `bcryptjs`):

| Nome Real | Apelido Heroico | E-mail | Papel (`role`) | Classe (`class_code`) | Skin (`skin_code`) | Nível | Ouro / Fichas | Atributos (`STR / AGI / CON / INT / CHA / LUK`) |
| :--- | :--- | :--- | :--- | :--- | :--- | :---: | :---: | :--- |
| **Sidney Lira** | Paladino Sidney | `sidney@liraquest.com` | `ADMIN` | `guardiao_do_lar` | `paladino_lira` | 5 | 150 / 50 | `15 / 10 / 16 / 12 / 12 / 10` |
| **Elaine Lira** | Mestra Elaine | `elaine@liraquest.com` | `PARENT` | `guardiao_da_harmonia` | `guardia_harmonia` | 5 | 150 / 50 | `10 / 10 / 12 / 14 / 16 / 10` |
| **Paulo Lira** | Sir Paulinho | `paulo@liraquest.com` | `CHILD` | `rastreador_veloz` | `rastreador_veloz` | 3 | 60 / 20 | `12 / 16 / 11 / 10 / 10 / 14` |
| **Jennifer Lira** | Valquíria Jennifer | `jennifer@liraquest.com` | `CHILD` | `artifice_criativo` | `artifice_criativa` | 3 | 75 / 25 | `14 / 11 / 12 / 16 / 11 / 10` |

---

## 4. Regras dos Módulos

### 4.1 Módulo Tarefas do Lar — Pilar Força (`STR`) [IMPLEMENTADO]
Fluxo completo em produção entre `backend/src/modules/tasks/` e `frontend/src/views/TasksView.js`:

1. **Gestão & Visibilidade de Missões:**
   - Guardiões (`PARENT`/`ADMIN`) criam missões via `POST /api/tasks` com título, descrição opcional, categoria (padrão `'LAR'`), destinatário (`assigned_to` ou `null` para todos), frequência (`DAILY`, `WEEKLY`, `ONCE`) e recompensas configuráveis (padrões: `25 XP STR`, `15 XP`, `10 Ouro`, `1 Ficha`).
   - `GET /api/tasks` lista as missões ativas da família ordenadas por `reward_str_xp DESC, title ASC`. Para `CHILD`, exibe apenas missões abertas (`assigned_to IS NULL`) ou atribuídas especificamente a ele.
   - O backend cruza as submissões do próprio dia (`created_at >= início do dia`) para retornar `today_pending`, `today_approved` e `latest_submission` por missão.
2. **Envio de Comprovação Fotográfica pelo Herói:**
   - No `TasksView.js`, ao clicar em **"📸 Enviar Prova"**, o herói tira uma foto com a câmera do aparelho (`capture="environment"`) ou seleciona uma imagem, visualiza o preview e adiciona comentário opcional (`member_notes`).
   - A imagem é convertida em Base64 (`FileReader.readAsDataURL`) e enviada via `POST /api/tasks/:id/submit` (servidor Express aceita payloads até `15mb`), criando um registro `PENDING` em `family_task_submissions`.
3. **Fila de Aprovação 1-Clique dos Guardiões:**
   - `GET /api/tasks/submissions/pending` retorna todas as comprovações `PENDING` do clã com miniatura clicável (abre modal em alta resolução), nome/apelido/STR do herói e recompensas da tarefa.
   - **Aprovação (`POST /api/tasks/submissions/:id/approve`):** Valida que a submissão ainda está `PENDING`, marca `APPROVED` registrando `reviewed_by` e `reviewed_at`, credita ao herói `+reward_str_xp`, `+reward_xp`, `+reward_gold` e `+reward_tokens`, executa a regra de ascensão de `STR` (100 `xp_str` ➔ `+1 STR`) e de Nível Geral (`level * 100`).
   - **Rejeição com Feedback Pedagógico (`POST /api/tasks/submissions/:id/reject`):** Marca `REJECTED` com `parent_feedback` (padrão: `"Precisa caprichar mais na organização!"`), sem penalizar ou subtrair saldo existente, permitindo novo envio pelo herói.

#### Missões Padrão Semeadas & Sugestões de Referência para o Clã
As 4 missões iniciais criadas automaticamente pelo `seed.js` para o Clã Lira são:
- **Arrumar a Cama e Quarto** — `DAILY` (`+25 XP STR`, `+15 XP`, `+10 Ouro`, `+1 Ficha`)
- **Lavar e Guardar a Louça do Almoço** — `DAILY` (`+30 XP STR`, `+20 XP`, `+15 Ouro`, `+1 Ficha`)
- **Recolher o Lixo da Casa** — `DAILY` (`+20 XP STR`, `+15 XP`, `+10 Ouro`, `+1 Ficha`)
- **Organizar a Mesa de Estudos** — `DAILY` (`+15 XP STR`, `+10 XP`, `+10 Ouro`, `+1 Ficha`)

Sugestões de calibração por faixa de dificuldade para criação de novas missões pelos Guardiões:

| Dificuldade | Tempo Médio | Exemplos de Missões do Lar | Faixa Sugerida (V2) |
| :--- | :--- | :--- | :--- |
| 🟢 **Fácil** | 5–10 min | Arrumar a cama, guardar brinquedos, colocar roupa suja no cesto, tirar prato da mesa, abastecer água/ração do pet, arrumar mochila | `15–25 XP STR`, `10–15 XP`, `5–10 Ouro`, `1 Ficha` |
| 🟡 **Média** | 15–30 min | Varrer cômodo, recolher e levar o lixo, lavar louça leve, guardar roupas dobradas, tirar poeira, guardar compras | `25–40 XP STR`, `15–25 XP`, `15–25 Ouro`, `1–2 Fichas` |
| 🔴 **Difícil** | 30–60 min | Limpeza geral do quarto, lavar louça completa com panelas, passar pano na casa, higienizar banheiro, estender/recolher varal completo | `50–80 XP STR`, `35–60 XP`, `40–70 Ouro`, `2–3 Fichas` |

---

### 4.2 Módulos Planejados (Roadmap V2 — Protótipos de UI)
Atualmente possuem interfaces SPA estruturadas em `frontend/src/views/` e diretórios de módulo reservados em `backend/src/modules/`, aguardando implementação de persistência e rotas REST dedicadas:

- **📚 Estudos & Saber (`INT` — `StudyView.js` / `backend/src/modules/study/`):**
  - Temporizador **Pomodoro do Sábio** (ciclos de 25 minutos de foco sem distrações) e checklist de missões escolares (leitura diária, lição de casa e revisão).
  - Planejado para creditar `xp_int` (ascensão de `INT` a cada 100 pontos), `xp` geral, `adventure_energy` e `gold`.
- **🥗 Saúde & Vitalidade (`CON` — `HealthView.js` / `backend/src/modules/health/`):**
  - Planejamento de cardápio familiar com pesos e gramas (proteínas, carboidratos limpos e salada), suporte a modo de rotina organizada vs. flexível, check-in de presença dos filhos nas refeições e medidor diário de **hidratação (meta de 2L / 8 copos de 250ml)**.
  - Planejado para creditar `xp_con` (ascensão de `CON` a cada 100 pontos) e `xp` geral.
- **🏪 Empório & Vales Reais (`ShopView.js` / `backend/src/modules/economy/`):**
  - Catálogo de vales reais definidos pelos pais (ex.: *Noite da Pizza em Família* — 30 Fichas, *Escolha do Filme do Sábado* — 15 Fichas, *+1 Hora Extra de Videogame* — 20 Fichas).
  - Planejado para debitar `family_tokens` no resgate com fluxo de aprovação/entrega pelos pais (`PENDING` ➔ `APPROVED`/`DELIVERED`) e estorno automático em caso de cancelamento.
- **⚔️ Aventuras RPG D20 (`RpgView.js` / `backend/src/modules/rpg/`):**
  - Expedições e masmorras interativas com gasto de `adventure_energy` (conquistada nas responsabilidades reais) e testes de resolução em dado **D20** somando os atributos da ficha viva contra a Classe de Dificuldade (`CD`), premiando com Ouro e XP.

---

## 5. Arquitetura do Monorepo & Identidade Visual

### 5.1 Stack Tecnológica Real
- **Backend:** Node.js (ES Modules), Express `^4.21.2`, Sequelize `^6.37.8`, MySQL2 `^3.24.2`, `bcryptjs`, `jsonwebtoken`, `cors`, `dotenv`.
- **Frontend:** SPA modular em HTML5, CSS3 e JavaScript nativo (ES Modules sem bundler) com roteamento hash (`#/home`, `#/login`, `#/register`, `#/hub`, `#/tasks`, `#/study`, `#/health`, `#/shop`, `#/rpg`), servido estaticamente pelo mesmo servidor Express (`server.js`).
- **Tipografia Oficial:** Google Fonts **Cinzel** (cabeçalhos nobres) e **Plus Jakarta Sans** (leitura e controles).

### 5.2 Árvore Real de Pastas do Monorepo
```text
LiraQuest/
├── .agents/
│   └── AGENTS.md                  # Diretrizes de engenharia, segurança e documentação
├── backend/
│   ├── package.json
│   └── src/
│       ├── config/
│       │   └── database.js        # Conexão Sequelize com MySQL (Hostinger)
│       ├── core/
│       │   └── authMiddleware.js  # Verificação JWT (authMiddleware) e RBAC (requireGuardian)
│       ├── database/
│       │   └── seed.js            # Seed seguro e idempotente (Clã Lira, membros e missões)
│       └── modules/
│           ├── family/            # Family, FamilyMember, familyController, familyRoutes
│           ├── tasks/             # FamilyTask, FamilyTaskSubmission, tasksRoutes
│           ├── study/             # Stub reservado para Estudos (INT)
│           ├── health/            # Stub reservado para Saúde (CON)
│           ├── economy/           # Stub reservado para Empório & Vales
│           └── rpg/               # Stub reservado para Aventuras D20
├── frontend/
│   ├── index.html                 # Shell principal da SPA
│   ├── package.json
│   ├── public/                    # Assets estáticos legados/auxiliares
│   └── src/
│       ├── main.js                # Registro de rotas e bootstrap da SPA
│       ├── styles/
│       │   └── main.css           # Design system oficial (Bordô, Azul Real, Dourado)
│       ├── core/
│       │   ├── api.js             # Cliente HTTP fetch com injeção de Bearer JWT
│       │   ├── auth.js            # Estado de sessão e helpers de perfil
│       │   └── router.js          # Roteador SPA hash-based com guarda de auth
│       ├── components/
│       │   ├── HeroHUD.js         # HUD do topo (Nível, XP, Energia, Fichas, Ouro, Streak)
│       │   └── Navbar.js          # Barra de navegação superior
│       └── views/
│           ├── HomeView.js        # Landing Page & apresentação dos 4 Pilares
│           ├── LoginView.js       # Login universal (e-mail/apelido + senha)
│           ├── RegisterView.js    # Cadastro de herói (role CHILD)
│           ├── HubView.js         # Grande Salão (4 Portais + Ficha Viva D20)
│           ├── TasksView.js       # Mural de Tarefas, upload foto e fila 1-clique
│           ├── StudyView.js       # Protótipo UI Pomodoro do Sábio
│           ├── HealthView.js      # Protótipo UI Hidratação e Refeições
│           ├── ShopView.js        # Protótipo UI Loja do Lar
│           └── RpgView.js         # Protótipo UI Rolador D20 e Masmorras
├── doc/
│   ├── REGRAS_DE_NEGOCIO.md       # Este documento (Regras, Arquitetura e Rotas V2)
│   ├── BANCO_DE_DADOS.md          # Modelagem MySQL, Diagrama ER e Seed V2
│   ├── banco/                     # Referências históricas preservadas
│   ├── modelo/                    # Protótipos visuais preservados
│   ├── saude/                     # Materiais nutricionais preservados
│   └── zombi/                     # Materiais do módulo Zombi preservados
├── package.json                   # Scripts start, dev, seed, build, deploy
└── server.js                      # Servidor Express unificado (API + SPA)
```

### 5.3 Identidade Visual & Paleta Oficial (`frontend/src/styles/main.css`)
- 🍷 **Cor Primária — Bordô / Vinho Nobre:** `#800020`, `#9b111e`, `#6b0f24`, `#4a0e17` (botões primários, gradientes de ação, bordas nobres e acentos heroicos).
- 🌌 **Cor Secundária — Azul Real:** `#0f172a`, `#1e3a8a`, `#2563eb`, `#1d4ed8` (fundos escuros `#07090e`, superfícies de cards e botões secundários).
- 👑 **Cor Terciária — Dourado Imperial:** `#d4af37`, `#f59e0b`, `#fbbf24`, `#facc15` (ouro, moedas, títulos em gradiente, estrelas de XP e bordas de prestígio).

---

## 6. Mapa Oficial de Rotas REST Ativas (V2)

Relação fiel e exclusiva das rotas montadas atualmente em `server.js`, `backend/src/modules/family/familyRoutes.js` e `backend/src/modules/tasks/tasksRoutes.js`.

### 6.1 Diagnóstico & Entrega da SPA (`server.js` e `familyRoutes.js`)

| Método | Rota | Acesso | Comportamento |
| :--- | :--- | :--- | :--- |
| `GET` | `/testeBD` | Pública | Redireciona (`302`) para `/api/testeBD`. |
| `GET` | `/api/testeBD` *(alias: `/api/status`)* | Pública | Executa `sequelize.authenticate()` e retorna status JSON do MySQL com `responseTimeMs` e `timestamp`. |
| `GET` | `/api/*` *(não mapeada)* | Pública | Retorna HTTP `404` `{ error: 'Endpoint não encontrado' }`. |
| `GET` | `*` *(demais rotas web)* | Pública | Entrega `frontend/index.html` para roteamento SPA no cliente. |

### 6.2 Autenticação & Clã Familiar (`familyRoutes.js`, prefixo `/api`)

| Método | Rota | Autenticação / RBAC | Parâmetros & Comportamento |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/login` *(alias: `/api/login`)* | Pública | Body: `{ identifier \| email \| hero_nickname \| nickname \| name, password, family_code? }`. Valida senha com `bcryptjs` (retorna `401` se `family_code` não existir), gera JWT (`7d`) e retorna `{ token, user, member }`. |
| `GET` | `/api/auth/me` *(aliases: `/api/me`, `/api/family/me`)* | JWT | Retorna a ficha unificada do membro autenticado (`is_active: true`) com objeto `family`, sem `password`. |
| `POST` | `/api/auth/register` *(alias: `/api/register`)* | Pública | Body: `{ name, hero_nickname?, password \| pin, invite_code?, class_code?, email? }`. Cria membro sempre com `role: 'CHILD'`, atributos iniciais do arquétipo e vínculo opcional ao clã (`family_id: null` se `invite_code` omitido). Retorna `201` com JWT e perfil. |
| `GET` | `/api/auth/children` *(aliases: `/api/children`, `/api/family/children`)* | JWT | Lista simplificada de membros ativos com `role = 'CHILD'` restrita estritamente ao `family_id` do usuário autenticado (`id`, `name`, `hero_nickname`, `skin_code`, `class_code`, `level`). |
| `GET` | `/api/family/members` | JWT | Lista todos os membros ativos (`is_active: true`) do mesmo `family_id` do usuário autenticado, ordenados por `role ASC, name ASC`, sem `password`. |
| `POST` | `/api/family/join` *(alias: `/api/family/join-clan`)* | JWT | Body: `{ invite_code \| inviteCode }`. Localiza a família pelo código (case-insensitive), atualiza `family_id` do membro autenticado e retorna um novo JWT `token` atualizado. |

### 6.3 Tarefas do Lar & Comprovações (`tasksRoutes.js`, prefixo `/api/tasks`)

| Método | Rota | Autenticação / RBAC | Parâmetros & Comportamento |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/tasks` | JWT | Lista tarefas ativas do clã (`family_id`). Para `CHILD`, filtra `assigned_to IS NULL` ou `assigned_to = req.user.id`. Inclui `assignee` e status do dia (`today_pending`, `today_approved`, `latest_submission`). |
| `POST` | `/api/tasks` | JWT + `requireGuardian` (`PARENT`/`ADMIN`) | Body: `{ title, description?, category?, assigned_to?, frequency?, reward_str_xp?, reward_xp?, reward_gold?, reward_tokens? }`. Cria nova missão vinculada ao `family_id` do guardião. |
| `POST` | `/api/tasks/:id/submit` | JWT | Body: `{ proof_image?, member_notes? }`. Valida que a missão pertence ao clã e está ativa, criando submissão `PENDING` em `family_task_submissions`. |
| `GET` | `/api/tasks/submissions/pending` | JWT + `requireGuardian` (`PARENT`/`ADMIN`) | Lista submissões `PENDING` do clã ordenadas por `created_at DESC`, incluindo dados da tarefa (`task`) e do herói executor (`member`). |
| `POST` | `/api/tasks/submissions/:id/approve` | JWT + `requireGuardian` (`PARENT`/`ADMIN`) | Aprova submissão `PENDING` do clã, grava `reviewed_by`/`reviewed_at`, credita `gold`, `family_tokens`, `xp` e `xp_str`, aplica subida de `STR` (a cada `100 xp_str`) e Nível Geral (`level * 100`). |
| `POST` | `/api/tasks/submissions/:id/reject` | JWT + `requireGuardian` (`PARENT`/`ADMIN`) | Rejeita submissão `PENDING` do clã, grava `reviewed_by`/`reviewed_at` e salva `parent_feedback` (aceita `parent_feedback` ou `feedback` no body). |
