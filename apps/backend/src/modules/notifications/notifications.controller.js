/**
 * @fileoverview Notifications controller.
 */

import * as notificationsService from './notifications.service.js';
import { sendSuccess, sendPaginated } from '../../utils/apiResponse.js';
import { asyncHandler } from '../../utils/asyncHandler.js';

export const getNotifications = asyncHandler(async (req, res) => {
  const { page = '1', limit = '20' } = req.query;
  const { notifications, total, unreadCount } = await notificationsService.getNotifications(
    req.user.id,
    { page: parseInt(page), limit: parseInt(limit) }
  );
  res.json({
    success: true,
    message: 'Notifications retrieved.',
    data: {
      items: notifications,
      unreadCount,
      pagination: { page: parseInt(page), limit: parseInt(limit), total },
    },
  });
});

export const markAllRead = asyncHandler(async (req, res) => {
  await notificationsService.markAllRead(req.user.id);
  sendSuccess(res, 200, 'All notifications marked as read.');
});

export const markRead = asyncHandler(async (req, res) => {
  await notificationsService.markRead(req.params.id, req.user.id);
  sendSuccess(res, 200, 'Notification marked as read.');
});
