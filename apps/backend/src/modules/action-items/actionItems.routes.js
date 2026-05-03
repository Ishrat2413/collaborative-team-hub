import { Router } from 'express';
import * as ctrl from './actionItems.controller.js';
import { protect } from '../../middleware/auth.js';

const router = Router();
router.use(protect);

router.post('/', ctrl.createActionItem);
router.get('/', ctrl.getActionItems);
router.get('/:itemId', ctrl.getActionItem);
router.patch('/:itemId', ctrl.updateActionItem);
router.delete('/:itemId', ctrl.deleteActionItem);

export default router;
