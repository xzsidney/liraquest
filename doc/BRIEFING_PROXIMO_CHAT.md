# 🏰 BRIEFING COMPLETO — LIRAQUEST (Para Novo Chat de Desenvolvimento)

> **Leia este arquivo inteiro antes de escrever qualquer linha de código.**
> Ele resume tudo que foi decidido até agora: produto, arquitetura, banco de dados, regras e próximos passos.

---

## 1. O QUE É O LIRAQUEST

**LiraQuest** (`liraquest.com.br`) é uma plataforma de **RPG e gamificação familiar em tempo real**.

O objetivo é transformar rotinas da vida real (tarefas domésticas, estudos, esportes, bons hábitos) em missões de RPG. Os filhos ganham **XP e Ouro** ao cumprir tarefas reais aprovadas pelos pais, evoluem seus personagens e jogam **Raids cooperativas** junto com a família.

**Família real do projeto (usuários iniciais):**
| Nome | Papel | Perfil |
|:---|:---|:---|
| Sidney | Pai / Criador do projeto | `PARENT` / `ADMIN` |
| Elaine | Mãe | `PARENT` |
| Paulo | Filho (mora junto, 16 anos) | `CHILD` |
| Jennifer | Filha (mora junto, 14 anos) | `CHILD` |
| Jaqueline | Filha da Elaine (visita, 30 anos) | `CHILD` |
| Jonathan | Filho da Elaine (visita, 27 anos) | `CHILD` |
| Matheus | Filho do Sidney (visita, 23 anos) | `CHILD` |

---

## 2. REGRAS ABSOLUTAS DO PROJETO

### Banco de Dados
- Todas as tabelas em **`snake_case` minúsculo**, sem exceção.
- Divididas em dois grupos: **`definition_*`** (catálogo global) e **`character_*`** (dados do jogador).
- Conexão direta com **MySQL da Hostinger** via `DATABASE_URL` no `.env`.
- **NUNCA executar `DROP TABLE`, `TRUNCATE` ou `DELETE` em massa sem autorização explícita no chat.**
- Scripts de sincronização são sempre **aditivos** (`alter: true`, nunca `force: true`).

### Código
- **Frontend:** HTML/CSS/JS nativo (fase atual). Futuramente Vue 3 + Phaser 3.
- **Motor de Jogo:** **Phaser 3** (não Pixi.js — decisão tomada e registrada).
- **Backend:** Node.js + Express + Sequelize + Socket.IO.
- **Auth:** JWT (7 dias) + Bcrypt (salt 10).
- **Modelos Sequelize:** PascalCase no arquivo, `tableName` explícito em snake_case.

### Deploy
- **Repositório:** `https://github.com/xzsidney/liraquest.git` (branch `main`)
- **Hostinger:** `server.js` → porta 3000.
- Sempre perguntar antes de fazer commit/push (exceto em modo FULL autorizado).

---

## 3. O QUE JÁ ESTÁ CONSTRUÍDO

### ✅ Banco de Dados (MySQL Hostinger)
- Tabela `family_users` criada e populada com 3 contas de teste:
  - `admin@liraquest.com` / `admin123` → `ADMIN`
  - `pai@liraquest.com` / `pai123` → `PARENT`
  - `filho@liraquest.com` / `filho123` → `CHILD`

### ✅ Backend (Node.js + Express)
- `server.js` — entrypoint do servidor
- `server/config/database.js` — Sequelize conectado à Hostinger
- `server/models/FamilyUser.js` — modelo da tabela `family_users`
- `server/middlewares/authMiddleware.js` — `authenticateToken` + `authorizeRoles`
- `server/controllers/authController.js` — `register`, `login`, `getMe`, `listAllUsers`
- `server/routes/authRoutes.js` — rotas `/api/auth/*`

### ✅ API Endpoints Funcionando
| Método | Rota | Auth | Descrição |
|:---|:---|:---|:---|
| `POST` | `/api/auth/register` | Pública | Registra novo usuário (sempre `CHILD` por padrão) |
| `POST` | `/api/auth/login` | Pública | Autentica e retorna JWT |
| `GET` | `/api/auth/me` | JWT | Retorna usuário autenticado |
| `GET` | `/api/auth/users` | JWT + ADMIN | Lista todos os usuários |

### ✅ Frontend (SPA — `public/`)
- `public/index.html` — 6 telas em uma única página (SPA via hash routing)
- `public/app.js` — lógica de autenticação, navegação e route guards
- **6 telas implementadas:**
  1. Home Pública (`#home`)
  2. Cadastro (`#register`) — sempre cria perfil `CHILD`
  3. Login (`#login`) — com botões de 1-clique para teste rápido
  4. Dashboard Admin (`#admin`) — lista usuários do banco em tempo real
  5. Dashboard Pais (`#parent`) — painel do guardião
  6. Dashboard Filhos (`#child`) — painel do herói

---

## 4. DECISÕES DE PRODUTO (NÃO ALTERAR SEM CONVERSAR COM SIDNEY)

### Perfis de Acesso
- `ADMIN` → acesso total (Sidney)
- `PARENT` → cria tarefas, aprova provas, gerencia família
- `CHILD` → joga, cumpre tarefas, evolui personagem
- **Cadastro público sempre cria `CHILD`** — sem opção de escolha de perfil

### Usuário ≠ Personagem
- **Usuário** = conta de acesso (e-mail, senha, dados reais: telefone, escola/trabalho)
- **Personagem** = identidade no jogo (nome do herói, avatar, atributos, classe, habilidades)
- São entidades completamente separadas, com telas e tabelas distintas

### Fluxo do Filho (CHILD)
```
Login → Dashboard do Usuário (dados reais)
  → Se sem personagem: botão "Criar Meu Herói"
  → Criação do Personagem: nome + sexo + avatar (foto ou sprite MUGEN)
  → Dashboard do Personagem: atributos, classe, loja, combate
```

### Todos os Filhos São Iguais
- Não existe distinção entre filho que mora na casa e filho que visita
- Tarefas são cumpridas **de qualquer lugar**, com **envio de prova** (foto + texto)
- O Pai aprova remotamente → XP + Ouro creditados automaticamente

### Sistema de Família (Clã)
- Pai cria a família → gera **código de convite**
- Filhos entram com o código (moram junto ou não)
- Escalável para amigos, primos, eventos futuros

### Eventos Familiares (Gincanas)
- Natal, aniversários, férias → Eventos Temporários com missões especiais
- Toda a família participa online (mesmo em cidades diferentes)
- Raids especiais com Chefes temáticos via Socket.IO

### Motor de Jogo
- **Phaser 3** — substituiu Pixi.js
- Sprites MUGEN são usados como avatares de personagem e animações de combate no Phaser

---

## 5. ARQUITETURA DE BANCO DE DADOS (DEFINIDA, AINDA NÃO IMPLEMENTADA)

### Tabelas `definition_*` — Catálogo Global (imutável)
| Tabela | Conteúdo |
|:---|:---|
| `definition_classes` | As 6 classes (Guardião do Lar, Sábio Estrategista, etc.) |
| `definition_attributes` | Os 6 atributos (STR, AGI, CON, INT, CHA, LUK) |
| `definition_skills` | Habilidades de cada classe (dano, custo MP, tier, pré-requisito) |
| `definition_items` | Itens da loja (armas, armaduras, poções, preço em ouro) |
| `definition_monsters` | Monstros e chefes (HP, ataques, recompensas) |

### Tabelas principais
| Tabela | Conteúdo |
|:---|:---|
| `family_users` | ✅ Já existe — conta de acesso (e-mail, senha, role) |
| `families` | Clãs/famílias — código de convite, nome, criado por quem |
| `family_members` | Relação entre `family_users` e `families` |

### Tabelas `character_*` — Dados Vivos do Jogador
| Tabela | Conteúdo |
|:---|:---|
| `characters` | Personagem do jogador (user_id, nome, level, xp, gold, class_id ativo) |
| `character_classes` | Todas as classes que o personagem jogou + level e xp por classe |
| `character_attributes` | Valores reais de cada atributo do personagem |
| `character_skills` | Habilidades desbloqueadas (por classe) |
| `character_inventory` | Itens e equipamentos ativos |

### Tabelas de Gameplay
| Tabela | Conteúdo |
|:---|:---|
| `tasks` | Tarefas criadas pelos Pais (título, XP, ouro, descrição) |
| `task_submissions` | Envio de prova pelo filho (foto, texto, status: pendente/aprovado/rejeitado) |
| `events` | Eventos temporários (Natal, aniversários, gincanas) |
| `battles` | Histórico de batalhas e raids |

---

## 6. OS 6 ATRIBUTOS E AS 6 CLASSES (DEFINIDOS)

### Atributos
| Atributo | ID | Combat | Vida Real |
|:---|:---|:---|:---|
| Força | `str` | Dano físico, empurrão | Esforço físico, tarefas pesadas |
| Agilidade | `agi` | Iniciativa, esquiva, distância | Reflexos, furtividade, tempo |
| Constituição | `con` | HP máximo, resistência | Vigor, foco AFK prolongado |
| Inteligência | `int` | Dano mágico, MP máximo | Estudos, leitura, enigmas |
| Carisma | `cha` | Buffs de grupo, auras | Empatia, liderança, convivência |
| Sorte | `luk` | Crítico, sobrevivência | Drop raro, bônus surpresa |

### Classes (cada uma com atributo primário único)
| Classe | Principal | Secundário | Papel |
|:---|:---|:---|:---|
| 🛡️ Guardião do Lar | CON | STR | Tanque / Protetor |
| 📚 Sábio Estrategista | INT | CON | Mago / Dano Mágico |
| ✨ Guardião da Harmonia | CHA | INT | Curandeiro / Suporte |
| ⚡ Rastreador Veloz | AGI | LUK | Dano Físico / Esquiva |
| 🛠️ Artífice Criativo | STR | INT | Invocador / Controle |
| 🎲 Aventureiro Oportunista | LUK | AGI | Crítico / Longo Alcance |

### Multi-Classe
- Jogador troca de classe livremente, mas inicia do zero na nova
- Progresso de cada classe é **preservado individualmente**
- Estratégia natural: focar em uma classe é mais eficiente, mas ter várias é mais versátil

---

## 7. DOCUMENTAÇÃO TÉCNICA (SEMPRE ATUALIZAR)

Após qualquer mudança de funcionalidade, atualizar obrigatoriamente:
- `doc/LIRAQUEST_CONCEITO_CENTRAL.md` — visão do produto e mecânicas
- `doc/BANCO_DE_DADOS.md` — tabelas, colunas e relacionamentos
- `doc/BACKEND_ROTAS.md` — endpoints REST e eventos Socket.IO

---

## 8. PRÓXIMOS PASSOS (FASE 2)

### O que fazer agora:
1. **Criar as tabelas de Família** no banco Hostinger:
   - `families` (nome do clã, código de convite, owner_id)
   - `family_members` (family_id, user_id, joined_at)

2. **Expandir o perfil do usuário** com campos reais:
   - `phone`, `school_or_work`, `profile_photo_url`
   - Alterar `family_users` via migration aditiva

3. **Criar as tabelas de Personagem**:
   - `characters` (vinculado ao user_id)
   - `character_classes` (multi-classe com progresso individual)
   - `character_attributes`

4. **Tela do Filho** (prioridade máxima):
   - Dashboard do Usuário com dados reais + edição
   - Fluxo de Criação do Personagem (nome, sexo, avatar)
   - Dashboard do Personagem

5. **Alimentar as tabelas de catálogo** com os dados das 6 classes, 6 atributos e habilidades base.

---

## 9. FUNCIONALIDADES CONFIRMADAS DO PERFIL FILHO (CHILD)

Estas são as funções **definidas e confirmadas** que o usuário do tipo Filho deve ter:

| # | Funcionalidade | Status | Descrição |
|:---|:---|:---|:---|
| 1 | **Criar Personagem** | ✅ Definido | Nome do herói + Sexo + Avatar (foto upload ou sprite MUGEN) |
| 2 | **Fazer Tarefas** | ✅ Definido | Ver mural de missões → Concluir → Enviar prova (foto/texto) → Aguardar aprovação |
| 3 | **Atualizar Dados** | ✅ Definido | Editar: nome, telefone, escola/trabalho, foto de perfil |
| 4 | **Alerta via WhatsApp** | 💡 Em análise | Ideia em estudo — forma de integrar (avisar Pai, receber aprovação, etc.) |

### 💡 Ideias em Análise (NÃO implementar ainda)
- **WhatsApp:** Sidney está pensando na melhor forma de uso. Possibilidades:
  - Filho avisa Pai via WhatsApp quando envia uma prova de tarefa
  - Filho recebe notificação no WhatsApp quando uma tarefa é aprovada
  - Link `wa.me` pré-formatado (sem custo, sem API)
  - **Aguardar decisão do Sidney antes de implementar.**



## 9. ESTRUTURA DE ARQUIVOS ATUAL

```
E:\11_Games\LiraQuest\
├── .env                          ← DATABASE_URL, JWT_SECRET, PORT
├── server.js                     ← Entrypoint Express
├── package.json
├── public/
│   ├── index.html                ← SPA com 6 telas
│   └── app.js                    ← Lógica de auth e navegação
├── server/
│   ├── config/database.js        ← Sequelize → Hostinger MySQL
│   ├── models/FamilyUser.js      ← Modelo family_users
│   ├── middlewares/authMiddleware.js
│   ├── controllers/authController.js
│   └── routes/authRoutes.js
├── scripts/
│   └── syncDatabase.js           ← Sync aditivo + seed inicial
└── doc/
    ├── LIRAQUEST_CONCEITO_CENTRAL.md  ← Produto completo (LEIA PRIMEIRO)
    ├── BANCO_DE_DADOS.md              ← Mapeamento de tabelas
    ├── BACKEND_ROTAS.md               ← Endpoints REST e WebSocket
    └── BRIEFING_PROXIMO_CHAT.md       ← Este arquivo
```
