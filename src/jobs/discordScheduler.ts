import DiscordJS, { GatewayIntentBits } from "discord.js";
import cron from "node-cron";
import { goalCommand } from "../commands/goalCommand";
import { TODAY, __prod__ } from "../constants";
import { timeZoneOffsetDict } from "../utils/timeZoneUtil";
// import { addExistingMembers } from "./addExistingMembers";
import { autokick } from "./autokick";
import { createGoal } from "./createGoal";
import { createGoalReminder } from "./createGoalReminder";
import { dailySummary } from "./dailySummary";
import { newMember } from "./newMember";
import { reactToImages } from "./react";
import { updateGoalsToday } from "./updateGoalsToday";
// import { cleanActiveEvents } from "./cleanActiveEvents";
require("dotenv").config();

// NOTE: Ensure that you invite the bot to every channel or make them admin
export const SERVER_ID = !__prod__
  ? process.env.TEST_SERVER_ID
  : process.env.PROD_SERVER_ID;
export const DAILY_UPDATES_CHAT_CHANNEL_ID = !__prod__
    ? process.env.TEST_DAILY_UPDATES_CHAT_CHANNEL_ID
    : process.env.PROD_DAILY_UPDATES_CHAT_CHANNEL_ID;
export const ADMIN_USER_IDS = ["743590338337308754", "933066784867766342"]; // for updates

async function discordBot() {
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
    // addExistingMembers(client, SERVER_ID as string);
    reactToImages(client, DAILY_UPDATES_CHAT_CHANNEL_ID as string);
    newMember(client);

    // update streaks daily from database numbers using cron, everyday @ midnight
    // cleanActiveEvents()
    // updateGoalsToday(
    //   client,
    //   SERVER_ID as string,
    //   DAILY_UPDATES_CHAT_CHANNEL_ID as string
    // );

    cron.schedule("*/10 * * * *", () => {
      console.log("UPDATING EVERY 10 MINUTES TO GET CURRENT DATETIME: ", new Date())
    })

    // update every hour
    cron.schedule("0 */1 * * *", async () => {
      const gmt0Hours = TODAY.getUTCHours();
      const timeZoneIsUTCMidnight = timeZoneOffsetDict[gmt0Hours];
      console.log("UPDATING FOR timeZoneIsUTCMidnight: ", timeZoneIsUTCMidnight);
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

    // update every day at 9am EST, 1pm UTC
    cron.schedule("0 13 */1 * *", () => {
      console.log("LOGGING DAILY SUMMARY");
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
