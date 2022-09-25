import { WeeklyGoal } from "../entities/WeeklyGoal";
import { Event } from "../entities/Event";
import { GoalType } from "../types/dbTypes";

export const readAllActiveGoalsForTimezone = (timeZone: string) => {
  return WeeklyGoal.find({
    where: { isActive: true, timeZone },
  });
}

export const readLastWeeklyGoal = (discordId: string) => {
  return WeeklyGoal.findOne({
    where: {
      discordId: discordId,
      isActive: true,
    },
  });
};

export const updateWeeklyGoalStatusToInactive = (discordId: string) => {
  return WeeklyGoal.update(
    { discordId: discordId, isActive: true },
    { isActive: false }
  );
};

export const updateWeeklyGoalAndEventsActive = (weeklyGoalId: number) => {
  WeeklyGoal.update({ id: weeklyGoalId }, { isActive: true });
  Event.update({ goalId: weeklyGoalId }, { isActive: true });
};

export const updateAllUserWeeklyGoalsToInactive = (discordId: string) => {
  WeeklyGoal.update({ discordId }, { isActive: false });
}

export const updateUserWeeklyGoalsToInactiveByType = (discordId: string, type: GoalType) => {
  WeeklyGoal.update({ discordId, type }, { isActive: false });
}