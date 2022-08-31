import { WeeklyGoal } from "../entities/WeeklyGoal";
import { Task } from "../entities/Task";
import { Event } from "../entities/Event";

export const migrateFromTaskDB = async () => {
    const tasks = await Task.find();

    // iterate through all users in taskDB
    tasks.forEach(async (task: Task) => {
        let weeklyGoalId = await WeeklyGoal.findOne({where: {discordId: task.discordId}})
        if (!weeklyGoalId) {
            // create weekly goal
            weeklyGoalId = await WeeklyGoal.create({
                discordId: task.discordId,
                isActive: true,
                description: task.description,
                goalLeftChannelId: task.goalLeftChannelId,
                misses: 0,
            })
        }
        
        let eventId = await Event.create({
            discordId: task.discordId,
            goalId: weeklyGoalId.id,
            adjustedDate: task.date,
            completed: task.completed,
            isActive: true,
            goalLeftChannelId: task.goalLeftChannelId
        })
    })
}