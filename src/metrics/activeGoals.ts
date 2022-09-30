import { Guild, PermissionsBitField } from "discord.js"
import { readAllActiveGoals } from "../resolvers/weeklyGoal"
import { createVoiceChannel, readChannelByName } from "../utils/channelUtil"

export const activeGoals = async (GUILD: Guild) => {
    let displayActiveGoalsChannelName = "Active Goals: "
    const activeGoalsChannel = readChannelByName(GUILD, displayActiveGoalsChannelName)
    if (activeGoalsChannel) {
        activeGoalsChannel.delete()
    }

    const mod_role_id = GUILD?.roles.cache.find((r) => r.name === "mod");
    const everyone_role_id = GUILD?.roles.cache.find((r) => r.name === "@everyone");
    const channel_permission_overwrites = [
        {
        id: mod_role_id?.id as string,
        allow: [PermissionsBitField.Flags.ViewChannel],
        },
        {
        id: everyone_role_id?.id as string,
        deny: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.Connect],
        },
    ];
    const numActiveGoals = await readAllActiveGoals()
    displayActiveGoalsChannelName += numActiveGoals.length
    createVoiceChannel(GUILD, displayActiveGoalsChannelName, channel_permission_overwrites, 2)
}