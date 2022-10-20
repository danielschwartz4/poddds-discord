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
    if ( ((msgCategoryChannel?.name.includes("fitness") || msgCategoryChannel?.name.includes("study")) && (msg.reference?.messageId || msg.mentions.members?.first()) 
      || msgChannel?.name.includes("feedback")) 
      && !msg.author.bot
    ) {
        const userId = msg.author.id
        const user = await GUILD()?.members.fetch(msg.author.id);
        // 1. check if they already supported today
        const userSupport = await readSupport(userId)

        console.log("SUPPORT ROLE ID", ROLE_IDS()['supportRoleId'])

        // 2. if alreadySupportedToday = False
        if (userSupport && !userSupport.supportedToday) {
          // 3. supportPoints += 1
          const newSupportPoints = userSupport.points + 1
          
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
            
          }
        }

        

        // const supporter_role_id = GUILD()?.roles.cache.find((r) => r.name === "⭐ Supporter ⋮ 1+ Supports");
        // const user = await GUILD()?.members.fetch(msg.author.id);

        // // if the user is not already a supporter, let them know!
        // if (!user?.roles.cache.some((role) => role === supporter_role_id)) { 
          
        //   setTimeout(() => ephermeral_msg.delete(), 45000);

        //   user?.roles.add(supporter_role_id as Role);
        // } else if (!user) {
        //   console.log("tried adding a support but couldn't find user", msg.author)
        // }
    }
  });
};
