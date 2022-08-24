// react with some emojis if there's an image

import { Client } from "discord.js";
import { User } from "../entities/User";
import { IsNull, Not } from "typeorm";
import moment from "moment";
import { Task } from "../entities/Task";

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
      const date_today = moment().format('l')
      const task = await Task.findOne({ where: { discordId: msg.author.id, date: date_today }});
      if (task?.goalLeftChannelId) {
        let goal_left_channel = client.channels.cache.get(task.goalLeftChannelId);
        Task.update({ discordId: user_id, date: date_today }, { completed: true, goalLeftChannelId: undefined });
        goal_left_channel?.delete();
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
