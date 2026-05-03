/**
 * @fileoverview Authentication routes.
 * @module auth/routes
 */

import { Router } from 'express';
import * as authController from './auth.controller.js';
import { protect } from '../../middleware/auth.js';

const router = Router();

/** @route POST /api/v1/auth/register */
router.post('/register', authController.register);

/** @route POST /api/v1/auth/login */
router.post('/login', authController.login);

/** @route POST /api/v1/auth/refresh */
router.post('/refresh', authController.refresh);

/** @route POST /api/v1/auth/logout */
router.post('/logout', authController.logout);

/** @route GET /api/v1/auth/me */
router.get('/me', protect, authController.getMe);

export default router;
