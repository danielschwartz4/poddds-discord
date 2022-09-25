import { mdyDate } from "../../utils/timeZoneUtil";
import { WeeklyGoal } from "../../entities/WeeklyGoal";
import { readLastWeeklyGoal } from "../../resolvers/weeklyGoal";
import { expiredGoalNotif } from "../expiredGoalNotif";
import { Guild } from "discord.js";

export const checkIfLastGoal = async (
  user_id: string,
  date: string,
  GUILD: Guild
) => {
  readLastWeeklyGoal(user_id).then(async (weekly_goal_res) => {
    // compare only dates and not time
    if (weekly_goal_res && weekly_goal_res.adjustedEndDate) {
      if (mdyDate(weekly_goal_res?.adjustedEndDate) === date) {
        expiredGoalNotif(user_id, weekly_goal_res as WeeklyGoal, GUILD);
      }
    }
  });
};
