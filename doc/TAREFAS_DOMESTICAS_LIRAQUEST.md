# 📋 Catálogo de Tarefas & Missões — LiraQuest
## (Documento de Referência para Desenvolvimento — Seed da Tabela `definition_tasks`)

> **Para os desenvolvedores:** Este arquivo é o catálogo oficial de tarefas que deve ser inserido na tabela `definition_tasks` do banco de dados via script de seed. Cada linha desta tabela representa uma missão disponível no mural do app. Os pais podem criar tarefas personalizadas além destas, mas estas são as missões padrão que já existem quando a família entra pela primeira vez.

---

## 🗂️ Estrutura da Tabela `definition_tasks`

```sql
definition_tasks
├── id              UUID (PK, gerado automaticamente)
├── slug            VARCHAR(100) UNIQUE — identificador legível (ex: 'arrumar-cama')
├── name            VARCHAR(150) — Nome da missão exibido no app
├── description     TEXT         — O que fazer (instrução prática)
├── category        ENUM         — 'DOMESTIC', 'STUDY', 'HEALTH', 'CREATIVE', 'SOCIAL'
├── difficulty      ENUM         — 'EASY', 'MEDIUM', 'HARD'
├── allowed_profile ENUM         — 'ALL', 'CHILD_ONLY', 'ADULT_ONLY'
├── reward_xp       INTEGER      — XP concedido ao completar
├── reward_gold     INTEGER      — Ouro do Reino concedido
├── reward_energy   INTEGER      — Energia de Aventura concedida (combustível para masmorras)
├── estimated_time  VARCHAR(50)  — Tempo estimado de execução (ex: '5-10 min')
├── requires_proof  BOOLEAN      — Se exige foto/texto como prova (sempre true por padrão)
├── created_at      TIMESTAMP
└── updated_at      TIMESTAMP
```

**Regra de Energia de Aventura por Dificuldade:**
- 🟢 `EASY` → **+1 Energia**
- 🟡 `MEDIUM` → **+2 Energia**
- 🔴 `HARD` → **+4 Energia**

---

## 🏠 Categoria: DOMESTIC (Tarefas Domésticas)

### 🟢 Nível EASY — Ações rápidas do dia a dia (2 a 10 minutos)

| slug | Nome da Tarefa | O que fazer | Perfil | XP | Ouro | Energia | Tempo |
|:---|:---|:---|:---|:---|:---|:---|:---|
| `arrumar-cama` | Arrumar a Própria Cama | Esticar o lençol, ajeitar o cobertor e posicionar os travesseiros corretamente. | `ALL` | 10 | 5 | 1 | 5 min |
| `recolher-brinquedos` | Recolher os Brinquedos | Guardar brinquedos e jogos espalhados na caixa ou estante organizada. | `ALL` | 10 | 5 | 1 | 5-10 min |
| `roupa-suja-no-cesto` | Roupa Suja no Cesto | Colocar as roupas do dia no cesto apropriado, sem deixar nenhuma peça no chão. | `ALL` | 10 | 5 | 1 | 5 min |
| `colocar-tirar-prato` | Colocar/Tirar o Prato da Mesa | Levar prato, copos e talheres usados para a pia após a refeição. | `ALL` | 15 | 5 | 1 | 5 min |
| `alimentar-pet` | Abastecer Água e Ração do Pet | Lavar e encher os potinhos de comida e água do animal de estimação. | `ALL` | 15 | 10 | 1 | 5-10 min |
| `arrumar-mochila` | Arrumar a Mochila da Escola | Conferir os cadernos do dia seguinte, estojo e garrafinha de água. | `CHILD_ONLY` | 15 | 5 | 1 | 5-10 min |
| `regar-plantas` | Regar as Plantas da Casa | Colocar a quantidade certa de água nos vasos da sala ou varanda. | `ALL` | 15 | 5 | 1 | 5-10 min |

---

### 🟡 Nível MEDIUM — Rotina (15 a 30 minutos)

| slug | Nome da Tarefa | O que fazer | Perfil | XP | Ouro | Energia | Tempo |
|:---|:---|:---|:---|:---|:---|:---|:---|
| `varrer-comodo` | Varrer um Cômodo | Passar a vassoura no quarto ou na sala e recolher a sujeira com a pá. | `ALL` | 35 | 20 | 2 | 15-20 min |
| `tirar-lixo` | Tirar o Lixo da Casa | Amarrar os sacos de lixo (banheiro/cozinha) e colocar na lixeira principal. | `ALL` | 30 | 15 | 2 | 10-15 min |
| `lavar-louca-leve` | Lavar a Louça Leve | Lavar copos, pratos e talheres (sem facas afiadas) e organizar no escorredor. | `ALL` | 40 | 25 | 2 | 20-30 min |
| `guardar-roupas` | Guardar as Roupas Dobradas | Organizar as peças limpas nas gavetas e pendurar itens em cabides. | `ALL` | 35 | 20 | 2 | 15-20 min |
| `limpar-poeira` | Limpar a Poeira dos Móveis | Passar pano seco ou espanador nas mesas, estantes e bancadas de toda a casa. | `ALL` | 30 | 15 | 2 | 15-20 min |
| `guardar-compras` | Ajudar a Guardar as Compras | Retirar itens das sacolas e organizar mantimentos na despensa e geladeira. | `ALL` | 40 | 25 | 2 | 15-20 min |
| `passear-cachorro` | Passear com o Cachorro | Dar uma volta no quarteirão com o pet, recolhendo os dejetos adequadamente. | `ALL` | 45 | 30 | 2 | 20-30 min |

---

### 🔴 Nível HARD — Grandes missões semanais (30 a 60+ minutos)

| slug | Nome da Tarefa | O que fazer | Perfil | XP | Ouro | Energia | Tempo |
|:---|:---|:---|:---|:---|:---|:---|:---|
| `limpeza-quarto` | Limpeza Geral do Quarto | Varrer, passar pano no chão, organizar guarda-roupa, trocar roupa de cama e tirar o lixo. | `ALL` | 100 | 70 | 4 | 45-60 min |
| `lavar-louca-completa` | Lavar a Louça Completa | Lavar, secar e guardar todas as panelas, travessas e pratos da refeição familiar. | `ALL` | 90 | 60 | 4 | 30-45 min |
| `passar-pano-casa` | Passar Pano no Chão da Casa | Utilizar balde e rodo/mop em todas as áreas comuns (sala, cozinha e corredores). | `ALL` | 100 | 70 | 4 | 40-60 min |
| `limpar-banheiro` | Higienização do Banheiro | Limpar pia, espelho, recolher o lixo e higienizar o vaso sanitário. | `ALL` | 120 | 80 | 4 | 30-45 min |
| `preparar-refeicao` | Preparar uma Refeição Familiar | Cozinhar um prato completo para a família (ex: omelete, massa, salada, lanche). | `ADULT_ONLY` | 110 | 75 | 4 | 40-60 min |
| `lavar-quintal` | Lavar o Quintal ou Garagem | Varrer folhas secas, jogar água e esfregar o piso com vassoura pesada. | `ALL` | 120 | 85 | 4 | 45-60 min |
| `varal-completo` | Estender e Recolher Varal Completo | Tirar roupas da máquina, estender no varal e dobrar todas quando secarem. | `ALL` | 80 | 50 | 4 | 30-45 min |

---

## 📚 Categoria: STUDY (Estudos & Aprendizado)

### 🟢 Nível EASY

| slug | Nome da Tarefa | O que fazer | Perfil | XP | Ouro | Energia | Tempo |
|:---|:---|:---|:---|:---|:---|:---|:---|
| `ler-20min` | Ler por 20 Minutos | Ler qualquer livro, revista ou artigo educativo por pelo menos 20 minutos seguidos. | `ALL` | 30 | 15 | 1 | 20 min |
| `revisar-caderno` | Revisar o Caderno do Dia | Ler e organizar as anotações feitas em sala de aula no dia. | `CHILD_ONLY` | 20 | 10 | 1 | 15-20 min |

---

### 🟡 Nível MEDIUM

| slug | Nome da Tarefa | O que fazer | Perfil | XP | Ouro | Energia | Tempo |
|:---|:---|:---|:---|:---|:---|:---|:---|
| `estudar-materia` | Estudar uma Matéria | Focar em uma disciplina escolar por pelo menos 30 minutos usando o Foco do Herói. | `CHILD_ONLY` | 70 | 40 | 2 | 30 min |
| `fazer-licao` | Fazer a Lição de Casa | Concluir todas as tarefas escolares do dia antes do jantar. | `CHILD_ONLY` | 60 | 35 | 2 | 30-45 min |
| `aprender-algo-novo` | Aprender Algo Novo | Assistir a um vídeo educativo, tutorial ou curso por pelo menos 30 minutos. | `ALL` | 50 | 30 | 2 | 30 min |

---

### 🔴 Nível HARD

| slug | Nome da Tarefa | O que fazer | Perfil | XP | Ouro | Energia | Tempo |
|:---|:---|:---|:---|:---|:---|:---|:---|
| `estudar-prova` | Estudar para uma Prova | Sessão de estudo de pelo menos 45 minutos focada em uma prova ou avaliação. | `CHILD_ONLY` | 120 | 80 | 4 | 45-60 min |
| `projeto-escolar` | Concluir um Projeto Escolar | Finalizar uma etapa importante de um trabalho escolar ou apresentação. | `CHILD_ONLY` | 130 | 90 | 4 | 60+ min |

---

## 💪 Categoria: HEALTH (Saúde & Hábitos Pessoais)

### 🟢 Nível EASY

| slug | Nome da Tarefa | O que fazer | Perfil | XP | Ouro | Energia | Tempo |
|:---|:---|:---|:---|:---|:---|:---|:---|
| `escovar-dentes` | Escovar os Dentes (3x ao dia) | Escovar os dentes após o café, almoço e jantar. | `ALL` | 10 | 5 | 1 | 5 min |
| `beber-agua` | Beber Água ao Longo do Dia | Consumir pelo menos 1,5 litro de água durante o dia. | `ALL` | 15 | 8 | 1 | Dia inteiro |
| `dormir-no-horario` | Dormir no Horário Combinado | Estar na cama com as luzes apagadas no horário combinado pela família. | `CHILD_ONLY` | 20 | 10 | 1 | — |

---

### 🟡 Nível MEDIUM

| slug | Nome da Tarefa | O que fazer | Perfil | XP | Ouro | Energia | Tempo |
|:---|:---|:---|:---|:---|:---|:---|:---|
| `praticar-esporte` | Praticar um Esporte ou Atividade Física | 30 minutos de qualquer atividade física: jogar bola, andar de bike, dançar, academia. | `ALL` | 60 | 35 | 2 | 30 min |
| `caminhar` | Dar uma Caminhada | Caminhar pelo bairro por pelo menos 20 minutos. | `ALL` | 40 | 25 | 2 | 20-30 min |
| `comer-verdura` | Comer Verdura ou Fruta na Refeição | Incluir legume, verdura ou fruta em pelo menos uma refeição do dia. | `ALL` | 30 | 20 | 2 | — |

---

## 🎨 Categoria: CREATIVE (Criatividade & Projetos)

### 🟡 Nível MEDIUM

| slug | Nome da Tarefa | O que fazer | Perfil | XP | Ouro | Energia | Tempo |
|:---|:---|:---|:---|:---|:---|:---|:---|
| `desenhar` | Desenhar ou Colorir | Criar um desenho ou colorir uma ilustração por pelo menos 20 minutos. | `ALL` | 40 | 25 | 2 | 20-30 min |
| `montar-projeto-manual` | Fazer um Projeto Manual | Montar, construir ou criar algo com materiais artísticos (Lego, argila, recorte, colagem). | `ALL` | 50 | 30 | 2 | 30 min |

---

### 🔴 Nível HARD

| slug | Nome da Tarefa | O que fazer | Perfil | XP | Ouro | Energia | Tempo |
|:---|:---|:---|:---|:---|:---|:---|:---|
| `artesanato-peca` | Concluir uma Peça de Artesanato | Finalizar uma peça artesanal completa (crochê, pintura, bijuteria, etc.). | `ADULT_ONLY` | 130 | 90 | 4 | 60+ min |
| `projeto-criativo-completo` | Concluir um Projeto Criativo | Finalizar um projeto de arte, design, música ou escrita do início ao fim. | `ALL` | 120 | 80 | 4 | 60+ min |

---

## 🤝 Categoria: SOCIAL (Convivência & Família)

### 🟢 Nível EASY

| slug | Nome da Tarefa | O que fazer | Perfil | XP | Ouro | Energia | Tempo |
|:---|:---|:---|:---|:---|:---|:---|:---|
| `ajudar-familiar` | Ajudar um Familiar Sem Ser Pedido | Identificar uma necessidade de alguém da família e ajudar espontaneamente. | `ALL` | 25 | 15 | 1 | Variável |
| `pedir-desculpa` | Pedir Desculpa Quando Errar | Reconhecer um erro e pedir desculpa sincera à pessoa afetada. | `ALL` | 20 | 10 | 1 | — |

---

### 🟡 Nível MEDIUM

| slug | Nome da Tarefa | O que fazer | Perfil | XP | Ouro | Energia | Tempo |
|:---|:---|:---|:---|:---|:---|:---|:---|
| `momento-familia` | Participar de um Momento em Família | Jogar um jogo de tabuleiro, assistir a um filme ou fazer uma atividade juntos. | `ALL` | 50 | 30 | 2 | 30-60 min |
| `ligar-parente` | Ligar ou Mandar Mensagem para um Parente | Entrar em contato com avós, tios ou primos de forma carinhosa. | `ALL` | 35 | 20 | 2 | 15 min |

---

## 📊 Resumo Geral do Catálogo

| Categoria | Fácil | Médio | Difícil | Total |
|:---|:---|:---|:---|:---|
| 🏠 Doméstica | 7 | 7 | 7 | **21** |
| 📚 Estudo | 2 | 3 | 2 | **7** |
| 💪 Saúde | 3 | 3 | 0 | **6** |
| 🎨 Criatividade | 0 | 2 | 2 | **4** |
| 🤝 Social | 2 | 2 | 0 | **4** |
| **TOTAL** | **14** | **17** | **11** | **42 tarefas** |

---

## ⚙️ Notas Técnicas para o Desenvolvedor

1. **Seed:** Todas as 42 tarefas devem ser inseridas na tabela `definition_tasks` via script `scripts/seedTasks.js` com `INSERT IGNORE` para não duplicar em re-execuções.
2. **`allowed_profile`:**
   - `ALL` → exibida para todos os membros da família
   - `CHILD_ONLY` → exibida apenas para usuários com `role = 'CHILD'`
   - `ADULT_ONLY` → exibida apenas para usuários com `role = 'PARENT'`
3. **`requires_proof`:** Todas as tarefas são `true` por padrão. O pai decide se aceita sem foto ou se exige evidência ao criar/editar uma tarefa no painel.
4. **Tarefas Customizadas:** Além deste catálogo, os pais podem criar tarefas próprias com campos livres. Essas tarefas vão para a tabela `tasks` (instância da família), não em `definition_tasks` (catálogo global).
5. **Energia de Aventura:** Campo `reward_energy` é o valor que alimenta o "Terminal do Avatar". Sem cumprir tarefas, o herói não tem Energia para entrar nas masmorras.
