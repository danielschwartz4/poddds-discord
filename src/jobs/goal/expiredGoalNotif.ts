import { Guild, TextChannel } from "discord.js";
import { CLIENT } from "../../constants";
import { WeeklyGoal } from "../../entities/WeeklyGoal";
import { updateWeeklyGoalStatusToInactive } from "../../resolvers/weeklyGoal";

export const expiredGoalNotif = async (
  discordId: string,
  weekly_goal: WeeklyGoal,
  GUILD: Guild
) => {
  console.log("EXPIRED GOAL: ", weekly_goal);
  var Difference_In_Time =
    weekly_goal.adjustedEndDate.getTime() -
    weekly_goal.adjustedStartDate.getTime();
  // To calculate the no. of days between two dates
  var Difference_In_Days = Difference_In_Time / (1000 * 3600 * 24) + 1;

  let selfPromoChannel = GUILD?.channels.cache.find(
    (channel) => channel.name === "🔥self-promo"
  );

  let msg = await (
    CLIENT.channels.cache.get(selfPromoChannel?.id as string) as TextChannel
  ).send(
    "🎉 " +
      `<@${discordId}>` +
      " has finished their " +
      Difference_In_Days +
      " days goal! 🎉\n" +
      "🚧 Goal: " +
      weekly_goal?.description +
      "\n🖼 Evidence: " +
      weekly_goal?.evidence
  );
  msg.react("🔥");

  updateWeeklyGoalStatusToInactive(discordId);
};
