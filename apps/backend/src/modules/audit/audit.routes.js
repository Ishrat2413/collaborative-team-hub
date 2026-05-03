import { Router } from 'express';
import * as ctrl from './audit.controller.js';
import { protect } from '../../middleware/auth.js';
import { requireWorkspaceAdmin } from '../../middleware/rbac.js';

const router = Router();
router.use(protect);

router.get('/', ctrl.getAuditLogs);
router.get('/export', ctrl.exportAuditCSV);

export default router;
