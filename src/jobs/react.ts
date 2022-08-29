// react with some emojis if there's an image

import { Client } from "discord.js";
import moment from "moment";
import { User } from "../entities/User";
import { Event } from "../entities/Event";

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
      const date_today = moment().format("l");
      const task = await Event.findOne({
        where: { discordId: msg.author.id, date: date_today },
      });
      if (task?.goalLeftChannelId) {
        let goal_left_channel = client.channels.cache.get(
          task.goalLeftChannelId
        );
        Event.update(
          { discordId: user_id, date: date_today },
          { completed: true, goalLeftChannelId: "" }
        );
        User.update({ discordId: user_id }, { misses: 0 });
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
