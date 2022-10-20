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
        console.log("end date was the same as the current date! for user id ", user_id, " and goal type ", type)
        expiredGoalNotif(user_id, type, weekly_goal_res as WeeklyGoal);
      }
    }
  });
};
