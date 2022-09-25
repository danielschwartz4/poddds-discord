import { DMChannel } from "discord.js";
import { ADMIN_USER_IDS, CLIENT } from "../constants";

export const routeBotDMs = () => {
  // route DMs TO and FROM bot to admins
  CLIENT.on("messageCreate", async (msg) => {
    if (!msg.author.bot && msg.guildId === null) {
      ADMIN_USER_IDS.forEach((val: string) => {
        CLIENT.users.fetch(val as string).then((user) => {
          user.send(
            "**poddds bot DM message FROM " +
              msg.author.username +
              ":**\n" +
              msg.content
          );
        });
      });
      setTimeout(() => {
        msg.react("👍");
      }, 1000 * 3);
    
    // if the bot sent something, notify the admins
    } else if (msg.author.bot && msg.guildId === null && !msg.content.includes('poddds bot DM message')) {
      const DM_channel = await CLIENT.channels.fetch(msg.channelId) as DMChannel
      const DM_user = await CLIENT.users.fetch(DM_channel.recipientId)
      const DM_username = DM_user.username
      ADMIN_USER_IDS.forEach((val: string) => {
        CLIENT.users.fetch(val as string).then((user) => {
          user.send(
            "**poddds bot DM message TO " +
              DM_username +
              ":**\n" +
              msg.content
          );
        });
      });
    }
  });
};
