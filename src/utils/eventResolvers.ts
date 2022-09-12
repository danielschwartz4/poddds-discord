import { Event } from "../entities/Event";

export const readLastActiveUserEvent = async (
    discordId: string
) => {
    return await Event.findOne({
        where: {
            discordId: discordId,
            isActive: true,
        },
        order: {
            id: "DESC"
        }
    })
}