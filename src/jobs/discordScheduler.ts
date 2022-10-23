import cron from "node-cron";
import { goalCommand } from "../commands/goalCommand";
import { breakCommand } from "../commands/breakCommand";
import { leavePodCommand } from "../commands/leavePodCommand";
import { CLIENT, LOCAL_TODAY, SERVER_ID, TODAY, __prod__ } from "../constants";
import { createBreak } from "./break/createBreak";
import { dailySummary } from "./dailySummary";
import { createGoal } from "./goal/createGoal";
import { createGoalReminder } from "./goal/createGoalReminder";
import { updateGoalsToday } from "./goalsLeftToday/updateGoalsToday";
import { updateGoalsYesterday } from "./goalsLeftToday/updateGoalsYesterday";
import { autoKickMember } from "./member/autoKickMember";
import { newMember } from "./member/newMember";
import { routeBotDMs } from "./member/routeBotDMs";
import { leavePod } from "./pod/leavePod";
import { reactToImages } from "./react/react";
import { timeZoneOffsetDict } from "../utils/timeZoneUtil";
import { checkForSupportTagOrReply } from "./supportPoints/supportPoints";
import { displayRabidUsersCount } from "../metrics/rabidUsers";
require("dotenv").config();

export const GUILD = () => {
  return CLIENT?.guilds.cache.get(SERVER_ID as string);
};

export const ROLE_IDS = () => {
  const podmateRoleId = GUILD()?.roles.cache.find((r) => r.name === "🚀 podmate");
  const supportRoleId = GUILD()?.roles.cache.find((r) => r.name === "⭐ Supporter ⋮ 1+ Supports");
  const supportPlusRoleId = GUILD()?.roles.cache.find((r) => r.name === "💫 Supporter+ ⋮ 5+ Supports⭐");
  const preChampRoleId = GUILD()?.roles.cache.find((r) => r.name === "🔆Pre-Champ ⋮ 10+ Supports⭐⭐");
  const champRoleId = GUILD()?.roles.cache.find((r) => r.name === "👑 Champ ⋮ 14+ Supports⭐⭐");
  const legendRoleId = GUILD()?.roles.cache.find((r) => r.name === "🔱 Legend ⋮ 30+ Supports⭐⭐⭐");
  const lifeChangerRoleId = GUILD()?.roles.cache.find((r) => r.name === "🔮 Life Changer ⋮ 100+ Supports✨");
  
  return {
    'podmateRoleId' : podmateRoleId,
    'supportRoleId' : supportRoleId,
    'supportPlusRoleId' : supportPlusRoleId,
    'preChampRoleId' : preChampRoleId,
    'champRoleId' : champRoleId,
    'legendRoleId' : legendRoleId,
    'lifeChangerRoleId' : lifeChangerRoleId,
  }
}

async function discordBot() {
  CLIENT.on("ready", async () => {
    console.log("The client bot is ready!");
    console.log("EST LOCAL TIME RIGHT NOW TO CHECK: ", LOCAL_TODAY("-5")); // in EST

    // Run our bot functions
    GUILD();
    goalCommand();
    createGoal();
    breakCommand();
    createBreak();
    leavePodCommand();
    leavePod();
    reactToImages();
    newMember();
    routeBotDMs();
    checkForSupportTagOrReply();
    displayRabidUsersCount();

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
        new Date()
      );
      await updateGoalsYesterday(timeZoneIsUTCMidnight);
      await updateGoalsToday(timeZoneIsUTCMidnight);
      // await resetSupportPoints(timeZoneIsUTCMidnight); // cannot use yet because user table does not have timezone
      await autoKickMember(timeZoneIsUTCMidnight);

      // update metrics
      // displayActiveGoalsCount();
      // displayGoalCompletionCount();
    });

    // update every day at 9am EST (-5), (EST + 4) 1pm UTC
    cron.schedule("00 13 */1 * *", () => {
      dailySummary();
    });

    // update "At 00:00 on Sunday"
    cron.schedule("0 0 * * 0", () => {
      displayRabidUsersCount();
      createGoalReminder();
    });

    // update "At 00:00 on Thursday"
    cron.schedule("0 0 * * 4", () => {
      displayRabidUsersCount();
      createGoalReminder();
    });
  });

  if (__prod__) {
    CLIENT.login(process.env.PROD_DISCORD_TOKEN);
  } else {
    CLIENT.login(process.env.TEST_DISCORD_TOKEN);
  }
}

export default discordBot;
