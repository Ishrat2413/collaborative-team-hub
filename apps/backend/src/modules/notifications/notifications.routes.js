import { Router } from 'express';
import * as ctrl from './notifications.controller.js';
import { protect } from '../../middleware/auth.js';

const router = Router();
router.use(protect);

router.get('/', ctrl.getNotifications);
router.patch('/read-all', ctrl.markAllRead);
router.patch('/:id/read', ctrl.markRead);

export default router;
