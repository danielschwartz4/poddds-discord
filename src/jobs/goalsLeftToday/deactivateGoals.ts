import { WeeklyGoal } from "../../entities/WeeklyGoal";
import { Event } from "../../entities/Event";
import { CLIENT } from "../discordScheduler";

export const deactivateGoalsAndEvents = async (discordId: string) => {
  // deactivate any goals left today channels from discord UI if they exist
  let active_events = await Event.find({ where: { discordId: discordId, isActive: true }})
  active_events.forEach((event) => {
    const goal_left_channel = CLIENT.channels.cache.get(
        event.goalLeftChannelId
      );
    if (goal_left_channel) {
      goal_left_channel?.delete();
    }
  })

  Event.update({ discordId: discordId }, { isActive: false });
  WeeklyGoal.update({ discordId: discordId }, { isActive: false });
};
