require("dotenv").config();
import DiscordJS, { GatewayIntentBits } from "discord.js";
import { newGoalAlert } from "./newGoal";
import { reactToImages } from "./react";
import updateStreaks from "./streak";
import { newMember } from "./newMember";
import { addExistingMembers } from "./addExistingMembers";
import { __prod__ } from "../constants";
import cron from "node-cron";
import { updateGoalsToday } from "./updateGoalsToday";

async function discordBot() {
  // NOTE: Ensure that you invite the bot to every channel or make them admin
  const SERVER_ID = !__prod__ ? process.env.TEST_SERVER_ID : process.env.PROD_SERVER_ID;
  const DAILY_UPDATES_CHAT_CHANNEL_ID = !__prod__ ? process.env.TEST_DAILY_UPDATES_CHAT_CHANNEL_ID : process.env.PROD_DAILY_UPDATES_CHAT_CHANNEL_ID;
  const WEEKLY_GOALS_SETTING_CHANNEL_ID = !__prod__ ? process.env.TEST_WEEKLY_GOALS_SETTING_CHANNEL_ID : process.env.PROD_WEEKLY_GOALS_SETTING_CHANNEL_ID;
  const ADMIN_USER_IDS = ["743590338337308754", "933066784867766342"]; // for updates

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
    addExistingMembers(client, SERVER_ID as string);
    newGoalAlert(
      client,
      WEEKLY_GOALS_SETTING_CHANNEL_ID as string,
      ADMIN_USER_IDS
    );
    reactToImages(client, DAILY_UPDATES_CHAT_CHANNEL_ID as string);
    newMember(client);

    // update streaks daily from database numbers using cron, everyday @ midnight
    updateGoalsToday(client, SERVER_ID as string, DAILY_UPDATES_CHAT_CHANNEL_ID as string);
    updateStreaks(
      client,
      SERVER_ID as string,
      DAILY_UPDATES_CHAT_CHANNEL_ID as string
    );
    cron.schedule("0 0 * * *", async () => {
      updateGoalsToday(client, SERVER_ID as string, DAILY_UPDATES_CHAT_CHANNEL_ID as string);
      updateStreaks(
        client,
        SERVER_ID as string,
        DAILY_UPDATES_CHAT_CHANNEL_ID as string
      );
    });
  });

  if (__prod__) {
    client.login(process.env.PROD_DISCORD_TOKEN);
  } else {
    client.login(process.env.TEST_DISCORD_TOKEN);
  }
}

export default discordBot;
