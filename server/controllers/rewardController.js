import { randomUUID } from 'node:crypto';
import {
  FamilyReward,
  FamilyRewardRedemption,
  FamilyMember,
  FamilyUser,
  UserProgress,
} from '../models/index.js';
import { findOrCreateProgress } from './userProgressController.js';

/**
 * Popula recompensas familiares padrão se a família ainda não possuir nenhuma
 */
export async function ensureFamilyHasRewards(familyId, creatorId) {
  try {
    if (!familyId) return;
    const count = await FamilyReward.count({ where: { family_id: familyId } });
    if (count > 0) return;

    const defaultRewards = [
      {
        title: 'Vale Futebol com os Amigos',
        description: 'Liberar a pelada do fim de semana com a turma ou assistir ao jogão juntos!',
        token_cost: 25,
        category: 'OUTING',
        icon: '⚽',
        allowed_profile: 'ALL',
      },
      {
        title: 'Noite da Pizza em Família',
        description: 'Você escolhe o sabor da pizza na sexta-feira ou sábado!',
        token_cost: 40,
        category: 'GASTRONOMY',
        icon: '🍕',
        allowed_profile: 'ALL',
      },
      {
        title: '1h Extra de Videogame / Telas',
        description: 'Tempo extra de diversão nos seus jogos e aplicativos favoritos.',
        token_cost: 20,
        category: 'ENTERTAINMENT',
        icon: '🎮',
        allowed_profile: 'CHILD',
      },
      {
        title: 'Rodada de Sorvete / Açaí',
        description: 'Passeio até a sorveteria para saborear sua sobremesa preferida.',
        token_cost: 15,
        category: 'GASTRONOMY',
        icon: '🍦',
        allowed_profile: 'ALL',
      },
      {
        title: 'Escolher o Filme do Fim de Semana',
        description: 'Você manda no controle remoto e escolhe o filme com direito a pipoca.',
        token_cost: 15,
        category: 'ENTERTAINMENT',
        icon: '🎬',
        allowed_profile: 'ALL',
      },
      {
        title: 'Noite do Hambúrguer Artesanal',
        description: 'Lanches especiais com batata frita e refrigerante em família.',
        token_cost: 35,
        category: 'GASTRONOMY',
        icon: '🍔',
        allowed_profile: 'ALL',
      },
      {
        title: 'Dormir até mais tarde no Sábado',
        description: 'Acordar na hora que quiser sem hora marcada ou despertador.',
        token_cost: 15,
        category: 'PRIVILEGE',
        icon: '🛌',
        allowed_profile: 'ALL',
      },
      {
        title: 'Passeio no Parque ou Praia',
        description: 'Dia especial de lazer ao ar livre, andar de bicicleta ou praia.',
        token_cost: 30,
        category: 'OUTING',
        icon: '🏖️',
        allowed_profile: 'ALL',
      },
      {
        title: 'Comprar um Livro ou Quadrinho Novo',
        description: 'Escolha um novo livro ou HQ para expandir sua estante.',
        token_cost: 45,
        category: 'GIFT',
        icon: '📚',
        allowed_profile: 'ALL',
      },
      {
        title: 'Folga de 1 Tarefa Doméstica',
        description: 'Vale folga de lavar a louça ou arrumar a mesa hoje!',
        token_cost: 25,
        category: 'PRIVILEGE',
        icon: '🎲',
        allowed_profile: 'CHILD',
      },
    ];

    const rewardsToCreate = defaultRewards.map((r) => ({
      id: randomUUID().toLowerCase(),
      family_id: familyId,
      created_by: creatorId,
      ...r,
      is_active: true,
    }));

    await FamilyReward.bulkCreate(rewardsToCreate);
    console.log(`✅ [Loja do Lar] 10 recompensas padrão criadas para a família ${familyId}`);
  } catch (err) {
    console.error('❌ Erro em ensureFamilyHasRewards:', err);
  }
}

/**
 * Lista as recompensas da loja do lar para o usuário logado
 */
export const listRewards = async (req, res) => {
  try {
    const userId = req.user.id;
    const userRole = req.user.role;

    const membership = await FamilyMember.findOne({ where: { user_id: userId } });
    if (!membership) {
      return res.json({
        success: true,
        hasFamily: false,
        rewards: [],
        token_balance: 0,
      });
    }

    const familyId = membership.family_id;
    await ensureFamilyHasRewards(familyId, userId);

    const progress = await findOrCreateProgress(userId);
    const tokenBalance = progress.family_tokens || progress.token_balance || 0;

    const whereClause = { family_id: familyId };
    // Se for filho, mostrar apenas ativas
    if (userRole === 'CHILD') {
      whereClause.is_active = true;
    }

    const rewards = await FamilyReward.findAll({
      where: whereClause,
      order: [['created_at', 'ASC']],
    });

    return res.json({
      success: true,
      hasFamily: true,
      token_balance: tokenBalance,
      rewards,
    });
  } catch (error) {
    console.error('❌ Erro ao listar recompensas da loja:', error);
    return res.status(500).json({
      success: false,
      message: 'Erro interno ao consultar recompensas.',
    });
  }
};

/**
 * Cria uma nova recompensa da família (exclusivo PARENT/ADMIN)
 */
export const createReward = async (req, res) => {
  try {
    const userId = req.user.id;
    const { title, description, token_cost, category, icon, allowed_profile } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({
        success: false,
        message: 'O título da recompensa é obrigatório.',
      });
    }

    const membership = await FamilyMember.findOne({ where: { user_id: userId } });
    if (!membership) {
      return res.status(400).json({
        success: false,
        message: 'Você precisa estar em uma família para cadastrar recompensas.',
      });
    }

    const reward = await FamilyReward.create({
      id: randomUUID().toLowerCase(),
      family_id: membership.family_id,
      created_by: userId,
      title: title.trim(),
      description: description ? description.trim() : null,
      token_cost: Math.max(1, parseInt(token_cost, 10) || 20),
      category: category || 'ENTERTAINMENT',
      icon: icon || '🎁',
      allowed_profile: allowed_profile || 'ALL',
      is_active: true,
    });

    return res.status(201).json({
      success: true,
      message: `Recompensa "${reward.title}" cadastrada com sucesso!`,
      reward,
    });
  } catch (error) {
    console.error('❌ Erro ao criar recompensa:', error);
    return res.status(500).json({
      success: false,
      message: 'Erro interno ao cadastrar recompensa.',
    });
  }
};

/**
 * Atualiza uma recompensa existente
 */
export const updateReward = async (req, res) => {
  try {
    const { rewardId } = req.params;
    const { title, description, token_cost, category, icon, allowed_profile, is_active } = req.body;

    const reward = await FamilyReward.findByPk(rewardId);
    if (!reward) {
      return res.status(404).json({
        success: false,
        message: 'Recompensa não encontrada.',
      });
    }

    await reward.update({
      title: title !== undefined ? title.trim() : reward.title,
      description: description !== undefined ? description?.trim() : reward.description,
      token_cost: token_cost !== undefined ? Math.max(1, parseInt(token_cost, 10)) : reward.token_cost,
      category: category || reward.category,
      icon: icon || reward.icon,
      allowed_profile: allowed_profile || reward.allowed_profile,
      is_active: is_active !== undefined ? Boolean(is_active) : reward.is_active,
    });

    return res.json({
      success: true,
      message: 'Recompensa atualizada com sucesso!',
      reward,
    });
  } catch (error) {
    console.error('❌ Erro ao atualizar recompensa:', error);
    return res.status(500).json({
      success: false,
      message: 'Erro interno ao atualizar recompensa.',
    });
  }
};

/**
 * Alterna status ativo/pausado da recompensa
 */
export const toggleReward = async (req, res) => {
  try {
    const { rewardId } = req.params;
    const reward = await FamilyReward.findByPk(rewardId);
    if (!reward) {
      return res.status(404).json({
        success: false,
        message: 'Recompensa não encontrada.',
      });
    }

    await reward.update({ is_active: !reward.is_active });

    return res.json({
      success: true,
      message: `Recompensa ${reward.is_active ? 'ativada' : 'pausada'} com sucesso!`,
      reward,
    });
  } catch (error) {
    console.error('❌ Erro ao alternar recompensa:', error);
    return res.status(500).json({
      success: false,
      message: 'Erro interno ao alternar status da recompensa.',
    });
  }
};

/**
 * Exclui uma recompensa
 */
export const deleteReward = async (req, res) => {
  try {
    const { rewardId } = req.params;
    const reward = await FamilyReward.findByPk(rewardId);
    if (!reward) {
      return res.status(404).json({
        success: false,
        message: 'Recompensa não encontrada.',
      });
    }

    await reward.destroy();

    return res.json({
      success: true,
      message: 'Recompensa excluída com sucesso!',
    });
  } catch (error) {
    console.error('❌ Erro ao excluir recompensa:', error);
    return res.status(500).json({
      success: false,
      message: 'Erro interno ao excluir recompensa.',
    });
  }
};

/**
 * Resgata uma recompensa com Fichas do Lar
 */
export const redeemReward = async (req, res) => {
  try {
    const userId = req.user.id;
    const userRole = req.user.role;
    const { rewardId } = req.params;
    const { notes } = req.body;

    const reward = await FamilyReward.findByPk(rewardId);
    if (!reward || !reward.is_active) {
      return res.status(404).json({
        success: false,
        message: 'Recompensa indisponível para resgate.',
      });
    }

    // Verificar perfil permitido
    if (reward.allowed_profile !== 'ALL' && reward.allowed_profile !== userRole) {
      return res.status(403).json({
        success: false,
        message: 'Esta recompensa não está disponível para o seu perfil.',
      });
    }

    // Verificar saldo de Fichas do Lar
    const progress = await findOrCreateProgress(userId);
    const currentTokens = progress.family_tokens || progress.token_balance || 0;

    if (currentTokens < reward.token_cost) {
      return res.status(400).json({
        success: false,
        message: `Saldo insuficiente de Fichas do Lar. Você tem ${currentTokens} fichas, mas esta recompensa custa ${reward.token_cost} fichas.`,
      });
    }

    // Deduzir Fichas
    const newBalance = currentTokens - reward.token_cost;
    await progress.update({
      family_tokens: newBalance,
      token_balance: newBalance,
    });

    // Criar solicitação de resgate
    const redemption = await FamilyRewardRedemption.create({
      id: randomUUID().toLowerCase(),
      reward_id: reward.id,
      family_id: reward.family_id,
      user_id: userId,
      token_cost: reward.token_cost,
      status: 'PENDING',
      notes: notes ? notes.trim() : null,
    });

    return res.status(201).json({
      success: true,
      message: `🎉 Parabéns! Você resgatou "${reward.title}" por ${reward.token_cost} Fichas do Lar! Apresente este vale aos seus pais.`,
      new_token_balance: newBalance,
      redemption,
    });
  } catch (error) {
    console.error('❌ Erro ao resgatar recompensa:', error);
    return res.status(500).json({
      success: false,
      message: 'Erro interno ao resgatar recompensa.',
    });
  }
};

/**
 * Lista os vales resgatados pelo usuário atual
 */
export const listMyRedemptions = async (req, res) => {
  try {
    const userId = req.user.id;

    const redemptions = await FamilyRewardRedemption.findAll({
      where: { user_id: userId },
      include: [{ model: FamilyReward, as: 'reward' }],
      order: [['created_at', 'DESC']],
    });

    return res.json({
      success: true,
      redemptions,
    });
  } catch (error) {
    console.error('❌ Erro ao consultar meus vales:', error);
    return res.status(500).json({
      success: false,
      message: 'Erro interno ao consultar vales.',
    });
  }
};

/**
 * Lista todas as solicitações de resgate da família (para o Guardião)
 */
export const listFamilyRedemptions = async (req, res) => {
  try {
    const userId = req.user.id;
    const membership = await FamilyMember.findOne({ where: { user_id: userId } });
    if (!membership) {
      return res.status(404).json({
        success: false,
        message: 'Família não encontrada.',
      });
    }

    const redemptions = await FamilyRewardRedemption.findAll({
      where: { family_id: membership.family_id },
      include: [
        { model: FamilyReward, as: 'reward' },
        { model: FamilyUser, as: 'user', attributes: ['id', 'name', 'email', 'role', 'profile_photo_url'] },
      ],
      order: [['created_at', 'DESC']],
    });

    return res.json({
      success: true,
      redemptions,
    });
  } catch (error) {
    console.error('❌ Erro ao consultar resgates da família:', error);
    return res.status(500).json({
      success: false,
      message: 'Erro interno ao consultar resgates da família.',
    });
  }
};

/**
 * Guardião avalia/entrega uma solicitação de resgate
 */
export const reviewRedemption = async (req, res) => {
  try {
    const { redemptionId } = req.params;
    const { status, notes } = req.body;
    const reviewerId = req.user.id;

    if (!['APPROVED', 'DELIVERED', 'CANCELLED'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Status inválido. Escolha entre APPROVED, DELIVERED ou CANCELLED.',
      });
    }

    const redemption = await FamilyRewardRedemption.findByPk(redemptionId, {
      include: [{ model: FamilyReward, as: 'reward' }],
    });

    if (!redemption) {
      return res.status(404).json({
        success: false,
        message: 'Resgate não encontrado.',
      });
    }

    // Se foi cancelado, devolver as Fichas do Lar para o usuário
    if (status === 'CANCELLED' && redemption.status !== 'CANCELLED') {
      const progress = await findOrCreateProgress(redemption.user_id);
      const refundedBalance = (progress.family_tokens || progress.token_balance || 0) + redemption.token_cost;
      await progress.update({
        family_tokens: refundedBalance,
        token_balance: refundedBalance,
      });
    }

    await redemption.update({
      status,
      reviewed_by: reviewerId,
      reviewed_at: new Date(),
      notes: notes ? notes.trim() : redemption.notes,
    });

    return res.json({
      success: true,
      message: `Resgate ${status === 'APPROVED' ? 'aprovado' : status === 'DELIVERED' ? 'marcado como entregue' : 'cancelado com estorno das fichas'}!`,
      redemption,
    });
  } catch (error) {
    console.error('❌ Erro ao avaliar resgate:', error);
    return res.status(500).json({
      success: false,
      message: 'Erro interno ao avaliar resgate.',
    });
  }
};
