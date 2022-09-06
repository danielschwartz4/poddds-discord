import DiscordJS, { GatewayIntentBits } from "discord.js";
import { goalCommand } from "../commands/goalCommand";
import { TODAY, __prod__ } from "../constants";
import { timeZoneOffsetDict } from "../utils/timeZoneUtil";
import { addExistingMembers } from "./addExistingMembers";
import { createGoal } from "./createGoal";
import { newMember } from "./newMember";
import { reactToImages } from "./react";
import { updateGoalsToday } from "./updateGoalsToday";
import cron from "node-cron";
import { autokick } from "./autokick";
import { createGoalReminder } from "./createGoalReminder";
import { dailySummary } from "./dailySummary";
require("dotenv").config();

export const SERVER_ID = !__prod__
  ? process.env.TEST_SERVER_ID
  : process.env.PROD_SERVER_ID;

async function discordBot() {
  // NOTE: Ensure that you invite the bot to every channel or make them admin
  const DAILY_UPDATES_CHAT_CHANNEL_ID = !__prod__
    ? process.env.TEST_DAILY_UPDATES_CHAT_CHANNEL_ID
    : process.env.PROD_DAILY_UPDATES_CHAT_CHANNEL_ID;
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
    // migrateFromTaskDB()
    const guilds = client.guilds.cache.map((guild) => guild.id);
    console.log(guilds);

    goalCommand(client, SERVER_ID as string);
    createGoal(client, ADMIN_USER_IDS, SERVER_ID as string);
    addExistingMembers(client, SERVER_ID as string);
    reactToImages(client, DAILY_UPDATES_CHAT_CHANNEL_ID as string);
    newMember(client);

    // update streaks daily from database numbers using cron, everyday @ midnight

    updateGoalsToday(
      client,
      SERVER_ID as string,
      DAILY_UPDATES_CHAT_CHANNEL_ID as string
    );

    // update every hour
    cron.schedule("0 */1 * * *", async () => {
      const gmt0Hours = TODAY.getUTCHours();
      const timeZoneIsUTCMidnight = timeZoneOffsetDict[gmt0Hours];
      updateGoalsToday(
        client,
        SERVER_ID as string,
        DAILY_UPDATES_CHAT_CHANNEL_ID as string,
        timeZoneIsUTCMidnight
      );
      autokick(client, SERVER_ID as string, timeZoneIsUTCMidnight);
      // updateStreaks(
      //   client,
      //   SERVER_ID as string,
      //   DAILY_UPDATES_CHAT_CHANNEL_ID as string
      // );
    });

    // update every day at 7am EST
    cron.schedule("0 12 */1 * *", () => {
      dailySummary(client);
    });

    // update "At 00:00 on Sunday"
    cron.schedule("0 0 * * 0", () => {
      createGoalReminder(client);
    });
  });

  if (__prod__) {
    client.login(process.env.PROD_DISCORD_TOKEN);
  } else {
    client.login(process.env.TEST_DISCORD_TOKEN);
  }
}

export default discordBot;
