import { GoalType } from "../../types/dbTypes";
import { updateAllUserEventsToInactive, updateUserEventsToInactiveByType } from "../../resolvers/event";
import { updateAllUserWeeklyGoalsToInactive, updateWeeklyGoalStatusToInactiveByType } from "../../resolvers/weeklyGoal";

export const deactivateGoalsAndEvents = async (
  discordId: string,
  type?: GoalType
) => {
  // deactivate any goals left today channels from discord UI if they exist

  if (type) {
    updateWeeklyGoalStatusToInactiveByType(discordId, type);
    updateUserEventsToInactiveByType(discordId, type)
  } else {
    // deactivate all
    updateAllUserEventsToInactive(discordId);
    updateAllUserWeeklyGoalsToInactive(discordId);
  }
};
