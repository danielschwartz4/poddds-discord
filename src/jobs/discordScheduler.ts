import { Guild } from "discord.js";
import cron from "node-cron";
import { readUser } from "../resolvers/user";
import { breakCommand } from "../commands/breakCommand";
import { exerciseGoalCommand } from "../commands/exerciseGoalCommand";
import { leavePodCommand } from "../commands/leavePodCommand";
import { studyGoalCommand } from "../commands/studyGoalCommand";
import { ADMIN_USER_IDS, CLIENT, LOCAL_TODAY, SERVER_ID, TODAY, __prod__ } from "../constants";
import { timeZoneOffsetDict } from "../utils/timeZoneUtil";
import { createBreak } from "./createBreak";
import { dailySummary } from "./dailySummary";
import { createGoal } from "./goal/createGoal";
import { createGoalReminder } from "./goal/createGoalReminder";
import { updateGoalsToday } from "./goalsLeftToday/updateGoalsToday";
import { updateGoalsYesterday } from "./goalsLeftToday/updateGoalsYesterday";
import { autoKickMember } from "./member/autoKickMember";
import { newMember } from "./member/newMember";
import { leavePod } from "./pod/leavePod";
import { reactToImages } from "./react/react";
import { routeBotDMs } from "./routeBotDMs";
require("dotenv").config();

async function discordBot() {
  CLIENT.on("ready", async () => {
    console.log("The client bot is ready!");
    console.log("EST LOCAL TIME RIGHT NOW TO CHECK: ", LOCAL_TODAY("-4")); // in EST
    const GUILD = CLIENT?.guilds.cache.get(SERVER_ID as string);

    // TEST, delete
    console.log("TESTING HERE")

    // Run our bot functions
    exerciseGoalCommand(GUILD as Guild);
    studyGoalCommand(GUILD as Guild);
    createGoal(GUILD as Guild);
    // Put breakCommand in createBreak and pass in timezone
    breakCommand(GUILD as Guild);
    createBreak();
    leavePodCommand(GUILD as Guild);
    leavePod(GUILD as Guild);
    reactToImages(GUILD as Guild);
    newMember();
    routeBotDMs();

    // addExistingMembers(client, SERVER_ID as string);

    // update every hour (give it one minute past for hour hand to update)
    cron.schedule("1 */1 * * *", async () => {
      createBreak(); // need to update TODAY var in break every hour

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
      await updateGoalsYesterday(GUILD as Guild, timeZoneIsUTCMidnight);
      await updateGoalsToday(GUILD as Guild, timeZoneIsUTCMidnight);
      await autoKickMember(timeZoneIsUTCMidnight, GUILD as Guild);
    });

    // update every day at 9am EST (-5), (EST + 4) 1pm UTC
    cron.schedule("0 13 */1 * *", () => {
      dailySummary();
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
