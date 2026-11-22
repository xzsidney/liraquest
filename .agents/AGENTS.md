# Regras de Segurança e Banco de Dados (LiraQuest)

## Proteção Contra Perda de Dados
A partir de agora, a IA está PROIBIDA de executar ações destrutivas no banco de dados, tais como:
- Executar queries de `DROP TABLE`, `TRUNCATE` ou `DELETE` em massa.
- Executar comandos de sincronização destrutiva (`force: true`, `--accept-data-loss` ou reset de migrações).

**EXCEÇÃO:** A única forma de realizar essas ações é caso a IA siga OBRIGATORIAMENTE os dois passos abaixo:
1. Parar a execução e enviar um alerta destacado avisando o usuário sobre a possível perda de dados.
2. Aguardar o usuário responder no chat com uma autorização explícita confirmando a destruição dos dados.

Qualquer alteração de esquema no banco (Sequelize/MySQL) que ofereça risco deve ser analisada cuidadosamente e apresentada ao usuário antes de rodar comandos no terminal.

## Execução em MODO FULL (Autonomia Total sem Interrupções)
Se o usuário digitar comandos como `"executar em modo full"`, `"executar o plano full"`, `"executar full"` ou indicar MODO FULL no prompt:
- A IA recebe **SINAL VERDE ABSOLUTO E TOTAL** para executar todas as ações do plano de ponta a ponta sem pedir nenhuma confirmação, sem parar no meio do caminho para fazer perguntas e sem solicitar autorização no chat.
- **Deploy Automático:** Ao concluir as alterações e testes, a IA executa o commit e push direto (`npm run deploy`) sem perguntar.
- **Ações de Banco de Dados no Modo Full:** Se o prompt do modo full trouxer explicitamente comandos de reset, drop ou migração, a IA considera isso como a autorização expressa concedida pelo usuário e executa imediatamente sem pausar.
- **Objetivo do Modo Full:** O usuário quer que a IA trabalhe com total autonomia para que ele possa sair da sala e encontrar a tarefa 100% concluída, testada e deployada ao retornar.

## Atualizações de Banco de Dados via Ambiente Local
O ambiente local do backend está conectado diretamente ao banco de dados MySQL de produção na Hostinger através das credenciais no arquivo `.env`. 
Toda vez que for necessário atualizar a estrutura do banco de dados (como criar novas tabelas por sincronização) ou preencher novos dados base (rodar scripts de seed/carga de habilidades e monstros), a IA **DEVE** executar o comando localmente pelo terminal (ex: `npx tsx scripts/...`) para aplicar as mudanças diretamente em produção e facilitar a vida do usuário.

**Condições OBRIGATÓRIAS:**
- Isso SÓ pode ser feito de forma automática se a atualização for **aditiva** (criar nova tabela, adicionar colunas, inserir dados).
- Mesmo sendo aditiva, a IA deve **avisar no chat** o que vai fazer.
- Se o script ou a operação for **deletar tabelas, apagar colunas, ou resetar dados existentes (ex: delete em massa, destroy)**, a IA esbarra na regra de "Proteção Contra Perda de Dados" e **precisa de permissão expressa** do usuário antes de rodar o comando.

## Documentação Contínua da Arquitetura e do Conceito Central
Sempre que a IA construir ou modificar funcionalidades do projeto (exemplo: criar um novo CRUD, adicionar novas tabelas no banco de dados, criar novas rotas REST, alterar regras de gamificação, introduzir novos módulos ou fluxos), é **OBRIGATÓRIO** atualizar imediatamente os dois documentos oficiais localizados na pasta `doc/`:
1. `doc/REGRAS_DE_NEGOCIO.md`: Manter atualizada a visão do produto ("Eu sou o Herói"), os 4 Pilares, o Sistema de Mestria Orgânica por Atributo, as regras dos módulos ativos/planejados, a arquitetura do monorepo e o Mapa Oficial de Rotas REST ativas.
2. `doc/BANCO_DE_DADOS.md`: Registrar toda tabela criada/modificada, descrever suas colunas exatas (tipo, nulabilidade, default, PK/FK), manter o Diagrama ER (Mermaid) atualizado e documentar alterações no seed inicial.

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

## Automação de Comandos de Terminal e Git (Anti Pop-ups da IDE)
Para evitar que a IDE fique travando a execução com caixas de diálogo a cada commit ou script:
1. A IA está **PROIBIDA** de rodar comandos com `BypassSandbox: true` desnecessariamente. Todos os scripts de teste, migrações e comandos do Node.js (ex: `node scripts/...`) DEVEM ser executados obrigatoriamente no modo Sandbox padrão (`BypassSandbox: false`), que roda 100% automático sem exigir aprovação manual do usuário.
2. A IA está **PROIBIDA** de rodar comandos manuais de `git commit -m "frase longa..."` diretamente no terminal, pois mensagens dinâmicas quebram o auto-approve do sandbox da IDE.
3. Todo deploy para o Git DEVE ser executado obrigatoriamente através do script padronizado: `npm run deploy`.
4. Comandos locais preparatórios de git (como `git status` e `git diff`) devem ser executados em modo Sandbox padrão (`BypassSandbox: false`), sem solicitar privilégios desnecessários.

## Regra de Ferramentas
A IA está proibida de usar comandos de terminal (como `powershell`, `cat`, etc) para ler ou buscar conteúdos de arquivos. Ela DEVE obrigatoriamente usar suas ferramentas nativas (`view_file`, `grep_search`) para evitar bloqueios de permissão do sistema.
