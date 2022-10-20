import { Support } from "../entities/Support"

export const createSupport = (userId: number, discordId: string) => {
    return Support.create({ userId, discordId }).save();
}

export const readSupport = (discordId: string) => {
    return Support.findOne({
        where: {
            discordId
        }
    })
}

export const updateSupportToComplete = (discordId: string, points: number) => {
    return Support.update(
        { discordId },
        // { supportedToday: false, points} // for testing
        { supportedToday: true, points}
    )
}