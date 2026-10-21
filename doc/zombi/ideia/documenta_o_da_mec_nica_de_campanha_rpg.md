# Sistema de Campanha Investigativa RPG para Zombicide Marvel

Este documento detalha o funcionamento, as regras de jogo e a arquitetura técnica da mecânica híbrida **"Carmen Sandiego + Fort Hendrix"**, desenvolvida para transformar partidas de *Marvel Zombies / Zombicide* em uma campanha narrativa estilo RPG com investigação por tokens.

---

## 1. Visão Geral da Mecânica

No *Zombicide* tradicional, interagir com um objetivo geralmente se resume a gastar 1 Ação para recolher um marcador, ganhar 5 XP e descartá-lo do tabuleiro.

Neste sistema adaptado:
1. **Tokens Físicos Numerados (1 a 6):** São posicionados estrategicamente nas salas do mapa durante a montagem do cenário.
2. **Investigação Não-Linear:** Os jogadores podem se mover até qualquer token do tabuleiro, mas nem todos os locais podem ser resolvidos imediatamente.
3. **Pistas e Rastreamento (Estilo *Carmen Sandiego*):** Ao inspecionar uma sala, o jogador descobre relatórios, diários ou vestígios que apontam logicamente onde encontrar a próxima ferramenta ou chave.
4. **Pré-Requisitos e Bloqueios:** Certos eventos exigem que o grupo possua determinados itens (ex: Chave Magnética), tenha ativado mecanismos (ex: Disjuntor Geral) ou decodificado senhas antes de liberar o acesso.
5. **Decisão e Risco vs. Recompensa (*Push Your Luck*):** Ao interagir com um token, o jogador primeiro lê a descrição do perigo e **escolhe** se deseja arriscar a ação (ex: forçar um armário que pode conter armadilhas) ou recuar sem gastar recursos.
6. **Alternância Dinâmica de Modo (Heróis Vivos vs. Heróis Zumbis):** A mesma estrutura de tokens funciona para ambos os lados, mudando a motivação narrativa, as recompensas e o tipo de ameaça gerada (Super-Herói Zumbi como Boss ou Tropas de Elite Vivas/Sentinelas como reforços).

---

## 2. Fluxo da Rodada no Tabuleiro e no Aplicativo

```text
[Tabuleiro Físico]                [Aplicativo Web / Mobile]
       │                                     │
   1. Herói move-se até a                    │
      Zona com o Token X                     │
       │                                     │
   2. Gasta 1 Ação para ───────────────────> 3. Clica no Card do Token X
      Interagir com o Token                  │
                                             4. App exibe o briefing da área
                                                e as opções disponíveis:
                                                [Recuar] ou [Interagir/Arriscar]
                                             │
   5. Jogador confirma ação <──────────────── 
       │
   6. Se houver pré-requisito pendente:
      └──> App exibe: "Acesso Bloqueado" + Dica de onde procurar.
       │
   7. Se os requisitos estiverem cumpridos / Token livre:
      ├──> A) Evento de Pista: Atualiza inventário e entrega rota.
      ├──> B) Teste de Perícia: Rola 1d6 no app ou nos dados físicos.
      └──> C) Emboscada/Alarme: Spawna inimigos imediatos no tabuleiro.
```

---

## 3. Tipologia de Tokens

Para manter a exploração dinâmica, cada um dos 6 tokens cumpre um papel estrutural no cenário:

| Token | Tipo | Função de Jogo | Exemplo de Missão |
| :---: | :--- | :--- | :--- |
| **1** | *Ponto de Triagem (Livre)* | Entrega o contexto inicial e direciona a investigação. | Consoles da Entrada revelam que a chave foi levada para a Biblioteca. |
| **2** | *Investigação / Teste* | Exige um teste de perícia ou ação arriscada para extrair um item-chave. | Terminal da Biblioteca que dropa a Chave Alfa ou dispara sirene. |
| **3** | *Clímax / Gatekeeper* | Bloqueado por requisitos múltiplos. Aciona o evento principal e o Chefe. | Quarentena que exige Chave Alfa + Energia ligada; aciona Boss Fight. |
| **4** | *Armadilha de Ganância* | Opcional. Promete itens ou cura, mas pode causar dano em área e hordas. | Frigorífico com correntes: pode dar rações intactas ou esporos zumbis. |
| **5** | *Interruptor de Mapa* | Altera o estado do tabuleiro e cumpre requisitos de outras salas. | Oficina dos Geradores: religa a energia da casa e desativa perigos elétricos. |
| **6** | *Extração / Conclusão* | Zona de saída bloqueada até que o objetivo principal seja cumprido. | Portão da Garagem: requer o Transponder recolhido no Token 3. |

---

## 4. Estrutura de Dados dos Tokens (Modelo JSON)

Para integrar esse sistema em aplicações web ou mobile, os tokens podem ser modelados com a seguinte estrutura de dados:

```json
{
  "mission_id": "M01_VETOR_DA_CARNE",
  "tokens": [
    {
      "id": 1,
      "title": "Quadro de Comando do Hall",
      "status": "available",
      "requires": [],
      "narrative": {
        "hero_mode": "O terminal de segurança pisca com códigos estáticos e relatórios de evacuação caídos.",
        "zombie_mode": "Consoles chamuscados com restos de registros de fuga deixados pelos humanos."
      },
      "actions": [
        {
          "type": "investigate",
          "label": "Examinar registros do sistema",
          "cost_actions": 1,
          "outcome": {
            "grants_flag": "has_log",
            "xp": 2,
            "clue": "Aponta para o Token 2 (Biblioteca) e alerta sobre o Token 5 (Geradores)."
          }
        }
      ]
    },
    {
      "id": 3,
      "title": "Ala Médica / Quarentena",
      "status": "locked",
      "requires": ["has_key", "has_power"],
      "lock_message": "Requer Chave Alfa (Token 2) e Energia da Mansão (Token 5).",
      "narrative": {
        "hero_mode": "Câmara blindada onde o Transponder que está atraindo a entidade foi isolado.",
        "zombie_mode": "A câmara blindada guarda o Transponder sintonizado com o apetite cósmico!"
      },
      "actions": [
        {
          "type": "unlock_boss",
          "label": "Descarregar Transponder",
          "cost_actions": 1,
          "outcome": {
            "grants_flag": "has_transponder",
            "spawn_event": {
              "hero_mode": "Spawn do Wolverine Zumbi (Boss) na porta da sala.",
              "zombie_mode": "Spawn de Patrulha SHIELD / Sentinela no pátio."
            }
          }
        }
      ]
    }
  ]
}
```

---

## 5. Regras Especiais de Adaptação

### 5.1. Testes de Perícia Rápidos (Skill Checks)
Quando o evento exigir um teste de perícia sem inventar sistemas complexos de RPG:
* Gasta-se **1 Ação** na zona do token.
* Rola-se **1d6**:
  * **4 a 6:** Sucesso pleno (obtém o item sem efeitos negativos).
  * **2 a 3:** Sucesso com custo (obtém o item, mas compra 1 Carta de Spawn imediata ou sofre 1 de Dano).
  * **1:** Falha crítica (dispara alarme geral, gera emboscada imediata e não destrava o objetivo nesta ação).
* **Bônus de Herói:** Personagens tematicamente afins adicionam **+1 ao resultado do dado** (ex: Homem de Ferro em testes de tecnologia; Hulk em testes de força física bruta).

### 5.2. Modo Zumbi vs. Modo Herói
* **Modo Heróis Vivos:** 
  * O foco é contenção, resgate e sobrevivência.
  * O Boss é sempre um **Super-Herói Zumbi** com poderes devastadores e sede de sangue.
* **Modo Heróis Zumbis:**
  * O foco é dominação, saciar a fome e ativar o sinal do Banquete Cósmico.
  * Os adversários especiais são **Heróis Vivos da Resistência**, **Tropas Táticas da S.H.I.E.L.D.** ou **Sentinelas**, com ataques à distância e escudos de contenção.

---

## 6. Boas Práticas para Criação de Novas Missões

1. **Evite becos sem saída:** Sempre forneça ao menos uma pista alternativa caso os jogadores falhem em um teste ou prefiram evitar uma sala muito cheia de monstros.
2. **Distribuição geográfica no mapa:** Coloque o Token 1 perto da entrada (START), os tokens intermediários (chaves e geradores) em extremidades opostas do mapa, e a saída (Token 6) distante do clímax (Token 3), forçando o grupo a se movimentar pelo tabuleiro sob pressão das cartas de Spawn.
3. **Senso de urgência:** O aumento natural do nível de perigo do Zombicide (Azul ➔ Amarelo ➔ Laranja ➔ Vermelho) funciona como o relógio biológico da campanha; quanto mais turnos os heróis gastam investigando tokens secundários, mais brutais se tornam as hordas.