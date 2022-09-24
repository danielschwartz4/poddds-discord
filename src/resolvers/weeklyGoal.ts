import { WeeklyGoal } from "../entities/WeeklyGoal";
import { Event } from "../entities/Event";

export const readLastWeeklyGoal = async (discordId: string) => {
  return await WeeklyGoal.findOne({
    where: {
      discordId: discordId,
      isActive: true,
    },
  });
};

export const updateWeeklyGoalStatusToInactive = async (discordId: string) => {
  return await WeeklyGoal.update(
    { discordId: discordId, isActive: true },
    { isActive: false }
  );
};

export const updateWeeklyGoalAndEventsActive = async (weeklyGoalId: number) => {
  await WeeklyGoal.update({ id: weeklyGoalId }, { isActive: true });
  await Event.update({ goalId: weeklyGoalId }, { isActive: true });
};
