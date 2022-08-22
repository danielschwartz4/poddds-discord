require("dotenv").config();
import DiscordJS, { GatewayIntentBits } from "discord.js";
import { newGoalAlert } from "./newGoal";
import { reactToImages } from "./reactToImages";
import cronScheduler from "./manageStreaks";
import { newMember } from "./newMember";

async function discordBot() {
  // NOTE: Ensure that you invite the bot to every channel or make them admin
  const SERVER_ID = "1011046440195330189";
  const DAILY_UPDATES_CHAT_CHANNEL_ID = "1011046708211359935";
  const WEEKLY_GOALS_SETTING_CHANNEL_ID = "1011047016886972447";
  const ADMIN_USER_IDS = ["743590338337308754"]; // for updates

  // Add discord
  const client = new DiscordJS.Client({
    intents: [
      GatewayIntentBits.Guilds,
      GatewayIntentBits.GuildMessages,
      GatewayIntentBits.MessageContent,
      GatewayIntentBits.GuildMembers,
      GatewayIntentBits.GuildPresences,
    ],
  });

  client.on("ready", () => {
    console.log("The client bot is ready!");
    newGoalAlert(client, WEEKLY_GOALS_SETTING_CHANNEL_ID, ADMIN_USER_IDS);
    reactToImages(client, DAILY_UPDATES_CHAT_CHANNEL_ID);
    cronScheduler(client, SERVER_ID);
    newMember(client);
  });

  client.login(process.env.DISCORD_TOKEN);
}

export default discordBot;
