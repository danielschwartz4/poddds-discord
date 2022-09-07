import { WeeklyGoal } from "../entities/WeeklyGoal";
import { Event } from "../entities/Event";
import { TODAY } from "../constants";
import { addDays, mdyDate } from "../utils/timeZoneUtil";

export const cleanActiveEvents = async () => {
    let allActiveGoals = await Event.find({ where: { isActive: true }, order: { id: "DESC" }})
    // let checkedGoalIds: number[] = [];
    // let checkedGoalDate: string[] = [];

    
    // if the event's weekly goal is not active, set the event to not active
    allActiveGoals.forEach(async (active_goal: Event) => {
        let weeklyGoalMatch = await WeeklyGoal.findOne({ where: { id: active_goal.goalId}})
        if (!weeklyGoalMatch || !weeklyGoalMatch?.isActive) {
            await Event.update({ id: active_goal.id }, { isActive: false })

        }
    })

    // // remove duplicates
    // let duplicatesIds: number[] = [];
    // allActiveGoals.forEach((active_goal: Event) => {
    //     if (active_goal.isActive) {
    //         if (checkedGoalIds.includes(active_goal.goalId) && checkedGoalDate.includes(active_goal.adjustedDate)) {
    //             // console.log("THIS ACTIVE GOAL IS A DUPLICATE, event id: " + active_goal.id)
    //             duplicatesIds.push(active_goal.id)
    //         } else {
    //             // catch duplicates
    //             checkedGoalIds.push(active_goal.goalId)
    //             checkedGoalDate.push(active_goal.adjustedDate)
    //         }
    //     }
    // })
    // duplicatesIds.forEach(async (goalId: number) => {
    //     await Event.update({ id: goalId }, { isActive: false })
    // })

    // ENSURE THAT ALL WEEKLY GOALS HAVE ONE ACTIVE EVENT IN CASE ITS MARKED AS FALSE
    // update not completed events today or after with isActive = false with highest id
    let dates_array = []
    for (let i = 0; i <= 28; i++) {
        const date = addDays(TODAY, i);
        const formattedDate = mdyDate(date);
        dates_array.push(formattedDate)
    }

    let allActiveWeeklyGoals = await WeeklyGoal.find({ where: { isActive: true }, order: { id: "DESC" }})
    dates_array.forEach((date: string) => {
        allActiveWeeklyGoals.forEach(async (active_weekly_goal: WeeklyGoal) => {
            // update top events based on date and active weekly goal id to true
            let mostRecentEventForWeeklyGoal = await Event.findOne({where: { adjustedDate: date, goalId: active_weekly_goal.id}, order: { id: "DESC" }})
            if (mostRecentEventForWeeklyGoal) {
                if (!mostRecentEventForWeeklyGoal.isActive)
                await Event.update( { id: mostRecentEventForWeeklyGoal.id }, { isActive: true})
            }
        })
    })   
}