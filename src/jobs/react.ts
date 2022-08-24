// react with some emojis if there's an image

import { Client } from "discord.js";
import { User } from "../entities/User";
import { IsNull, Not } from "typeorm";

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
      const user = await User.findOne({ where: { discordId: msg.author.id }});
      if (user?.goalLeftChannelId) {
        let goal_left_channel = client.channels.cache.get(user.goalLeftChannelId);
        let parent_left_channel = client.channels.cache.get(goal_left_channel?.parentId);
        User.update({ discordId: user_id }, { goalLeftChannelId: undefined });
        goal_left_channel?.delete();

        const users_missed = await User.find({ where: {goalLeftChannelId: Not(undefined || IsNull())}});
        if (!users_missed.length) {
          console.log("deleting parent channel")
          parent_left_channel?.delete()
        }
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
