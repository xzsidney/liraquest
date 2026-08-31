import express from 'express';
import { authenticateToken, authorizeRoles } from '../middlewares/authMiddleware.js';
import {
  listRewards,
  createReward,
  updateReward,
  toggleReward,
  deleteReward,
  redeemReward,
  listMyRedemptions,
  listFamilyRedemptions,
  reviewRedemption,
} from '../controllers/rewardController.js';

const router = express.Router();

router.use(authenticateToken);

// Vitrine da Loja & Resgates
router.get('/', listRewards);
router.post('/:rewardId/redeem', redeemReward);
router.get('/redemptions/my', listMyRedemptions);

// Gestão de Recompensas (Exclusivo PARENT/ADMIN)
router.post('/', authorizeRoles('ADMIN', 'PARENT'), createReward);
router.put('/:rewardId', authorizeRoles('ADMIN', 'PARENT'), updateReward);
router.patch('/:rewardId/toggle', authorizeRoles('ADMIN', 'PARENT'), toggleReward);
router.delete('/:rewardId', authorizeRoles('ADMIN', 'PARENT'), deleteReward);
router.get('/redemptions/family', authorizeRoles('ADMIN', 'PARENT'), listFamilyRedemptions);
router.post('/redemptions/:redemptionId/review', authorizeRoles('ADMIN', 'PARENT'), reviewRedemption);

export default router;
