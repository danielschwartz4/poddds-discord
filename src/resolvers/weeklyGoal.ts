import { WeeklyGoal } from "../entities/WeeklyGoal";
import { Event } from "../entities/Event";
import { GoalType } from "../types/dbTypes";

export const readWeeklyGoalByType = (discordId: string, type: GoalType) => {
  return WeeklyGoal.findOne({
    where: {
      discordId,
      isActive: true,
      type,
    },
    order: {
      id: "DESC",
    },
  });
};

export const readAllActiveGoalsForTimezone = (timeZone: string) => {
  return WeeklyGoal.find({
    where: { isActive: true, timeZone },
  });
};

export const readLastWeeklyGoalByType = (discordId: string, type: GoalType) => {
  return WeeklyGoal.findOne({
    where: {
      discordId: discordId,
      isActive: true,
      type,
    },
  });
};

export const updateWeeklyGoalToCompleted = (
  discordId: string,
  type: GoalType
) => {
  return WeeklyGoal.update({ discordId, isActive: true, type }, { misses: 0 });
};

export const updateWeeklyGoalStatusToInactiveByType = (
  discordId: string,
  type: GoalType
) => {
  return WeeklyGoal.update(
    { discordId: discordId, isActive: true, type },
    { isActive: false }
  );
};

export const updateWeeklyGoalAndEventsActive = (weeklyGoalId: number) => {
  WeeklyGoal.update({ id: weeklyGoalId }, { isActive: true });
  Event.update({ goalId: weeklyGoalId }, { isActive: true });
};

export const updateAllUserWeeklyGoalsToInactive = (discordId: string) => {
  WeeklyGoal.update({ discordId }, { isActive: false });
};

export const updateUserWeeklyGoalsToInactiveByType = (
  discordId: string,
  type: GoalType
) => {
  WeeklyGoal.update({ discordId, type }, { isActive: false });
};
