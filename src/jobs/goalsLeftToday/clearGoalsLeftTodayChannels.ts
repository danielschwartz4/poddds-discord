import { TextChannel } from "discord.js";
import { TODAY } from "../../constants";
import { GoalType } from "../../types/dbTypes";
import { readPodGoalsLeftTodayCategoryChannelByPodId } from "../../utils/channelUtil";
import { GUILD } from "../discordScheduler";

export const clearOldGoalsLeftTodayChannels = async (podId: number, podType: GoalType) => {
    let goalsLeftCategoryChannel = await readPodGoalsLeftTodayCategoryChannelByPodId(podId, podType);
    const goalsLeftChannels = GUILD()?.channels.cache.filter(c => c.parentId === goalsLeftCategoryChannel?.id)
    goalsLeftChannels?.forEach((guildChannel) => {
      let channel_id = guildChannel.id
      let channel = GUILD()?.channels.cache.filter(c => c.id === channel_id)
      let channel_text = channel?.get(channel_id) as TextChannel
      channel_text.messages.fetch({ limit: 1 }).then((msg) => {
        const msgTimestamp = msg.first()?.createdTimestamp
        if (msgTimestamp) {
          // difference is in milliseconds
          const days_elapsed = (TODAY().getTime() - msgTimestamp) / (1000 * 60 * 60 * 24)
          if (days_elapsed > 1) {
            guildChannel.delete()
            console.log("deleting channel that was here for 1+ days for ", guildChannel.name, " in pod ", podId)
          }
        }
      })
    })
}