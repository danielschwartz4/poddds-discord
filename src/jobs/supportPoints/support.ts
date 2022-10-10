import { Role } from "discord.js";
import {
  CLIENT,
} from "../../constants";
import { GUILD } from "../discordScheduler";

export const checkForSupportTagOrReply = () => {
  CLIENT.on("messageCreate", async (msg) => {
    if (
      (msg.reference?.messageId || msg.mentions.members?.first())
    ) {
        const supporter_role_id = GUILD()?.roles.cache.find((r) => r.name === "supporter (1+ supports)");
        const user = await GUILD()?.members.fetch(msg.author.id);
        user?.roles.add(supporter_role_id as Role);
    }
  });
};
