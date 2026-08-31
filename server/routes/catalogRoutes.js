import express from 'express';
import {
  getAttributes,
  getClasses,
  getSkillsByClass,
  getItems,
  getMonsters,
  getDefinitionTasks,
} from '../controllers/catalogController.js';

const router = express.Router();

// Rotas públicas do catálogo do RPG
router.get('/attributes', getAttributes);
router.get('/classes', getClasses);
router.get('/skills/:classId', getSkillsByClass);
router.get('/items', getItems);
router.get('/monsters', getMonsters);
router.get('/tasks', getDefinitionTasks);


export default router;
