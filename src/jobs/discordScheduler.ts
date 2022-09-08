import DiscordJS, { GatewayIntentBits } from "discord.js";
import cron from "node-cron";
import { breakCommand } from "../commands/breakCommand";
import { goalCommand } from "../commands/goalCommand";
import { TODAY, __prod__ } from "../constants";
import { timeZoneOffsetDict } from "../utils/timeZoneUtil";
// import { addExistingMembers } from "./addExistingMembers";
import { autokick } from "./autokick";
import { createBreak } from "./createBreak";
import { createGoal } from "./createGoal";
import { createGoalReminder } from "./createGoalReminder";
import { dailySummary } from "./dailySummary";
import { newMember } from "./newMember";
import { reactToImages } from "./react";
import { updateGoalsToday } from "./updateGoalsToday";
// import { cleanActiveEvents } from "./cleanActiveEvents";
require("dotenv").config();

export const SERVER_ID = !__prod__
  ? process.env.TEST_SERVER_ID
  : process.env.PROD_SERVER_ID;

export const DAILY_UPDATES_CHAT_CHANNEL_ID = !__prod__
  ? process.env.TEST_DAILY_UPDATES_CHAT_CHANNEL_ID
  : process.env.PROD_DAILY_UPDATES_CHAT_CHANNEL_ID;

export const CLIENT = new DiscordJS.Client({
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

async function discordBot() {
  // NOTE: Ensure that you invite the bot to every channel or make them admin

  const ADMIN_USER_IDS = ["743590338337308754", "933066784867766342"]; // for updates

  CLIENT.on("ready", () => {
    console.log("The CLIENT bot is ready!");
    // migrateFromTaskDB()
    const guilds = CLIENT.guilds.cache.map((guild) => guild.id);
    console.log(guilds);

    goalCommand(CLIENT, SERVER_ID as string);
    createGoal(CLIENT, ADMIN_USER_IDS, SERVER_ID as string);
    breakCommand(CLIENT, SERVER_ID as string);
    createBreak(CLIENT, ADMIN_USER_IDS, SERVER_ID as string);

    // addExistingMembers(CLIENT, SERVER_ID as string);
    reactToImages(CLIENT, DAILY_UPDATES_CHAT_CHANNEL_ID as string);
    newMember(CLIENT);

    cron.schedule("*/10 * * * *", () => {
      console.log(
        "UPDATING EVERY 10 MINUTES TO GET CURRENT DATETIME: ",
        new Date()
      );
    });

    // update every hour
    cron.schedule("0 */1 * * *", async () => {
      const gmt0Hours = TODAY.getUTCHours();
      const timeZoneIsUTCMidnight = timeZoneOffsetDict[gmt0Hours];
      console.log(
        "UPDATING FOR timeZoneIsUTCMidnight: ",
        timeZoneIsUTCMidnight
      );
      updateGoalsToday(
        CLIENT,
        SERVER_ID as string,
        DAILY_UPDATES_CHAT_CHANNEL_ID as string,
        timeZoneIsUTCMidnight
      );
      autokick(CLIENT, SERVER_ID as string, timeZoneIsUTCMidnight);
      // updateStreaks(
      //   CLIENT,
      //   SERVER_ID as string,
      //   DAILY_UPDATES_CHAT_CHANNEL_ID as string
      // );
    });
    // dailySummary(CLIENT);
    // update every day at 9am EST, 1pm UTC
    dailySummary(CLIENT);
    cron.schedule("0 13 */1 * *", () => {
      console.log("LOGGING DAILY SUMMARY");
      dailySummary(CLIENT);
    });

    // update "At 00:00 on Sunday"
    cron.schedule("0 0 * * 0", () => {
      createGoalReminder(CLIENT);
    });
  });

  if (__prod__) {
    CLIENT.login(process.env.PROD_DISCORD_TOKEN);
  } else {
    CLIENT.login(process.env.TEST_DISCORD_TOKEN);
  }
}

export default discordBot;
