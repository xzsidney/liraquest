import {
  sequelize,
  FamilyZombiCampaign,
  FamilyZombiMission,
  FamilyZombiToken,
} from '../server/models/index.js';

async function seedZombiCampaign() {
  try {
    console.log('🔌 Conectando ao banco de dados MySQL...');
    await sequelize.authenticate();
    console.log('✅ Conexão estabelecida!');

    // Criar apenas as 3 novas tabelas se não existirem (operação 100% aditiva e segura)
    console.log('🛠️ Sincronizando tabelas family_zombi_* (modo aditivo)...');
    await FamilyZombiCampaign.sync();
    await FamilyZombiMission.sync();
    await FamilyZombiToken.sync();
    console.log('✅ Tabelas family_zombi_campaigns, family_zombi_missions e family_zombi_tokens prontas!');

    // 1. Criar ou atualizar a Campanha Principal
    const campaignData = {
      code: 'o_sinal_do_fim_do_mundo',
      title: 'Campanha: O Sinal do Fim do Mundo',
      subtitle: 'Sistema Investigativo Carmen Sandiego + Fort Hendrix (5 Capítulos)',
      premise_hero:
        'O vírus não é um acidente terreno; é um feromônio cósmico desenhado para converter populações em biomassa e chamar devoradores cósmicos. Os Heróis Zumbis mais inteligentes mantiveram memórias técnicas e estão erguendo um Farol Quântico Suborbital para atrair a Entidade Devoradora. Não há cura: a única saída dos Heróis Vivos é cegar a Terra, desligar a rede de energia, destruir as lentes de foco atmosférico e implodir o transmissor central antes da chegada da entidade.',
      premise_zombie:
        'A Fome não é uma maldição — é um chamado estelar! Nossas mentes retiveram o conhecimento técnico necessário para erguer o Farol Quântico Suborbital e atrair a Entidade Cósmica até a Terra. Quando o Devorador de Mundos pousar, teremos biomassa divina e carne cósmica infinita para nos banquetearmos pela eternidade! Precisamos defender e ativar cada etapa do projeto contra a S.H.I.E.L.D. e os últimos heróis vivos.',
      current_mission_number: 1,
      active_mode: 'HERO',
      campaign_state: {
        missions: {},
        legacy_items: [],
      },
      is_active: true,
    };

    let campaign = await FamilyZombiCampaign.findOne({
      where: { code: campaignData.code },
    });

    if (!campaign) {
      campaign = await FamilyZombiCampaign.create(campaignData);
      console.log('✨ Campanha criada:', campaign.title);
    } else {
      await campaign.update({
        title: campaignData.title,
        subtitle: campaignData.subtitle,
        premise_hero: campaignData.premise_hero,
        premise_zombie: campaignData.premise_zombie,
      });
      console.log('🔄 Campanha atualizada:', campaign.title);
    }

    // 2. Definição das 5 Missões e seus 6 Tokens
    const missionsData = [
      // =========================================================================
      // CAPÍTULO 1: O PRIMEIRO ECO (Mapa MZ1)
      // =========================================================================
      {
        mission_number: 1,
        code: 'M01_O_PRIMEIRO_ECO',
        title: 'CAPÍTULO 1: O PRIMEIRO ECO',
        location_name: 'Perímetro Urbano e Antena de Retransmissão Local',
        rulebook_map_code: 'MZ1 (Pág. 24)',
        tiles_needed: '3R, 5R, 8R, 9V',
        map_image_url: '/zombi/img/map_mz1.png',
        setup_notes:
          'Monte os tiles 3R, 5R, 8R e 9V conforme a Missão MZ1 (pág. 24). Posicione os Tokens numerados de 1 a 6 nas zonas correspondentes aos objetivos e salas do mapa.',
        lore_hero:
          '"O céu de Manhattan emite um zumbido grave de baixa frequência e um brilho violeta anômalo. Captamos uma transmissão nas frequências da S.H.I.E.L.D., mas não é socorro: é uma sequência binária de telemetria apontada para o espaço profundo! Uma torre de micro-ondas modificada está sendo defendida no quarteirão. Precisamos acessar o servidor térreo, cortar o transformador da rua e arrancar o Cristal Frequencial do líder inimigo!"',
        lore_zombie:
          '"O primeiro harmônico do nosso Farol já ecoa na ionosfera! Mas os agentes da S.H.I.E.L.D. ativaram travas de bloqueio no servidor térreo e tentam cortar a força da nossa antena de micro-ondas. Precisamos destravar a telemetria, sobrecarregar o transformador a nosso favor e garantir o Cristal Frequencial antes que a resistência feche o cerco!"',
        inventory_badges: [
          { key: 'has_log', label: '📑 Telemetria do Servidor' },
          { key: 'has_key', label: '🔑 Código de Modulação (739)' },
          { key: 'has_power', label: '⚡ Transformador Controlado' },
          { key: 'has_transponder', label: '💎 Cristal Frequencial & 3 Coordenadas' },
        ],
        tokens: [
          {
            token_number: 1,
            token_role: 'Ponto de Triagem (Livre)',
            title: 'Servidor do Térreo Comercial',
            tile_location: 'Tile 8R • Recepção do Prédio',
            crop_image_url: '',
            initial_status: 'AVAILABLE',
            requires_flags: [],
            lock_banner_text: '',
            unlock_action_label: 'Investigar Token 1',
            room_desc_hero:
              'Racks de servidores piscando em luz violeta. Cabos coaxiais grossos sobem pelo poço do elevador até o terraço.',
            room_desc_zombie:
              'Terminais da S.H.I.E.L.D. bloqueando o envio da nossa telemetria espacial. O cheiro de humanos assustados ainda paira no ar.',
            modal_lore_hero:
              'Os monitores exibem pacotes de dados suborbitais. Alguém com intelecto brilhante reprogramou a rede local da S.H.I.E.L.D. para servir de guia estelar.',
            modal_lore_zombie:
              'Os humanos deixaram protocolos de bloqueio ativos. Mas os registros mostram exatamente onde eles esconderam o estabilizador e como o transformador da rua opera.',
            actions_json: [
              {
                type: 'direct',
                title_hero: 'Gastar 1 Ação para decodificar quem alimenta o sinal',
                title_zombie: 'Gastar 1 Ação para rastrear os protocolos de bloqueio',
                subtitle: 'Extrai pistas vitais estilo Carmen Sandiego sobre o quarteirão.',
                grants_flags: ['has_log'],
                outcome_title_hero: '📡 Pista Obtida: Rota do Sinal Identificada!',
                outcome_title_zombie: '🧠 Pista Obtida: Sabotagem Humana Mapeada!',
                outcome_desc_hero:
                  'O log revela duas travas: o <strong>Código de Acesso ao Terraço</strong> foi guardado no <em>Escritório de Criptografia (Token 2)</em>, enquanto a antena é alimentada pelo <em>Transformador de Rua (Token 5)</em>. Cuidado: há um furgão blindado instável no beco sul (Token 4)!',
                outcome_desc_zombie:
                  'Os arquivos apontam que a chave de sintonia está trancada no <em>Escritório dos Fundos (Token 2)</em> e que precisamos dominar o <em>Transformador da Rua (Token 5)</em> para estabilizar a Torre de Micro-ondas (Token 3)!',
              },
            ],
          },
          {
            token_number: 2,
            token_role: 'Investigação & Teste',
            title: 'Escritório de Criptografia',
            tile_location: 'Tile 8R • Sala dos Fundos',
            crop_image_url: '',
            initial_status: 'AVAILABLE',
            requires_flags: [],
            lock_banner_text: '',
            unlock_action_label: 'Inspecionar Token 2',
            room_desc_hero:
              'Mesas reviradas e um terminal militar protegido por firewall biométrico e sensores acústicos.',
            room_desc_zombie:
              'Um terminal tático zumbindo com as credenciais de acesso à plataforma da antena.',
            modal_lore_hero:
              'Na tela rachada, o protocolo de contenção exige extração manual do código de segurança sem disparar o alarme do quarteirão.',
            modal_lore_zombie:
              'O console guarda a sequência numérica que libera o acesso blindado à base da antena no metrô/terraço.',
            actions_json: [
              {
                type: 'dice',
                title_hero: 'Hackear o Servidor para extrair o Código (Teste 1d6)',
                title_zombie: 'Arrancar o Módulo de Memória com a Senha (Teste 1d6)',
                subtitle: '4-6: Sucesso limpo | 2-3: Sucesso com Spawn | 1: Alarme Crítico (+1 para Herói Tecnológico)',
                grants_flags: ['has_key'],
                dice_outcomes: {
                  high: {
                    title: '🔓 Sucesso Pleno! Código [ 7 - 3 - 9 ] Obtido!',
                    desc_hero:
                      'Você burlou o sistema em silêncio absoluto! Descobriu a senha da comporta da antena: <strong>739</strong>. Ganhe +5 XP!',
                    desc_zombie:
                      'Sua mente faminta decifrou o padrão instantaneamente! Senha obtida: <strong>739</strong>. Ganhe +5 XP!',
                  },
                  mid: {
                    title: '⚠️ Código [ 7 - 3 - 9 ] Extraído com Curto-Circuito!',
                    desc_hero:
                      'Você conseguiu a senha <strong>739</strong>, mas o painel explodiu em faíscas: compre 1 Carta de Spawn imediata no ponto mais próximo!',
                    desc_zombie:
                      'Você arrancou o código <strong>739</strong>, mas a sirene local tocou: coloque 2 Troopers da S.H.I.E.L.D. na zona de Spawn mais próxima!',
                  },
                  low: {
                    title: '🚨 FALHA CRÍTICA: Alarme de Contenção!',
                    desc_hero:
                      'Choque elétrico! O herói sofre 1 de Dano e 1 Carta de Spawn é comprada, mas o código <strong>739</strong> pisca na tela queimada antes de apagar.',
                    desc_zombie:
                      'Descarga de choque da S.H.I.E.L.D.! Sofra 1 Ferimento e compre 1 Carta de Spawn, mas você memoriza o código <strong>739</strong>!',
                  },
                },
              },
              {
                type: 'direct',
                title_hero: 'Vasculhar Gavetas de Suprimentos (Ação Secundária)',
                title_zombie: 'Farejar Esconderijo sob a Mesa (Ação Secundária)',
                subtitle: 'Busca rápida por recursos extras na sala.',
                grants_flags: [],
                outcome_title_hero: '🧰 Kit Tático Encontrado!',
                outcome_title_zombie: '🩸 Rastro de Adrenalina!',
                outcome_desc_hero:
                  'Você encontra munição incendiária improvisada: compre 1 Carta de Traço (Trait) grátis para o seu herói!',
                outcome_desc_zombie:
                  'O cheiro de medo revigora seus sentidos: compre 1 Carta de Traço Zumbi (Zombie Trait) grátis!',
              },
            ],
          },
          {
            token_number: 3,
            token_role: 'Clímax / Gatekeeper',
            title: 'Estação da Antena & Cristal Frequencial',
            tile_location: 'Tile 3R • Acesso Blindado',
            crop_image_url: '/zombi/img/metro_crop.png',
            initial_status: 'LOCKED',
            requires_flags: ['has_key', 'has_power'],
            lock_banner_text:
              '🔒 Requisitos: Código de Modulação 739 (Token 2) + Transformador da Rua (Token 5).',
            unlock_action_label: 'Digitar Senha (739) & Invadir Antena',
            room_desc_hero:
              'A escadaria blindada leva ao núcleo da antena de micro-ondas modificada com cabos alienígenas.',
            room_desc_zombie:
              'O coração do emissor local. Precisamos destrancar a comporta com o código 739 e derrotar o comandante inimigo!',
            modal_lore_hero:
              'A porta de contenção aceita o código 739! Lá dentro, um Herói Zumbi de Elite está conectado aos cabos de alta tensão sintonizando o Cristal Frequencial no próprio peito!',
            modal_lore_zombie:
              'A comporta se abre após digitar 739! Um Super-Herói Vivo da resistência lidera um esquadrão tentando destruir nosso Cristal Frequencial!',
            actions_json: [
              {
                type: 'keypad',
                keypad_code: '739',
                title_hero: 'Digitar Código [739] no Painel e Confrontar o Sintonizador',
                title_zombie: 'Digitar Código [739] e Defender o Cristal Frequencial',
                subtitle: 'Abre a câmara principal, libera o Cristal e aciona o confronto de Chefe!',
                grants_flags: ['has_transponder'],
                outcome_title_hero: '⚡ BOSS ACIONADO: O Sintonizador da Antena!',
                outcome_title_zombie: '🛡️ CONTRA-ATAQUE: Comandante da Resistência!',
                outcome_desc_hero:
                  'Você arranca o <strong>Cristal Frequencial</strong> e obtém o registro das outras <strong>3 Coordenadas do Sinal</strong>! Mas o impacto desperta a fúria do guardião: <strong>Coloque 1 Super-Herói Zumbi (Boss)</strong> nesta zona! Agora corram para a Saída (Token 6)!',
                outcome_desc_zombie:
                  'O <strong>Cristal Frequencial</strong> está sintonizado e as <strong>3 Coordenadas</strong> foram gravadas! Mas um <strong>Super-Herói Vivo + 2 Guards</strong> invadem a entrada para tentar impedi-los! Levem o cristal até a Saída (Token 6)!',
              },
            ],
          },
          {
            token_number: 4,
            token_role: 'Armadilha de Ganância',
            title: 'Furgão Blindado Tombado',
            tile_location: 'Tile 9V • Beco dos Destroços',
            crop_image_url: '',
            initial_status: 'AVAILABLE',
            requires_flags: [],
            lock_banner_text: '',
            unlock_action_label: 'Avaliar Risco (Token 4)',
            room_desc_hero:
              'Um transporte médico da S.H.I.E.L.D. lacrado com correntes e aviso de risco biológico.',
            room_desc_zombie:
              'Um furgão blindado cheirando a plasma fresco, mas cercado de minas de concussão.',
            modal_lore_hero:
              'As portas traseiras estão presas por uma trava pressurizada. Pode haver estimulantes médicos intactos ou uma armadilha deixada na evacuação.',
            modal_lore_zombie:
              'Há bolsas de sangue e amostras lá dentro, mas sensores laser da S.H.I.E.L.D. piscam sob o chassi.',
            actions_json: [
              {
                type: 'dice',
                title_hero: 'Arrombar Trava Pressurizada (Push Your Luck - 1d6)',
                title_zombie: 'Rasgar a Lataria Blindada (Push Your Luck - 1d6)',
                subtitle: '4-6: Cura + 5 XP | 2-3: +1 Carta de Traço mas sofre 1 Dano | 1: Explosão!',
                grants_flags: [],
                dice_outcomes: {
                  high: {
                    title: '💉 Sorte Grande! Suprimentos Intactos!',
                    desc_hero:
                      'Você encontra kits de nanorreparo Stark! O herói recupera até 2 de Vida e ganha +5 XP!',
                    desc_zombie:
                      'Bolsas de biomassa pura! O herói reduz sua Fome para 0 (ou recupera 1 de Vida) e ganha +5 XP!',
                  },
                  mid: {
                    title: '💥 Estilhaços na Abertura!',
                    desc_hero:
                      'Você pega 1 Carta de Traço e +3 XP, mas o vapor pressurizado causa 1 Ferimento ao herói.',
                    desc_zombie:
                      'Você pega 1 Carta de Traço Zumbi e +3 XP, mas a mina de choque causa 1 Ferimento.',
                  },
                  low: {
                    title: '☣️ ARMADILHA SONORA E QUÍMICA!',
                    desc_hero:
                      'Gás corrosivo! Todos na zona sofrem 1 Ferimento e 1 Carta de Spawn é comprada imediatamente!',
                    desc_zombie:
                      'Granada de luz e som! Sofra 1 Ferimento e coloque 3 Troopers na rua adjacente!',
                  },
                },
              },
            ],
          },
          {
            token_number: 5,
            token_role: 'Interruptor de Mapa',
            title: 'Transformador de Alta Tensão',
            tile_location: 'Tile 5R • Esquina Leste',
            crop_image_url: '',
            initial_status: 'AVAILABLE',
            requires_flags: [],
            lock_banner_text: '',
            unlock_action_label: 'Operar Transformador (Token 5)',
            room_desc_hero:
              'Uma caixa de força industrial que alimenta os escudos da torre de micro-ondas.',
            room_desc_zombie:
              'O gerador de rua que canaliza megawatts para o nosso emissor suborbital.',
            modal_lore_hero:
              'Arcos voltaicos azuis saltam das bobinas. Cortar a alimentação aqui desativará a blindagem magnética da antena principal.',
            modal_lore_zombie:
              'Redirecionar a carga máxima da rua destravará as comportas magnéticas da estação da antena.',
            actions_json: [
              {
                type: 'direct',
                title_hero: 'Destruir o Transformador para apagar o Escudo da Antena',
                title_zombie: 'Sobrecarregar o Transformador para Energizar a Antena',
                subtitle: 'Cumpre o requisito de energia do Token 3 e altera o estado do mapa.',
                grants_flags: ['has_power'],
                outcome_title_hero: '⚡ Transformador Cortado! Blindagem Desativada!',
                outcome_title_zombie: '⚡ Força Máxima Redirecionada!',
                outcome_desc_hero:
                  'Um clarão ilumina a rua quando as bobinas explodem! O escudo magnético da <strong>Estação da Antena (Token 3)</strong> caiu. Se já tiver o código do Token 2, avance para o Token 3!',
                outcome_desc_zombie:
                  'Os cabos rugem com energia púrpura! A trava elétrica da <strong>Estação da Antena (Token 3)</strong> está energizada e pronta para o código!',
              },
            ],
          },
          {
            token_number: 6,
            token_role: 'Extração / Conclusão',
            title: 'Perímetro de Extração & Coordenadas',
            tile_location: 'Zona EXIT • Fim do Quarteirão',
            crop_image_url: '',
            initial_status: 'LOCKED',
            requires_flags: ['has_transponder'],
            lock_banner_text:
              '🔒 Requisito Final: Coletar o Cristal Frequencial & Coordenadas no Token 3.',
            unlock_action_label: 'Escapar com as 3 Coordenadas!',
            room_desc_hero:
              'O corredor de evacuação leva para fora do bairro em colapso. Só podemos sair com o Cristal Frequencial e as coordenadas.',
            room_desc_zombie:
              'A rota para o Complexo Industrial (Capítulo 2). Precisamos levar o Cristal sintonizado conosco!',
            modal_lore_hero:
              'Com o modulador quântico arrancado e a antena local apagada, o registro aponta para um Complexo Industrial onde uma "Bateria de Sangue" está sendo carregada!',
            modal_lore_zombie:
              'O Primeiro Eco foi disparado! Mas para furar a atmosfera terrestre, precisamos marchar até a Subestação Industrial e ativar a Bateria de Sangue!',
            actions_json: [
              {
                type: 'direct',
                title_hero: 'Concluir Capítulo 1 e Avançar para A Bateria de Sangue!',
                title_zombie: 'Concluir Capítulo 1 e Marchar para A Bateria de Sangue!',
                subtitle: 'Requer que não haja inimigos na Zona de Saída no tabuleiro.',
                grants_flags: ['mission_complete'],
                outcome_title_hero: '🏆 VITÓRIA NO CAPÍTULO 1: O PRIMEIRO ECO!',
                outcome_title_zombie: '🏆 VITÓRIA NO CAPÍTULO 1: SINAL ECOANDO!',
                outcome_desc_hero:
                  'Vocês apagaram a antena local e decodificaram as coordenadas seguintes! Preparem-se para o <strong>Capítulo 2: A Bateria de Sangue</strong>!',
                outcome_desc_zombie:
                  'A telemetria inicial foi enviada ao espaço! Agora vamos alimentar o reator no <strong>Capítulo 2: A Bateria de Sangue</strong>!',
              },
            ],
          },
        ],
      },

      // =========================================================================
      // CAPÍTULO 2: A BATERIA DE SANGUE (Mapa MZ2)
      // =========================================================================
      {
        mission_number: 2,
        code: 'M02_A_BATERIA_DE_SANGUE',
        title: 'CAPÍTULO 2: A BATERIA DE SANGUE',
        location_name: 'Complexo Industrial / Subestação de Energia',
        rulebook_map_code: 'MZ2 (Pág. 25)',
        tiles_needed: '1R, 2V, 4V, 5V, 6V, 7R',
        map_image_url: '',
        setup_notes:
          'Monte os 6 tiles (4V, 2V, 7R, 1R, 6V, 5V) conforme a Missão MZ2 (pág. 25). Posicione os 6 Tokens de investigação nas salas dos bunkers e geradores.',
        lore_hero:
          '"Os dados revelam que o transmissor precisa de uma carga brutal para perfurar a atmosfera. Os infectados invadiram uma usina de reatores e a converteram em uma câmara biomecânica: estão usando contêineres de biomassa para catalisar um reator de matéria escura! Precisamos infiltrar sem disparar as sirenes, purgar os 3 conduítes orgânicos e sobrecarregar o núcleo antes que o tempo acabe!"',
        lore_zombie:
          '"Nossa usina biomecânica está quase pronta! Os contêineres de biomassa pulsarão energia suficiente para rasgar a ionosfera. Mas esquadrões de contenção invadiram as galerias para fechar nossas válvulas orgânicas. Precisamos pressurizar os conduítes e proteger o Núcleo de Matéria Escura!"',
        inventory_badges: [
          { key: 'has_log', label: '📑 Mapa de Pressão dos Bunkers' },
          { key: 'has_key', label: '🧪 Conduítes Alfa & Beta Purgados' },
          { key: 'has_power', label: '🔧 Terceiro Conduíte & Válvula Mestre' },
          { key: 'has_transponder', label: '☢️ Sequência de Colapso do Reator Ativa' },
        ],
        tokens: [
          {
            token_number: 1,
            token_role: 'Ponto de Triagem (Livre)',
            title: 'Guarita de Controle Acústico',
            tile_location: 'Tile 4V • Entrada Norte',
            crop_image_url: '',
            initial_status: 'AVAILABLE',
            requires_flags: [],
            lock_banner_text: '',
            unlock_action_label: 'Investigar Guarita (Token 1)',
            room_desc_hero:
              'Sensores de movimento e monitores de pressão que vigiam as galerias industriais.',
            room_desc_zombie:
              'Painel de vigilância onde monitoramos a pressão sanguínea das tubulações do reator.',
            modal_lore_hero:
              'O mapa térmico mostra três linhas de alimentação orgânica bombeando energia para a câmara sul.',
            modal_lore_zombie:
              'Os sensores mostram onde as travas de segurança humanas estão impedindo o fluxo máximo de biomassa.',
            actions_json: [
              {
                type: 'direct',
                title_hero: 'Mapeamento Silencioso das Tubulações',
                title_zombie: 'Rastrear Válvulas de Pressão Orgânica',
                subtitle: 'Revela onde estão os conduítes e o código de purga térmica.',
                grants_flags: ['has_log'],
                outcome_title_hero: '🤫 Infiltração Furtiva Mapeada!',
                outcome_title_zombie: '🩸 Fluxo da Bateria Localizado!',
                outcome_desc_hero:
                  'Pista obtida: Os <strong>Conduítes Alfa e Beta (Token 2)</strong> e a <strong>Válvula Mestre (Token 5)</strong> precisam ser cortados antes de acessar o <strong>Núcleo do Reator (Token 3)</strong>. Código de purga anotado no painel: <strong>404</strong>.',
                outcome_desc_zombie:
                  'Pista obtida: Ative os <strong>Conduítes Alfa e Beta (Token 2)</strong> e a <strong>Válvula Mestre (Token 5)</strong> usando o código <strong>404</strong> para liberar a carga total no <strong>Reator (Token 3)</strong>!',
              },
            ],
          },
          {
            token_number: 2,
            token_role: 'Investigação & Teste',
            title: 'Galeria dos Conduítes Alfa & Beta',
            tile_location: 'Tile 7R • Corredor Oeste',
            crop_image_url: '',
            initial_status: 'AVAILABLE',
            requires_flags: [],
            lock_banner_text: '',
            unlock_action_label: 'Cortar Conduítes (Token 2)',
            room_desc_hero:
              'Tubos translúcidos pulsando com energia carmesim e cabos de alta voltagem.',
            room_desc_zombie:
              'As artérias principais que alimentam os capacitores da usina.',
            modal_lore_hero:
              'Romper os dois primeiros conduítes exige precisão para que o fluido cáustico não dispare as sirenes de emergência.',
            modal_lore_zombie:
              'Precisamos destravar o bombeamento máximo sem romper as juntas de contenção.',
            actions_json: [
              {
                type: 'dice',
                title_hero: 'Purgar Conduítes Alfa e Beta (Teste 1d6)',
                title_zombie: 'Pressurizar Conduítes Alfa e Beta (Teste 1d6)',
                subtitle: '4-6: Purga Silenciosa | 2-3: Sirene Parcial | 1: Vazamento Tóxicos',
                grants_flags: ['has_key'],
                dice_outcomes: {
                  high: {
                    title: '🧪 Conduítes 1 e 2 Desativados em Silêncio!',
                    desc_hero:
                      'Corte cirúrgico! Nenhum alarme disparou e o herói ganha +5 XP.',
                    desc_zombie:
                      'Pressão estabilizada no máximo! O herói ganha +5 XP.',
                  },
                  mid: {
                    title: '🚨 Conduítes Cortados, mas a Sirene Tocou!',
                    desc_hero:
                      'O alarme ecoa no setor: compre 1 Carta de Spawn imediata! (+5 XP)',
                    desc_zombie:
                      'As sirenes da S.H.I.E.L.D. disparam: compre 1 Carta de Spawn imediata! (+5 XP)',
                  },
                  low: {
                    title: '☣️ Explosão de Fluido Catalisador!',
                    desc_hero:
                      'O tubo estoura! O herói sofre 1 Ferimento e compra 1 Carta de Spawn, mas o conduíte é destruído.',
                    desc_zombie:
                      'Recuo de pressão! Sofra 1 Ferimento e compre 1 Carta de Spawn, mas o fluxo é liberado.',
                  },
                },
              },
            ],
          },
          {
            token_number: 3,
            token_role: 'Clímax / Gatekeeper',
            title: 'Câmara do Reator de Matéria Escura',
            tile_location: 'Tile 6V • Bunker Blindado Sul',
            crop_image_url: '',
            initial_status: 'LOCKED',
            requires_flags: ['has_key', 'has_power'],
            lock_banner_text:
              '🔒 Requisitos: Purgar Conduítes Alfa/Beta (Token 2) + Cortar 3º Conduíte (Token 5).',
            unlock_action_label: 'Digitar [404] & Sobrecarregar Reator',
            room_desc_hero:
              'No centro da câmara blindada, uma esfera de matéria escura gira alimentada pela biomassa.',
            room_desc_zombie:
              'O coração da Bateria de Sangue! Pronto para enviar o pulso energético para as lentes do Observatório.',
            modal_lore_hero:
              'Com as três linhas orgânicas cortadas, o painel central aceita o código de colapso [404]. Assim que ativado, o complexo inteiro começará a desmoronar!',
            modal_lore_zombie:
              'Com os três conduítes em carga máxima, digite [404] para disparar o feixe de energia para o Observatório antes que a usina exploda!',
            actions_json: [
              {
                type: 'keypad',
                keypad_code: '404',
                title_hero: 'Digitar Código [404] para Iniciar Colapso do Núcleo!',
                title_zombie: 'Digitar Código [404] para Disparar a Carga e Evacuar!',
                subtitle: 'Inicia a contagem regressiva de destruição da usina!',
                grants_flags: ['has_transponder'],
                outcome_title_hero: '☢️ COLAPSO INICIADO! CORRAM PARA A SAÍDA!',
                outcome_title_zombie: '⚡ CARGA ENVIADA! REATOR EM SOBRECARGA!',
                outcome_desc_hero:
                  'O núcleo entra em fusão crítica! <strong>Regra de Pressão:</strong> Ao final de cada rodada até escapar pelo Token 6, coloque 2 Inimigos extras no ponto de Spawn mais próximo! Corram!',
                outcome_desc_zombie:
                  'O feixe de energia subiu para o Observatório! Mas o reator vai explodir: corram para a Saída (Token 6) enquanto tropas de elite tentam bloquear o caminho!',
              },
            ],
          },
          {
            token_number: 4,
            token_role: 'Armadilha de Ganância',
            title: 'Tanque de Estase Experimental',
            tile_location: 'Tile 2V • Laboratório Leste',
            crop_image_url: '',
            initial_status: 'AVAILABLE',
            requires_flags: [],
            lock_banner_text: '',
            unlock_action_label: 'Examinar Tanque (Token 4)',
            room_desc_hero:
              'Cilindros de vidro contendo soros regenerativos e sombras que se mexem no líquido.',
            room_desc_zombie:
              'Cápsulas contendo cobaias e mutagênicos concentrados de alto valor nutritivo.',
            modal_lore_hero:
              'Você pode drenar o tanque para obter o Soro de Regeneração, mas a cobaia presa lá dentro pode despertar.',
            modal_lore_zombie:
              'Quebrar o vidro garante um banquete imediato, mas pode liberar gás criogênico.',
            actions_json: [
              {
                type: 'dice',
                title_hero: 'Drenar Cápsula de Estase (Risco 1d6)',
                title_zombie: 'Devorar Cobaia da Cápsula (Risco 1d6)',
                subtitle: '4-6: Cura Total + Traço | 1-3: Criatura liberta e 1 Ferimento!',
                grants_flags: [],
                dice_outcomes: {
                  high: {
                    title: '🧬 Soro Puro Extraído!',
                    desc_hero:
                      'O herói recupera toda a Vida perdida e compra 1 Carta de Traço grátis!',
                    desc_zombie:
                      'Banquete genético! Zere sua Fome, recupere 1 de Vida e ganhe +5 XP!',
                  },
                  mid: {
                    title: '❄️ Vazamento Criogênico!',
                    desc_hero:
                      'O vidro trinca: sofra 1 Ferimento, mas ganhe +5 XP.',
                    desc_zombie:
                      'Vapor congelante: sofra 1 Ferimento, mas zere sua Fome!',
                  },
                  low: {
                    title: '👹 A COBAIA DESPERTOU!',
                    desc_hero:
                      'O cilindro explode! Sofra 1 Ferimento e compre 1 Carta de Spawn imediata!',
                    desc_zombie:
                      'Um Guarda de Elite em armadura pesada sai da câmara! Coloque 2 Guards na sua zona!',
                  },
                },
              },
            ],
          },
          {
            token_number: 5,
            token_role: 'Interruptor de Mapa',
            title: 'Terceiro Conduíte & Válvula Mestre',
            tile_location: 'Tile 5V • Sala das Turbinas',
            crop_image_url: '',
            initial_status: 'AVAILABLE',
            requires_flags: [],
            lock_banner_text: '',
            unlock_action_label: 'Manobrar Válvula (Token 5)',
            room_desc_hero:
              'A última linha de alimentação orgânica que sustenta o escudo térmico do reator.',
            room_desc_zombie:
              'A turbina secundária que completa a pressão necessária para o disparo.',
            modal_lore_hero:
              'Uma roda de ferro pesada controla a válvula mestre. Girá-la cortará a última artéria da Bateria de Sangue.',
            modal_lore_zombie:
              'Travar a válvula no limite máximo liberará o acesso ao painel central do reator.',
            actions_json: [
              {
                type: 'direct',
                title_hero: 'Fechar Válvula Mestre e Cortar 3º Conduíte',
                title_zombie: 'Abrir Válvula Mestre em Capacidade Total',
                subtitle: 'Libera o requisito de força para acessar o Reator (Token 3).',
                grants_flags: ['has_power'],
                outcome_title_hero: '🔧 Terceira Linha Orgânica Cortada!',
                outcome_title_zombie: '🔧 Pressão Máxima Atingida!',
                outcome_desc_hero:
                  'As turbinas desaceleram e as trancas da <strong>Câmara do Reator (Token 3)</strong> se abrem! Use o código <strong>404</strong> no Token 3!',
                outcome_desc_zombie:
                  'A câmara principal (Token 3) está pronta! Digite <strong>404</strong> no Token 3 para concluir a carga!',
              },
            ],
          },
          {
            token_number: 6,
            token_role: 'Extração / Conclusão',
            title: 'Elevador de Fuga da Subestação',
            tile_location: 'Zona EXIT • Saída Norte',
            crop_image_url: '',
            initial_status: 'LOCKED',
            requires_flags: ['has_transponder'],
            lock_banner_text:
              '🔒 Requisito Final: Iniciar a Sobrecarga do Reator no Token 3.',
            unlock_action_label: 'Fugir antes da Explosão!',
            room_desc_hero:
              'A saída de emergência da usina, tremendo com as explosões subterrâneas.',
            room_desc_zombie:
              'Passagem para a superfície em direção ao Observatório Astronômico.',
            modal_lore_hero:
              'O complexo inteiro colapsa em chamas violetas atrás de vocês! Atrasamos a carga principal, mas os zumbis já instalaram espelhos de colimação no Antigo Observatório!',
            modal_lore_zombie:
              'A usina cumpriu seu papel antes de explodir! Agora precisamos alinhar os espelhos quânticos no Observatório (Capítulo 3)!',
            actions_json: [
              {
                type: 'direct',
                title_hero: 'Escapar da Usina e Ir para o Capítulo 3!',
                title_zombie: 'Sair da Usina e Avançar para o Capítulo 3!',
                subtitle: 'Todos os heróis na Zona de Saída sem inimigos.',
                grants_flags: ['mission_complete'],
                outcome_title_hero: '🏆 VITÓRIA NO CAPÍTULO 2: REATOR DESTRUÍDO!',
                outcome_title_zombie: '🏆 VITÓRIA NO CAPÍTULO 2: BATERIA CARREGADA!',
                outcome_desc_hero:
                  'Vocês destruíram a Bateria de Sangue! Próximo destino: <strong>Capítulo 3: Os Olhos dos Vigilantes</strong>!',
                outcome_desc_zombie:
                  'A energia foi transmitida! Próximo destino: <strong>Capítulo 3: Os Olhos dos Vigilantes</strong>!',
              },
            ],
          },
        ],
      },

      // =========================================================================
      // CAPÍTULO 3: OS OLHOS DOS VIGILANTES (Mapa MZ3)
      // =========================================================================
      {
        mission_number: 3,
        code: 'M03_OS_OLHOS_DOS_VIGILANTES',
        title: 'CAPÍTULO 3: OS OLHOS DOS VIGILANTES',
        location_name: 'Antigo Observatório / Laboratório de Óptica Espacial',
        rulebook_map_code: 'MZ3 (Pág. 26)',
        tiles_needed: '1V, 3R, 5R, 6R, 7V, 8R',
        map_image_url: '',
        setup_notes:
          'Monte os 6 tiles (7V, 1V, 5R, 6R, 3R, 8R) conforme a Missão MZ3 (pág. 26). O edifício superior representa a Cúpula do Observatório.',
        lore_hero:
          '"Mesmo sem a energia total da usina, os infectados instalaram três grandes espelhos de colimação — lentes quânticas de alta precisão — no topo do laboratório astronômico para focar o pulso luminoso em direção à órbita da Lua. Se essas lentes alinharem, o farol se tornará visível para além da Via Láctea! Precisamos recuperar os diários de calibração, quebrar os mecanismos dos espelhos e derrotar o Guardião das passarelas!"',
        lore_zombie:
          '"No topo do Observatório repousam os Três Olhos Quânticos! Quando alinharmos os espelhos de colimação com a órbita lunar, nosso chamado atravessará a galáxia. Os heróis vivos e o Mago Supremo tentam selar a cúpula para cegar nossas lentes. Vamos tomar os códigos de calibração e alinhar os espelhos!"',
        inventory_badges: [
          { key: 'has_log', label: '🔭 Diários de Calibração Óptica' },
          { key: 'has_key', label: '🪞 Espelhos 1 e 2 Sabotados (912)' },
          { key: 'has_power', label: '⚙️ Giroscópio do 3º Espelho Destravado' },
          { key: 'has_transponder', label: '💥 Lentes Quânticas Destruídas / Guardião Vencido' },
        ],
        tokens: [
          {
            token_number: 1,
            token_role: 'Ponto de Triagem (Livre)',
            title: 'Recepção do Observatório',
            tile_location: 'Tile 3R/8R • Pátio Sul',
            crop_image_url: '',
            initial_status: 'AVAILABLE',
            requires_flags: [],
            lock_banner_text: '',
            unlock_action_label: 'Vasculhar Recepção (Token 1)',
            room_desc_hero:
              'Mapas celestes rasgados e lunetas quebradas apontadas para a anomalia violeta no céu.',
            room_desc_zombie:
              'Cálculos astronômicos rabiscados nas paredes indicando o ângulo orbital da Lua.',
            modal_lore_hero:
              'Os registros do astrônomo-chefe mostram como as três lentes da cúpula estão interligadas.',
            modal_lore_zombie:
              'As anotações mostram a sequência exata para travar o foco das lentes em direção ao espaço profundo.',
            actions_json: [
              {
                type: 'direct',
                title_hero: 'Ler Diários de Calibração Óptica',
                title_zombie: 'Absorver Cálculos de Alinhamento Sidéreo',
                subtitle: 'Entrega as pistas sobre os mecanismos dos espelhos e o código da cúpula.',
                grants_flags: ['has_log'],
                outcome_title_hero: '🔭 Pista Obtida: Segredo da Cúpula!',
                outcome_title_zombie: '🌌 Pista Obtida: Coordenadas Lunares!',
                outcome_desc_hero:
                  'O diário revela: <em>"Os controles dos Espelhos 1 e 2 ficam na Biblioteca (Token 2) e o Giroscópio Equatorial no Anexo Leste (Token 5). O código da Cúpula Central (Token 3) é <strong>912</strong>."</em>',
                outcome_desc_zombie:
                  'Anotação obtida: <em>"Ative os Espelhos 1 e 2 na Biblioteca (Token 2) e o Giroscópio no Anexo (Token 5). Depois use o código <strong>912</strong> na Cúpula (Token 3)!"</em>',
              },
            ],
          },
          {
            token_number: 2,
            token_role: 'Investigação & Teste',
            title: 'Biblioteca & Controle Óptico',
            tile_location: 'Tile 5R • Ala Oeste',
            crop_image_url: '',
            initial_status: 'AVAILABLE',
            requires_flags: [],
            lock_banner_text: '',
            unlock_action_label: 'Sabotar Espelhos 1 e 2 (Token 2)',
            room_desc_hero:
              'Alavancas hidráulicas que sustentam os dois primeiros espelhos de colimação.',
            room_desc_zombie:
              'Os servomotores que posicionam as duas primeiras lentes quânticas.',
            modal_lore_hero:
              'Desalinhar manualmente os dois espelhos exige força e precisão enquanto a estrutura vibra com energia cósmica.',
            modal_lore_zombie:
              'Travar os dois espelhos na posição lunar exige sincronia perfeita dos motores.',
            actions_json: [
              {
                type: 'dice',
                title_hero: 'Quebrar Engrenagens dos Espelhos 1 e 2 (Teste 1d6)',
                title_zombie: 'Alinhar Lentes Quânticas 1 e 2 (Teste 1d6)',
                subtitle: '4-6: Sucesso Pleno | 2-3: Sucesso com Barulho | 1: Estilhaços de Cristal',
                grants_flags: ['has_key'],
                dice_outcomes: {
                  high: {
                    title: '🪞 Espelhos 1 e 2 Desalinhados com Sucesso!',
                    desc_hero:
                      'O feixe violeta perde metade do foco! O herói ganha +5 XP e confirma a senha da cúpula: <strong>912</strong>.',
                    desc_zombie:
                      'Duas lentes brilham em sintonia perfeita com a Lua! Ganhe +5 XP e senha confirmada: <strong>912</strong>.',
                  },
                  mid: {
                    title: '🔔 Estrondo Metálico na Cúpula!',
                    desc_hero:
                      'Os espelhos quebram com um estrondo: compre 1 Carta de Spawn imediata! (+5 XP, Senha: <strong>912</strong>)',
                    desc_zombie:
                      'O barulho das engrenagens atrai patrulhas: compre 1 Carta de Spawn! (+5 XP, Senha: <strong>912</strong>)',
                  },
                  low: {
                    title: '⚡ Reflexo de Feixe Quântico!',
                    desc_hero:
                      'Um raio de luz queima a sala! Sofra 1 Ferimento e compre 1 Carta de Spawn, mas os espelhos cedem (Senha: <strong>912</strong>).',
                    desc_zombie:
                      'Descarga óptica! Sofra 1 Ferimento e compre 1 Carta de Spawn, mas as lentes travam no lugar (Senha: <strong>912</strong>).',
                  },
                },
              },
            ],
          },
          {
            token_number: 3,
            token_role: 'Clímax / Gatekeeper',
            title: 'Cúpula Principal & Passarela do Guardião',
            tile_location: 'Tile 7V • Santuário Norte',
            crop_image_url: '',
            initial_status: 'LOCKED',
            requires_flags: ['has_key', 'has_power'],
            lock_banner_text:
              '🔒 Requisitos: Espelhos 1 e 2 (Token 2) + Giroscópio do 3º Espelho (Token 5).',
            unlock_action_label: 'Digitar [912] & Encarar o Guardião',
            room_desc_hero:
              'A grande abóbada aberta para o céu estrelado, onde o Guardião patrulha a lente mestra.',
            room_desc_zombie:
              'O domo astronômico onde o Doutor Estranho / Guardião Vivo tenta selar nosso feixe espacial.',
            modal_lore_hero:
              'Ao digitar 912, as portas da cúpula se abrem! Um Herói Zumbi extremamente ágil salta das passarelas superiores para proteger o último espelho!',
            modal_lore_zombie:
              'A abóbada se abre com o código 912! O Guardião Supremo lança feitiços de contenção para tentar quebrar nossa lente principal!',
            actions_json: [
              {
                type: 'keypad',
                keypad_code: '912',
                title_hero: 'Digitar [912], Destruir a Lente Mestra e Enfrentar o Guardião!',
                title_zombie: 'Digitar [912], Selar o Foco Lunar e Devorar o Guardião!',
                subtitle: 'Desbloqueia o confronto da Cúpula e libera a rota de extração!',
                grants_flags: ['has_transponder'],
                outcome_title_hero: '💥 LENTES DESTRUÍDAS! O GUARDIÃO ATACA!',
                outcome_title_zombie: '🌕 FOCO LUNAR ATINGIDO! DERROTEM O GUARDIÃO!',
                outcome_desc_hero:
                  'Você estilhaça o último espelho de colimação! O raio para a Lua se apaga, mas os dados indicam que os zumbis tomaram um <strong>Silo de Mísseis da Hydra</strong>! <strong>Coloque 1 Super-Herói Inimigo</strong> na Cúpula e abram caminho até a Saída (Token 6)!',
                outcome_desc_zombie:
                  'O pulso luminoso atingiu a Lua! Mas os humanos tentam lançar uma ogiva a partir de um <strong>Silo da Hydra</strong>. Derrotem o Guardião na Cúpula e avancem para a Saída (Token 6)!',
              },
            ],
          },
          {
            token_number: 4,
            token_role: 'Armadilha de Ganância',
            title: 'Cofre de Relíquias do Santuário',
            tile_location: 'Tile 1V • Câmara Lateral',
            crop_image_url: '',
            initial_status: 'AVAILABLE',
            requires_flags: [],
            lock_banner_text: '',
            unlock_action_label: 'Abrir Relrelicário (Token 4)',
            room_desc_hero:
              'Um mostruário místico rachado contendo artefatos de proteção arcana.',
            room_desc_zombie:
              'Relíquias pulsando com energia dimensional que podem amplificar nossos poderes.',
            modal_lore_hero:
              'Quebrar o selo protetor pode conceder uma bênção arcana ou desencadear uma maldição defensiva.',
            modal_lore_zombie:
              'Absorver a energia da relíquia pode fortalecer a horda ou queimar sua carne morta.',
            actions_json: [
              {
                type: 'dice',
                title_hero: 'Quebrar Selo do Relicário (Risco 1d6)',
                title_zombie: 'Absorver Artefato Arcano (Risco 1d6)',
                subtitle: '4-6: +2 Cartas de Traço e +5 XP | 1-3: Descarga Mística!',
                grants_flags: [],
                dice_outcomes: {
                  high: {
                    title: '✨ Bênção do Observador!',
                    desc_hero:
                      'Energia pura! Compre 2 Cartas de Traço e ganhe +5 XP!',
                    desc_zombie:
                      'Poder cósmico! Compre 2 Cartas de Traço Zumbi, zere a Fome e ganhe +5 XP!',
                  },
                  mid: {
                    title: '🌀 Instabilidade Dimensional!',
                    desc_hero:
                      'Você ganha 1 Carta de Traço, mas sofre 1 Ferimento.',
                    desc_zombie:
                      'Você ganha 1 Carta de Traço Zumbi, mas aumenta a Fome em +1.',
                  },
                  low: {
                    title: '⚡ Maldição de Contenção!',
                    desc_hero:
                      'Armadilha arcana! Sofra 1 Ferimento e compre 1 Carta de Spawn!',
                    desc_zombie:
                      'Chamas místicas! Sofra 1 Ferimento e compre 1 Carta de Spawn!',
                  },
                },
              },
            ],
          },
          {
            token_number: 5,
            token_role: 'Interruptor de Mapa',
            title: 'Giroscópio Equatorial (3º Espelho)',
            tile_location: 'Tile 6R • Anexo Leste',
            crop_image_url: '',
            initial_status: 'AVAILABLE',
            requires_flags: [],
            lock_banner_text: '',
            unlock_action_label: 'Travar Giroscópio (Token 5)',
            room_desc_hero:
              'O contrapeso gigante que mantém a terceira lente apontada para o zênite.',
            room_desc_zombie:
              'O eixo rotacional que estabiliza a lente mestra da cúpula.',
            modal_lore_hero:
              'Soltar os pinos de travamento fará o terceiro espelho tombar sobre o próprio eixo.',
            modal_lore_zombie:
              'Engatar a trava mestra fixará a abóbada na direção exata da Lua.',
            actions_json: [
              {
                type: 'direct',
                title_hero: 'Soltar Pinos de Contrapeso do Giroscópio',
                title_zombie: 'Travar Eixo Equatorial na Posição Lunar',
                subtitle: 'Cumpre o requisito mecânico para abrir a Cúpula (Token 3).',
                grants_flags: ['has_power'],
                outcome_title_hero: '⚙️ Giroscópio Desarmado!',
                outcome_title_zombie: '⚙️ Giroscópio Travado com Precisão!',
                outcome_desc_hero:
                  'A terceira lente perde a estabilidade e as comportas da <strong>Cúpula Principal (Token 3)</strong> destravam! Use o código <strong>912</strong> lá!',
                outcome_desc_zombie:
                  'O domo gira e se alinha! Agora vá até a <strong>Cúpula Principal (Token 3)</strong> e digite <strong>912</strong>!',
              },
            ],
          },
          {
            token_number: 6,
            token_role: 'Extração / Conclusão',
            title: 'Passarela de Evacuação do Domo',
            tile_location: 'Zona EXIT • Extremo Norte',
            crop_image_url: '',
            initial_status: 'LOCKED',
            requires_flags: ['has_transponder'],
            lock_banner_text:
              '🔒 Requisito Final: Resolver o confronto da Cúpula Principal (Token 3).',
            unlock_action_label: 'Deixar o Observatório!',
            room_desc_hero:
              'A escadaria externa que desce da colina do observatório rumo à base subterrânea.',
            room_desc_zombie:
              'O caminho rumo ao Silo Blindado da Hydra para o lançamento suborbital.',
            modal_lore_hero:
              'Os espelhos foram destruídos! Frustrados na superfície, os zumbis tomaram um Silo de Mísseis da Hydra para lançar uma ogiva sinalizadora direto na estratosfera!',
            modal_lore_zombie:
              'Com o alinhamento calculado, vamos tomar o Silo Blindado da Hydra e lançar a ogiva de sinalização diretamente para o espaço!',
            actions_json: [
              {
                type: 'direct',
                title_hero: 'Concluir Capítulo 3 e Rumar ao Silo Blindado!',
                title_zombie: 'Concluir Capítulo 3 e Invadir o Silo da Hydra!',
                subtitle: 'Todos os heróis na Zona de Saída sem inimigos.',
                grants_flags: ['mission_complete'],
                outcome_title_hero: '🏆 VITÓRIA NO CAPÍTULO 3: CEGANDO OS VIGILANTES!',
                outcome_title_zombie: '🏆 VITÓRIA NO CAPÍTULO 3: OLHOS ABERTOS NO COSMOS!',
                outcome_desc_hero:
                  'As lentes caíram! Preparem-se para infiltrar a base militar no <strong>Capítulo 4: O Silo Blindado</strong>!',
                outcome_desc_zombie:
                  'As estrelas nos ouvem! Avancem para o <strong>Capítulo 4: O Silo Blindado</strong>!',
              },
            ],
          },
        ],
      },

      // =========================================================================
      // CAPÍTULO 4: O SILO BLINDADO (Mapa MZ4)
      // =========================================================================
      {
        mission_number: 4,
        code: 'M04_O_SILO_BLINDADO',
        title: 'CAPÍTULO 4: O SILO BLINDADO',
        location_name: 'Instalação Militar Fortificada / Base Subterrânea da Hydra',
        rulebook_map_code: 'MZ4 (Pág. 28)',
        tiles_needed: '1R, 2V, 3R, 4R, 5R, 6V, 7R, 8V, 9V',
        map_image_url: '',
        setup_notes:
          'Monte o mapa grande 3x3 (9 tiles: 3R, 9V, 6V / 7R, 4R, 5R / 2V, 8V, 1R) conforme a Missão MZ4 (pág. 28). Posicione os 6 Tokens nos objetivos indicados.',
        lore_hero:
          '"Para lançar a ogiva de sinalizador suborbital que ativará o farol nos céus, os zumbis tomaram um silo de lançamento blindado da Hydra. A base está lacrada com portas de titânio e sistemas de defesa automatizados que atiram em qualquer ser com batimentos cardíacos! Precisamos caçar os cartões Alfa e Beta dos oficiais, desligar as torretas automáticas e retirar a ogiva primária do poço do míssil!"',
        lore_zombie:
          '"Este silo subterrâneo da Hydra guarda o foguete que levará nosso sinalizador para fora da atmosfera! As torretas automáticas da base ainda estão ativas e os sobreviventes tentam trancar o poço de lançamento. Vamos arrancar os cartões Alfa e Beta dos comandantes, assumir o controle das defesas e preparar a ogiva!"',
        inventory_badges: [
          { key: 'has_log', label: '📑 Planta Subterrânea da Hydra' },
          { key: 'has_key', label: '💳 Cartões Alfa & Beta (Código 880)' },
          { key: 'has_power', label: '🔫 Torretas Automáticas Desativadas' },
          { key: 'has_transponder', label: '🚀 Ogiva Suborbital Sabotada' },
        ],
        tokens: [
          {
            token_number: 1,
            token_role: 'Ponto de Triagem (Livre)',
            title: 'Bunker de Inteligência da Hydra',
            tile_location: 'Tile 1R • Ala Sudeste',
            crop_image_url: '',
            initial_status: 'AVAILABLE',
            requires_flags: [],
            lock_banner_text: '',
            unlock_action_label: 'Acessar Bunker (Token 1)',
            room_desc_hero:
              'Mapas táticos com o símbolo do crânio vermelho e tentáculos cobrindo as paredes de concreto.',
            room_desc_zombie:
              'Centro de comando onde os oficiais da Hydra monitoravam o poço do míssil.',
            modal_lore_hero:
              'O sistema de segurança da Hydra exige dupla autenticação (Cartões Alfa e Beta) e o desligamento do protocolo de torretas.',
            modal_lore_zombie:
              'Os terminais mostram onde os dois comandantes fugiram com os cartões de disparo.',
            actions_json: [
              {
                type: 'direct',
                title_hero: 'Baixar Planta do Silo e Localização dos Oficiais',
                title_zombie: 'Farejar Rastro dos Oficiais da Hydra',
                subtitle: 'Localiza os portadores dos Cartões Alfa/Beta e a Sala de Controle das Torretas.',
                grants_flags: ['has_log'],
                outcome_title_hero: '🗺️ Pista Obtida: Protocolo Duplo da Hydra!',
                outcome_title_zombie: '🩸 Pista Obtida: Presas Localizadas!',
                outcome_desc_hero:
                  'Os registros indicam: Os oficiais com os <strong>Cartões Alfa e Beta</strong> estão encurralados nos <em>Alojamentos Centrais (Token 2)</em>. As <strong>Torretas Automáticas</strong> são desligadas na <em>Sala de Controle Leste (Token 5)</em>. O código de abertura do Poço do Míssil (Token 3) é <strong>880</strong>!',
                outcome_desc_zombie:
                  'Os oficiais com os <strong>Cartões Alfa e Beta</strong> estão nos <em>Alojamentos (Token 2)</em>. Domine a <em>Sala de Controle das Torretas (Token 5)</em> e use o código <strong>880</strong> no <em>Poço do Míssil (Token 3)</em>!',
              },
            ],
          },
          {
            token_number: 2,
            token_role: 'Investigação & Teste',
            title: 'Corredor dos Oficiais (Cartões Alfa & Beta)',
            tile_location: 'Tile 7R/4R • Bunkers Centrais',
            crop_image_url: '',
            initial_status: 'AVAILABLE',
            requires_flags: [],
            lock_banner_text: '',
            unlock_action_label: 'Caçar Cartões (Token 2)',
            room_desc_hero:
              'Corredor blindado onde dois oficiais zumbificados da Hydra vagam com os cartões pendurados no pescoço.',
            room_desc_zombie:
              'Barricada interna onde os oficiais da Hydra guardam as chaves magnéticas Alfa e Beta.',
            modal_lore_hero:
              'Para recuperar ambos os cartões sem ser encurralado nos corredores estreitos, é preciso um ataque rápido e coordenado.',
            modal_lore_zombie:
              'Avance sobre os oficiais para arrancar os cartões magnéticos Alfa e Beta e o código de lançamento.',
            actions_json: [
              {
                type: 'dice',
                title_hero: 'Abater Oficiais eTomar Cartões Alfa & Beta (Teste 1d6)',
                title_zombie: 'Devorar Comandantes e Pegar Cartões Alfa & Beta (Teste 1d6)',
                subtitle: '4-6: Captura Limpa | 2-3: Reforços de Guardas | 1: Contra-ataque!',
                grants_flags: ['has_key'],
                dice_outcomes: {
                  high: {
                    title: '💳 Cartões Alfa e Beta Recuperados! (Código 880)',
                    desc_hero:
                      'Golpe preciso! Você recolhe os dois cartões com o código <strong>880</strong> e ganha +5 XP!',
                    desc_zombie:
                      'Refeição dupla! Zere a Fome, ganhe +5 XP e pegue os cartões com o código <strong>880</strong>!',
                  },
                  mid: {
                    title: '💳 Cartões Obtidos sob Fogo Cruzado! (Código 880)',
                    desc_hero:
                      'Você pega os cartões (<strong>880</strong>), mas o combate atrai 2 Guards para a zona adjacente!',
                    desc_zombie:
                      'Você pega os cartões (<strong>880</strong>), mas 2 Specialists da S.H.I.E.L.D. surgem no corredor!',
                  },
                  low: {
                    title: '💥 Granada de Concussão do Oficial!',
                    desc_hero:
                      'O oficial detona uma granada ao cair! Sofra 1 Ferimento e compre 1 Carta de Spawn, mas os cartões (<strong>880</strong>) são seus!',
                    desc_zombie:
                      'Armadilha explosiva! Sofra 1 Ferimento e compre 1 Carta de Spawn, mas os cartões (<strong>880</strong>) foram coletados!',
                  },
                },
              },
            ],
          },
          {
            token_number: 3,
            token_role: 'Clímax / Gatekeeper',
            title: 'Poço do Míssil & Ogiva Suborbital',
            tile_location: 'Tile 3R • Silo Noroeste',
            crop_image_url: '',
            initial_status: 'LOCKED',
            requires_flags: ['has_key', 'has_power'],
            lock_banner_text:
              '🔒 Requisitos: Cartões Alfa/Beta (Token 2) + Desativar Torretas (Token 5).',
            unlock_action_label: 'Digitar [880] & Acessar Ogiva',
            room_desc_hero:
              'A imensa comporta circular do silo de lançamento onde o foguete suborbital aponta para o céu.',
            room_desc_zombie:
              'A plataforma de ignição onde a ogiva do sinalizador aguarda a sequência final.',
            modal_lore_hero:
              'Com os Cartões Alfa e Beta inseridos e as torretas desligadas, digite [880] para abrir a escotilha da ogiva e arrancar o núcleo do transmissor!',
            modal_lore_zombie:
              'Digite [880] para abrir a câmara do míssil! Os heróis vivos sabotaram os propulsores líquidos, então teremos que levar o núcleo da ogiva até o topo do Arranha-Céu (Capítulo 5)!',
            actions_json: [
              {
                type: 'keypad',
                keypad_code: '880',
                title_hero: 'Digitar [880] e Retirar a Ogiva Primária do Míssil!',
                title_zombie: 'Digitar [880] e Resgatar o Núcleo da Ogiva para a Superfície!',
                subtitle: 'Sabota o lançamento do silo e prepara o confronto final nas nuvens!',
                grants_flags: ['has_transponder'],
                outcome_title_hero: '🚀 OGIVA RETIRADA! ALERTA MÁXIMO NO SILO!',
                outcome_title_zombie: '🚀 NÚCLEO RESGATADO! RUMO AO TOPO DO ARRANHA-CÉU!',
                outcome_desc_hero:
                  'Você desarma o míssil! Mas o General Zumbi escapa com as peças reservas para o topo do Arranha-Céu mais alto da cidade! <strong>Compre 1 Carta de Spawn em cada ponto ativo</strong> e fujam pela Rampa Norte (Token 6)!',
                outcome_desc_zombie:
                  'Os propulsores do míssil foram sabotados, mas você resgatou o Núcleo Quântico! Vamos subir ao topo do Arranha-Céu (Capítulo 5) e acender o farol com nossa própria energia vital! Avancem para a Saída (Token 6)!',
              },
            ],
          },
          {
            token_number: 4,
            token_role: 'Armadilha de Ganância',
            title: 'Arsenal Experimental da Hydra',
            tile_location: 'Tile 2V • Depósito Sudoeste',
            crop_image_url: '',
            initial_status: 'AVAILABLE',
            requires_flags: [],
            lock_banner_text: '',
            unlock_action_label: 'Arrombar Arsenal (Token 4)',
            room_desc_hero:
              'Caixas blindadas com protótipos de armas de energia tesseract e munição pesada.',
            room_desc_zombie:
              'Câmaras de estimulação neural da Hydra que multiplicam a ferocidade em combate.',
            modal_lore_hero:
              'O cofre de armas tem um sensor de sobrecarga. Se abrir corretamente, o grupo ganha poder de fogo devastador.',
            modal_lore_zombie:
              'Os injetores de adrenalina sintética podem dar ações extras ou fritar seus nervos.',
            actions_json: [
              {
                type: 'dice',
                title_hero: 'Destravar Cofre de Armas da Hydra (Risco 1d6)',
                title_zombie: 'Quebrar Câmara de Estimulação (Risco 1d6)',
                subtitle: '4-6: +2 Traços e +5 XP | 1-3: Descarga de Plasma!',
                grants_flags: [],
                dice_outcomes: {
                  high: {
                    title: '🔫 Protótipo Tesseract Equipado!',
                    desc_hero:
                      'Armamento pesado! Compre 2 Cartas de Traço e ganhe +5 XP!',
                    desc_zombie:
                      'Fúria Sintética! Compre 2 Cartas de Traço Zumbi e ganhe +5 XP!',
                  },
                  mid: {
                    title: '⚡ Curto no Cofre!',
                    desc_hero:
                      'Ganhe 1 Carta de Traço, mas sofra 1 Ferimento.',
                    desc_zombie:
                      'Ganhe 1 Carta de Traço Zumbi, mas sofra 1 Ferimento.',
                  },
                  low: {
                    title: '💥 Explosão de Munição!',
                    desc_hero:
                      'Todos na sala sofrem 1 Ferimento e 1 Carta de Spawn é comprada!',
                    desc_zombie:
                      'Todos na sala sofrem 1 Ferimento e 1 Carta de Spawn é comprada!',
                  },
                },
              },
            ],
          },
          {
            token_number: 5,
            token_role: 'Interruptor de Mapa',
            title: 'Terminal Central das Torretas Automáticas',
            tile_location: 'Tile 6V • Sala de Controle Nordeste',
            crop_image_url: '',
            initial_status: 'AVAILABLE',
            requires_flags: [],
            lock_banner_text: '',
            unlock_action_label: 'Hackear Torretas (Token 5)',
            room_desc_hero:
              'Metralhadoras automatizadas no teto rastreiam qualquer sinal de batimento cardíaco.',
            room_desc_zombie:
              'Canhões de contenção programados para fuzilar qualquer biomassa infectada perto do silo.',
            modal_lore_hero:
              'Desligar o servidor central de defesa apaga os lasers vermelhos que bloqueiam o corredor do Poço do Míssil.',
            modal_lore_zombie:
              'Reprogramar as torretas faz com que elas parem de alvejar nossa horda e virem contra os soldados da S.H.I.E.L.D.!',
            actions_json: [
              {
                type: 'direct',
                title_hero: 'Desativar Sistema de Defesa Automatizado',
                title_zombie: 'Inverter Alvo das Torretas contra os Humanos',
                subtitle: 'Desbloqueia o caminho seguro até o Poço do Míssil (Token 3).',
                grants_flags: ['has_power'],
                outcome_title_hero: '🔫 Torretas Desligadas! Corredor Seguro!',
                outcome_title_zombie: '🔫 Defesas da Base Dominadas!',
                outcome_desc_hero:
                  'As metralhadoras recolhem para o teto! O acesso ao <strong>Poço do Míssil (Token 3)</strong> está livre. Use o código <strong>880</strong> lá!',
                outcome_desc_zombie:
                  'As torretas agora trabalham para nós! Elimine gratuitamente até 2 Troopers em qualquer zona do mapa e avance para o <strong>Token 3 (Código 880)</strong>!',
              },
            ],
          },
          {
            token_number: 6,
            token_role: 'Extração / Conclusão',
            title: 'Rampa Blindada para a Superfície',
            tile_location: 'Zona EXIT • Saída Norte',
            crop_image_url: '',
            initial_status: 'LOCKED',
            requires_flags: ['has_transponder'],
            lock_banner_text:
              '🔒 Requisito Final: Sabotar/Resgatar a Ogiva no Poço do Míssil (Token 3).',
            unlock_action_label: 'Subir para o Confronto Final!',
            room_desc_hero:
              'A rampa de carga que leva de volta às ruas sob um céu púrpuro apocalíptico.',
            room_desc_zombie:
              'A saída da base rumo ao topo da Torre Oscorp para o grande clímax.',
            modal_lore_hero:
              'Ao sair do silo, vocês olham para cima: sombras colossais cobrem as estrelas! A Entidade Cósmica chegou à borda do sistema solar e os zumbis estão montando o transmissor final no topo da Torre Oscorp!',
            modal_lore_zombie:
              'Olhem para o céu púrpuro: a sombra do Devorador de Mundos já cobre a Lua! Vamos subir ao topo da Torre Oscorp e acender o Farol nas Nuvens!',
            actions_json: [
              {
                type: 'direct',
                title_hero: 'Avançar para o Capítulo Final: O Farol nas Nuvens!',
                title_zombie: 'Marchar para o Capítulo Final: O Banquete Cósmico!',
                subtitle: 'Todos os heróis na Zona de Saída sem inimigos.',
                grants_flags: ['mission_complete'],
                outcome_title_hero: '🏆 VITÓRIA NO CAPÍTULO 4: SILO NEUTRALIZADO!',
                outcome_title_zombie: '🏆 VITÓRIA NO CAPÍTULO 4: NÚCLEO PRONTO!',
                outcome_desc_hero:
                  'Tudo se decide agora! Preparem-se para o <strong>Capítulo 5: O Clímax – O Farol nas Nuvens</strong>!',
                outcome_desc_zombie:
                  'A eternidade nos aguarda! Preparem-se para o <strong>Capítulo 5: O Clímax – O Farol nas Nuvens</strong>!',
              },
            ],
          },
        ],
      },

      // =========================================================================
      // CAPÍTULO 5: O CLÍMAX - O FAROL NAS NUVENS (Mapa MZ5)
      // =========================================================================
      {
        mission_number: 5,
        code: 'M05_O_FAROL_NAS_NUVENS',
        title: 'CAPÍTULO 5: O CLÍMAX – O FAROL NAS NUVENS',
        location_name: 'Plataforma de Lançamento no Topo da Torre Oscorp',
        rulebook_map_code: 'MZ5 (Pág. 29)',
        tiles_needed: '2V, 3V, 4V, 5R, 8R, 9V',
        map_image_url: '',
        setup_notes:
          'Monte os 6 tiles (5R, 4V / 9V, 3V / 2V, 8R) conforme a Missão MZ5 (pág. 29). A área demarcada à direita representa o núcleo superior do Farol.',
        lore_hero:
          '"A Entidade Cósmica já entrou na borda do sistema solar; sombras colossais cobrem as estrelas e a atmosfera queima em um tom púrpuro apocalíptico. Os heróis zumbis sobreviventes juntaram os restos do transmissor no topo da torre e estão canalizando a própria energia vital para acender a centelha final! Desarmem os 3 Pilares de Plasma, derrotem o General Zumbi Líder e detonem o Pulso Eletromagnético (EMP) no coração do farol!"',
        lore_zombie:
          '"O céu arde em púrpura e a silhueta colossal de Galactus se desenha entre os planetas! Estamos no topo da Torre Oscorp canalizando nossa própria energia vital nos 3 Pilares de Plasma para acender a centelha final. Os últimos Super-Heróis Vivos trouxeram uma bomba de Pulso Eletromagnético (EMP) para apagar nosso farol. Defendam os pilares, esmaguem o líder humano e iniciem o Banquete Eterno!"',
        inventory_badges: [
          { key: 'has_log', label: '📡 Frequência do Dispositivo EMP' },
          { key: 'has_key', label: '⚡ Pilares de Plasma 1 e 2 Desarmados (000)' },
          { key: 'has_power', label: '🔋 3º Pilar de Plasma Desativado' },
          { key: 'has_transponder', label: '💥 General Derrotado & EMP Armado' },
        ],
        tokens: [
          {
            token_number: 1,
            token_role: 'Ponto de Triagem (Livre)',
            title: 'Convés de Telemetria & Carga EMP',
            tile_location: 'Tile 2V/9V • Ala Sudoeste',
            crop_image_url: '',
            initial_status: 'AVAILABLE',
            requires_flags: [],
            lock_banner_text: '',
            unlock_action_label: 'Calibrar EMP (Token 1)',
            room_desc_hero:
              'O vento uiva sob o céu violeta. Aqui está o console que calibra nossa bomba portátil de Pulso Eletromagnético (EMP).',
            room_desc_zombie:
              'Antenas secundárias onde sincronizamos nossos sinais vitais com a frequência do Devorador de Mundos.',
            modal_lore_hero:
              'O computador indica que o escudo do General Líder é sustentado por três nós de plasma espalhados pelo terraço.',
            modal_lore_zombie:
              'Os sensores mostram que precisamos ativar os três nós de plasma para abrir a câmara de ignição final.',
            actions_json: [
              {
                type: 'direct',
                title_hero: 'Sincronizar Bomba EMP e Localizar os 3 Pilares de Plasma',
                title_zombie: 'Sintonizar Frequência Cósmica nos 3 Pilares de Plasma',
                subtitle: 'Mapeia os nós de plasma e revela o código de anulação zero.',
                grants_flags: ['has_log'],
                outcome_title_hero: '📡 Bomba EMP Pronta para o Ataque Final!',
                outcome_title_zombie: '🌌 Harmonia Cósmica Sintonizada!',
                outcome_desc_hero:
                  'Pista Final: Desarme os <strong>Pilares de Plasma 1 e 2 (Token 2)</strong> e o <strong>3º Pilar (Token 5)</strong> para derrubar a barreira da <em>Câmara do Farol (Token 3)</em>! O código de detonação EMP no núcleo é <strong>000</strong>!',
                outcome_desc_zombie:
                  'Pista Final: Carregue os <strong>Pilares de Plasma 1 e 2 (Token 2)</strong> e o <strong>3º Pilar (Token 5)</strong> para abrir a <em>Câmara do Farol (Token 3)</em>! O código de ignição final é <strong>000</strong>!',
              },
            ],
          },
          {
            token_number: 2,
            token_role: 'Investigação & Teste',
            title: 'Pilares de Transmissão Norte & Sul',
            tile_location: 'Tile 5R • Terraço Noroeste',
            crop_image_url: '',
            initial_status: 'AVAILABLE',
            requires_flags: [],
            lock_banner_text: '',
            unlock_action_label: 'Desarmar Pilares 1 e 2 (Token 2)',
            room_desc_hero:
              'Duas colunas de plasma disparando raios púrpuras contínuos em direção às nuvens.',
            room_desc_zombie:
              'Os dois primeiros emissores que rasgam as nuvens com o chamado da Fome.',
            modal_lore_hero:
              'Cada pilar exige que o herói mantenha os circuitos em curto sem ser interrompido pelas descargas psíquicas.',
            modal_lore_zombie:
              'Canalizar sua própria bioenergia nos pilares exige suportar a radiação cósmica.',
            actions_json: [
              {
                type: 'dice',
                title_hero: 'Colapsar Pilares de Plasma 1 e 2 (Teste 1d6)',
                title_zombie: 'Injetar Energia Vital nos Pilares 1 e 2 (Teste 1d6)',
                subtitle: '4-6: Pilares Dominados (+5 XP) | 2-3: Descarga (1 Dano) | 1: Onda Psíquica!',
                grants_flags: ['has_key'],
                dice_outcomes: {
                  high: {
                    title: '⚡ Pilares 1 e 2 Neutralizados! (Código 000)',
                    desc_hero:
                      'Os dois feixes se apagam! O herói ganha +5 XP e confirma o código de anulação: <strong>000</strong>.',
                    desc_zombie:
                      'Os dois feixes brilham com força total! Ganhe +5 XP e código de ignição: <strong>000</strong>.',
                  },
                  mid: {
                    title: '⚡ Arco de Plasma! (Código 000)',
                    desc_hero:
                      'Você desativa os pilares (<strong>000</strong>) e ganha +5 XP, mas sofre 1 Ferimento pela radiação.',
                    desc_zombie:
                      'Você ativa os pilares (<strong>000</strong>) e ganha +5 XP, mas sofre 1 Ferimento pelo esforço.',
                  },
                  low: {
                    title: '🧠 Onda Psíquica do General!',
                    desc_hero:
                      'O General Líder projeta um ataque mental: sofra 1 Ferimento e compre 1 Carta de Spawn, mas os pilares caem (<strong>000</strong>)!',
                    desc_zombie:
                      'Contra-ataque dos heróis vivos: sofra 1 Ferimento e compre 1 Carta de Spawn, mas os pilares estão acesos (<strong>000</strong>)!',
                  },
                },
              },
            ],
          },
          {
            token_number: 3,
            token_role: 'Clímax / Gatekeeper',
            title: 'Coração do Farol & O General Líder',
            tile_location: 'Tile 4V/3V • Câmara Central da Oscorp',
            crop_image_url: '',
            initial_status: 'LOCKED',
            requires_flags: ['has_key', 'has_power'],
            lock_banner_text:
              '🔒 Requisitos: Pilares 1 e 2 (Token 2) + 3º Pilar de Plasma (Token 5).',
            unlock_action_label: 'Digitar [000] • BATALHA FINAL!',
            room_desc_hero:
              'O epicentro do Farol Quântico, onde o General Zumbi Líder flutua envolto em chamas cósmicas.',
            room_desc_zombie:
              'O altar de transmissão onde o líder dos Heróis Vivos tenta instalar a bomba EMP.',
            modal_lore_hero:
              'As portas blindadas da Oscorp se abrem após o código 000! O General Zumbi Líder ergue os olhos famintos enquanto a sombra da Entidade Cósmica paira sobre a Terra!',
            modal_lore_zombie:
              'O código 000 abre o núcleo! O último Campeão dos Heróis Vivos ergue sua arma final para tentar impedir nossa ascensão cósmica!',
            actions_json: [
              {
                type: 'keypad',
                keypad_code: '000',
                title_hero: 'Digitar [000], Enfrentar o General Zumbi e Armar o EMP!',
                title_zombie: 'Digitar [000], Esmagar o Campeão Humano e Acender o Farol!',
                subtitle: 'Inicia a Batalha Final da Campanha!',
                grants_flags: ['has_transponder'],
                outcome_title_hero: '⚔️ BATALHA FINAL: O GENERAL DO FIM DO MUNDO!',
                outcome_title_zombie: '⚔️ BATALHA FINAL: O ÚLTIMO DEFENSOR DA TERRA!',
                outcome_desc_hero:
                  '<strong>REGRA DE CHEFE FINAL:</strong> Coloque o Super-Herói Zumbi mais poderoso na câmara (ele possui <strong>+2 de Resistência/Toughness</strong> extra)! O dispositivo EMP está armado no coração do farol! Derrotem o General e corram para o Ponto de Detonação (Token 6)!',
                outcome_desc_zombie:
                  '<strong>REGRA DE CHEFE FINAL:</strong> Coloque o Super-Herói Vivo mais forte na câmara (com <strong>+2 de Resistência/Toughness</strong> extra) + 2 Guards! Derrotem o defensor humano e avancem para o Ponto de Ascensão (Token 6)!',
              },
            ],
          },
          {
            token_number: 4,
            token_role: 'Armadilha de Ganância',
            title: 'Cápsula de Emergência da Torre',
            tile_location: 'Tile 9V • Sala de Segurança',
            crop_image_url: '',
            initial_status: 'AVAILABLE',
            requires_flags: [],
            lock_banner_text: '',
            unlock_action_label: 'Tentar a Sorte (Token 4)',
            room_desc_hero:
              'Um armário blindado de emergência de Norman Osborn com soros experimentais.',
            room_desc_zombie:
              'Um cilindro de Fórmula Duende que pode turbinar seus músculos mortos.',
            modal_lore_hero:
              'A Fórmula Duende pode dar força sobre-humana para a batalha final ou causar um colapso orgânico.',
            modal_lore_zombie:
              'Ingerir o composto químico pode curar todas as feridas ou explodir em chamas verdes.',
            actions_json: [
              {
                type: 'dice',
                title_hero: 'Usar Composto Experimental Osborn (Risco 1d6)',
                title_zombie: 'Devorar Cilindro da Fórmula Duende (Risco 1d6)',
                subtitle: '4-6: Cura Total + 2 Traços | 1-3: Bomba de Abóbora!',
                grants_flags: [],
                dice_outcomes: {
                  high: {
                    title: '🟢 Poder Máximo para o Clímax!',
                    desc_hero:
                      'O herói recupera toda a Vida, ganha +5 XP e compra 2 Cartas de Traço!',
                    desc_zombie:
                      'Fome zerada, Vida totalmente recuperada, +5 XP e 2 Cartas de Traço Zumbi!',
                  },
                  mid: {
                    title: '🧪 Reação Instável!',
                    desc_hero:
                      'Recupere 1 de Vida e compre 1 Carta de Traço, mas gere 1 Carta de Spawn.',
                    desc_zombie:
                      'Zere a Fome e compre 1 Carta de Traço, mas gere 1 Carta de Spawn.',
                  },
                  low: {
                    title: '🎃 Armadilha de Bomba de Abóbora!',
                    desc_hero:
                      'Explosão no armário! Sofra 1 Ferimento e compre 1 Carta de Spawn!',
                    desc_zombie:
                      'Chamas verdes! Sofra 1 Ferimento e compre 1 Carta de Spawn!',
                  },
                },
              },
            ],
          },
          {
            token_number: 5,
            token_role: 'Interruptor de Mapa',
            title: 'Terceiro Nó de Plasma & Escudo Defletor',
            tile_location: 'Tile 3V/8R • Ala Leste da Oscorp',
            crop_image_url: '',
            initial_status: 'AVAILABLE',
            requires_flags: [],
            lock_banner_text: '',
            unlock_action_label: 'Desativar 3º Pilar (Token 5)',
            room_desc_hero:
              'O último emissor de plasma que mantém a cúpula do General impenetrável.',
            room_desc_zombie:
              'O último condutor energético necessário para completar a tríade estelar.',
            modal_lore_hero:
              'Arrancar os cabos mestres deste pilar apagará o escudo defletor do coração do farol.',
            modal_lore_zombie:
              'Conectar os cabos finais liberará o acesso ao trono de transmissão.',
            actions_json: [
              {
                type: 'direct',
                title_hero: 'Sobrecarregar e Destruir o 3º Nó de Plasma',
                title_zombie: 'Ativar o 3º Nó de Plasma em Potência Máxima',
                subtitle: 'Cumpre o requisito final para abrir a Câmara do General (Token 3).',
                grants_flags: ['has_power'],
                outcome_title_hero: '🔋 Escudo Defletor do General Desfeito!',
                outcome_title_zombie: '🔋 Tríade de Plasma Completa!',
                outcome_desc_hero:
                  'A barreira cai! Agora invadam o <strong>Coração do Farol (Token 3)</strong> usando o código <strong>000</strong>!',
                outcome_desc_zombie:
                  'O núcleo está aberto! Entrem no <strong>Coração do Farol (Token 3)</strong> e digitem <strong>000</strong>!',
              },
            ],
          },
          {
            token_number: 6,
            token_role: 'Extração / Conclusão',
            title: 'Detonação do EMP & Desfecho da Terra',
            tile_location: 'Zona EXIT • Plataforma Leste',
            crop_image_url: '',
            initial_status: 'LOCKED',
            requires_flags: ['has_transponder'],
            lock_banner_text:
              '🔒 Requisito Final: Armar o EMP e derrotar o General no Token 3.',
            unlock_action_label: 'DETONAR EMP E CONCLUIR CAMPANHA!',
            room_desc_hero:
              'O heliporto de extração de onde acionaremos o detonador remoto do Pulso Eletromagnético.',
            room_desc_zombie:
              'O parapeito da torre de onde contemplaremos a descida da Entidade Cósmica.',
            modal_lore_hero:
              'Com o General derrotado e todos os heróis na plataforma de extração, você aperta o gatilho do Pulso Eletromagnético (EMP)!',
            modal_lore_zombie:
              'Com os últimos defensores humanos derrotados e a bomba EMP destruída, o feixe púrpuro perfura as estrelas!',
            actions_json: [
              {
                type: 'direct',
                title_hero: '💥 DETONAR PULSO ELETROMAGNÉTICO (EMP) — SALVAR A TERRA!',
                title_zombie: '🌌 DISPARAR O FAROL QUÂNTICO — INICIAR O BANQUETE CÓSMICO!',
                subtitle: 'Finaliza a Campanha de 5 Capítulos!',
                grants_flags: ['mission_complete', 'campaign_complete'],
                outcome_title_hero: '🏆 FIM DA CAMPANHA: A TERRA ESTÁ INVISÍVEL E SALVA!',
                outcome_title_zombie: '🏆 FIM DA CAMPANHA: O BANQUETE ETERNO COMEÇOU!',
                outcome_desc_hero:
                  'Uma onda azul de pulso eletromagnético varre Manhattan, implodindo o Farol Quântico e apagando todas as luzes do continente! No espaço profundo, a sombra colossal da Entidade perde o rastro do feromônio e passa direto pela órbita terrestre, desaparecendo na escuridão do cosmos. Vocês venceram a campanha <strong>O Sinal do Fim do Mundo</strong>!',
                outcome_desc_zombie:
                  'O raio púrpura rasga o céu noturno! As nuvens se abrem e a Entidade Cósmica pousa sobre o horizonte, trazendo consigo mundos inteiros e carne divina inesgotável. A Fome dos Marvel Zombies finalmente encontrou um banquete digno da eternidade! Vocês venceram a campanha <strong>O Sinal do Fim do Mundo</strong>!',
              },
            ],
          },
        ],
      },
    ];

    // 3. Inserir ou atualizar cada missão e seus 6 tokens
    for (const mData of missionsData) {
      let mission = await FamilyZombiMission.findOne({
        where: { code: mData.code },
      });

      const missionPayload = {
        campaign_id: campaign.id,
        mission_number: mData.mission_number,
        code: mData.code,
        title: mData.title,
        location_name: mData.location_name,
        rulebook_map_code: mData.rulebook_map_code,
        tiles_needed: mData.tiles_needed,
        map_image_url: mData.map_image_url,
        setup_notes: mData.setup_notes,
        lore_hero: mData.lore_hero,
        lore_zombie: mData.lore_zombie,
        inventory_badges: mData.inventory_badges,
      };

      if (!mission) {
        mission = await FamilyZombiMission.create(missionPayload);
        console.log(`  ➕ Missão ${mData.mission_number} criada: ${mData.title}`);
      } else {
        await mission.update(missionPayload);
        console.log(`  🔄 Missão ${mData.mission_number} atualizada: ${mData.title}`);
      }

      for (const tData of mData.tokens) {
        const existingToken = await FamilyZombiToken.findOne({
          where: {
            mission_id: mission.id,
            token_number: tData.token_number,
          },
        });

        const tokenPayload = {
          mission_id: mission.id,
          token_number: tData.token_number,
          token_role: tData.token_role,
          title: tData.title,
          tile_location: tData.tile_location,
          crop_image_url: tData.crop_image_url,
          initial_status: tData.initial_status,
          requires_flags: tData.requires_flags,
          lock_banner_text: tData.lock_banner_text,
          unlock_action_label: tData.unlock_action_label,
          room_desc_hero: tData.room_desc_hero,
          room_desc_zombie: tData.room_desc_zombie,
          modal_lore_hero: tData.modal_lore_hero,
          modal_lore_zombie: tData.modal_lore_zombie,
          actions_json: tData.actions_json,
        };

        if (!existingToken) {
          await FamilyZombiToken.create(tokenPayload);
        } else {
          await existingToken.update(tokenPayload);
        }
      }
      console.log(`     🎯 6 Tokens da Missão ${mData.mission_number} sincronizados!`);
    }

    console.log('\n🎉 SEED DA CAMPANHA MARVEL ZOMBIES CONCLUÍDO COM SUCESSO!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Erro ao executar seedZombiCampaign:', error);
    process.exit(1);
  }
}

seedZombiCampaign();
