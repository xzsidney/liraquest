# 🏰 PROJETO LIRAQUEST (liraquest.com.br) - RESUMO PARA O NOVO CHAT

## 📌 1. Visão Geral do Projeto
O **LiraQuest** é uma plataforma de RPG e gamificação familiar em tempo real, 100% separada do sistema LiraRPG (White Wolf).
Ele transforma rotinas, estudos e tarefas da vida real em uma aventura épica para pais e filhos, com batalhas arcade 2D, evolução de heróis e Raids cooperativas multiplayer.

* **Domínio:** `liraquest.com.br`
* **Diretório Local:** `E:\11_Games\LiraQuest`
* **Repositório GitHub:** `https://github.com/xzsidney/liraquest.git` (Branch: `main`)

---

## 🏗️ 2. Arquitetura Técnica (Fullstack Unificado - 1 Repositório)
* **Frontend:** Vue 3, Tailwind CSS, Vite, Pixi.js v8 (Motor de Animações MUGEN).
* **Backend:** Express, Socket.IO (WebSockets em tempo real), Sequelize MySQL.
* **Banco de Dados:** Conectado diretamente ao MySQL da Hostinger (tabelas prefixadas com `family_*`).
* **Deploy na Hostinger:**
  * **Arquivo de Entrada:** `server.js` (inicia `server.ts` servindo a API, WebSockets e o `dist/` estático na porta 3000).
  * **Build Command:** `npm run build` (roda `npx tsx scripts/generateMugenRegistry.ts` + build do Vite).

---

## 📚 3. Documentação Já Criada (Pasta `doc/`)
O projeto possui 3 documentos completos em `E:\11_Games\LiraQuest\doc/`:
1. `doc/LIRAQUEST_CONCEITO_CENTRAL.md`: Regras de gameplay, classes, tarefas, loja, foco AFK e combate no Grid.
2. `doc/BANCO_DE_DADOS.md`: Mapeamento de todas as tabelas SQL em `snake_case` (`family_characters`, `family_tasks`, `family_rewards`, `family_battles`, `family_skills`, etc.).
3. `doc/BACKEND_ROTAS.md`: Mapeamento completo dos endpoints REST e eventos de WebSockets (Socket.IO).

---

## 🥊 4. O que já está implementado e funcionando:
* **Motor MUGEN 2D (Pixi.js v8):** Parser automático de arquivos `.air` para sprites (`capamerica`, `spiderman`, `colossus`, `kenshin`).
* **Ficha do Herói (`/familia/ficha`):** Seleção de classe, atributos e seletor de avatares com preview dos sprites MUGEN.
* **Sistema Global de Convites:** Banner dourado animado no topo de qualquer tela quando um membro da família convida outro para a Raid.
* **Arena 1v1 (`/familia/batalha`):** Duelo solo com painel expandido (Golpe Rápido, Golpe Forte, Ataque à Distância, Magias e Defesa).

---

## 🎯 5. PRÓXIMO PASSO IMEDIATO A REALIZAR:
Ajustar a **Raid Cooperativa Multiplayer (2 a 4 Jogadores)** em `src/views/family/FamilyRaidView.vue` e `server/sockets/familySocketService.ts`:
1. **Barra de Linha do Tempo / Fila de Iniciativa Visual:**
   Exibir no topo do combate: `[ 1º Sidney ] ➔ [ 2º Filho ] ➔ [ 3º Chefe Colossus ]`.
2. **Sincronização de Turnos por Aparelho:**
   * Cada jogador joga no seu próprio celular/PC.
   * Quando for a vez do Jogador A, os botões acendem na tela dele (`⚡ É SUA VEZ!`) e na tela do Jogador B aparece `⏳ Aguardando Jogador A...`.
   * Quando o Jogador A ataca, a animação do golpe e o dano no Boss acontecem nas duas telas ao mesmo tempo em tempo real!
   * O turno passa para o Jogador B, depois para o Boss, e o ciclo reinicia.  