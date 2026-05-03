import { Router } from 'express';
import * as ctrl from './workspaces.controller.js';
import { protect } from '../../middleware/auth.js';
import { requireWorkspaceAdmin, requireWorkspaceMember } from '../../middleware/rbac.js';

const router = Router();
router.use(protect);

router.post('/', ctrl.createWorkspace);
router.get('/', ctrl.getWorkspaces);
router.get('/:workspaceId', ctrl.getWorkspace);
router.patch('/:workspaceId', requireWorkspaceAdmin, ctrl.updateWorkspace);
router.post('/:workspaceId/invite', requireWorkspaceAdmin, ctrl.inviteMember);
router.patch('/:workspaceId/members/:userId/role', requireWorkspaceAdmin, ctrl.changeMemberRole);
router.delete('/:workspaceId/members/:userId', requireWorkspaceAdmin, ctrl.removeMember);

export default router;
