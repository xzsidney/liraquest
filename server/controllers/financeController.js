/**
 * Controller Financeiro (Módulo legado desativado no V2 Oficial)
 */

export const listBills = async (req, res) => {
  return res.json({ success: true, bills: [], summary: { total: 0, paid: 0, pending: 0, overdue: 0 } });
};

export const createBill = async (req, res) => {
  return res.json({ success: true, message: 'Módulo financeiro desativado no V2 oficial.' });
};

export const updateBill = async (req, res) => {
  return res.json({ success: true, message: 'Módulo financeiro desativado no V2 oficial.' });
};

export const toggleBillStatus = async (req, res) => {
  return res.json({ success: true, message: 'Módulo financeiro desativado no V2 oficial.' });
};

export const deleteBill = async (req, res) => {
  return res.json({ success: true, message: 'Módulo financeiro desativado no V2 oficial.' });
};

export const listClanVaults = async (req, res) => {
  return res.json({ success: true, vaults: [] });
};

export const createClanVault = async (req, res) => {
  return res.json({ success: true, message: 'Módulo financeiro desativado no V2 oficial.' });
};

export const depositClanVault = async (req, res) => {
  return res.json({ success: true, message: 'Módulo financeiro desativado no V2 oficial.' });
};

export const updateClanVault = async (req, res) => {
  return res.json({ success: true, message: 'Módulo financeiro desativado no V2 oficial.' });
};

export const deleteClanVault = async (req, res) => {
  return res.json({ success: true, message: 'Módulo financeiro desativado no V2 oficial.' });
};

export const getChildVault = async (req, res) => {
  return res.json({
    success: true,
    vault: {
      balance_reais: 0,
      total_deposited_reais: 0,
      total_withdrawn_reais: 0,
      allowance_monthly_reais: 0,
      goal_title: 'Sonho do Herói',
      goal_target_reais: 100,
    },
    transactions: [],
  });
};

export const depositPiggyBank = async (req, res) => {
  return res.json({ success: true, message: 'Módulo financeiro desativado no V2 oficial.' });
};

export const withdrawPiggyBank = async (req, res) => {
  return res.json({ success: true, message: 'Módulo financeiro desativado no V2 oficial.' });
};

export const convertGoldToAllowance = async (req, res) => {
  return res.json({ success: true, message: 'Módulo financeiro desativado no V2 oficial.' });
};

export const updateChildGoal = async (req, res) => {
  return res.json({ success: true, message: 'Módulo financeiro desativado no V2 oficial.' });
};

export const payAllowance = async (req, res) => {
  return res.json({ success: true, message: 'Módulo financeiro desativado no V2 oficial.' });
};
