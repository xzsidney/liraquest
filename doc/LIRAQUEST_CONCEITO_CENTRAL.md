# LiraQuest - Conceito Central & Documentação do Produto

## 🏰 1. Visão Geral
**LiraQuest (`liraquest.com.br`)** é uma plataforma de RPG e gamificação familiar em tempo real, criada para transformar as rotinas, estudos e tarefas da vida real em uma grande jornada heroica e lúdica para pais e filhos.

A aplicação une:
* **Gamificação de Hábitos**: Pais criam missões e tarefas de casa (arrumar quarto, estudar, leitura, escovar dentes) que concedem Ouro e Pontos de Experiência (XP).
* **Progressão de Personagens**: Os filhos evoluem de nível, aprimoram 6 atributos e desbloqueiam habilidades na Árvore de Talentos das suas classes.
* **Loja Real do Reino**: Ouro acumulado pode ser trocado por recompensas da vida real (passeios, tempo de videogame, brinquedos) ou por equipamentos que melhoram os atributos do herói no jogo.
* **Foco AFK / Pomodoro**: Temporizador de foco para estudos e leitura com recompensas proporcionais ao tempo focado.
* **Motor de Combate Arcade (Phaser)**: Combate por turnos em campo 2D com heróis, monstros e animações de habilidades.
* **Raid Cooperativa Multiplayer (2 a 4 Jogadores)**: Pais e filhos jogam juntos em tempo real via WebSockets (Socket.IO) com sistema de iniciativa por turnos contra Chefes Colossais.
* **Motor de Livro-Jogo Solo**: Sistema de aventuras narrativas em nós com múltiplas escolhas e testes de atributos.
* **Radar do Reino**: Mapa de localidades (Casa, Vizinhança, Especial) que contextualiza as missões no mundo do jogo.
* **Controle de Acesso RBAC (3 Perfis)**:
  * 👑 **Administrador (`ADMIN`)**: Controle mestre e visão geral de todos os dados da plataforma.
  * 🛡️ **Pais / Guardiões (`PARENT`)**: Gestão familiar completa, criação e aprovação de tarefas e recompensas.
  * ⚔️ **Filhos / Heróis (`CHILD`)**: Interface gamificada com personagem próprio, missões, combate e progressão.

---

## 👥 1.1 Hierarquia de Perfis & Acesso
1. **Home Pública (`/`)**: Apresentação e boas-vindas à plataforma.
2. **Cadastro (`/register`)**: Criação de contas — sempre com perfil `CHILD` por padrão.
3. **Login (`/login`)**: Autenticação segura com JWT e redirecionamento inteligente.
4. **Dashboard Admin (`/admin`)**: Restrito a administradores.
5. **Dashboard Pais (`/parent`)**: Restrito a pais/guardiões (e administradores).
6. **Dashboard Filhos (`/child`)**: Restrito a filhos/heróis.

---

## 🧍 1.2 Separação de Conta (Usuário) e Personagem

> **Princípio fundamental:** O Usuário é a *conta de acesso*. O Personagem é a *identidade no jogo*. São entidades completamente separadas, com telas e tabelas distintas.

* O usuário faz login na plataforma com e-mail e senha.
* A princípio, cada usuário cria **um único personagem**.
* As telas de **Usuário** (dados reais, perfil de acesso) são completamente separadas das telas de **Personagem** (atributos, classe, habilidades, combate).

---

## 👶 1.3 Fluxo Completo do Filho (CHILD) — Foco Principal

> O filho é o **jogador central** do LiraQuest. Todo o fluxo foi desenhado para a experiência dele.

### Passo 1 — Dashboard do Usuário (Mundo Real)
Ao fazer login, o filho é direcionado para seu painel pessoal com dados da vida real:

| Campo | Descrição |
|:---|:---|
| **Nome completo** | Nome real do usuário |
| **Telefone** | Número de contato |
| **Escola / Faculdade / Trabalho** | Instituição atual (nome e turno) |
| **Foto de perfil** | Foto real do usuário (opcional) |

**Regras de Visibilidade dos Dados:**
* 👤 O próprio filho vê e edita apenas os seus dados.
* 🛡️ Os Pais (`PARENT`) veem os dados dos filhos vinculados à sua família.
* 👑 O Administrador (`ADMIN`) tem visão total de todos os dados da plataforma.

> Se o filho ainda **não criou um personagem**, o painel exibe chamada para ação: `⚔️ Criar Meu Herói`.

---

### Passo 2 — Criação do Personagem (Simples e Direto)
Criação **minimalista** — rápida para não criar atrito, mas significativa o suficiente para gerar identidade.

| Campo | Descrição |
|:---|:---|
| **Nome do Herói** | Nome que aparecerá no jogo (pode ser diferente do nome real) |
| **Sexo** | Masculino / Feminino / Outro |
| **Avatar** | Escolha entre **foto de perfil** (upload) ou um **sprite MUGEN** pré-definido |

**Sobre o Sistema Duplo de Avatar:**
* **Opção 1 — Foto:** O jogador faz upload de uma foto real que representa seu herói no perfil.
* **Opção 2 — Sprite MUGEN:** O jogador escolhe um personagem animado da biblioteca MUGEN. Esse sprite é o mesmo usado nas **animações de combate no Phaser** — garantindo que o avatar do perfil seja idêntico ao herói que luta nas Raids.

Após confirmar → personagem salvo e filho redirecionado para o **Dashboard do Personagem**.

---

### Passo 3 — Dashboard do Personagem (Mundo do Jogo)
Aqui o filho vive a experiência de RPG. É onde o progresso acontece:

* **Atributos:** Distribui pontos ganhos ao subir de nível nos 6 atributos (STR, AGI, CON, INT, CHA, LUK).
* **Classe Ativa:** Visualiza e troca sua classe livremente (progresso de cada classe preservado).
* **Árvore de Talentos:** Desbloqueia habilidades com XP.
* **Inventário:** Gerencia itens e equipamentos ativos.
* **Loja do Reino:** Compra itens com Ouro acumulado pelas tarefas da vida real.
* **Combate / Raids:** Acesso às batalhas cooperativas com a família.

---

## 🏠 1.4 Modelo de Família & Vinculação

### Princípio: Todos os Filhos São Iguais
> Não existe distinção entre filho que mora na casa e filho que visita ou mora em outro lugar. Todos têm o mesmo perfil `CHILD`, as mesmas telas, as mesmas tarefas e os mesmos direitos no jogo.

* Um filho pode cumprir uma tarefa **de onde estiver** — na própria casa, na casa dos pais, em qualquer lugar.
* O que valida a tarefa **não é a localização**, mas a **prova enviada** e a **aprovação do Pai**.

---

## 🎨 1.5 Identidade Visual & Paleta de Cores Oficial
Para transmitir uma atmosfera imersiva, nobre e heroica condizente com a fantasia medieval da família, toda a interface e os elementos visuais do **LiraQuest** adotam estritamente o seguinte padrão cromático:

* 🍷 **Cor Primária: Bordô / Vinho Nobre (`#800020`, `#9b111e`, `#6b0f24`, `#4a0e17`)**
  * Aplicada em botões principais de ação heroica, headers de cartões de destaque, bordas nobres e acentos de batalha.
* 🌌 **Cor Secundária: Azul Real (`#1e3a8a`, `#2563eb`, `#1d4ed8`, `#0f172a`)**
  * Aplicada em superfícies de painéis, barras de progresso de mana/experiência, cartões informativos e elementos táticos/arcanos.
* 👑 **Cor Terciária: Dourado Imperial (`#d4af37`, `#f59e0b`, `#fbbf24`, `#facc15`)**
  * Aplicada no saldo de ouro, insígnias de prestígio, títulos nobiliárquicos, estrelas de XP, botões de recompensa e detalhes cintilantes.

---

* Isso torna o LiraQuest **100% funcional de forma remota e assíncrona** por natureza — não como adaptação, mas como regra central.

### Como a Família é Criada
1. O Pai (`PARENT`) cria a conta e, no seu painel, **cria a Família** (ex: *"Clã Lira"*) — gerando um **código de convite**.
2. Cada filho entra com o código ao criar sua conta (ou vincula posteriormente).
3. Todos os membros vinculados à mesma família aparecem no painel dos Pais e podem participar das Raids e Eventos juntos.
4. Esse modelo é escalável: no futuro, amigos, primos e outros familiares podem ser convidados com o mesmo mecanismo.

---

## ✅ 1.5 Sistema de Conclusão de Tarefas com Prova

> A tarefa só é completada quando o filho envia a prova e o Pai aprova. Esse fluxo é **assíncrono** — cada um age no seu tempo, de onde estiver.

### Fluxo de uma Tarefa
```
Pai cria a tarefa (título, descrição, XP, Ouro)
  ↓
Filho vê a tarefa no seu mural de missões
  ↓
Filho conclui na vida real
  ↓
Filho envia a prova (foto, texto ou ambos)
  ↓
Pai recebe notificação e visualiza a prova no painel
  ↓
Pai APROVA → XP + Ouro creditados automaticamente ao personagem
Pai REJEITA → Filho recebe feedback e pode tentar novamente
```

### Tipos de Prova Aceitas
| Tipo | Descrição |
|:---|:---|
| **Foto** | Upload de imagem como evidência da tarefa concluída |
| **Texto** | Descrição escrita do que foi feito |
| **Ambos** | Foto + descrição combinadas |

### Eventos Familiares (Gincanas)
* Datas especiais (Natal, aniversários, férias) podem ter **Eventos Temporários** — missões exclusivas com recompensas maiores e ranking da família.
* Toda a família participa: quem mora junto e quem está em outra cidade entra pela mesma URL e código de família.
* Eventos podem incluir **Raids Especiais** — batalhas cooperativas com Chefes temáticos (ex: *Chefe do Natal*) com toda a família reunida em tempo real via Socket.IO.

---

## 🎮 2. Mecânicas de Gameplay

### 2.1 Os 6 Atributos do Personagem

Cada atributo tem papel **dentro do combate** e **fora dele**, conectando o desempenho no jogo com os hábitos da vida real.

| Atributo | Identificador | Papel no Combate | Papel Fora de Combate / Narrativo |
|:---|:---|:---|:---|
| **Força** | `str` | Dano físico corpo a corpo, quebra de escudos/armaduras e empurrões no grid. | Desafios de esforço físico, carregar mais itens/peso e derrubar obstáculos. |
| **Agilidade** | `agi` | Iniciativa de turnos (quem joga primeiro), esquiva/evasão e dano à distância (arcos/adagas). | Reflexos rápidos, furtividade e tarefas com limite de tempo. |
| **Constituição** | `con` | Pontos de vida máximos (HP), resistência a efeitos negativos (atordoamento, veneno). | Vigor e foco prolongado (ex: sessões de estudo/timer AFK). |
| **Inteligência** | `int` | Dano de magias arcanas, reserva máxima de MP/Mana e eficiência de habilidades táticas. | Resolução de enigmas, testes de conhecimento em livros-jogos e leitura. |
| **Carisma** | `cha` | Eficiência de auras de grupo, buffs/escudos em aliados e redução de custos na loja. | Negociação em eventos narrativos, liderança e resolução pacífica de conflitos. |
| **Sorte** | `luk` | Chance de acerto crítico (x1.5 / x2 de dano), chance de sobreviver com 1 HP a um golpe fatal. | Taxa de drop de itens raros, recompensas extras em ouro e eventos bônus imprevistos. |

---

### 2.2 As 6 Classes de Heróis

> **Regra de Ouro das Classes:** Cada atributo é o atributo principal de **exatamente uma classe**, garantindo identidade única e diferenciação clara de jogabilidade.

#### 🛡️ Guardião do Lar (Tanque / Protetor)
* **Conceito Real:** A pessoa que cuida da organização da casa, protege os irmãos menores e traz segurança para o ambiente.
* **Atributo Principal:** Constituição (CON) | **Secundário:** Força (STR)
* **Papel no Combate:** Tanque. Absorve dano pelos aliados, atrai atenção dos monstros.
* **Habilidades:**
  * *Muralha Doméstica:* Cria um escudo que absorve dano direcionado a outros membros da família.
  * *Postura Firme:* Reduz o dano recebido e força o monstro a focar no Guardião.
* **Bônus de Hábito:** XP extra ao cumprir tarefas de arrumação pesada, limpeza do quarto e cuidado com o espaço comum.

---

#### 📚 Sábio Estrategista (Mago / Intelectual)
* **Conceito Real:** O herói focado nos estudos, leitura, lições de casa e curiosidade científica.
* **Atributo Principal:** Inteligência (INT) | **Secundário:** Constituição (CON)
* **Papel no Combate:** Dano Mágico. Ataca à distância com magias elementais de alto dano.
* **Habilidades:**
  * *Raio de Conhecimento:* Disparo mágico elemental de longo alcance.
  * *Análise Tática:* Revela fraquezas do monstro, aumentando o dano de todo o grupo no próximo turno.
* **Bônus de Hábito:** XP extra ao usar o Foco AFK/Pomodoro para leituras, deveres escolares e notas altas.

---

#### ✨ Guardião da Harmonia (Curandeiro / Suporte)
* **Conceito Real:** Aquele que traz paz à família, ajuda a resolver desentendimentos e cuida de quem precisa.
* **Atributo Principal:** Carisma (CHA) | **Secundário:** Inteligência (INT)
* **Papel no Combate:** Suporte. Cura aliados, aplica buffs e fortalece o grupo inteiro.
* **Habilidades:**
  * *Abraço Revitalizante:* Cura HP de um aliado ferido ou de todo o clã.
  * *Aura de Motivação:* Concede bônus de dano e velocidade a todos os familiares na Raid.
* **Bônus de Hábito:** XP extra em tarefas de autocuidado, cooperação com os pais e gentileza no dia a dia.

---

#### ⚡ Rastreador Veloz (Ladino / Atleta Ágil)
* **Conceito Real:** Aquele cheio de energia física, focado em esportes, rapidez para cumprir recados e reflexos ágeis.
* **Atributo Principal:** Agilidade (AGI) | **Secundário:** Sorte (LUK)
* **Papel no Combate:** Dano Físico Rápido e Esquiva. Age antes de todos os outros e tem alta evasão.
* **Habilidades:**
  * *Ataque Relâmpago:* Golpe rápido com chance de acertar duas vezes antes do turno do monstro.
  * *Passo Furtivo:* Aumenta drasticamente a chance de esquivar do próximo ataque inimigo.
* **Bônus de Hábito:** XP extra em atividades esportivas, tarefas rápidas com limite de tempo e brincadeiras ao ar livre.

---

#### 🛠️ Artífice Criativo (Engenheiro / Construtor)
* **Conceito Real:** O herói focado em artes, desenhos, trabalhos manuais, montagens e consertos caseiros.
* **Atributo Principal:** Força (STR) | **Secundário:** Inteligência (INT)
* **Papel no Combate:** Invocador / Controle. Cria armadilhas e invoca estruturas mecânicas que atacam.
* **Habilidades:**
  * *Torre de Sucata:* Invoca um ajudante mecânico no grid que ataca à distância por turnos.
  * *Bomba de Brinquedo:* Causa dano em área atingindo múltiplos pontos do campo de batalha.
* **Bônus de Hábito:** XP extra ao organizar brinquedos/materiais artísticos, concluir projetos criativos e tarefas práticas.

---

#### 🎲 Aventureiro Oportunista (Atirador / Sortudo)
* **Conceito Real:** Aquele que adora desafios, jogos de tabuleiro, arriscar novas ideias e descobrir coisas novas.
* **Atributo Principal:** Sorte (LUK) | **Secundário:** Agilidade (AGI)
* **Papel no Combate:** Crítico / Longo Alcance. Menor dano base, mas com chance altíssima de golpes devastadores.
* **Habilidades:**
  * *Disparo Certeiro:* Ataque à distância com altíssima chance de dano crítico.
  * *Golpe da Sorte:* Aciona uma roleta mágica — pode conceder ouro bônus imenso ou atordoar o chefe.
* **Bônus de Hábito:** XP extra ao experimentar novos alimentos, cumprir missões surpresa do Radar e desafios extras.

---

### 2.3 Tabela Resumo: Classes × Atributos

| Classe | Papel no Combate | Atributo Principal | Atributo Secundário | Foco na Vida Real |
|:---|:---|:---|:---|:---|
| 🛡️ Guardião do Lar | Tanque / Defesa | Constituição (CON) | Força (STR) | Arrumação e cuidado da casa |
| 📚 Sábio Estrategista | Mago / Dano Mágico | Inteligência (INT) | Constituição (CON) | Estudos e leitura |
| ✨ Guardião da Harmonia | Suporte / Cura | Carisma (CHA) | Inteligência (INT) | Empatia e convivência |
| ⚡ Rastreador Veloz | Dano Físico / Esquiva | Agilidade (AGI) | Sorte (LUK) | Esportes e rapidez |
| 🛠️ Artífice Criativo | Invocador / Controle | Força (STR) | Inteligência (INT) | Artes e trabalhos manuais |
| 🎲 Aventureiro Oportunista | Crítico / Longo Alcance | Sorte (LUK) | Agilidade (AGI) | Desafios e descobertas |

---

### 2.4 Sistema de Troca de Classe (Multi-Classe)

> **Filosofia:** Liberdade total, com consequência real. O jogador nunca perde o que construiu, mas sente o peso da escolha de mudar.

* O jogador pode trocar de classe a qualquer momento — não existe restrição de nível.
* Ao trocar, o personagem **inicia do zero na nova classe** (level 1, sem habilidades desbloqueadas).
* A classe anterior fica **salva e preservada** — atributos, level, habilidades e progressão ficam intactos.
* Quando o jogador retorna a uma classe antiga, retoma exatamente do ponto onde parou.
* **Causa e Efeito Natural:** Focar em uma classe e levá-la ao máximo é sempre mais eficiente no combate. Ter muitas classes é versátil, mas nenhuma chegará ao nível máximo tão rapidamente. O próprio jogador aprende isso com o tempo — sem que o jogo precise ditar a resposta.
* Esse sistema cria perguntas estratégicas ricas: *"Vale subir minha classe principal ao máximo ou ter múltiplas classes médias para a Raid?"*

---

### 2.5 Sistema de Combate (Phaser)

> O motor de combate será desenvolvido com **Phaser 3** (Game Engine 2D completo), substituindo Pixi.js.

* **Por que Phaser?** Oferece Scene Manager, Física Arcade, sistema de Input, animações de sprites e câmera nativos — reduzindo drasticamente o código necessário para o combate.
* **Campo de Batalha:** Grid tático com posições lineares.
* **Alcance de Ataques:**
  * *Físico (corpo a corpo):* Distância 1 — requer adjacência.
  * *Distância (arcos/adagas):* Alcance de 2 a 5 casas.
  * *Magias e Especiais:* Variável conforme a Árvore de Talentos.
* **IA do Monstro:** Avança em direção ao herói quando à distância; ataca quando adjacente.
* **Fila de Iniciativa:** Controlada pelo atributo `agi` — quanto maior, antes age no turno.
  * Formato: `[ 1º Herói A ] ➔ [ 2º Herói B ] ➔ [ Chefe Boss ]`
  * Em Raids, cada jogador atua no seu próprio aparelho. Ações sincronizadas em tempo real via Socket.IO.

---

### 2.6 Enfermaria do Reino
* Quando um herói chega a **0 HP** em combate, é internado na Enfermaria Real por **1 hora** de tempo real.
* Os **Pais (Guardiões)** possuem passe de alta médica imediata: podem liberar qualquer herói a qualquer momento.

---

### 2.7 Árvore de Talentos (3 Tiers por Classe)
* **Tier I — Iniciante:** Habilidades básicas da classe, custo menor de XP.
* **Tier II — Veterano:** Habilidades intermediárias, requerem habilidade do Tier I como pré-requisito.
* **Tier III — Mestre:** Habilidades épicas de classe, máximo poder.
* Cada habilidade possui um custo em XP para desbloquear e pode ser equipada em um slot de combate.
* A Árvore de Talentos é **exclusiva por classe** — trocar de classe significa começar uma Árvore nova.

---

### 2.8 Centro de Foco AFK / Pomodoro
* Herói inicia um timer de foco vinculado a uma tarefa ou missão livre.
* Ao completar, XP + Ouro são creditados e o sistema verifica subida de nível.
* Atributo **Constituição (CON)** concede bônus de recompensa em sessões longas de foco.

---

### 2.9 Motor de Livro-Jogo Solo (Aventuras Narrativas)
* Aventuras compostas por **Nós Narrativos** conectados por **Escolhas**.
* Cada escolha pode ter um **teste de atributo** opcional (ex: `int` vs dificuldade `15`).
* Resultado do teste: roteado para `successNodeId` ou `failureNodeId`.
* Nós finais com tipo: `VICTORY`, `DEFEAT` ou `NEUTRAL`.

---

## 🗄️ 3. Arquitetura de Banco de Dados

> **Princípio:** Tabelas em `snake_case` minúsculo, sem prefixo. Divididas em dois grupos conceituais.

### 3.1 Tabelas `definition_*` (Catálogo / Biblioteca Global)
São os dados **imutáveis e compartilhados** do jogo — as definições que existem independente de qualquer jogador. Quando um balanceamento é necessário, altera-se aqui e todos os personagens são afetados automaticamente.

| Tabela | Conteúdo |
|:---|:---|
| `definition_classes` | As 6 classes (nome, descrição, atributo principal, atributo secundário) |
| `definition_attributes` | Os 6 atributos (nome, identificador, descrição) |
| `definition_skills` | Todas as habilidades de todas as classes (dano, custo MP, tier, pré-requisito) |
| `definition_items` | Todos os itens da loja (armas, armaduras, poções, preço em ouro, bônus de atributo) |
| `definition_monsters` | Todos os monstros e chefes (HP, ataques, resistências, recompensas de XP/ouro) |

### 3.2 Tabelas `character_*` (Instâncias do Jogador)
São os dados **vivos e únicos** de cada personagem. Referenciam as definições por ID, mas armazenam o estado real de cada herói.

| Tabela | Conteúdo |
|:---|:---|
| `characters` | O personagem do jogador (user_id, nome, level, xp, gold, class_id ativo) |
| `character_classes` | Todas as classes que o personagem já jogou, com level e xp individuais |
| `character_attributes` | Os valores reais de cada atributo do personagem |
| `character_skills` | Habilidades desbloqueadas pelo personagem (por classe) |
| `character_inventory` | Itens que o personagem possui, quantidade e equipamentos ativos |

---

## 🏗️ 4. Arquitetura Técnica

### Stack Fullstack Unificado (1 Repositório)
* **Frontend:** HTML/CSS/JS nativo (fase atual) → Vue 3 com Phaser 3 (fase de combate).
* **Motor de Jogo:** **Phaser 3** — Game Engine 2D completo com Scene Manager, física, animações e input nativos.
* **Backend & Realtime:** Express, Socket.IO (WebSockets), Sequelize (MySQL).
* **Banco de Dados:** MySQL na Hostinger — tabelas em `snake_case` minúsculo, divididas em `definition_*` e `character_*`.
* **Autenticação:** JWT + Bcrypt. Middlewares RBAC com 3 perfis: `ADMIN`, `PARENT`, `CHILD`.
* **Deploy:**
  * Arquivo de entrada: `server.js` → porta 3000.
  * Repositório: `https://github.com/xzsidney/liraquest.git` (Branch: `main`).

---

## 🎯 5. Roadmap

### ✅ Fase 1 — Concluída: Autenticação & Estrutura Base
* Sistema de login/cadastro com JWT e Bcrypt.
* Banco de dados MySQL na Hostinger com tabela `family_users`.
* 6 telas funcionais (Home, Cadastro, Login, Dashboard Admin, Pais e Filhos).
* Separação de perfis ADMIN / PARENT / CHILD com Route Guards.

### 🔄 Fase 2 — Em Definição: Personagem & Catálogo
* Definição e criação das tabelas `definition_*` e `character_*` no banco Hostinger.
* Tela de criação e visualização do Personagem (separada da conta do usuário).
* Seleção de classe, distribuição de atributos e Árvore de Talentos básica.

### 📋 Fase 3 — Backlog: Tarefas & Gamificação
* Mural de missões dos Pais (PARENT) com aprovação e recompensas.
* Foco AFK / Pomodoro com ganho de XP e ouro.
* Loja do Reino com itens reais e virtuais.

### 🎮 Fase 4 — Backlog: Combate Phaser
* Integração do Phaser 3 no frontend.
* Sistema de combate por turnos com grid, animações e IA de monstros.
* Raids Cooperativas Multiplayer via Socket.IO.
