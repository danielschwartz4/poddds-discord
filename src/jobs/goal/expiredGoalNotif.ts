import { Guild, TextChannel } from "discord.js";
import { readUser } from "../../resolvers/user";
import { GoalType } from "../..//types/dbTypes";
import { CLIENT } from "../../constants";
import { WeeklyGoal } from "../../entities/WeeklyGoal";
import { updateWeeklyGoalStatusToInactiveByType } from "../../resolvers/weeklyGoal";

export const expiredGoalNotif = async (
  discordId: string,
  GUILD: Guild,
  type: GoalType,
  weekly_goal: WeeklyGoal,
) => {
  if (!weekly_goal) return
  console.log("EXPIRED GOAL: ", weekly_goal);
  var Difference_In_Time = weekly_goal.adjustedEndDate.getTime() - weekly_goal.adjustedStartDate.getTime();
  var Difference_In_Days = Difference_In_Time / (1000 * 3600 * 24);

  const userObject = await readUser(discordId)
  console.log(userObject, type)
  let podName: string;
  if (type === 'exercise') {
    podName = "--- 💪 exercise pod " + userObject?.exercisePodId
  } else if (type === 'study') {
    podName = "--- 📚 study pod " + userObject?.studyPodId
  }
  if (!type) return
  const userPodCategoryChannel = GUILD?.channels.cache.find((channel) => channel.name === podName)
  const categoryChannels = GUILD.channels.cache.filter(c => c.parentId === userPodCategoryChannel?.id)

  // find the self promo channel and post in there
  let selfPromoChannel: string;
  categoryChannels.forEach(async (channel) => {
    if (channel.name === '🔥self-promo') {
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
