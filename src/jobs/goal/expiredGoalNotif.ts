import { TextChannel } from "discord.js";
import { GoalType } from "../..//types/dbTypes";
import { CLIENT } from "../../constants";
import { WeeklyGoal } from "../../entities/WeeklyGoal";
import { updateWeeklyGoalStatusToInactiveByType } from "../../resolvers/weeklyGoal";
import { readPodCategoryChannelsByType } from "../../utils/channelUtil";

export const expiredGoalNotif = async (
  discordId: string,
  type: GoalType,
  weekly_goal: WeeklyGoal,
) => {
  if (!weekly_goal) return
  var Difference_In_Time = weekly_goal.adjustedEndDate.getTime() - weekly_goal.adjustedStartDate.getTime();
  var Difference_In_Days = Difference_In_Time / (1000 * 3600 * 24);

  const categoryChannels = await readPodCategoryChannelsByType(discordId, type)

  // find the self promo channel and post in there
  let selfPromoChannel: string;
  categoryChannels?.forEach(async (channel) => {
    if (channel.name === '🔥wins') {
      selfPromoChannel = channel.id

      let msg = await (
        CLIENT.channels.cache.get(selfPromoChannel) as TextChannel
      ).send(
        "🎉 " +
          `<@${discordId}>` +
          " has finished their **" +
          Difference_In_Days +
          " days goal!** 🎉\n" +
          "🚧 **Goal:** " +
          weekly_goal?.description +
          "\n🖼 **Evidence:** " +
          weekly_goal?.evidence
      );
      msg.react("🔥");

      updateWeeklyGoalStatusToInactiveByType(discordId, type);
    }
  })

  
};
