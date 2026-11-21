# 📜 LiraQuest — Blueprint Arquitetural e Guia Mestre (V2 Unificada)

---

## 🎯 1. Visão Executiva e Conceito do Produto

O **LiraQuest** é um ecossistema gamificado de gestão de hábitos, rotina e RPG de mesa familiar em tempo real. O aplicativo foi desenhado para eliminar os atritos domésticos e transformar o cotidiano familiar em uma empolgante jornada épica cooperativa entre pais e filhos.

### 1.1 A Alma do RPG de Mesa
Inspirado na mística dos RPGs clássicos de mesa (D&D, Tormenta, Livro-Jogo de Aventuras e Dungeon Encounters), cada membro da família possui sua ficha viva de aventureiro:
- **Atributos Fundamentais:** Força (STR), Agilidade (AGI), Constituição (CON), Inteligência (INT), Carisma (CHA) e Sorte (LUK).
- **Testes de Resolução:** Rolagem de dados virtuais (D20 e D6) com som e animações dinâmicas contra Classes de Dificuldade (CD).
- **Progressão Tangível:** Pontos de Vida (HP), Energia de Aventura, Experiência (XP), Nível e Moedas.

---

## 🧭 2. Os 4 Pilares da Vida Familiar

Ao contrário de apps de listas frias, no LiraQuest a vida real é o combustível direto do jogo:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          OS 4 PILARES DA VIDA REAL                          │
├─────────────────────┬───────────────────────┬───────────────────────────────┤
│ PILAR               │ IMPACTO NO JOGO       │ EXEMPLOS DE MISSÕES / ROTINA  │
├─────────────────────┼───────────────────────┼───────────────────────────────┤
│ 🧹 TAREFAS DO LAR   │ Força (STR) & Energia │ Arrumar a cama, louça, quarto │
│ 📚 ESTUDOS          │ Inteligência (INT)    │ Lição de casa, leitura, foco  │
│ 🥗 SAÚDE & CORPO    │ Constituição (CON)    │ Refeições saudáveis, 2L água  │
│ 🎡 LAZER & DIVERSÃO │ Fichas Reais & Ouro   │ Noite da Pizza, Masmorras D20 │
└─────────────────────┴───────────────────────┴───────────────────────────────┘
```

---

## 👑 3. Filosofia da Interface Unificada: "EU SOU O HERÓI"

Elimina-se a antiga divisão de "dois mundos separados" (Terminal do Usuário vs Terminal do Avatar).
- **Identidade Única:** A criança e os pais não controlam um personagem distante: **Eles são os próprios heróis da casa**.
- **Hub Central (Tela Única do Jogador):**
  - **HUD Nobre no Topo:** Avatar/Skin ativa, Nome e Apelido Heroico, Barra de Nível/XP, Energia de Aventura (`⚡`), Fichas do Lar (`🎟️`), Ouro (`💰`) e Sequência (`🔥 Streak`).
  - **Navegação Rápida por Abas:**
    1. 🏡 **Missões do Lar:** Mural diário com envio de provas (fotos) e aprovação rápida.
    2. 📚 **Estudos:** Temporizador Pomodoro gamificado e lições escolares.
    3. 🥗 **Saúde:** Cardápio com gramas, registro de refeições e copos d'água.
    4. 🎡 **Empório Real:** Resgate de vales reais da casa e itens mágicos.
    5. 🗡️ **Aventuras RPG:** Masmorras D20, Duelo de Arqueiros 1v1 e Arcade.

---

## 🌐 4. Escala Multi-Tenant: Pronto para 100+ Famílias

Embora nasça desenhado sob medida para o **Clã Lira**, o sistema possui arquitetura de SaaS familiar multi-tenant, permitindo cadastrar e isolar mais de 100 famílias simultâneas com total segurança.

### 4.1 Isolamento de Dados
- Toda tabela de entidade viva possui a chave estrangeira `family_id` (UUID).
- Todas as consultas, listagens e eventos de WebSocket aplicam estritamente o filtro `WHERE family_id = :familyId`.
- Uma família jamais tem acesso a fotos, tarefas, nomes ou finanças de outro clã.

---

## 🚀 5. Fluxo de Onboarding, Identidade e Autenticação

### 5.1 O Duplo Funil de Entrada
1. **O Guardião (Pai/Mãe):**
   - Cria sua conta (`Nome Real`, `Apelido Heroico`, `E-mail`, `Senha Forte`).
   - Registra o nome da família (ex: *"Clã Lira"*).
   - O sistema cria a família e gera um **Código de Convite Nobre** (ex: `LIRA-7842`).
2. **O Herói (Filho/Jovem):**
   - **Opção A (Com Celular/E-mail):** Insere o Código do Clã, define seu Nome Real, Apelido Heroico e escolhe sua Skin/Classe inicial.
   - **Opção B (Criança sem E-mail):** O pai cria o herói diretamente pelo painel do clã com 1 clique (Nome, Apelido e PIN de 4 números). A criança faz login no tablet com seu Apelido e PIN.

### 5.2 Nome Real vs. Apelido Heroico vs. Skins
- **Nome Real:** Utilizado em documentos, relatórios pedagógicos e aprovação de vales reais.
- **Apelido Heroico:** Utilizado nos placares, duelos, topo da tela e no clima medieval (ex: *Sir Paulinho*, *Valquíria Jennifer*, *Paladino Sidney*).
- **Skins Iniciais:** 6 arquétipos clássicos gratuitos (Guerreiro, Ladina, Mago, Curandeira, Artífice, Arqueira) com evolução cosmética conforme o herói sobe de nível.

### 5.3 Segurança & Tokens
- **Autenticação JWT:** Tokens Bearer com payload assinado (`userId`, `familyId`, `role`).
- **Recuperação de Senha:** Geração de Token temporário de redefinição enviado com expiração de 15 minutos, além de opção de redefinição de PIN diretamente pelos pais no painel do Guardião.

---

## 🛡️ 6. A Família Fundadora (Seed Inicial do Clã Lira)

O banco de dados limpo conterá nativamente a estrutura pré-configurada da família fundadora:

| Membro | Nome Real | Apelido Heroico | Papel do Sistema | Papel no Clã | Classe de RPG |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Sidney** | Sidney Lira | Paladino Sidney | `ADMIN` / `PARENT` | Mestre Guardião | Guardião do Lar |
| **Elaine** | Elaine Lira | Mestra Elaine | `PARENT` | Guardiã Mestra | Guardiã da Harmonia |
| **Paulo** | Paulo Lira | Sir Paulinho | `CHILD` | Herói Aventureiro | Rastreador Veloz |
| **Jennifer** | Jennifer Lira | Valquíria Jennifer | `CHILD` | Heroína Aventureira | Artífice Criativa |

---

## 🗄️ 7. Padrões de Banco de Dados e Segurança Técnica

Para garantir conformidade entre o ambiente local (Windows) e o ambiente de produção (Linux/Hostinger MySQL):

1. **UUIDv4 Obrigatório:**
   - Todas as chaves primárias (`id`) e chaves estrangeiras (`*_id`) devem ser do tipo `UUID` (geradas por `DataTypes.UUIDV4`).
2. **Nomenclatura de Tabelas:**
   - Tabelas SQL em `snake_case` com prefixo `family_` (ex: `family_users`, `family_tasks`, `family_characters`, `family_health_logs`).
   - Tabelas de catálogo imutável utilizam prefixo `definition_*` com `id` (UUID) e `code` único (ex: `'str'`, `'guardiao_do_lar'`).
3. **Modelos Sequelize:**
   - Nomes em `PascalCase` com propriedades explícitas:
     ```javascript
     {
       sequelize,
       modelName: 'FamilyUser',
       tableName: 'family_users',
       underscored: true,
       timestamps: true
     }
     ```
4. **Proteção de Dados:**
   - Proibição de comandos destrutivos sem aprovação do usuário (`DROP TABLE`, `TRUNCATE`, `force: true` ou deletes em massa).
   - Deletes de usuários ou tarefas sempre via desativação lógica (`is_active: false`).

---

## 🎨 8. Identidade Visual & Paleta Oficial

A interface do LiraQuest adota uma estética nobre de RPG de fantasia medieval:
- 🍷 **Cor Primária:** Bordô / Vinho Nobre (`#800020`, `#9b111e`, `#6b0f24`) — Botões de destaque, cabeçalhos épicos, bordas nobres.
- 🌌 **Cor Secundária:** Azul Real Profundo (`#0f172a`, `#1e3a8a`, `#2563eb`) — Fundo da aplicação, superfícies de cards e elementos arcanos.
- 👑 **Cor Terciária:** Dourado Imperial (`#d4af37`, `#f59e0b`, `#facc15`) — Insígnias, estrelas de XP, moedas de ouro, barras de nível e glória.

---

## 🚀 9. Regra Operacional de Deploy Contínuo Imediato (Git / Hostinger)

Como a validação e os testes são realizados diretamente no ambiente de produção na Hostinger:

> **REGRA MANDATÓRIA PARA OS EXECUTORES:**
> A cada funcionalidade ou fase concluída por um prompt executor:
> 1. O executor DEVE obrigatoriamente rodar os testes de integridade locais.
> 2. O executor DEVE rodar o script de deploy automatizado:
>    ```bash
>    npm run deploy
>    ```
>    ou os comandos padronizados de commit e push para o repositório (`https://github.com/xzsidney/liraquest.git`), acionando o deploy imediato para a Hostinger.
> 3. Entregar ao usuário a URL de teste em produção pronta para verificação.

---

## 📚 10. Documentação Contínua

Sempre que novas tabelas, rotas ou mecânicas forem implementadas, os arquivos da pasta `doc/` devem ser atualizados em sincronia:
1. `doc/LIRAQUEST_CONCEITO_CENTRAL.md`
2. `doc/BANCO_DE_DADOS.md`
3. `doc/BACKEND_ROTAS.md`
