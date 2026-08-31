# Regras de Segurança e Banco de Dados (LiraQuest)

## Proteção Contra Perda de Dados
A partir de agora, a IA está PROIBIDA de executar ações destrutivas no banco de dados, tais como:
- Executar queries de `DROP TABLE`, `TRUNCATE` ou `DELETE` em massa.
- Executar comandos de sincronização destrutiva (`force: true`, `--accept-data-loss` ou reset de migrações).

**EXCEÇÃO:** A única forma de realizar essas ações é caso a IA siga OBRIGATORIAMENTE os dois passos abaixo:
1. Parar a execução e enviar um alerta destacado avisando o usuário sobre a possível perda de dados.
2. Aguardar o usuário responder no chat com uma autorização explícita confirmando a destruição dos dados.

Qualquer alteração de esquema no banco (Sequelize/MySQL) que ofereça risco deve ser analisada cuidadosamente e apresentada ao usuário antes de rodar comandos no terminal.

## Execução FULL de Planos (Override de Permissão)
Se o usuário digitar exatamente o comando `"executar o [nome do plano] full"` (ex: *executar o plano X full*), a IA recebe **SINAL VERDE ABSOLUTO** para iniciar a execução do plano imediatamente e de forma autônoma, sem pedir NENHUMA confirmação no chat. 
- Esta regra **sobrescreve** o "Fluxo de Deploy Automatizado via Git", ou seja, a IA já deve fazer o commit e push direto ao terminar as tarefas, sem perguntar.
- **EXCEÇÃO: PROTEÇÃO DE DADOS.** Esta regra **NÃO** sobrescreve a "Proteção Contra Perda de Dados". Mesmo no modo FULL, se a IA precisar apagar dados, dropar tabelas ou rodar scripts destrutivos, ela DEVE obrigatoriamente parar e pedir permissão antes.
- O objetivo desta regra é permitir que o usuário saia da sala e a IA faça todo o trabalho pesado sem ficar bloqueada aguardando respostas no chat, protegendo apenas o banco de dados.

## Atualizações de Banco de Dados via Ambiente Local
O ambiente local do backend está conectado diretamente ao banco de dados MySQL de produção na Hostinger através das credenciais no arquivo `.env`. 
Toda vez que for necessário atualizar a estrutura do banco de dados (como criar novas tabelas por sincronização) ou preencher novos dados base (rodar scripts de seed/carga de habilidades e monstros), a IA **DEVE** executar o comando localmente pelo terminal (ex: `npx tsx scripts/...`) para aplicar as mudanças diretamente em produção e facilitar a vida do usuário.

**Condições OBRIGATÓRIAS:**
- Isso SÓ pode ser feito de forma automática se a atualização for **aditiva** (criar nova tabela, adicionar colunas, inserir dados).
- Mesmo sendo aditiva, a IA deve **avisar no chat** o que vai fazer.
- Se o script ou a operação for **deletar tabelas, apagar colunas, ou resetar dados existentes (ex: delete em massa, destroy)**, a IA esbarra na regra de "Proteção Contra Perda de Dados" e **precisa de permissão expressa** do usuário antes de rodar o comando.

## Documentação Contínua da Arquitetura e do Conceito Central
Sempre que a IA construir ou modificar funcionalidades do projeto (exemplo: criar um novo CRUD, adicionar novas tabelas no banco de dados, criar novas rotas REST, introduzir novos eventos de WebSocket, mecânicas de combate MUGEN 2D ou fluxo de Raids), é **OBRIGATÓRIO** atualizar imediatamente os três arquivos de mapa localizados na pasta `doc/`:
1. `doc/LIRAQUEST_CONCEITO_CENTRAL.md`: Manter atualizada a visão do produto, descrevendo novas mecânicas, regras de gamificação familiar, Foco AFK, Árvore de Talentos, classes de heróis e fluxo da Raid Cooperativa.
2. `doc/BANCO_DE_DADOS.md`: Registrar o nome da tabela criada/modificada, descrever suas colunas (tipo e função) e listar os relacionamentos com outras tabelas.
3. `doc/BACKEND_ROTAS.md`: Mapear a localização da rota REST ou evento de WebSocket recém-criado, detalhar os parâmetros e listar as ações executadas.

Esta regra garante que a visão estratégica do jogo e a arquitetura técnica do ecossistema estejam sempre documentadas de forma impecável.

## Regra de Nomenclatura e Boas Práticas para Banco de Dados e Modelos
Para garantir compatibilidade universal entre ambientes (Windows local vs Linux/Hostinger produção) e seguir as melhores práticas da indústria:

1. **Padrão de Identificadores (UUID / GUID Obrigatório):**
   - **TODAS as tabelas** do banco de dados devem utilizar obrigatoriamente identificadores únicos do tipo **UUID** (Universally Unique Identifier / GUID) como chave primária (`id`) gerados por `DataTypes.UUIDV4`.
   - Todas as chaves estrangeiras (`*_id`) devem apontar para campos do tipo `UUID`.
   - Tabelas de catálogo (`definition_*`) devem possuir seu `id` como `UUID` e uma coluna `code` ou `slug` (ex: `code: 'str'`, `code: 'guardiao_do_lar'`) única para facilitar buscas e referências legíveis por código.

2. **No Banco de Dados (Tabelas SQL):**
   - Todos os novos nomes de tabelas no banco de dados devem ser **OBRIGATORIAMENTE em `snake_case` minúsculo** com o prefixo `family_` (ex: `family_characters`, `family_tasks`, `family_rewards`, `family_battles`, `family_skills`).

3. **No Backend (Modelos TypeScript / Sequelize):**
   - As classes e arquivos dos modelos permanecem em **`PascalCase`** (ex: `FamilyCharacter.ts`, `FamilyTask.ts`, `FamilyBattle.ts`).
   - Na inicialização do modelo no Sequelize (`init`), deve-se sempre definir explicitamente a propriedade `tableName` com o nome em `snake_case` correspondente:
     ```typescript
     {
       sequelize,
       modelName: 'FamilyCharacter',
       tableName: 'family_characters',
       timestamps: true,
     }
     ```

## Identidade Visual & Paleta de Cores Oficial
Toda a interface do usuário (UI/UX) do LiraQuest deve seguir estritamente a seguinte paleta de cores nobre e temática:
- 🍷 **Cor Primária:** Bordô / Vinho Nobre (`#800020`, `#9b111e`, `#6b0f24`, `#4a0e17`) — Botões principais, elementos de destaque, bordas nobres e acentos heroicos.
- 🌌 **Cor Secundária:** Azul Real (`#1e3a8a`, `#2563eb`, `#1d4ed8`, `#0f172a`) — Fundos profundos, superfícies de cards, barras de progresso e elementos arcanos/táticos.
- 👑 **Cor Terciária:** Dourado Imperial (`#d4af37`, `#f59e0b`, `#fbbf24`, `#facc15`) — Ouro, moedas, títulos nobres, estrelas de XP, conquistas, insígnias reais e detalhes de prestígio.

## Arquitetura Técnica do LiraQuest (Fullstack Unificado)
- **Frontend:** HTML/CSS/JS nativo e responsivo com SPA hash routing, evoluindo para Vue 3 + Tailwind CSS + Phaser 3 (Motor de Animação e Batalha Arcade 2D).
- **Backend & Realtime:** Express, Socket.IO (WebSockets em tempo real para convites e Raids cooperativas), Sequelize (MySQL).
- **Repositório Unificado:** Frontend e backend convivem no mesmo repositório com build automatizado (`npm run build` executa o build servido por `server.js`).

## Fluxo de Deploy Automatizado via Git (Com Pergunta Prévia)
Todo o código será implementado e testado em ambiente local. 
A cada funcionalidade concluída, a IA **DEVE OBRIGATORIAMENTE** avisar no chat e solicitar a confirmação do usuário (ex: *"Funcionalidade X concluída! Podemos subir para o Git / Hostinger?"*).
Somente após a autorização explícita do usuário, a IA executará os comandos de commit e push para o repositório Git (`https://github.com/xzsidney/liraquest.git`), acionando o deploy automático para a Hostinger.

## Regra de Ferramentas
A IA está proibida de usar comandos de terminal (como `powershell`, `cat`, etc) para ler ou buscar conteúdos de arquivos. Ela DEVE obrigatoriamente usar suas ferramentas nativas (`view_file`, `grep_search`) para evitar bloqueios de permissão do sistema.
