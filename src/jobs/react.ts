// react with some emojis if there's an image

import { Client } from "discord.js";
import { Event } from "../entities/Event";
import { WeeklyGoal } from "../entities/WeeklyGoal";
import { mdyDate, todayAdjusted } from "../utils/timeZoneUtil";

export const reactToImages = (
  client: Client<boolean>,
  daily_updates_channel_id: String
) => {
  client.on("messageCreate", async (msg) => {
    if (
      msg.attachments.size > 0 &&
      msg.channelId === daily_updates_channel_id
    ) {
      // delete goals left channel if the user has one
      const user_id = msg.author.id;
      // ! Should really be finding specific task
      const weekly_goal = await WeeklyGoal.findOne({
        where: { discordId: msg.author.id },
      });
      const date_today = mdyDate(
        todayAdjusted(weekly_goal?.timeZone as string)
      );
      const task = await Event.findOne({
        where: {
          discordId: msg.author.id,
          adjustedDate: date_today,
        },
      });
      if (task?.goalLeftChannelId) {
        let goal_left_channel = client.channels.cache.get(
          task.goalLeftChannelId
        );
        Event.update(
          { discordId: user_id, adjustedDate: date_today },
          { completed: true, goalLeftChannelId: "" }
        );
        WeeklyGoal.update({ discordId: user_id }, { misses: 0 });
        setTimeout(() => {
          goal_left_channel?.delete();
        }, 1000 * 3);
      }

      console.log("An attachment was added!");
      setTimeout(() => {
        msg.react("🔥");
      }, 1000 * 3);
      setTimeout(() => {
        msg.react("🙌");
      }, 1000 * 4);
      setTimeout(() => {
        msg.react("💯");
      }, 1000 * 5);
      setTimeout(() => {
        msg.react("💪");
      }, 1000 * 6);
    }
  });
};
