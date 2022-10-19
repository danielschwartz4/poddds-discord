import { EmbedBuilder } from "discord.js";
import { CLIENT } from "../../constants";

export const faq = () => {
    CLIENT.on("messageCreate", async (msg) => {
        const msgChannel = msg.guild?.channels.cache.get(msg.channelId);
        if (msgChannel?.name.includes("faq") && !msg.author.bot) {
            msg.channel.send({
                embeds: [new EmbedBuilder().setDescription('Hello, World!')]
            })
        }
    })
}