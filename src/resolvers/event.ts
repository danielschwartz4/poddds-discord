import { GoalType } from "../types/dbTypes";
import { Event } from "../entities/Event";

export const readActiveEvent = (discordId: string, adjustedDate: string) => {
    return Event.find({ 
        where: {
            discordId,
            isActive: true,
            adjustedDate
        }
    })
}

export const readActiveEvents = (discordId: string) => {
    return Event.find({
        where: { discordId, isActive: true },
    });
}

export const updateAllUserEventsToInactive = ( discordId: string) => {
    return Event.update({ discordId }, { isActive: false });
}

export const updateUserEventsToInactiveByType = ( discordId: string, type: GoalType) => {
    return Event.update({ discordId, type }, { isActive: false });
}