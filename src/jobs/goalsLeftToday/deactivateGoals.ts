import { WeeklyGoal } from "../../entities/WeeklyGoal";
import { Event } from "../../entities/Event";
import { GoalType } from "src/types/dbTypes";

export const deactivateGoalsAndEvents = (discordId: string, type: GoalType) => {
  Event.update({ discordId: discordId, type: type }, { isActive: false });
  WeeklyGoal.update({ discordId: discordId, type: type }, { isActive: false });
};
