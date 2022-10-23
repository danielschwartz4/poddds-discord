import { TextChannel } from "discord.js";
import { CLIENT } from "../../constants";
import { readUser } from "../../resolvers/user";
import { GoalType } from "../../types/dbTypes";
import { readPodGoalsLeftTodayCategoryChannelByPodId } from "../../utils/channelUtil";
import { GUILD } from "../discordScheduler";

export const deleteGoalLeftTodayChannel = async (podId: number, podType: GoalType, userId: string) => {
    let goalsLeftCategoryChannel = await readPodGoalsLeftTodayCategoryChannelByPodId(podId, podType);
    const goalsLeftChannels = GUILD()?.channels.cache.filter(c => c.parentId === goalsLeftCategoryChannel?.id)
    
    const user = await readUser(userId)

    // if the username is found in goals left today as a channel, delete it
    const userChannels = goalsLeftChannels?.filter(c => c.name === user?.discordUsername.toLowerCase())
    userChannels?.forEach((channel) => {
        setTimeout(() => {
            channel?.delete();
        }, 1000 * 3);
    })
}

export const deleteGoalLeftTodayChannelByChannelId = async (channelId: string, userId: string) => {
    const channel = CLIENT.channels.cache.get(channelId) as TextChannel;
  
    const podType = channel?.parent?.name.includes("💪")
        ? "fitness"
        : "study";
    const podId = parseInt(channel?.parent?.name.split(" ").pop() as string);

    let goalsLeftCategoryChannel = await readPodGoalsLeftTodayCategoryChannelByPodId(podId, podType);
    const goalsLeftChannels = GUILD()?.channels.cache.filter(c => c.parentId === goalsLeftCategoryChannel?.id)
    
    const user = await readUser(userId)

    // if the username is found in goals left today as a channel, delete it
    const userChannels = goalsLeftChannels?.filter(c => c.name === user?.discordUsername.toLowerCase())
    userChannels?.forEach((channel) => {
        setTimeout(() => {
            channel?.delete();
        }, 1000 * 3);
    })
}