import { Router } from 'express';
import * as ctrl from './announcements.controller.js';
import { protect } from '../../middleware/auth.js';
import { requireWorkspaceAdmin } from '../../middleware/rbac.js';

const router = Router();
router.use(protect);

router.post('/', requireWorkspaceAdmin, ctrl.createAnnouncement);
router.get('/', ctrl.getAnnouncements);
router.get('/:announcementId', ctrl.getAnnouncement);
router.patch('/:announcementId/pin', requireWorkspaceAdmin, ctrl.togglePin);
router.post('/:announcementId/reactions', ctrl.toggleReaction);
router.delete('/:announcementId', requireWorkspaceAdmin, ctrl.deleteAnnouncement);

export default router;
