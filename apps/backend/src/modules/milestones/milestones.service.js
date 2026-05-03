/**
 * @fileoverview Milestones service.
 */

import prisma from '../../config/db.js';
import { recalculateProgress } from '../goals/goals.service.js';

export const createMilestone = async (goalId, data) => {
  const milestone = await prisma.milestone.create({
    data: { goalId, ...data },
  });
  await recalculateProgress(goalId);
  return milestone;
};

export const updateMilestone = async (milestoneId, data) => {
  const milestone = await prisma.milestone.update({
    where: { id: milestoneId },
    data,
  });
  await recalculateProgress(milestone.goalId);
  return milestone;
};

export const deleteMilestone = async (milestoneId) => {
  const milestone = await prisma.milestone.delete({ where: { id: milestoneId } });
  await recalculateProgress(milestone.goalId);
};
