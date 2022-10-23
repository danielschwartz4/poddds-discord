import { GoalType } from "../types/dbTypes";
import { Event } from "../entities/Event";
import { In, IsNull } from "typeorm";

export const readActiveEvent = (discordId: string, adjustedDate: string) => {
    return Event.find({ 
        where: {
            discordId,
            isActive: true,
            adjustedDate,
        }
    })
}

export const readActiveEventByType = (discordId: string, adjustedDate: string, type: GoalType) => {
    return Event.findOne({ 
        where: {
            discordId,
            isActive: true,
            adjustedDate,
            type
        }
    })
}

export const readActiveEvents = (discordId: string) => {
    return Event.find({
        where: { discordId, isActive: true },
    });
}

export const readActiveEventsByDateAndWeeklyGoalAndTimezone = (adjustedDate: string, goalIds: number[], timeZone: string) => {
    return Event.find({
        where: {
          adjustedDate,
          goalLeftChannelId: IsNull() || "",
          completed: false,
          isActive: true,
          goalId: In(goalIds),
          timeZone
        },
      });
}

export const readAllEventsByDateAndTimezone = (adjustedDate: string, timeZone: string) => {
    return Event.find({
        where: {
          adjustedDate,
          timeZone
        },
    });
    // might need to do a unique sort by id (limit 1 per id) and sort by goal id descending. otherwise overwritten goals may be caught as well
}

export const readAllCompletedEvents = () => {
    return Event.find({ where: { completed: true }})
}

export const updateEventToCompleted = ( discordId: string, adjustedDate: string, type: GoalType) => {
    return Event.update(
        { discordId, adjustedDate, isActive: true, type },
        { completed: true, goalLeftChannelId: "", isActive: false }
    );
}

export const updateEventToInactive = ( discordId: string, adjustedDate: string, type: GoalType) => {
    return Event.update(
        { discordId, adjustedDate, isActive: true, type },
        { isActive: false, goalLeftChannelId: "" }
    );
}

export const updateEventToInactiveByWeeklyGoal = ( weeklyGoalId: number) => {
    return Event.update(
        { goalId: weeklyGoalId },
        { isActive: false, goalLeftChannelId: "" }
    );
}


export const updateAllUserEventsToInactive = ( discordId: string) => {
    return Event.update({ discordId }, { isActive: false });
}

export const updateUserEventsToInactiveByType = ( discordId: string, type: GoalType) => {
    return Event.update({ discordId, type }, { isActive: false });
}

export const updateEventGoalLeftChannelId = (discordId: string, adjustedDate: string, goalLeftChannelId: string) => {
    return Event.update(
        { discordId, adjustedDate, isActive: true },
        { goalLeftChannelId }
    );
}