import DiscordJS, { GatewayIntentBits } from "discord.js";
import { __prod__ } from "../constants";
import { addExistingMembers } from "./addExistingMembers";
import { newGoalAlert } from "./newGoal";
import { newMember } from "./newMember";
import { reactToImages } from "./react";
import cronScheduler from "./streak";
import { goalCommand } from "../commands/goalCommand";
import { createGoal } from "./createGoal";
require("dotenv").config();

async function discordBot() {
  // NOTE: Ensure that you invite the bot to every channel or make them admin
  const SERVER_ID = !__prod__
    ? process.env.TEST_SERVER_ID
    : process.env.PROD_SERVER_ID;
  const DAILY_UPDATES_CHAT_CHANNEL_ID = !__prod__
    ? process.env.TEST_DAILY_UPDATES_CHAT_CHANNEL_ID
    : process.env.PROD_DAILY_UPDATES_CHAT_CHANNEL_ID;
  const WEEKLY_GOALS_SETTING_CHANNEL_ID = !__prod__
    ? process.env.TEST_WEEKLY_GOALS_SETTING_CHANNEL_ID
    : process.env.PROD_WEEKLY_GOALS_SETTING_CHANNEL_ID;
  const ADMIN_USER_IDS = ["743590338337308754", "933066784867766342"]; // for updates

  // Add discord
  const client = new DiscordJS.Client({
    intents: [
      GatewayIntentBits.Guilds,
      GatewayIntentBits.GuildMessages,
      GatewayIntentBits.MessageContent,
      GatewayIntentBits.GuildMembers,
      GatewayIntentBits.GuildPresences,
      GatewayIntentBits.GuildMessages,
      GatewayIntentBits.Guilds,
    ],
  });

  client.on("ready", () => {
    console.log("The client bot is ready!");
    goalCommand(client);
    createGoal(client);
    addExistingMembers(client, SERVER_ID as string);
    newGoalAlert(
      client,
      WEEKLY_GOALS_SETTING_CHANNEL_ID as string,
      ADMIN_USER_IDS
    );
    reactToImages(client, DAILY_UPDATES_CHAT_CHANNEL_ID as string);
    cronScheduler(
      client,
      SERVER_ID as string,
      DAILY_UPDATES_CHAT_CHANNEL_ID as string
    );
    newMember(client);
  });

  if (__prod__) {
    client.login(process.env.PROD_DISCORD_TOKEN);
  } else {
    client.login(process.env.TEST_DISCORD_TOKEN);
  }
}

export default discordBot;
