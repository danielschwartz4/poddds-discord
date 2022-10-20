import { Role, TextChannel } from "discord.js";
import { readSupport, updateSupportToComplete } from "../../resolvers/support";
import {
  CLIENT,
} from "../../constants";
import { GUILD, ROLE_IDS } from "../discordScheduler";

export const checkForSupportTagOrReply = () => {
  CLIENT.on("messageCreate", async (msg) => {
    const msgChannel = msg.guild?.channels.cache.get(msg.channelId);
    const msgCategoryChannel = msg.guild?.channels.cache.get(
      msgChannel?.parentId as string
    );
    console.log("a")
    if ( ((msgCategoryChannel?.name.includes("fitness") || msgCategoryChannel?.name.includes("study")) && (msg.reference?.messageId || msg.mentions.members?.first()) 
      || msgChannel?.name.includes("feedback")) 
      && !msg.author.bot
    ) {
      const userId = msg.author.id
      const user = await GUILD()?.members.fetch(msg.author.id);
      // 1. check if they already supported today
      const userSupport = await readSupport(userId)

      // 2. if alreadySupportedToday = False
      console.log("b")
      if (userSupport && !userSupport.supportedToday) {
        // 3. supportPoints += 1
        const newSupportPoints = userSupport.points + 1

        console.log("you now have support points = ", newSupportPoints)
        
        await updateSupportToComplete(userId, newSupportPoints)

        // 4. check if they earned any support levels
        let notifMessage;
        if (newSupportPoints === 1) {
          notifMessage = '🥳 you earned **1 support point** for today and unlocked the **⭐ Supporter ⋮ 1+ Supports role**! 🏋️‍♂️\n💪 earn another support point tomorrow by sending 1+ messages tagging/replying and supporting a podmate OR sending feedback in #🔁┆feedback! ➡'
          user?.roles.add(ROLE_IDS()['supportRoleId'] as Role);
        } else if (newSupportPoints === 5) { 
          notifMessage = '🥳 you earned **1 support point** for today and unlocked the **💫 Supporter+ ⋮ 5+ Supports⭐ role**! 🏋️‍♂️\n💪 earn another support point tomorrow by sending 1+ messages tagging/replying and supporting a podmate OR sending feedback in #🔁┆feedback! ➡'
          user?.roles.add(ROLE_IDS()['supportPlusRoleId'] as Role);
        } else if (newSupportPoints === 10) { 
          notifMessage = '🥳 you earned **1 support point** for today and unlocked the **🔆Pre-Champ ⋮ 10+ Supports⭐⭐ role**! 🏋️‍♂️\n💪 earn another support point tomorrow by sending 1+ messages tagging/replying and supporting a podmate OR sending feedback in #🔁┆feedback! ➡'
          user?.roles.add(ROLE_IDS()['preChampRoleId'] as Role);
        } else if (newSupportPoints === 14) { 
          notifMessage = '🥳 you earned **1 support point** for today and unlocked the **👑 Champ ⋮ 14+ Supports⭐⭐ role**! 🏋️‍♂️\n💪 earn another support point tomorrow by sending 1+ messages tagging/replying and supporting a podmate OR sending feedback in #🔁┆feedback! ➡'
          user?.roles.add(ROLE_IDS()['champRoleId'] as Role);
        } else if (newSupportPoints === 30) { 
          notifMessage = '🥳 you earned **1 support point** for today and unlocked the **🔱 Legend ⋮ 30+ Supports⭐⭐⭐ role**! 🏋️‍♂️\n💪 earn another support point tomorrow by sending 1+ messages tagging/replying and supporting a podmate OR sending feedback in #🔁┆feedback! ➡'
          user?.roles.add(ROLE_IDS()['legendRoleId'] as Role);
        } else if (newSupportPoints === 100) { 
          notifMessage = '🥳 you earned **1 support point** for today and unlocked the **🔮 Life Changer ⋮ 100+ Supports✨ role**! 🏋️‍♂️\n💪 earn another support point tomorrow by sending 1+ messages tagging/replying and supporting a podmate OR sending feedback in #🔁┆feedback! ➡'
          user?.roles.add(ROLE_IDS()['lifeChangerRoleId'] as Role);
        }

        // 5. send them a message that they achieved this new role! maybe pub in wins?
        if (notifMessage) {
          let ephermeral_msg = await (CLIENT.channels.cache.get(msg.channelId) as TextChannel).send(
            "role unlocked! (temporary notification) \n" + `<@${msg.author.id}>` + notifMessage
          );
          setTimeout(() => ephermeral_msg.delete(), 60000);
        }
      }
    }
  });
};
