import { Role, TextChannel } from "discord.js";
import {
  CLIENT,
} from "../../constants";
import { GUILD } from "../discordScheduler";

export const checkForSupportTagOrReply = () => {
  CLIENT.on("messageCreate", async (msg) => {
    const msgChannel = msg.guild?.channels.cache.get(msg.channelId);
    const msgCategoryChannel = msg.guild?.channels.cache.get(
      msgChannel?.parentId as string
    );
    if ( (msgCategoryChannel?.name.includes("fitness") || msgCategoryChannel?.name.includes("study")) &&
      (msg.reference?.messageId || msg.mentions.members?.first()) &&
      !msg.author.bot
    ) {
        const supporter_role_id = GUILD()?.roles.cache.find((r) => r.name === "⭐ Supporter ⋮ 1+ Supports");
        const user = await GUILD()?.members.fetch(msg.author.id);

        // if the user is not already a supporter, let them know!
        if (!user?.roles.cache.some((role) => role === supporter_role_id)) { 
          let ephermeral_msg = await (CLIENT.channels.cache.get(msg.channelId) as TextChannel).send(
            "role unlocked! (temporary notification) \n" +
            `<@${msg.author.id}>` +
              ' 🥳 you earned **1 support point** for today and unlocked the **@⭐ Supporter ⋮ 1+ Supports role**! 🏋️‍♂️\n💪 earn another support point tomorrow by sending 1+ messages tagging/replying and supporting a podmate! ➡'
          );
          setTimeout(() => ephermeral_msg.delete(), 45000);

          user?.roles.add(supporter_role_id as Role);
        } else if (!user) {
          console.log("tried adding a support but couldn't find user", msg.author)
        }
    }
  });
};
