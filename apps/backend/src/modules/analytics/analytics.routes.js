import { Router } from 'express';
import * as ctrl from './analytics.controller.js';
import { protect } from '../../middleware/auth.js';

const router = Router();
router.use(protect);

router.get('/dashboard', ctrl.getDashboard);
router.get('/export', ctrl.exportCSV);

export default router;
