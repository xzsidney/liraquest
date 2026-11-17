import express from 'express';
import { authenticateToken, authorizeRoles } from '../middlewares/authMiddleware.js';
import {
  listBills,
  createBill,
  updateBill,
  toggleBillStatus,
  deleteBill,
  listClanVaults,
  createClanVault,
  depositClanVault,
  updateClanVault,
  deleteClanVault,
  getChildVault,
  depositPiggyBank,
  withdrawPiggyBank,
  convertGoldToAllowance,
  updateChildGoal,
  payAllowance,
} from '../controllers/financeController.js';

const router = express.Router();

router.use(authenticateToken);

// 📑 1. Contas do Mês (Privativo Pais / PARENT e ADMIN)
router.get('/bills', authorizeRoles('ADMIN', 'PARENT'), listBills);
router.post('/bills', authorizeRoles('ADMIN', 'PARENT'), createBill);
router.put('/bills/:billId', authorizeRoles('ADMIN', 'PARENT'), updateBill);
router.patch('/bills/:billId/toggle', authorizeRoles('ADMIN', 'PARENT'), toggleBillStatus);
router.delete('/bills/:billId', authorizeRoles('ADMIN', 'PARENT'), deleteBill);

// 🏰 2. Cofre dos Sonhos do Clã (Compartilhado com toda a família)
router.get('/vaults', listClanVaults);
router.post('/vaults', authorizeRoles('ADMIN', 'PARENT'), createClanVault);
router.post('/vaults/:vaultId/deposit', depositClanVault);
router.put('/vaults/:vaultId', authorizeRoles('ADMIN', 'PARENT'), updateClanVault);
router.delete('/vaults/:vaultId', authorizeRoles('ADMIN', 'PARENT'), deleteClanVault);

// 🪙 3. Cofre & Mesada dos Filhos (Educação Financeira e Poupança)
router.get('/child-vault', getChildVault);
router.post('/child-vault/deposit', depositPiggyBank);
router.post('/child-vault/withdraw', withdrawPiggyBank);
router.post('/child-vault/convert', convertGoldToAllowance);
router.post('/child-vault/goal', updateChildGoal);
router.post('/child-vault/pay', authorizeRoles('ADMIN', 'PARENT'), payAllowance);

export default router;
