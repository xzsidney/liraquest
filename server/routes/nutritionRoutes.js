import express from 'express';
import { authenticateToken, authorizeRoles } from '../middlewares/authMiddleware.js';
import {
  getTodayMenu,
  getWeekMenu,
  saveMeal,
  deleteMeal,
  checkinMeal,
  getShoppingList,
  toggleShoppingItem,
  addShoppingItem,
  deleteShoppingItem,
  getSchedules,
  updateSchedules,
} from '../controllers/nutritionController.js';

const router = express.Router();

// Todas as rotas exigem autenticação
router.use(authenticateToken);

// 🍽️ Cardápio & Refeições
router.get('/today', getTodayMenu);
router.get('/week', getWeekMenu);
router.post('/meal', authorizeRoles('ADMIN', 'PARENT'), saveMeal);
router.delete('/meal/:mealId', authorizeRoles('ADMIN', 'PARENT'), deleteMeal);

// 👑 Validação dos Filhos (Check-in de presença dos Heróis)
router.post('/checkin', authorizeRoles('ADMIN', 'PARENT'), checkinMeal);

// 🛒 Lista de Compras (Abastecimento do Mês & Feira da Semana)
router.get('/shopping', getShoppingList);
router.post('/shopping', addShoppingItem);
router.post('/shopping/toggle', toggleShoppingItem);
router.delete('/shopping/:itemId', deleteShoppingItem);

// ⏰ Horários e Rotina (Certinho vs Flexível)
router.get('/schedule', getSchedules);
router.put('/schedule', authorizeRoles('ADMIN', 'PARENT'), updateSchedules);

export default router;
