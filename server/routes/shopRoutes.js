import express from 'express';
import { authenticateToken } from '../middlewares/authMiddleware.js';
import {
  getShopItems,
  buyItem,
} from '../controllers/shopController.js';

const router = express.Router();

router.use(authenticateToken);

router.get('/items', getShopItems);
router.post('/buy', buyItem);

export default router;
