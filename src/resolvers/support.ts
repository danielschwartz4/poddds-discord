import { Support } from "../entities/Support"

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
        { supportedToday: true, points}
    )
}