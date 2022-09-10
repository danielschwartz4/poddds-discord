import DiscordJS, { GatewayIntentBits } from "discord.js";
import cron from "node-cron";
import { breakCommand } from "../commands/breakCommand";
import { goalCommand } from "../commands/goalCommand";
import { LOCAL_TODAY, TODAY, __prod__ } from "../constants";
import { timeZoneOffsetDict } from "../utils/timeZoneUtil";
import { autokick } from "./autokick";
import { createBreak } from "./createBreak";
import { createGoal } from "./createGoal";
import { createGoalReminder } from "./createGoalReminder";
import { dailySummary } from "./dailySummary";
import { newMember } from "./newMember";
import { reactToImages } from "./react";
import { updateGoalsToday } from "./updateGoalsToday";
require("dotenv").config();

// NOTE: Ensure that you invite the bot to every channel or make them admin
export const SERVER_ID = !__prod__
  ? process.env.TEST_SERVER_ID
  : process.env.PROD_SERVER_ID;
export const DAILY_UPDATES_CHAT_CHANNEL_ID = !__prod__
  ? process.env.TEST_DAILY_UPDATES_CHAT_CHANNEL_ID
  : process.env.PROD_DAILY_UPDATES_CHAT_CHANNEL_ID;
export const ADMIN_USER_IDS = ["743590338337308754", "933066784867766342"]; // for updates

// Add discord
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
  CLIENT.on("ready", () => {
    console.log("The client bot is ready!");
    console.log("LOCAL TIME RIGHT NOW: ", LOCAL_TODAY("-4")) // in EST
    // migrateFromTaskDB()
    const guilds = CLIENT.guilds.cache.map((guild) => guild.id);
    console.log(guilds);

    goalCommand(CLIENT, SERVER_ID as string);
    createGoal(CLIENT, ADMIN_USER_IDS, SERVER_ID as string);
    breakCommand(CLIENT, SERVER_ID as string);
    createBreak(CLIENT);
    // addExistingMembers(client, SERVER_ID as string);
    reactToImages(CLIENT, DAILY_UPDATES_CHAT_CHANNEL_ID as string);
    newMember(CLIENT);

    // update streaks daily from database numbers using cron, everyday @ midnight
    // cleanActiveEvents()
    // updateGoalsToday(
    //   client,
    //   SERVER_ID as string,
    //   DAILY_UPDATES_CHAT_CHANNEL_ID as string
    // );

    // update every hour (give it one minute past for hour hand to update)
    cron.schedule("1 */1 * * *", async () => {
      const gmt0Hours = TODAY().getUTCHours();
      const timeZoneIsUTCMidnight = timeZoneOffsetDict[gmt0Hours];
      
      console.log(
        "UPDATING GOALS LEFT TODAY FOR TIME ZONE: ",
        timeZoneIsUTCMidnight,
        " AND GMT0HOURS IS: ",
        gmt0Hours,
        " WITH CURRENT TIME: ",
        new Date(),
        " AND TODAY AS: ",
        TODAY()
      );
      updateGoalsToday(
        CLIENT,
        SERVER_ID as string,
        DAILY_UPDATES_CHAT_CHANNEL_ID as string,
        timeZoneIsUTCMidnight
      );
      autokick(CLIENT, SERVER_ID as string, timeZoneIsUTCMidnight);
      // updateStreaks(
      //   client,
      //   SERVER_ID as string,
      //   DAILY_UPDATES_CHAT_CHANNEL_ID as string
      // );
    });

      
    // update every day at 9am EST (-5), (EST + 4) 1pm UTC
    cron.schedule("0 13 */1 * *", () => {
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
