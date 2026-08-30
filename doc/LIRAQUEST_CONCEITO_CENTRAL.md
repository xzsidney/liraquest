# LiraQuest - Conceito Central & Documentação do Produto

## 🏰 1. Visão Geral
**LiraQuest (`liraquest.com.br`)** é uma plataforma de RPG e gamificação familiar em tempo real, criada para transformar as rotinas, estudos e tarefas da vida real em uma grande jornada heroica e lúdica.

A aplicação une:
* **Gamificação de Hábitos**: Pais criam missões e tarefas de casa (arrumar quarto, estudar, leitura, escovar dentes) que concedem Ouro e Pontos de Experiência (XP).
* **Progressão de Personagens**: Os filhos evoluem de nível, aprimoram atributos (Força, Sabedoria, Vitalidade, Agilidade) e desbloqueiam magias na Árvore de Talentos.
* **Loja Real do Reino**: Ouro acumulado pode ser trocado por recompensas da vida real (passeios, tempo de videogame, brinquedos, livros).
* **Foco AFK / Pomodoro**: Temporizador de foco para estudos e leitura com recompensas proporcionais.
* **Motor Arcade MUGEN 2D (Pixi.js v8)**: Combate em tempo real com personagens icônicos (Capitão América, Homem-Aranha, Kenshin, etc.).
* **Raid Cooperativa Multiplayer (2 a 4 Jogadores)**: Pais e filhos jogam juntos em tempo real via WebSockets com Sistema de Iniciativa por Turnos contra Chefes Colossais.

---

## 🎮 2. Mecânicas de Gameplay

### 2.1 Classes de Heróis
1. **⚔️ Guerreiro**: Especialista em dano físico corpo a corpo e alta vitalidade.
2. **🔥 Mago**: Conjurador de magias elementais de longo alcance com alto consumo de MP.
3. **🛡️ Paladino**: Tanque protetor com escudos sagrados e auras para o grupo.
4. **✨ Curandeira**: Suporte vital que cura os membros da família nas Raids.
5. **🏹 Arqueiro**: Atirador de precisão com ataques à distância de custo zero.
6. **🗡️ Ladino**: Especialista em golpes críticos e esquivas rápidas.

### 2.2 Sistema de Combate no Grid Tático
* O campo de batalha possui **10 posições lineares (0 a 9)**.
* **Alcance de Golpes**:
  * *Golpe Rápido / Soco Forte*: Alcance 1 (lado a lado).
  * *Disparo à Distância / Teia / Flecha*: Alcance 2 a 5 casas.
  * *Magias e Especiais*: Variável conforme a árvore de habilidades.
* **Fila de Iniciativa**:
  `[ 1º Jogador A ] ➔ [ 2º Jogador B ] ➔ [ 3º Chefe Boss ]`
  Cada jogador atua no seu próprio aparelho e as ações são transmitidas instantaneamente para todos os navegadores conectados na sala.

### 2.3 Enfermaria do Reino
* Quando um herói tem seu HP zerado em combate, ele é levado para a Enfermaria Real para repousar por **1 hora** de tempo real.
* Os pais (Líderes) possuem passe de alta médica imediata para liberar os filhos a qualquer momento.

---

## 👨‍👩‍👧‍👦 3. Perfis e Permissões de Usuários
* **👑 Líder da Família (Pais)**: Podem criar tarefas, aprovar missões, cadastrar itens na loja, dar alta na enfermaria e gerenciar o reino.
* **🛡️ Herói Aventureiro (Filhos)**: Podem cumprir tarefas, usar o Foco AFK, comprar itens na loja, batalhar na Arena 1v1 e participar de Raids cooperativas.
