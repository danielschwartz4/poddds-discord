import { PermissionsBitField } from "discord.js"
import { GUILD } from "../jobs/discordScheduler"
import { readAllCompletedEvents } from "../resolvers/event"
import { createVoiceChannel, readChannelByName } from "../utils/channelUtil"

export const displayGoalCompletionCount = async () => {
    let displayChannelName = "Total Completions: "
    const goalsCompletedChannel = readChannelByName(displayChannelName)
    if (goalsCompletedChannel) {
        goalsCompletedChannel.delete()
    }

    const mod_role_id = GUILD()?.roles.cache.find((r) => r.name === "mod");
    const everyone_role_id = GUILD()?.roles.cache.find((r) => r.name === "@everyone");
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
    const numActiveGoals = await readAllCompletedEvents()
    displayChannelName += numActiveGoals.length
    createVoiceChannel(displayChannelName, channel_permission_overwrites, 3)
}