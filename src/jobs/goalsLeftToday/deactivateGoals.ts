import { WeeklyGoal } from "../../entities/WeeklyGoal";
import { Event } from "../../entities/Event";

export const deactivateGoalsAndEvents = (discordId: string) => {
  Event.update({ discordId: discordId }, { isActive: false });
  WeeklyGoal.update({ discordId: discordId }, { isActive: false });
};
