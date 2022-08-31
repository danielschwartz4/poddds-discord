import DiscordJS, { GatewayIntentBits } from "discord.js";
import cron from "node-cron";
import { goalCommand } from "../commands/goalCommand";
import { __prod__ } from "../constants";
import { timeZoneOffsetDict } from "../utils/timeZoneUtil";
import { addExistingMembers } from "./addExistingMembers";
import { createGoal } from "./createGoal";
import { newMember } from "./newMember";
import { reactToImages } from "./react";
import { updateGoalsToday } from "./updateGoalsToday";
require("dotenv").config();

async function discordBot() {
  // NOTE: Ensure that you invite the bot to every channel or make them admin
  const SERVER_ID = !__prod__
    ? process.env.TEST_SERVER_ID
    : process.env.PROD_SERVER_ID;
  const DAILY_UPDATES_CHAT_CHANNEL_ID = !__prod__
    ? process.env.TEST_DAILY_UPDATES_CHAT_CHANNEL_ID
    : process.env.PROD_DAILY_UPDATES_CHAT_CHANNEL_ID;
  // const WEEKLY_GOALS_SETTING_CHANNEL_ID = !__prod__
  //   ? process.env.TEST_WEEKLY_GOALS_SETTING_CHANNEL_ID
  //   : process.env.PROD_WEEKLY_GOALS_SETTING_CHANNEL_ID;
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
    goalCommand(client, SERVER_ID as string);
    createGoal(client, ADMIN_USER_IDS, SERVER_ID as string);
    addExistingMembers(client, SERVER_ID as string);
    reactToImages(client, DAILY_UPDATES_CHAT_CHANNEL_ID as string);
    newMember(client);

    // update streaks daily from database numbers using cron, everyday @ midnight
    const gmt0Hours = new Date().getUTCHours();
    const timeZoneIsUTCMidnight = timeZoneOffsetDict[gmt0Hours];

    updateGoalsToday(
      client,
      SERVER_ID as string,
      DAILY_UPDATES_CHAT_CHANNEL_ID as string,
      timeZoneIsUTCMidnight
    );
    cron.schedule("0 */1 * * *", async () => {
      const gmt0Hours = new Date().getUTCHours();
      const timeZoneIsUTCMidnight = timeZoneOffsetDict[gmt0Hours];

      updateGoalsToday(
        client,
        SERVER_ID as string,
        DAILY_UPDATES_CHAT_CHANNEL_ID as string,
        timeZoneIsUTCMidnight
      );
      // updateStreaks(
      //   client,
      //   SERVER_ID as string,
      //   DAILY_UPDATES_CHAT_CHANNEL_ID as string
      // );
    });
  });

  if (__prod__) {
    client.login(process.env.PROD_DISCORD_TOKEN);
  } else {
    client.login(process.env.TEST_DISCORD_TOKEN);
  }
}

export default discordBot;
