import { PermissionsBitField } from "discord.js"
import { readAllUsers } from "../resolvers/user"
import { GUILD } from "../jobs/discordScheduler"
import { createVoiceChannel, readChannelByName } from "../utils/channelUtil"

export const displayRabidUsersCount = async () => {
    let displayChannelName = "Active Users for 4+ Weeks (Goal: 100): "
    const activeGoalsChannel = readChannelByName(displayChannelName)
    if (activeGoalsChannel) {
        activeGoalsChannel.delete()
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
    const allUsers = await readAllUsers()
    let count = 0

    for (const user of allUsers) {
        // calculate today - created at date
        let days = new Date().getTime() - user.createdAt.getTime()
        let weeks = days / (24*3600*1000*7)

        if (weeks >= 4) {
            console.log("USER HERE FOR 4+ WEEKS: ", user.discordUsername)
            count += 1
        }
    }

    displayChannelName += count
    createVoiceChannel(displayChannelName, channel_permission_overwrites, 1)
}