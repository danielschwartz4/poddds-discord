import { DMChannel } from "discord.js";
import { botDMNotification } from "../../utils/adminNotifs";
import { CLIENT } from "../../constants";

export const routeBotDMs = () => {
  // route DMs TO and FROM bot to admins
  CLIENT.on("messageCreate", async (msg) => {
    if (!msg.author.bot && msg.guildId === null) {
      botDMNotification(msg.author.username, msg.content);
      setTimeout(() => {
        msg.react("👍");
      }, 1000 * 3);

      // if the bot sent something, notify the admins
    } else if (
      msg.author.bot &&
      msg.guildId === null &&
      !msg.content.includes("poddds bot DM message") && // do not route messages from admins to poddds bot back to admins
      !msg.content.includes("Hey! ⌚ Automatic weekly reminder from poddds mod here to") // do not route messages of goal creation reminders back to admins
    ) {
      const DM_channel = (await CLIENT.channels.fetch(
        msg.channelId
      )) as DMChannel;
      const DM_user = await CLIENT.users.fetch(DM_channel.recipientId);
      const DM_username = DM_user.username;
      botDMNotification(DM_username, msg.content);
    }
  });
};
