import { mdyDate } from "../../utils/timeZoneUtil";
import { WeeklyGoal } from "../../entities/WeeklyGoal";
import { readLastWeeklyGoalByType } from "../../resolvers/weeklyGoal";
import { expiredGoalNotif } from "../goal/expiredGoalNotif";
import { GoalType } from "../../types/dbTypes";

export const checkIfLastGoal = async (
  user_id: string,
  date: string,
  type: GoalType,
) => {
  readLastWeeklyGoalByType(user_id, type).then(async (weekly_goal_res) => {
    // compare only dates and not time
    if (weekly_goal_res && weekly_goal_res.adjustedEndDate) {
      if (mdyDate(weekly_goal_res?.adjustedEndDate) === date) {
        expiredGoalNotif(user_id, type, weekly_goal_res as WeeklyGoal);
      }
    }
  });
};
