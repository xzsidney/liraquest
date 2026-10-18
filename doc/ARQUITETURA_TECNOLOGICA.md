# 🏛️ LiraQuest — Arquitetura Tecnológica Oficial (Estilo Dungeon Encounters)

---

## 🎯 1. Visão Geral da Decisão de Arquitetura

O ecossistema **LiraQuest** adota a filosofia de design técnico inspirada em **Dungeon Encounters (Square Enix)**, combinando alta performance, zero atrito de instalação para a família, interface limpa e responsiva, e total integração com a infraestrutura de produção existente na **Hostinger**.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                       CLIENTE (FRONTEND WEB / PWA)                         │
│  📱 Celulares (iOS / Android) • 💻 Tablets / iPads • 🖥️ Navegadores Web      │
├──────────────────────────────────────┬──────────────────────────────────────┤
│  INTERFACE & MENUS (Vue 3 / Tailwind)│  TABULEIRO DE EXPLORAÇÃO (Canvas 2D) │
│  • Inventário, Habilidades e Fichas  │  • Grid ortogonal de coordenadas X/Y │
│  • Batalhas em Turno (ATB / HP duplo)│  • Névoa de Guerra (Tile coloring)   │
│  • Validação de Hábitos Familiares   │  • Marcadores Hexadecimais & Câmera  │
└──────────────────────────────────────┴──────────────────────────────────────┘
                                       ▲
                   HTTP REST / JSON    │    WebSockets (Socket.IO)
                                       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                    BACKEND (HOSTINGER / NODE.JS SERVICE)                    │
│  • Node.js + Express (Servidor unificado de API e estáticos)                │
│  • Socket.IO (Eventos em tempo real, sincronização do grupo e presenças)    │
│  • Sequelize ORM (Mapeamento de modelos com UUIDs)                          │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       ▲
                                       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                       BANCO DE DADOS (MYSQL HOSTINGER)                      │
│  • Tabelas prefixadas com `family_*`                                        │
│  • Chaves Primárias e Estrangeiras em UUID (DataTypes.UUIDV4)               │
│  • Catálogos e Definições com slugs amigáveis (`code`)                      │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 💻 2. Stack Tecnológica Selecionada

### 2.1 Frontend (Cliente Web Responsivo)
* **Framework Reativo:** **Vue 3** (Composition API, Vite).
* **Estilização & Design System:** **Tailwind CSS** com a paleta oficial do jogo (Bordô `#800020`, Azul Real `#1e3a8a`, Dourado Imperial `#d4af37`).
* **Motor do Tabuleiro (Grid do Mapa):** **HTML5 Canvas Nativo** (ou PixiJS leve).
  * Renderiza o grid de 99 andares com linhas finas e limpas.
  * Gerencia a movimentação suave da peça (tweening de coordenadas X e Y).
  * Controla a névoa de guerra (revelação e persistência dos passos dados).
  * Exibe os marcadores de células: **Números Pretos** (combates) e **Números Brancos** (altares, curandeiros, enigmas, lojas).
* **Distribuição:** Progressive Web App (PWA). Pode ser salvo como atalho na tela inicial do celular com 1 clique, sem passar por lojas da Apple ou Google.

### 2.2 Backend & Realtime
* **Ambiente de Execução:** **Node.js** (LTS).
* **Framework HTTP:** **Express.js**.
* **Comunicação em Tempo Real:** **Socket.IO** (para convites imediatos, atualizações de status de membros da guilda e ações cooperativas).
* **ORM:** **Sequelize** estruturado em TypeScript/ESModules.

### 2.3 Banco de Dados & Armazenamento
* **SGBD:** **MySQL** hospedado diretamente na **Hostinger**.
* **Padrão de Identificadores:** Chaves primárias e estrangeiras obrigatórias em **UUIDv4**.
* **Convenção de Nomenclatura:** Tabelas em `snake_case` com prefixo `family_` (ex: `family_characters`, `family_maps`, `family_tasks`, `family_battle_logs`).

---

## ⚖️ 3. Justificativa da Escolha (Por que esta stack?)

1. **Zero Fricção de Entrada para a Família:**
   * Motores como Godot Web geram arquivos WebAssembly de 30MB a 60MB e sofrem com incompatibilidade em navegadores iOS (Safari).
   * A solução Web Híbrida (Vue 3 + Canvas) carrega em menos de 2MB, abrindo instantaneamente em qualquer conexão.
2. **Separação Perfeita entre UI e Tabuleiro:**
   * *Dungeon Encounters* é 70% composto por menus táticos (inventários, status de heróis, coordenadas, log de batalha) e 30% pelo grid do mapa.
   * Criar menus ricos em HTML/Tailwind é infinitamente mais produtivo, legível e responsivo do que criar interfaces dentro de uma engine de jogos 3D.
3. **Reaproveitamento Total da Infraestrutura:**
   * Utiliza 100% da hospedagem Hostinger e do banco de dados MySQL já configurados, sem custos adicionais ou novas máquinas virtuais.
4. **Deploy Contínuo e Manutenção Simplificada:**
   * O build estático do frontend é gerado diretamente para a pasta pública servida pelo Node.js, mantendo o repositório unificado e com deploy ágil via Git.
