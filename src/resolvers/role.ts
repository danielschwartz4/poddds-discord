import { GuildMember, Role } from "discord.js";
import { GoalType } from "../types/dbTypes";

export const removeRole = (user: GuildMember, type: GoalType) => {
    if (type == 'fitness') {
        const fitnessRole = user.roles.cache.find((r) => r.name.includes('fitness'))
        user.roles.remove(fitnessRole as Role)
    } else if (type == 'study') {
        const studyRole = user.roles.cache.find((r) => r.name.includes('study'))
        user.roles.remove(studyRole as Role)
    }
}