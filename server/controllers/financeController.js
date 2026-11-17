import { randomUUID } from 'node:crypto';
import { Op } from 'sequelize';
import {
  FamilyBill,
  FamilyClanVault,
  FamilyChildVault,
  FamilyUser,
  Character,
} from '../models/index.js';
import { findOrCreateUserFamily } from './userProgressController.js';

/**
 * Popula contas padrão caso os pais não tenham nenhuma cadastrada
 */
async function ensureDefaultBills(familyId, creatorId) {
  try {
    const count = await FamilyBill.count({ where: { family_id: familyId } });
    if (count > 0) return;

    const today = new Date();
    const dueDate1 = new Date(today);
    dueDate1.setDate(today.getDate() + 5);
    const dueDate2 = new Date(today);
    dueDate2.setDate(today.getDate() + 10);
    const dueDate3 = new Date(today);
    dueDate3.setDate(today.getDate() + 15);
    const dueDate4 = new Date(today);
    dueDate4.setDate(today.getDate() - 2);

    const defaultBills = [
      {
        id: randomUUID().toLowerCase(),
        family_id: familyId,
        created_by: creatorId,
        title: '💡 Conta de Energia Elétrica',
        category: 'ENERGY',
        amount: 245.8,
        due_date: dueDate1.toISOString().split('T')[0],
        status: 'PENDING',
        payment_method: 'PIX',
        notes: 'Chave PIX da concessionária salva no app do banco.',
      },
      {
        id: randomUUID().toLowerCase(),
        family_id: familyId,
        created_by: creatorId,
        title: '🌐 Internet Fibra Óptica 500 Mega',
        category: 'INTERNET',
        amount: 129.9,
        due_date: dueDate2.toISOString().split('T')[0],
        status: 'PENDING',
        payment_method: 'Boleto',
        notes: 'Débito automático ou pagamento via código de barras.',
      },
      {
        id: randomUUID().toLowerCase(),
        family_id: familyId,
        created_by: creatorId,
        title: '🏡 Condomínio / Manutenção do Lar',
        category: 'HOUSING',
        amount: 450.0,
        due_date: dueDate3.toISOString().split('T')[0],
        status: 'PENDING',
        payment_method: 'PIX',
        notes: 'Taxa condominial e reserva de obras.',
      },
      {
        id: randomUUID().toLowerCase(),
        family_id: familyId,
        created_by: creatorId,
        title: '🛒 Supermercado do Mês (Abastecimento)',
        category: 'SUPERMARKET',
        amount: 820.5,
        due_date: dueDate4.toISOString().split('T')[0],
        status: 'PAID',
        paid_at: new Date(),
        payment_method: 'Cartão de Débito',
        notes: 'Compras essenciais de despensa já liquidadas.',
      },
    ];

    await FamilyBill.bulkCreate(defaultBills);
  } catch (err) {
    console.error('Erro ao popular contas padrão:', err);
  }
}

/**
 * Popula grande sonho padrão do clã se não existir
 */
async function ensureDefaultClanVault(familyId, creatorId) {
  try {
    const count = await FamilyClanVault.count({ where: { family_id: familyId } });
    if (count > 0) return;

    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() + 90);

    await FamilyClanVault.create({
      id: randomUUID().toLowerCase(),
      family_id: familyId,
      created_by: creatorId,
      title: 'Viagem de Férias do Clã (Praia / Parque Temático)',
      description: 'Meta coletiva familiar para descanso, praia, atrações e momentos inesquecíveis juntos!',
      category: 'TRIP',
      icon: '🏖️🎢',
      target_amount: 3000.0,
      current_amount: 2160.0,
      target_tasks: 500,
      current_tasks: 360,
      target_date: targetDate.toISOString().split('T')[0],
      status: 'ACTIVE',
    });
  } catch (err) {
    console.error('Erro ao popular cofre do clã padrão:', err);
  }
}

/**
 * Garante ou cria o cofrinho de poupança do herói
 */
async function findOrCreateChildVault(userId, familyId) {
  let vault = await FamilyChildVault.findOne({
    where: { user_id: userId, family_id: familyId },
  });

  if (!vault) {
    const character = await Character.findOne({ where: { user_id: userId } });
    vault = await FamilyChildVault.create({
      id: randomUUID().toLowerCase(),
      family_id: familyId,
      user_id: userId,
      character_id: character ? character.id : null,
      saved_gold: 0,
      allowance_balance_brl: 0.0,
      gold_to_brl_rate: 10.0, // Cada 10 Ouro = R$ 1,00 (100 Ouro = R$ 10,00)
      goal_title: 'Meu Sonho / Brinquedo / Jogo',
      goal_amount_brl: 50.0,
      total_withdrawn_brl: 0.0,
    });
  }
  return vault;
}

// ========================================================
// 1. CONTAS DO MÊS (ÁREA PRIVADA DOS GUARDIÕES / PARENT)
// ========================================================

export const listBills = async (req, res) => {
  try {
    const userId = req.user.id;
    const membership = await findOrCreateUserFamily(userId);
    if (!membership) {
      return res.status(400).json({ success: false, message: 'Família não encontrada.' });
    }

    const familyId = membership.family_id;
    await ensureDefaultBills(familyId, userId);

    const bills = await FamilyBill.findAll({
      where: { family_id: familyId },
      order: [
        ['due_date', 'ASC'],
        ['created_at', 'DESC'],
      ],
    });

    const todayStr = new Date().toISOString().split('T')[0];

    // Estatísticas financeiras consolidadas
    let totalPending = 0;
    let totalPaid = 0;
    let countPending = 0;
    let countPaid = 0;
    let countOverdue = 0;

    const formattedBills = bills.map((b) => {
      const isOverdue = b.status === 'PENDING' && b.due_date < todayStr;
      const amountNum = parseFloat(b.amount) || 0;

      if (b.status === 'PAID') {
        totalPaid += amountNum;
        countPaid++;
      } else {
        totalPending += amountNum;
        countPending++;
        if (isOverdue) countOverdue++;
      }

      return {
        id: b.id,
        title: b.title,
        category: b.category,
        amount: amountNum,
        due_date: b.due_date,
        status: isOverdue ? 'OVERDUE' : b.status,
        paid_at: b.paid_at,
        payment_method: b.payment_method,
        barcode_or_pix: b.barcode_or_pix,
        notes: b.notes,
      };
    });

    return res.json({
      success: true,
      bills: formattedBills,
      summary: {
        total_pending: parseFloat(totalPending.toFixed(2)),
        total_paid: parseFloat(totalPaid.toFixed(2)),
        total_month: parseFloat((totalPending + totalPaid).toFixed(2)),
        count_pending: countPending,
        count_paid: countPaid,
        count_overdue: countOverdue,
      },
    });
  } catch (err) {
    console.error('Erro ao listar contas:', err);
    return res.status(500).json({ success: false, message: 'Erro ao consultar contas domésticas.' });
  }
};

export const createBill = async (req, res) => {
  try {
    const userId = req.user.id;
    const membership = await findOrCreateUserFamily(userId);
    if (!membership) {
      return res.status(400).json({ success: false, message: 'Família não encontrada.' });
    }

    const { title, category, amount, due_date, payment_method, barcode_or_pix, notes } = req.body;
    if (!title || !amount || !due_date) {
      return res.status(400).json({
        success: false,
        message: 'Título, valor e data de vencimento são obrigatórios.',
      });
    }

    const bill = await FamilyBill.create({
      id: randomUUID().toLowerCase(),
      family_id: membership.family_id,
      created_by: userId,
      title: title.trim(),
      category: category || 'OTHER',
      amount: parseFloat(amount),
      due_date,
      status: 'PENDING',
      payment_method: payment_method || 'PIX',
      barcode_or_pix: barcode_or_pix ? barcode_or_pix.trim() : null,
      notes: notes ? notes.trim() : null,
    });

    return res.status(201).json({
      success: true,
      message: 'Conta cadastrada com sucesso!',
      bill,
    });
  } catch (err) {
    console.error('Erro ao cadastrar conta:', err);
    return res.status(500).json({ success: false, message: 'Erro ao cadastrar conta doméstica.' });
  }
};

export const updateBill = async (req, res) => {
  try {
    const { billId } = req.params;
    const userId = req.user.id;
    const membership = await findOrCreateUserFamily(userId);

    const bill = await FamilyBill.findOne({
      where: { id: billId, family_id: membership.family_id },
    });

    if (!bill) {
      return res.status(404).json({ success: false, message: 'Conta não encontrada.' });
    }

    const { title, category, amount, due_date, payment_method, barcode_or_pix, notes, status } = req.body;

    await bill.update({
      title: title !== undefined ? title.trim() : bill.title,
      category: category || bill.category,
      amount: amount !== undefined ? parseFloat(amount) : bill.amount,
      due_date: due_date || bill.due_date,
      payment_method: payment_method !== undefined ? payment_method : bill.payment_method,
      barcode_or_pix: barcode_or_pix !== undefined ? barcode_or_pix : bill.barcode_or_pix,
      notes: notes !== undefined ? notes : bill.notes,
      status: status || bill.status,
      paid_at: status === 'PAID' && !bill.paid_at ? new Date() : (status === 'PENDING' ? null : bill.paid_at),
    });

    return res.json({
      success: true,
      message: 'Conta atualizada com sucesso!',
      bill,
    });
  } catch (err) {
    console.error('Erro ao atualizar conta:', err);
    return res.status(500).json({ success: false, message: 'Erro ao atualizar conta.' });
  }
};

export const toggleBillStatus = async (req, res) => {
  try {
    const { billId } = req.params;
    const userId = req.user.id;
    const membership = await findOrCreateUserFamily(userId);

    const bill = await FamilyBill.findOne({
      where: { id: billId, family_id: membership.family_id },
    });

    if (!bill) {
      return res.status(404).json({ success: false, message: 'Conta não encontrada.' });
    }

    const newStatus = bill.status === 'PAID' ? 'PENDING' : 'PAID';
    const paidAt = newStatus === 'PAID' ? new Date() : null;

    await bill.update({
      status: newStatus,
      paid_at: paidAt,
    });

    return res.json({
      success: true,
      message: newStatus === 'PAID' ? 'Conta marcada como PAGA! ✅' : 'Conta reaberta como PENDENTE.',
      status: newStatus,
      bill,
    });
  } catch (err) {
    console.error('Erro ao alternar status da conta:', err);
    return res.status(500).json({ success: false, message: 'Erro ao alterar status da conta.' });
  }
};

export const deleteBill = async (req, res) => {
  try {
    const { billId } = req.params;
    const userId = req.user.id;
    const membership = await findOrCreateUserFamily(userId);

    const bill = await FamilyBill.findOne({
      where: { id: billId, family_id: membership.family_id },
    });

    if (!bill) {
      return res.status(404).json({ success: false, message: 'Conta não encontrada.' });
    }

    await bill.destroy();

    return res.json({
      success: true,
      message: 'Conta removida com sucesso.',
    });
  } catch (err) {
    console.error('Erro ao excluir conta:', err);
    return res.status(500).json({ success: false, message: 'Erro ao excluir conta.' });
  }
};

// ========================================================
// 2. COFRE DOS SONHOS DO CLÃ (METAS COMPARTILHADAS)
// ========================================================

export const listClanVaults = async (req, res) => {
  try {
    const userId = req.user.id;
    const membership = await findOrCreateUserFamily(userId);
    if (!membership) {
      return res.status(400).json({ success: false, message: 'Família não encontrada.' });
    }

    const familyId = membership.family_id;
    await ensureDefaultClanVault(familyId, userId);

    const vaults = await FamilyClanVault.findAll({
      where: { family_id: familyId },
      order: [['created_at', 'ASC']],
    });

    const formattedVaults = vaults.map((v) => {
      const targetAmt = parseFloat(v.target_amount) || 1;
      const currentAmt = parseFloat(v.current_amount) || 0;
      const progressPercent = Math.min(100, Math.round((currentAmt / targetAmt) * 100));

      const targetTasks = v.target_tasks || 0;
      const currentTasks = v.current_tasks || 0;
      const taskProgressPercent = targetTasks > 0 ? Math.min(100, Math.round((currentTasks / targetTasks) * 100)) : 0;

      return {
        id: v.id,
        title: v.title,
        description: v.description,
        category: v.category,
        icon: v.icon,
        target_amount: targetAmt,
        current_amount: currentAmt,
        progress_percentage: progressPercent,
        target_tasks: targetTasks,
        current_tasks: currentTasks,
        task_progress_percentage: taskProgressPercent,
        target_date: v.target_date,
        status: v.status,
      };
    });

    return res.json({
      success: true,
      vaults: formattedVaults,
    });
  } catch (err) {
    console.error('Erro ao listar cofres do clã:', err);
    return res.status(500).json({ success: false, message: 'Erro ao buscar metas familiares.' });
  }
};

export const createClanVault = async (req, res) => {
  try {
    const userId = req.user.id;
    const membership = await findOrCreateUserFamily(userId);
    if (!membership) {
      return res.status(400).json({ success: false, message: 'Família não encontrada.' });
    }

    const { title, description, category, icon, target_amount, target_tasks, target_date } = req.body;
    if (!title || !target_amount) {
      return res.status(400).json({
        success: false,
        message: 'Título e valor alvo da meta são obrigatórios.',
      });
    }

    const vault = await FamilyClanVault.create({
      id: randomUUID().toLowerCase(),
      family_id: membership.family_id,
      created_by: userId,
      title: title.trim(),
      description: description ? description.trim() : null,
      category: category || 'TRIP',
      icon: icon || '🏰',
      target_amount: parseFloat(target_amount),
      current_amount: 0.0,
      target_tasks: target_tasks ? parseInt(target_tasks, 10) : 0,
      current_tasks: 0,
      target_date: target_date || null,
      status: 'ACTIVE',
    });

    return res.status(201).json({
      success: true,
      message: 'Nova meta do clã criada com sucesso!',
      vault,
    });
  } catch (err) {
    console.error('Erro ao criar cofre do clã:', err);
    return res.status(500).json({ success: false, message: 'Erro ao criar meta familiar.' });
  }
};

export const depositClanVault = async (req, res) => {
  try {
    const { vaultId } = req.params;
    const { amount } = req.body;
    const depositNum = parseFloat(amount);

    if (isNaN(depositNum) || depositNum <= 0) {
      return res.status(400).json({ success: false, message: 'Valor de depósito inválido.' });
    }

    const userId = req.user.id;
    const membership = await findOrCreateUserFamily(userId);

    const vault = await FamilyClanVault.findOne({
      where: { id: vaultId, family_id: membership.family_id },
    });

    if (!vault) {
      return res.status(404).json({ success: false, message: 'Meta não encontrada.' });
    }

    const newCurrent = parseFloat(vault.current_amount) + depositNum;
    const isAchieved = newCurrent >= parseFloat(vault.target_amount);

    await vault.update({
      current_amount: newCurrent,
      status: isAchieved ? 'ACHIEVED' : vault.status,
    });

    return res.json({
      success: true,
      message: `Aporte de R$ ${depositNum.toFixed(2)} depositado com sucesso no Cofre do Clã! 🏰✨`,
      vault,
      is_achieved: isAchieved,
    });
  } catch (err) {
    console.error('Erro ao depositar no cofre:', err);
    return res.status(500).json({ success: false, message: 'Erro ao realizar aporte.' });
  }
};

export const updateClanVault = async (req, res) => {
  try {
    const { vaultId } = req.params;
    const userId = req.user.id;
    const membership = await findOrCreateUserFamily(userId);

    const vault = await FamilyClanVault.findOne({
      where: { id: vaultId, family_id: membership.family_id },
    });

    if (!vault) {
      return res.status(404).json({ success: false, message: 'Meta não encontrada.' });
    }

    const { title, description, category, icon, target_amount, current_amount, target_tasks, current_tasks, target_date, status } = req.body;

    await vault.update({
      title: title !== undefined ? title.trim() : vault.title,
      description: description !== undefined ? description : vault.description,
      category: category || vault.category,
      icon: icon || vault.icon,
      target_amount: target_amount !== undefined ? parseFloat(target_amount) : vault.target_amount,
      current_amount: current_amount !== undefined ? parseFloat(current_amount) : vault.current_amount,
      target_tasks: target_tasks !== undefined ? parseInt(target_tasks, 10) : vault.target_tasks,
      current_tasks: current_tasks !== undefined ? parseInt(current_tasks, 10) : vault.current_tasks,
      target_date: target_date !== undefined ? target_date : vault.target_date,
      status: status || vault.status,
    });

    return res.json({
      success: true,
      message: 'Meta familiar atualizada com sucesso!',
      vault,
    });
  } catch (err) {
    console.error('Erro ao atualizar cofre:', err);
    return res.status(500).json({ success: false, message: 'Erro ao atualizar meta.' });
  }
};

export const deleteClanVault = async (req, res) => {
  try {
    const { vaultId } = req.params;
    const userId = req.user.id;
    const membership = await findOrCreateUserFamily(userId);

    const vault = await FamilyClanVault.findOne({
      where: { id: vaultId, family_id: membership.family_id },
    });

    if (!vault) {
      return res.status(404).json({ success: false, message: 'Meta não encontrada.' });
    }

    await vault.destroy();

    return res.json({
      success: true,
      message: 'Meta familiar removida.',
    });
  } catch (err) {
    console.error('Erro ao excluir cofre:', err);
    return res.status(500).json({ success: false, message: 'Erro ao excluir meta.' });
  }
};

// ========================================================
// 3. COFRE & MESADA GAMIFICADA DOS FILHOS
// ========================================================

export const getChildVault = async (req, res) => {
  try {
    const userId = req.user.id;
    const membership = await findOrCreateUserFamily(userId);
    if (!membership) {
      return res.status(400).json({ success: false, message: 'Família não encontrada.' });
    }

    const familyId = membership.family_id;
    const isParent = req.user.role === 'PARENT' || req.user.role === 'ADMIN';

    // Cofrinho do usuário logado
    const myVault = await findOrCreateChildVault(userId, familyId);
    const myCharacter = await Character.findOne({ where: { user_id: userId } });

    let childrenVaults = [];
    if (isParent) {
      // Guardiões visualizam os cofrinhos de todos os filhos da família
      const members = await FamilyUser.findAll({
        where: { role: 'CHILD' },
        include: [
          { model: Character, as: 'character' },
          { model: FamilyChildVault, as: 'child_vault', where: { family_id: familyId }, required: false },
        ],
      });

      for (const child of members) {
        let cv = child.child_vault;
        if (!cv) {
          cv = await findOrCreateChildVault(child.id, familyId);
        }
        childrenVaults.push({
          user_id: child.id,
          user_name: child.name,
          hero_name: child.character?.name || 'Aventureiro',
          hero_gold: child.character?.gold || 0,
          saved_gold: cv.saved_gold,
          allowance_balance_brl: parseFloat(cv.allowance_balance_brl),
          gold_to_brl_rate: parseFloat(cv.gold_to_brl_rate),
          goal_title: cv.goal_title,
          goal_amount_brl: parseFloat(cv.goal_amount_brl),
          total_withdrawn_brl: parseFloat(cv.total_withdrawn_brl),
        });
      }
    }

    return res.json({
      success: true,
      my_vault: {
        id: myVault.id,
        hero_gold: myCharacter?.gold || 0,
        saved_gold: myVault.saved_gold,
        allowance_balance_brl: parseFloat(myVault.allowance_balance_brl),
        gold_to_brl_rate: parseFloat(myVault.gold_to_brl_rate),
        goal_title: myVault.goal_title,
        goal_amount_brl: parseFloat(myVault.goal_amount_brl),
        total_withdrawn_brl: parseFloat(myVault.total_withdrawn_brl),
      },
      children_vaults: childrenVaults,
      is_parent: isParent,
    });
  } catch (err) {
    console.error('Erro ao consultar cofre do filho:', err);
    return res.status(500).json({ success: false, message: 'Erro ao buscar cofrinho do herói.' });
  }
};

export const depositPiggyBank = async (req, res) => {
  try {
    const userId = req.user.id;
    const { gold_amount } = req.body;
    const amount = parseInt(gold_amount, 10);

    if (isNaN(amount) || amount <= 0) {
      return res.status(400).json({ success: false, message: 'Quantidade de ouro inválida.' });
    }

    const membership = await findOrCreateUserFamily(userId);
    const character = await Character.findOne({ where: { user_id: userId } });
    if (!character) {
      return res.status(400).json({ success: false, message: 'Herói não encontrado.' });
    }

    if (character.gold < amount) {
      return res.status(400).json({
        success: false,
        message: `Saldo insuficiente de ouro. Você possui ${character.gold} Ouro.`,
      });
    }

    const vault = await findOrCreateChildVault(userId, membership.family_id);

    // Deduz da carteira do personagem e adiciona no cofre de poupança
    await character.update({ gold: character.gold - amount });
    await vault.update({ saved_gold: vault.saved_gold + amount });

    return res.json({
      success: true,
      message: `🪙 ${amount} moedas de Ouro guardadas no Cofrinho de Poupança!`,
      hero_gold: character.gold,
      saved_gold: vault.saved_gold,
    });
  } catch (err) {
    console.error('Erro ao guardar no cofrinho:', err);
    return res.status(500).json({ success: false, message: 'Erro ao guardar moedas na poupança.' });
  }
};

export const withdrawPiggyBank = async (req, res) => {
  try {
    const userId = req.user.id;
    const { gold_amount } = req.body;
    const amount = parseInt(gold_amount, 10);

    if (isNaN(amount) || amount <= 0) {
      return res.status(400).json({ success: false, message: 'Quantidade de ouro inválida.' });
    }

    const membership = await findOrCreateUserFamily(userId);
    const vault = await findOrCreateChildVault(userId, membership.family_id);
    const character = await Character.findOne({ where: { user_id: userId } });

    if (vault.saved_gold < amount) {
      return res.status(400).json({
        success: false,
        message: `Saldo insuficiente na poupança. Você possui ${vault.saved_gold} Ouro guardado.`,
      });
    }

    await vault.update({ saved_gold: vault.saved_gold - amount });
    if (character) {
      await character.update({ gold: character.gold + amount });
    }

    return res.json({
      success: true,
      message: `🪙 ${amount} moedas de Ouro resgatadas de volta para sua bolsa de aventuras!`,
      hero_gold: character?.gold || 0,
      saved_gold: vault.saved_gold,
    });
  } catch (err) {
    console.error('Erro ao retirar do cofrinho:', err);
    return res.status(500).json({ success: false, message: 'Erro ao resgatar ouro.' });
  }
};

export const convertGoldToAllowance = async (req, res) => {
  try {
    const userId = req.user.id;
    const { gold_to_convert } = req.body;
    const goldNum = parseInt(gold_to_convert, 10);

    if (isNaN(goldNum) || goldNum <= 0) {
      return res.status(400).json({ success: false, message: 'Quantidade de ouro para converter inválida.' });
    }

    const membership = await findOrCreateUserFamily(userId);
    const vault = await findOrCreateChildVault(userId, membership.family_id);

    if (vault.saved_gold < goldNum) {
      return res.status(400).json({
        success: false,
        message: `Saldo de poupança insuficiente. Você tem ${vault.saved_gold} Ouro guardado.`,
      });
    }

    const rate = parseFloat(vault.gold_to_brl_rate) || 10;
    const convertedBrl = parseFloat((goldNum / rate).toFixed(2));

    await vault.update({
      saved_gold: vault.saved_gold - goldNum,
      allowance_balance_brl: parseFloat(vault.allowance_balance_brl) + convertedBrl,
    });

    return res.json({
      success: true,
      message: `🎉 Parabéns! ${goldNum} Ouro foram convertidos em R$ ${convertedBrl.toFixed(2)} de mesada real acumulada!`,
      saved_gold: vault.saved_gold,
      allowance_balance_brl: parseFloat(vault.allowance_balance_brl),
    });
  } catch (err) {
    console.error('Erro ao converter ouro em mesada:', err);
    return res.status(500).json({ success: false, message: 'Erro ao converter moedas em mesada.' });
  }
};

export const updateChildGoal = async (req, res) => {
  try {
    const userId = req.user.id;
    const { goal_title, goal_amount_brl } = req.body;

    if (!goal_title) {
      return res.status(400).json({ success: false, message: 'O título do objetivo é obrigatório.' });
    }

    const membership = await findOrCreateUserFamily(userId);
    const vault = await findOrCreateChildVault(userId, membership.family_id);

    await vault.update({
      goal_title: goal_title.trim(),
      goal_amount_brl: goal_amount_brl ? parseFloat(goal_amount_brl) : vault.goal_amount_brl,
    });

    return res.json({
      success: true,
      message: '🎯 Objetivo de poupança atualizado com sucesso!',
      goal_title: vault.goal_title,
      goal_amount_brl: parseFloat(vault.goal_amount_brl),
    });
  } catch (err) {
    console.error('Erro ao atualizar meta do herói:', err);
    return res.status(500).json({ success: false, message: 'Erro ao atualizar objetivo.' });
  }
};

export const payAllowance = async (req, res) => {
  try {
    const { target_user_id, amount_brl } = req.body;
    const payNum = parseFloat(amount_brl);

    if (!target_user_id || isNaN(payNum) || payNum <= 0) {
      return res.status(400).json({ success: false, message: 'Herói e valor de pagamento válidos são obrigatórios.' });
    }

    const membership = await findOrCreateUserFamily(req.user.id);
    const vault = await FamilyChildVault.findOne({
      where: { user_id: target_user_id, family_id: membership.family_id },
    });

    if (!vault) {
      return res.status(404).json({ success: false, message: 'Cofrinho do herói não encontrado.' });
    }

    if (parseFloat(vault.allowance_balance_brl) < payNum) {
      return res.status(400).json({
        success: false,
        message: `Saldo insuficiente na mesada. O herói possui R$ ${parseFloat(vault.allowance_balance_brl).toFixed(2)} disponível.`,
      });
    }

    await vault.update({
      allowance_balance_brl: parseFloat(vault.allowance_balance_brl) - payNum,
      total_withdrawn_brl: parseFloat(vault.total_withdrawn_brl) + payNum,
    });

    return res.json({
      success: true,
      message: `💵 Pagamento de R$ ${payNum.toFixed(2)} registrado e entregue ao herói na vida real!`,
      vault,
    });
  } catch (err) {
    console.error('Erro ao pagar mesada:', err);
    return res.status(500).json({ success: false, message: 'Erro ao registrar pagamento de mesada.' });
  }
};
