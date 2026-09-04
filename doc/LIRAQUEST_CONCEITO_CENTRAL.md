# 📖 LiraQuest — Documento de Visão de Produto e Conceito do Aplicativo (Product Concept Document)

---

## 🎯 1. Sumário Executivo & Propósito do Produto

### 1.1 O Que é o LiraQuest?
O **LiraQuest** é um ecossistema gamificado de gestão de hábitos e RPG familiar em tempo real. O aplicativo foi idealizado para resolver um dos maiores pontos de atrito da vida doméstica: **a resistência na execução de rotinas, deveres de casa, tarefas cotidianas e hábitos saudáveis por parte dos filhos**.

Ao invés de uma abordagem punitiva ou de cobranças repetitivas, o LiraQuest introduz um modelo de **Realidade Dupla Interconectada (Mundo Real ↔ Reino Virtual)**, onde as responsabilidades cotidianas se transformam no combustível principal para alimentar uma jornada de fantasia heroica jogada em conjunto por pais e filhos.

### 1.2 Proposta de Valor
* **Para os Pais (Guardiões / Mestres da Guilda):** Ferramenta lúdica de incentivo positivo, acompanhamento de hábitos, autonomia dos filhos e alinhamento de recompensas reais negociadas de forma transparente.
* **Para os Filhos (Heróis / Aventureiros):** Sensação imediata de progresso, recompensas tangíveis (na vida real e no jogo), narrativa envolvente e personalização de seus avatares.
* **Para a Família (O Clã):** Fortalecimento dos laços afetivos por meio de atividades cooperativas, onde pais e filhos unem forças para derrotar desafios no jogo e celebrar conquistas na vida real.

---

## 🌐 2. O Conceito Central: A Teoria dos Dois Terminais (Dois Mundos)

O grande diferencial do LiraQuest é a **separação conceitual e visual rigorosa entre o plano da Vida Real e o plano do Reino Virtual**, mantendo entre eles um canal direto de conversão de energia e recompensas.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              MUNDO REAL (USUÁRIO)                           │
│  • Ações: Arrumar a cama, lição de casa, buscar pão, ler 20 minutos         │
│  • Validação: Pai/Mãe confirma a conclusão da tarefa                        │
│  • Moeda Gerada: Fichas do Lar (Tokens Reais) + Energia de Aventura         │
│  • Loja: Escolher o sabor da pizza, tempo extra de videogame, passeios      │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │ CONVERSÃO DIRETA
                                       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                            REINO VIRTUAL (AVATAR)                           │
│  • Consumo: Energia de Aventura permite entrar em Masmorras e Batalhas      │
│  • Ações: Enfrentar monstros temáticos, Raids cooperativas familiares       │
│  • Moeda Gerada: Ouro do Reino (Gold) + Pontos de Experiência (XP)          │
│  • Loja: Espadas lendárias, armaduras, feitiços, mascotes e cosméticos      │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 2.1 Terminal do Usuário (Painel da Vida Real do Filho)
Representa a vida prática e a rotina do membro da família:
* **Mural de Missões do Dia:** Lista de deveres organizados por períodos e categorias com recompensas claras de Fichas, Ouro, XP e Energia.
* **Painel do Herói (Evolução Real do Filho):** Central de acompanhamento da evolução pessoal do usuário no mundo real, contendo:
  - **Nível Real do Usuário (Hábitos):** Nível de disciplina e consistência calculado a partir do XP real de tarefas cumpridas.
  - **Barra de XP & Patentes do Lar:** Títulos de honra (*🌱 Recruta do Lar*, *⚔️ Herói Dedicado*, *🛡️ Guardião Exemplar*, *👑 Cavaleiro de Elite*, *🌟 Campeão Lendário*).
  - **Cofre de Fichas Reais & Recursos:** Acúmulo de Fichas do Lar, Ouro e Energia de Foco.
  - **Sequência (Streak 🔥):** Dias consecutivos cumprindo deveres sem quebra de rotina.
  - **Métricas de Hábitos:** Tarefas concluídas no dia, total histórico e taxa de aprovação familiar.
* **Foco & Estudos (Pomodoro Gamificado):** Temporizador para sessões de leitura e lição de casa.
* **Histórico de Missões:** Extrato completo de comprovações e feedbacks dos pais.

### 2.2 Terminal do Guardião (Painel de Gestão dos Pais)
O centro de comando dos pais para coordenar e incentivar a família:
* **Validador de Provas em Tempo Real:** Avaliação com 1 clique das fotos e relatos enviados pelos filhos, com aprovação e feedback pedagógico.
* **Gestão de Missões (CRUD Completo):** Criação, edição, ativação/pausa e exclusão de tarefas personalizadas da casa.
* **Painel do Clã (Dashboard de Inteligência & Analytics Familiar):**
  - **Presença em Tempo Real:** Status de conexão de cada membro (`🟢 Online agora`, `🟡 Ausente há Xm`, `⚪ Visto há Xh`).
  - **📅 Hábitos & Produtividade Semanal:** Gráfico de evolução diária das missões cumpridas nos últimos 7 dias, com filtro individual por herói.
  - **🥧 Distribuição por Áreas da Vida:** Diagnóstico visual do equilíbrio entre Estudos 📚, Organização 🧹, Saúde 🏃‍♂️, Criatividade 🎨 e Social 🤝.
  - **👑 Campeão da Casa vs. 🌱 Herói em Foco:** Reconhecimento da liderança positiva e identificação empática de quem necessita de incentivo.
  - **📈 Relatório & Dicas Pedagógicas Dinâmicas:** Orientações personalizadas para os pais fortalecerem a motivação intrínseca e o reforço verbal positivo.
  - **⚔️ Comparativo Entre Heróis (Quem Fez o Quê):** Visualização lado a lado da produtividade de cada irmão com % de contribuição no clã, áreas de dedicação, matriz comparativa por hábitos e histórico detalhado das últimas missões realizadas por cada um.
  - **💰 Extrato do Tesouro Familiar & Resgates:** Balanço lúdico de Ouro e Fichas geradas vs Vales resgatados na Loja do Lar com histórico recente.
  - **🏆 Conquistas & Insígnias Coletivas do Clã:** Metas colaborativas da casa (ex: 50 tarefas no clã, 7 dias de streak coletiva, 20 tarefas de estudos).
  - **Métricas Globais do Clã:** Total de tarefas aprovadas pela família, tesouro acumulado e recorde de streak do clã.
* **Filhos & Clã Familiar:** Acompanhamento individual dos heróis vinculados e código de convite familiar em 1 clique.
* **Seus Dados Cadastrais:** Gestão do perfil pessoal, telefone, profissão e foto real do guardião.

### 2.3 Terminal do Avatar (Painel do Reino Virtual)
Representa o herói de fantasia dentro do universo lúdico:
* **Ficha do Herói:** Classe, nível de combate do avatar, árvore de habilidades e atributos (Força, Agilidade, Constituição, Inteligência, Carisma, Sorte).
* **Energia de Ação:** O fôlego/energia que o avatar precisa para entrar nas batalhas e explorar masmorras é conquistado exclusivamente através do cumprimento das tarefas reais.
* **Batalhas e Masmorras:** Modos de combate contra os monstros da desordem e chefes colossais.
* **Loja Mágica do Reino:** Onde o ouro obtido nos combates é gasto para comprar itens do jogo (armas, poções, trajes e montarias virtuais).

---

## 👨‍👩‍👧‍👦 3. Dinâmica e Perfis Familiares

### 3.1 👑 O Papel dos Pais (Mestres do Reino / Guardiões)
Os pais deixam o papel de "fiscais" para se tornarem os **Mestres da Guilda**:
1. **Cadastram e customizam as missões:** Definem tarefas adequadas à idade e rotina da casa.
2. **Definem as recompensas da vida real:** Estabelecem o valor em Fichas do Lar para cada benefício real.
3. **Validam as tarefas:** Recebem o aviso de conclusão e dão o "Visto do Mestre", liberando os pontos e a energia para o filho.
4. **Participam como Heróis Aliados:** Os pais também possuem seus próprios personagens e podem formar grupo nas Raids de fim de semana, incentivando a cooperação.

### 3.2 ⚔️ O Papel dos Filhos (Heróis Aventureiros)
1. **Escolhem sua Classe de Herói:** Alinham sua identidade no jogo com seus pontos fortes ou gostos pessoais.
2. **Concluem tarefas para ganhar autonomia:** Ao cumprir as missões reais, ganham Fichas Reais para gastar em privilégios e Energia/XP para evoluir o herói.
3. **Enfrentam desafios virtuais:** Usam a força do seu personagem para derrotar monstros, progredir na história e apoiar a família nas batalhas em grupo.

---

## 🎭 4. Classes de Heróis & Metáforas da Vida Real

As classes do LiraQuest conectam habilidades do jogo com atitudes reais:

| Classe | Papel no Jogo | Atributos Foco | Metáfora da Vida Real |
| :--- | :--- | :--- | :--- |
| **🛡️ Guardião do Lar** | Tanque protetor, escudos para a equipe e absorção de dano. | Constituição / Força | Cuidado com a ordem da casa, proteção dos irmãos e disciplina. |
| **📚 Sábio Estrategista** | Mago, ataques elementais e revelação de fraquezas dos inimigos. | Inteligência / Constituição | Foco nos estudos, leitura de livros, curiosidade e dever de casa. |
| **✨ Guardião da Harmonia** | Curandeiro e suporte que revitaliza e fortalece o clã. | Carisma / Inteligência | Empatia, gentileza, auxílio aos pais e resolução pacífica de brigas. |
| **⚡ Rastreador Veloz** | Dano físico ágil, golpes múltiplos e alta taxa de esquiva. | Agilidade / Sorte | Prática de esportes, agilidade nos recados rápidos e energia física. |
| **🛠️ Artífice Criativo** | Invocador de engenhocas e controle do campo de batalha. | Inteligência / Força | Artes manuais, desenhos, montagens de blocos e projetos práticos. |
| **🎲 Aventureiro Oportunista** | Atirador de longo alcance com alto índice de acerto crítico. | Sorte / Agilidade | Coragem de provar coisas novas (comidas/desafios) e espírito explorador. |

---

## 📊 5. Os 6 Atributos Fundamentais

1. **Força (STR):** Potência dos ataques físicos no jogo. Ligado a tarefas de esforço físico e movimentação.
2. **Agilidade (AGI):** Determina quem joga primeiro (iniciativa) e chance de esquiva. Ligado a pontualidade e velocidade.
3. **Constituição (CON):** Pontos de vida máximos (HP) do herói. Ligado à resistência, consistência de hábitos e autocuidado.
4. **Inteligência (INT):** Poder dos feitiços e habilidades táticas. Ligado a estudos, leitura e aprendizado.
5. **Carisma (CHA):** Força das curas, auras de grupo e descontos na loja. Ligado à harmonia familiar e espírito de equipe.
6. **Sorte (LUK):** Chance de acertos críticos e drops de tesouros extras. Ligado a surpresas, desafios extras e jogos.

---

## 👾 6. Monstros Temáticos & Narrativa Espelhada

Os monstros e vilões do jogo são **metáforas diretas da desordem e dos maus hábitos**, permitindo que a criança visualize o impacto de suas ações:

* **🧹 Goblin da Sujeira / Espectro da Poeira:** Monstro fraco que surge nos cômodos quando brinquedos e roupas ficam espalhados. Derrotado ao arrumar o espaço.
* **📚 O Devorador de Páginas:** Bloqueia as portas da sabedoria. Fica fraco à medida que a criança cumpre suas metas de leitura e estudos diários.
* **⏰ Titã da Procrastinação:** Monstro lento e resistente que atrasa os heróis. Derrotado quando as tarefas são entregues no prazo sem adiamento.
* **🍽️ O Colosso da Louça Acumulada (Chefe de Raid):** Grande monstro enfrentado no fim de semana que exige a colaboração de toda a família (pais e filhos) em equipe para ser vencido.

---

## 🎮 7. Modos de Jogo & Experiências Virtuais

### 7.1 Arcade do Reino Virtual & Mini-Jogos (Consumo de Energia de Aventura)
O Arcade do Reino é o hub de lazer onde o Avatar gasta a **⚡ Energia de Aventura** ganha nas tarefas do mundo real para se divertir e faturar **💰 Ouro Virtual** e **⭐ XP**:
1. 🔦 **Esconde-Esconde Camaleão (Lanterna Dinâmica & Modo Família):** O jogador comanda uma bolinha colorida em uma arena com 4 quadrantes de cores nobres (Rubi, Safira, Esmeralda, Ouro). Ao parar sobre a cor correspondente, fica 100% camuflado! Possui dois modos de jogo:
   - 🤖 **Modo Solo:** O jogador enfrenta a Patrulha da IA e precisa sobreviver por 45 segundos coletando cristais 💎 de ouro.
   - 👨‍👩‍👧‍👦 **Modo Família em Tempo Real (WebSockets / Socket.IO):** Pais e filhos entram no Saguão do Clã. A **Roleta da Sorte 🎰** gira e elege aleatoriamente um membro como o **🔦 Caçador da Lanterna** da rodada. Os outros viram os **👻 Camaleões**, que têm 10 segundos de escuridão para se esconder antes da caçada começar!
2. 🏹 **O Arqueiro do Saber (Tiroteio de Conhecimento e Reflexo - ATIVO):** Jogo de precisão motora e agilidade mental em Canvas 2D nativo (ultra leve para a Hostinger). O herói dispara flechas de luz contra 4 alvos/balões rúnicos flutuantes correspondentes às alternativas de enigmas curriculares reais.
   - 🎒 **Calibração por Etapas de Ensino:** Permite escolher entre *Fundamental 1 (Primário)*, *Fundamental 2*, *Ensino Médio* e *Ensino Superior / Faculdade*.
   - 🎯 **3 Níveis de Dificuldade da Aljava:**
     - 🟢 *Fácil (Iniciante):* Flechas ilimitadas (∞) para treinar sem pressão (1.0x recompensas).
     - 🟡 *Médio (Aventureiro):* Aljava com 15 flechas para 10 perguntas (+25% de Ouro e XP).
     - 🔴 *Difícil (Mestre Arqueiro):* Aljava com 12 flechas, alvos mais velozes e penalidade de -1 flecha extra por erro de resposta (+50% de Ouro e XP e bônus dobrado em INT).
   - ⚡ **Economia e Atributos:** Consome 4 ⚡ Energia de Aventura, credita Ouro 💰 direto no Herói, XP ⭐ na classe ativa e bônus no atributo **Inteligência (INT)**.
   - ⚡ **Alvo Relâmpago de Reflexo:** Aparição periódica de um alvo dourado de alta velocidade para testar o tempo de reação e conceder bônus extras (+250 pts).
3. ⚔️ **Duelo de Arqueiros (1v1 Família em Tempo Real - ATIVO):** Modo multijogador competitivo em tempo real baseado em Socket.IO (`/duel`) e Canvas 2D:
   - 🛡️ **Equidade Pedagógica:** Dois irmãos ou membros da família duelam na mesma arena de seus celulares ou PCs, cada um respondendo perguntas do seu próprio nível escolar (ex: caçula com Fundamental 1 e primogênito com Ensino Médio/Faculdade).
   - ⚖️ **Placar Dinâmico em "Cabo de Guerra":** Uma barra superior dinâmica com gema central oscila em tempo real conforme os acertos e combos de cada arqueiro, gerando engajamento e adrenalina saudável.
   - ⚡ **Desempenho Zero Lag:** A física e renderização ocorrem 100% no cliente (Canvas 2D nativo); o servidor Hostinger apenas propaga pings leves de pontuação e combo via WebSocket, operando com consumo mínimo de recursos.
   - 👑 **Glória e Recompensas:** O vencedor ganha +50 Ouro, +80 XP e +2 INT; o vice-campeão recebe prêmio de participação valoroso (+25 Ouro, +40 XP e +1 INT), reforçando sempre a cooperação e o esforço.
4. 📜 **Aventuras em Quest (Livro-Jogo Interativo de Masmorra - ATIVO):** RPG Solo de narrativa ramificada em estilo livro-jogo clássico com 3 escolhas estratégicas por cena e testes dinâmicos de atributos com D20 animado:
   - 🏰 **Campanhas no Catálogo:** Três masmorras disponíveis com 5 cenas/capítulos cada:
     - 🧹 *O Covil do Goblin da Poeira (Fácil):* Foco em organização do lar, bravura e iniciativa contra a sujeira.
     - 📚 *A Torre do Devorador de Páginas (Média):* Foco em sabedoria, leitura, enigmas arcanos e concentração escolar.
     - ⏳ *As Catacumbas da Procrastinação Eterna (Difícil):* Foco em determinação, agilidade e vitória sobre a preguiça e adiamento.
   - 🎲 **Mesa de Rolagem D20 Animada:** A cada cena, o jogador escolhe entre 3 ações (Força/Combate, Agilidade/Destreza, ou Inteligência/Magia). O dado D20 virtual rola com física e som tátil (Web Audio API), somando o modificador de atributo da ficha do herói contra a Classe de Dificuldade (CD).
   - ❤️ **Sistema de Pontos de Vida (HP):** O HP do herói na expedição é baseado em sua Constituição ($\text{HP} = 30 + \text{CON} \times 2$). Falhas nos testes causam dano com efeito de tremor de tela.
   - 👑 **Baú Épico & Evolução Real:** Ao vencer a câmara final, o Baú Épico se abre com fanfarra real, creditando Ouro no Herói, XP na Classe Ativa (com checagem de Level Up) e aprimorando permanentemente (+1) o atributo mais utilizado com sucesso na run! Em caso de derrota, a Guarda Real realiza o resgate honroso com recompensas de consolação (+15 Ouro, +25 XP), mantendo o princípio de reforço positivo sem punição severa.
   - ⚡ **Economia:** Consome 5 ⚡ Energia de Aventura ganha nas tarefas do mundo real.
5. ⚔️ **Arena de Batalha 2D:** Combates contra os Monstros da Casa.

### 7.2 Masmorras Solo & Desafios Diários
* O filho consome a **Energia de Aventura** ganha nas tarefas para entrar em masmorras curtas.
* Batalhas rápidas em grid tático que testam seus equipamentos e atributos.

### 7.3 Raids Familiares Cooperativas (Multiplayer em Tempo Real)
* Eventos especiais em que a família entra na mesma sala (cada um em seu celular/tablet).
* Sistema de combate em turnos com fila de iniciativa contra chefes poderosos.
* O atributo **Carisma** e as magias de suporte tornam-se essenciais para que todos sobrevivam e compartilhem o tesouro.

### 7.4 Foco do Herói (Temporizador Pomodoro Gamificado)
* Um cronômetro que a criança aciona ao sentar para estudar ou ler.
* Durante o tempo focado, o avatar descansa ou treina em modo "AFK". Ao término, converte o tempo estudado em bônus de XP e Energia.

---

## 💰 8. Economia do Aplicativo: A Separação das Moedas

Para manter a clareza e evitar confusão entre lazer real e progressão virtual, o sistema adota duas carteiras independentes:

### 8.1 A Loja do Lar (Recompensas Familiares & Vales Reais)
A **Loja do Lar** é a ponte definitiva que transforma disciplina em benefícios concretos para **todos os membros da casa (Filhos e Pais)**:
* **Para os Filhos:** Onde trocam suas **🎟️ Fichas do Lar** conquistadas nas tarefas por vales reais (ex: *1h Extra de Videogame*, *Noite da Pizza*, *Passeio no Parque*, *Comprar um Livro*).
* **Para os Pais (Guardiões):** Onde gerenciam o cardápio de combinados da casa (CRUD completo com custo em fichas e perfis permitidos), aprovam resgates e **também podem resgatar seus próprios vales** (ex: *Vale Futebol com os Amigos*, *Dormir até mais tarde*, *Noite do Hambúrguer*).
* **Fluxo de Resgate Seguro:** O membro escolhe a recompensa ➔ O saldo em fichas é validado e deduzido ➔ Uma solicitação de resgate é gerada com status `⏳ Aguardando Aprovação` ➔ O pai valida e entrega o benefício, mudando o status para `✅ Aprovado / Entregue`. Se cancelado, as fichas retornam instantaneamente ao saldo do membro.

---

## 🗺️ 9. O Fluxo de Uso Diário (O Ciclo Perfeito)

1. **Amanhecer:** O filho abre o aplicativo no **Terminal do Usuário** e vê suas missões matinais (arrumar a cama, escovar os dentes, preparar a mochila).
2. **Execução & Confirmação:** O filho cumpre as tarefas e marca como "Concluído". O pai recebe a notificação no painel dele e aprova.
3. **Ganho de Recursos:** O filho recebe **Fichas do Lar** (para a pizza do sábado) e **Energia de Aventura** para o seu herói.
4. **Tarde de Estudos:** O filho ativa o **Foco do Herói** para estudar para a prova. Ao terminar, ganha bônus de XP em Inteligência.
5. **Momento de Lazer (Gameplay):** O filho alterna para o **Terminal do Avatar**, gasta sua Energia nas masmorras, derrota o *Goblin da Sujeira* e ganha Ouro Virtual para trocar por um elmo novo.
6. **Fim de Semana em Família:** Pais e filhos entram juntos na **Raid Familiar**, derrotam o chefe colossão e comemoram trocando suas Fichas do Lar pela Noite da Pizza.

---

## 🚀 10. Diretrizes para a Equipe de Design e Desenvolvimento

* **Linguagem Visual Distinta:** O Terminal da Vida Real deve ser limpo, acolhedor, intuitivo e com foco em usabilidade. O Terminal do Avatar deve ser vibrante, épico, com clima de fantasia medieval/pixel art.
* **Nunca Bloquear a Criança de Forma Frustrante:** O aplicativo não deve usar punições severas (como perder tudo ao errar). O foco é sempre o **reforço positivo** — cumprir deveres acelera a jornada; não cumprir apenas mantém o ritmo normal.
* **Flexibilidade Total para os Pais:** Cada família tem sua dinâmica. A equipe deve projetar as ferramentas de forma que os pais possam criar suas próprias regras, tarefas customizadas e valores de recompensas com facilidade.

---

## 🕹️ 11. O Arcade Familiar & Livro-Jogo Interativo de Masmorras

O **Arcade de Lira** é o centro de diversão acessível pelo Terminal do Avatar (`/avatar` -> Aba Arcade). Ele consome a Energia de Aventura acumulada pelas tarefas diárias cumpridas no mundo real e oferece três experiências completas:

1. **O Arqueiro do Saber (Solo):** Mini-game arcade de precisão e arco e flecha com questões pedagógicas (primário à universidade).
2. **⚔️ Duelo de Arqueiros (1v1 Família em Tempo Real):** Mini-game competitivo via WebSockets entre dois irmãos ou pais e filhos, com alvos flutuantes sincronizados e calibração educacional independente por série escolar.
3. **📖 Aventuras em Quest (Livro-Jogo Interativo de Masmorra RPG):**
   - **Mecânica Clássica de Livro-Jogo (Estilo Fighting Fantasy):** O herói escolhe uma masmorra e mergulha em capítulos narrativos imersivos. Cada cena apresenta uma situação descritiva e 3 opções táticas (ex: Físico/Força, Destreza/Agilidade, Raciocínio/Inteligência).
   - **Dado D20 3D Autêntico & Resolução de Testes:** As ações são resolvidas rolando um icosaedro D20 vetorial, somando o modificador do atributo do personagem e comparando com a Classe de Dificuldade (CD).
   - **Árvore de Decisões com Causa e Consequência:** Sucessos e Falhas não são meros textos:
     - Se o herói obtém **Sucesso**, ele é direcionado para a cena de triunfo correspondente (ex: arromba a porta e surpreende os monstros desprevenidos), recebendo 3 novas escolhas táticas vantajosas.
     - Se o herói sofre uma **Falha**, ele sofre dano no HP e é direcionado para a cena de consequência (ex: a porta não abre, o herói torce o pé e os guardas são alertados), ganhando 3 novas opções de sobrevivência e improviso.
   - **Apresentação Visual Imersiva (Visual Novel / RPG de Mesa):** O cenário da masmorra preenche a arena inteira com ilustrações em alta resolução que mudam dinamicamente a cada cena e consequência (porta trancada, sala invadida com monstros surpresos, alarme disparado, confronto com o chefe e a câmara do baú). A caixa de narrativa e os 3 cartões de escolha ficam posicionados na parte inferior da tela com efeito de vidro translúcido (*Glassmorphism*), garantindo visão desobstruída da arte e máxima legibilidade.
   - **Progressão e Resgate Final:** Ao alcançar o Ato Final sem esgotar seus Pontos de Vida (HP), o jogador abre o Baú Épico, conquistando Ouro Virtual, XP de Classe e +1 ponto de aprimoramento no atributo mais utilizado com sucesso durante a expedição. Em caso de derrota (HP zerado), os socorristas do clã resgatam o aventureiro, mantendo o aprendizado e a diversão familiar.
4. **⚔️ Arena de Batalha 2D (RPG de Turnos com Sprites Clássicos MUGEN — Capitão América vs Ciclope):**
   - **Mecânica Tática por Turnos (Estilo Final Fantasy & Summoners War):** Combate 2D estratégico com barra de Iniciativa (ATB), pontos de vida (HP), pontos de magia (MP) e barra de Fúria (0 a 100%).
   - **Conexão Direta com a Ficha de Atributos do Herói:**
     - O poder de combate não é genérico: é derivado diretamente dos atributos da ficha viva do Herói (`CharacterAttributes` e bônus de itens equipados em `CharacterInventory`).
     - **HP Máximo:** Calculado com base na Constituição (`CON`) e Nível do Herói (`180 + CON * 18 + Level * 25`).
     - **MP Máximo:** Calculado com base na Inteligência (`INT`) e Nível (`70 + INT * 8 + Level * 6`).
     - **Ataque Físico:** Baseado em Força (`STR`) e bônus de armas (`30 + STR * 3.2 + WeaponBonus`).
     - **Ataque Mágico / Feixe Óptico:** Baseado em Inteligência (`INT`) (`35 + INT * 3.5`).
     - **Defesa & Absorção:** Baseado em Constituição (`CON`) e bônus de armaduras (`CON * 1.5 + ArmorBonus`).
     - **Velocidade de Iniciativa:** Baseado em Agilidade (`AGI`) (`10 + AGI * 0.9`).
     - **Taxa Crítica:** Baseado na Sorte (`LUK`) (`5% + LUK * 0.7%`).
   - **Deck Modular de Ações (1 Ataque Básico + 3 Habilidades Equipadas):**
     - O herói sempre possui **1 Ataque Básico** (soco ou chute padrão de custo 0 MP).
     - Carrega até **3 Habilidades Especiais** adquiridas na Árvore de Talentos (`definition_skills` com `is_equipped: true` em `character_skills`).
     - **Desacoplamento Visual via `animation_id`:** As habilidades no banco de dados contêm um ponteiro numérico (`animation_id`), permitindo que novas habilidades criadas pelo administrador utilizem animações da engine (1 = arremesso, 2 = feixe contínuo, 3 = gancho ascendente, 4 = investida/dash, 5 = rasteira, 100 = básico, 600 = golpe supremo) sem reescrever código de batalha.
   - **Animações Fluidas & Efeitos Visuais Originais:** Utiliza pacotes de sprites de alta fidelidade da era dourada dos arcades da Capcom (Marvel vs Capcom) com suporte a física bidirecional de projéteis e feixes laser contínuos, espelhamento inteligente de coordenadas, avanço dinâmico (dash) em golpes corpo a corpo e retorno à posição base.
   - **Duelo Épico de Campeões:**
     - **🛡️ Capitão América (Tanque / Vanguarda):** Combate com o lendário Escudo de Vibranium. Possui ataques físicos diretos, arremesso perfurante à distância (*Shield Slash* com projétil dinâmico que vai e volta), gancho aéreo ascendente com chance de atordoar (*Stars & Stripes* com rastro de poeira estelar), investida com escudo de choque (*Charging Star*) e o Golpe Supremo *FINAL JUSTICE* com explosão cósmica dourada.
     - **🔴 Ciclope (Artilheiro / Mestre Óptico):** Mestre de controle de campo à distância. Utiliza chutes giratórios (*Cyclone Kick*), rajada óptica concentrada (*Optic Blast* com feixe laser contínuo), varredura rasteira que atrasa a iniciativa adversária (*Optic Sweep*), gancho de plasma (*Gene Splice*) e o Golpe Supremo cinematográfico de tela cheia *MEGA OPTIC BLAST*.
   - **Economia e Recompensas:** Custo de 5 Energia de Aventura. Vitórias concedem +50 Ouro e +80 XP para evolução de nível do herói.
5. **🎞️ Visualizador & Editor de Animações 2D (`/animator.html`):**
   - Ferramenta visual do Arcade para inspeção, calibração e criação de golpes dos lutadores.
   - **Canvas com Eixo e Linhas Guia:** Visualização do centro de gravidade (0,0) e linha do chão com opção de grade milimétrica, sombra e espelhamento (lado 1P vs 2P).
   - **Calibração Rápida via Teclado e Mouse:** Ajuste pixel a pixel do ponto pivô (`bodyAxis.xaxis`, `bodyAxis.yaxis`, `shieldAxis.xaxis`, `shieldAxis.yaxis`) usando as setas direcionais (`←` `↑` `→` `↓`) ou `Shift + Setas` para saltos de 5px.
   - **Manipulação Completa de Sequências:** Permite duplicar frames, adicionar novos frames a partir de qualquer sprite PNG disponível na pasta do personagem, reordenar, alterar durações (`durationPerFrame`) e criar novas animações com 1 clique.
   - **Persistência Segura:** Salva as configurações diretamente no `manifest.json` com criação automática de backup de segurança (`manifest.backup.json`).
