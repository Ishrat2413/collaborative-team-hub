import { Router } from 'express';
import * as ctrl from './comments.controller.js';
import { protect } from '../../middleware/auth.js';

const router = Router();
router.use(protect);

router.post('/', ctrl.createComment);
router.delete('/:commentId', ctrl.deleteComment);

export default router;
