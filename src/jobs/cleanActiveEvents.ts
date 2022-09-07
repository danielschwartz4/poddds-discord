import { WeeklyGoal } from "../entities/WeeklyGoal";
import { Event } from "../entities/Event";

export const cleanActiveEvents = async () => {
    let allActiveGoals = await Event.find({ where: { isActive: true }, order: { id: "DESC" }})
    let checkedGoalIds: number[] = [];
    let checkedGoalDate: string[] = [];
    // if the event's weekly goal is not active, set the event to not active
    allActiveGoals.forEach(async (active_goal: Event) => {
        let weeklyGoalMatch = await WeeklyGoal.findOne({ where: { id: active_goal.goalId}})
        if (!weeklyGoalMatch || !weeklyGoalMatch?.isActive) {
            console.log("THIS WEEKLY EVENT " + active_goal.id + " HAS A GOAL THAT ISN'T ACTIVE: " + active_goal.goalId)
            await Event.update({ id: active_goal.id }, { isActive: false })
        }
    })

    // remove duplicates
    let duplicatesIds: number[] = [];
    allActiveGoals.forEach((active_goal: Event) => {
        if (active_goal.isActive) {
            if (checkedGoalIds.includes(active_goal.goalId) && checkedGoalDate.includes(active_goal.adjustedDate)) {
                console.log("THIS ACTIVE GOAL IS A DUPLICATE, event id: " + active_goal.id)
                duplicatesIds.push(active_goal.id)
            } else {
                // catch duplicates
                checkedGoalIds.push(active_goal.goalId)
                checkedGoalDate.push(active_goal.adjustedDate)
            }
        }
    })
    duplicatesIds.forEach(async (goalId: number) => {
        await Event.update({ id: goalId }, { isActive: false })
    })
}