import { TextChannel } from "discord.js";
import { CLIENT, DAILY_UPDATES_CHAT_CHANNEL_ID } from "../discordScheduler";

export const nudge = async (discordId : string) => {
    console.log("NUDGING", discordId)
    let msg = await (
        CLIENT.channels.cache.get(DAILY_UPDATES_CHAT_CHANNEL_ID as string) as TextChannel
    ).send(
    `<@${discordId}>` + ' 🎉 now support others in their journey! 🤝 \n1) tag (@) another podmate **AND** 🏋️‍♀️ \n2) check-in/reply back/comment about anything! \nex. "@mustang great work man!" ➡'
    );
    setTimeout(() => msg.delete(), 45000)
}