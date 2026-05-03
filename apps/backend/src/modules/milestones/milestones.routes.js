import { Router } from 'express';
import * as ctrl from './milestones.controller.js';
import { protect } from '../../middleware/auth.js';

const router = Router();
router.use(protect);

router.post('/', ctrl.createMilestone);
router.patch('/:milestoneId', ctrl.updateMilestone);
router.delete('/:milestoneId', ctrl.deleteMilestone);

export default router;
