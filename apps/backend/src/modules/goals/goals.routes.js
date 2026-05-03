import { Router } from 'express';
import * as ctrl from './goals.controller.js';
import { protect } from '../../middleware/auth.js';

const router = Router();
router.use(protect);

router.post('/', ctrl.createGoal);
router.get('/', ctrl.getGoals);
router.get('/:goalId', ctrl.getGoal);
router.patch('/:goalId', ctrl.updateGoal);
router.post('/:goalId/activity', ctrl.addActivity);
router.delete('/:goalId', ctrl.deleteGoal);

export default router;
