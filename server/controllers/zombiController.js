import { Op } from 'sequelize';
import {
  FamilyZombiCampaign,
  FamilyZombiMission,
  FamilyZombiToken,
  DefinitionMzCharacter,
} from '../models/index.js';

/**
 * GET /api/zombi/campaign
 * Retorna a campanha ativa com todas as suas 5 missões e os 6 tokens de cada missão.
 */
export const getActiveCampaign = async (req, res) => {
  try {
    const campaign = await FamilyZombiCampaign.findOne({
      where: { is_active: true },
      include: [
        {
          model: FamilyZombiMission,
          as: 'missions',
          include: [
            {
              model: FamilyZombiToken,
              as: 'tokens',
            },
          ],
        },
      ],
      order: [
        [{ model: FamilyZombiMission, as: 'missions' }, 'mission_number', 'ASC'],
        [
          { model: FamilyZombiMission, as: 'missions' },
          { model: FamilyZombiToken, as: 'tokens' },
          'token_number',
          'ASC',
        ],
      ],
    });

    if (!campaign) {
      return res.status(404).json({
        success: false,
        message: 'Nenhuma campanha Zombicide encontrada no banco de dados.',
      });
    }

    return res.json({
      success: true,
      campaign,
    });
  } catch (error) {
    console.error('Erro ao buscar campanha Zombicide:', error);
    return res.status(500).json({
      success: false,
      message: 'Erro interno ao carregar campanha.',
      error: error.message,
    });
  }
};

/**
 * POST /api/zombi/state
 * Salva o progresso da campanha (missão atual, modo Herói/Zumbi, flags e tokens resolvidos).
 */
export const saveCampaignState = async (req, res) => {
  try {
    const { current_mission_number, active_mode, campaign_state } = req.body;

    const campaign = await FamilyZombiCampaign.findOne({
      where: { is_active: true },
    });

    if (!campaign) {
      return res.status(404).json({
        success: false,
        message: 'Campanha não encontrada.',
      });
    }

    if (current_mission_number !== undefined) {
      campaign.current_mission_number = Number(current_mission_number);
    }
    if (active_mode === 'HERO' || active_mode === 'ZOMBIE') {
      campaign.active_mode = active_mode;
    }
    if (campaign_state !== undefined) {
      campaign.campaign_state = campaign_state;
    }

    await campaign.save();

    return res.json({
      success: true,
      message: 'Progresso da campanha salvo com sucesso!',
      campaign: {
        id: campaign.id,
        current_mission_number: campaign.current_mission_number,
        active_mode: campaign.active_mode,
        campaign_state: campaign.campaign_state,
      },
    });
  } catch (error) {
    console.error('Erro ao salvar estado da campanha Zombicide:', error);
    return res.status(500).json({
      success: false,
      message: 'Erro ao salvar progresso da campanha.',
      error: error.message,
    });
  }
};

/**
 * POST /api/zombi/reset
 * Reinicia o progresso salvo da campanha (volta para Missão 1 ou reinicia a missão selecionada).
 */
export const resetCampaignState = async (req, res) => {
  try {
    const { mission_number } = req.body || {};

    const campaign = await FamilyZombiCampaign.findOne({
      where: { is_active: true },
    });

    if (!campaign) {
      return res.status(404).json({
        success: false,
        message: 'Campanha não encontrada.',
      });
    }

    if (mission_number) {
      // Reiniciar apenas a missão específica no estado salvo
      const currentState = campaign.campaign_state || { missions: {}, legacy_items: [] };
      if (currentState.missions && currentState.missions[mission_number]) {
        delete currentState.missions[mission_number];
      }
      campaign.campaign_state = { ...currentState };
      campaign.changed('campaign_state', true);
    } else {
      // Reiniciar campanha completa
      campaign.current_mission_number = 1;
      campaign.campaign_state = {
        missions: {},
        legacy_items: [],
      };
    }

    await campaign.save();

    return res.json({
      success: true,
      message: 'Progresso reiniciado com sucesso!',
      campaign,
    });
  } catch (error) {
    console.error('Erro ao resetar campanha Zombicide:', error);
    return res.status(500).json({
      success: false,
      message: 'Erro ao reiniciar campanha.',
      error: error.message,
    });
  }
};

/**
 * GET /api/zombi/characters
 * Lista todos os personagens de Marvel Zombies com suporte a filtros rápidos.
 * Query Params opcionais:
 *  - box: filtra pelo nome da caixa
 *  - mode: 'hero', 'zombie' ou 'boss'
 *  - search: busca textual pelo nome do personagem
 */
export const listMzCharacters = async (req, res) => {
  try {
    const { box, mode, search } = req.query;
    const where = {};

    if (box) {
      where.box_name = box;
    }

    if (mode === 'hero') {
      where.has_super_hero = true;
    } else if (mode === 'zombie') {
      where.has_zombie_hero = true;
    } else if (mode === 'boss') {
      where.has_boss_enemy = true;
    }

    if (search && search.trim() !== '') {
      where[Op.or] = [
        { name: { [Op.like]: `%${search.trim()}%` } },
        { code: { [Op.like]: `%${search.trim()}%` } },
      ];
    }

    const characters = await DefinitionMzCharacter.findAll({
      where,
      attributes: [
        'id',
        'code',
        'name',
        'box_name',
        'has_super_hero',
        'has_zombie_hero',
        'has_boss_enemy',
        'boss_health',
      ],
      order: [['name', 'ASC']],
    });

    return res.json({
      success: true,
      total: characters.length,
      characters,
    });
  } catch (error) {
    console.error('Erro ao listar personagens Marvel Zombies:', error);
    return res.status(500).json({
      success: false,
      message: 'Erro ao listar personagens Marvel Zombies.',
      error: error.message,
    });
  }
};

/**
 * GET /api/zombi/characters/:code
 * Retorna os detalhes completos da ficha de um personagem (incluindo perfis, ataques e habilidades).
 */
export const getMzCharacterByCode = async (req, res) => {
  try {
    const { code } = req.params;

    const character = await DefinitionMzCharacter.findOne({
      where: { code },
    });

    if (!character) {
      return res.status(404).json({
        success: false,
        message: `Personagem '${code}' não encontrado no catálogo.`,
      });
    }

    return res.json({
      success: true,
      character,
    });
  } catch (error) {
    console.error(`Erro ao buscar personagem '${req.params.code}':`, error);
    return res.status(500).json({
      success: false,
      message: 'Erro ao buscar detalhes do personagem.',
      error: error.message,
    });
  }
};
