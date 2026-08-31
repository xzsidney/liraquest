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
* **Painel do Clã (Dashboard Analítico da Família):**
  - **Presença em Tempo Real:** Status de conexão de cada membro (`🟢 Online agora`, `🟡 Ausente há Xm`, `⚪ Visto há Xh`).
  - **👑 Campeão da Casa (Mais Tarefas):** Destaque ao herói mais produtivo da semana/mês.
  - **🌱 Herói em Foco (Apoio & Menos Tarefas):** Identificação acolhedora para incentivar quem precisa de apoio com tarefas acessíveis.
  - **Métricas Globais do Clã:** Total de tarefas concluídas pela família, tesouro acumulado e recorde de streak do clã.
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

### 7.1 Masmorras Solo & Desafios Diários
* O filho consome a **Energia de Aventura** ganha nas tarefas para entrar em masmorras curtas.
* Batalhas rápidas em grid tático que testam seus equipamentos e atributos.

### 7.2 Raids Familiares Cooperativas (Multiplayer em Tempo Real)
* Eventos especiais em que a família entra na mesma sala (cada um em seu celular/tablet).
* Sistema de combate em turnos com fila de iniciativa contra chefes poderosos.
* O atributo **Carisma** e as magias de suporte tornam-se essenciais para que todos sobrevivam e compartilhem o tesouro.

### 7.3 Aventuras Narrativas (Livro-Jogo Interativo)
* Histórias ilustradas com caminhos ramificados e escolhas.
* O avanço depende de testes dos 6 atributos do personagem, incentivando a tomada de decisões e o gosto pela leitura.

### 7.4 Foco do Herói (Temporizador Pomodoro Gamificado)
* Um cronômetro que a criança aciona ao sentar para estudar ou ler.
* Durante o tempo focado, o avatar descansa ou treina em modo "AFK". Ao término, converte o tempo estudado em bônus de XP e Energia.

---

## 💰 8. Economia do Aplicativo: A Separação das Moedas

Para manter a clareza e evitar confusão entre lazer real e progressão virtual, o sistema adota duas carteiras independentes:

```
┌──────────────────────────────────────┬──────────────────────────────────────┐
│        CARTEIRA DA VIDA REAL         │        CARTEIRA DO REINO VIRTUAL     │
├──────────────────────────────────────┼──────────────────────────────────────┤
│ • Moeda: Fichas do Lar (Tokens)      │ • Moeda: Ouro do Reino (Gold)        │
│ • Origem: Cumprir tarefas do dia a dia│ • Origem: Vencer monstros e baús     │
│ • Onde Gasta: Loja da Família        │ • Onde Gasta: Loja do Jogo           │
│ • Exemplos:                          │ • Exemplos:                          │
│   - Escolher o sabor da pizza        │   - Espada Flamejante (+10 Força)    │
│   - 1 hora extra de jogos/telas      │   - Poção de Vida Grande             │
│   - Escolher o passeio do domingo    │   - Armadura de Cavaleiro Real       │
│   - Pequenos brinquedos/guloseimas   │   - Mascote Fiel (Bônus passivo)     │
└──────────────────────────────────────┴──────────────────────────────────────┘
```

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
