require("dotenv").config();
import DiscordJS, { GatewayIntentBits, TextChannel } from "discord.js";

async function main() {
  // Add discord
  let interval;
  const client = new DiscordJS.Client({
    intents: [
      GatewayIntentBits.Guilds,
      GatewayIntentBits.GuildMessages,
      GatewayIntentBits.MessageContent,
    ],
  });

  client.on("messageCreate", async (msg) => {
    switch (msg.content) {
      //other commands above here...
      case "!eye":
        msg.channel.send("You are now subscribed to eye reminders.");
        interval = setInterval(function () {
          msg.channel
            .send("Please take an eye break now!")
            .catch(console.error);
        }, 3000); //every second
        break;
    }
  });

  client.login(
    "MTAxMDAxNDMwOTEzNDM3MjkyNA.GxePu4.gIauuOZqR9j8j3xhYvb_fRuC8t5OxIFCk9GgdY"
  );

  return "success";
}

main().catch((err) => console.log(err));

export default main;
