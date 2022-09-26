import { GoalType } from "../../types/dbTypes";
import { CLIENT } from "../../constants";
import { readActiveEvents, updateAllUserEventsToInactive, updateUserEventsToInactiveByType } from "../../resolvers/event";
import { updateAllUserWeeklyGoalsToInactive, updateUserWeeklyGoalsToInactiveByType } from "../../resolvers/weeklyGoal";

export const deactivateGoalsAndEvents = async (
  discordId: string,
  type?: GoalType
) => {
  // deactivate any goals left today channels from discord UI if they exist
  let active_events = await readActiveEvents(discordId);
  active_events.forEach((event) => {
    const goal_left_channel = CLIENT.channels.cache.get(
      event.goalLeftChannelId
    );
    if (goal_left_channel) {
      goal_left_channel?.delete();
    }
  });

  if (type) {
    updateUserWeeklyGoalsToInactiveByType(discordId, type);
    updateUserEventsToInactiveByType(discordId, type)
  } else {
    // deactivate all
    updateAllUserEventsToInactive(discordId);
    updateAllUserWeeklyGoalsToInactive(discordId);
  }
};
