import { mdyDate } from "../../utils/timeZoneUtil"
import { WeeklyGoal } from "../../entities/WeeklyGoal"
import { readLastWeeklyGoal } from "../../utils/weeklyGoalResolvers"
import { CLIENT } from "../discordScheduler"
import { expiredGoalNotif } from "../expiredGoalNotif"

export const checkIfLastGoal = async (
    user_id: string,
    date: string
) => {
    readLastWeeklyGoal(user_id).then(async (weekly_goal_res) => {
        // compare only dates and not time
        if (weekly_goal_res && weekly_goal_res.adjustedEndDate) {
            if (mdyDate(weekly_goal_res?.adjustedEndDate) === date) {
                expiredGoalNotif(CLIENT, user_id, weekly_goal_res as WeeklyGoal)
            }    
        } 
    })
}