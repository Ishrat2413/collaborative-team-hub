import { Router } from 'express';
import * as usersController from './users.controller.js';
import { protect } from '../../middleware/auth.js';
import { uploadAvatar } from '../../middleware/upload.js';

const router = Router();

router.use(protect);

router.patch('/profile', usersController.updateProfile);
router.patch('/avatar', uploadAvatar, usersController.updateAvatar);
router.get('/search', usersController.searchMembers);

export default router;
