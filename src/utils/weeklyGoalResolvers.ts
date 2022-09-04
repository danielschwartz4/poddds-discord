import { WeeklyGoal } from "../entities/WeeklyGoal";

export const readLastWeeklyGoal = async (
    discordId: string
) => {
    return await WeeklyGoal.findOne({
        where: {
            discordId: discordId,
            isActive: true,
        }
    })
}

export const updateWeeklyGoalStatusToInactive = async (
    discordId: string,
) => {
    return await WeeklyGoal.update(
        { discordId: discordId, isActive: true},
        { isActive: false }
    )
}