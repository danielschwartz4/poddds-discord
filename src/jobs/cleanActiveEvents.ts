import { WeeklyGoal } from "../entities/WeeklyGoal";
import { Event } from "../entities/Event";

export const cleanActiveEvents = async () => {
    console.log("CLEANING ACTIVE EVENTS!")
    let allActiveGoals = await Event.find({ where: { isActive: true }})
    console.log("HERE ARE THE ACTIVE EVENTS: ")
    console.log(allActiveGoals)

    // if the event's weekly goal is not active, set the event to not active
    allActiveGoals.forEach(async (active_goal: Event) => {
        let weeklyGoalMatch = await WeeklyGoal.findOne({ where: { id: active_goal.goalId}})
        if (!weeklyGoalMatch || !weeklyGoalMatch?.isActive) {
            await Event.update({ id: active_goal.id }, { isActive: false })
        }
    })
}