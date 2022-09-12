import { Client, TextChannel } from "discord.js";
import { WeeklyGoal } from "../entities/WeeklyGoal";
import { DAILY_UPDATES_CHAT_CHANNEL_ID } from "./discordScheduler";
// import { DAILY_UPDATES_CHAT_CHANNEL_ID } from "./discordScheduler";
require("dotenv").config();

export const dailySummary = async (client: Client) => {
  const activeGoals = await WeeklyGoal.find({
    where: {
      isActive: true,
    },
    order: {
      misses: {
        direction: "DESC",
      },
    },
  });

  // hardcoding test-channel id
  let channel = client.channels.cache.get(
    DAILY_UPDATES_CHAT_CHANNEL_ID as string
  ) as TextChannel;
  channel.send(buildSummary(activeGoals));
};

const buildSummary = (activeGoals: WeeklyGoal[]) => {
  console.log("IN BUILD SUMMARY");
  let res = "";

  activeGoals.forEach((goal: WeeklyGoal) => {
    // const guild = CLIENT.guilds.cache.get(SERVER_ID as string);
    // const user = await guild?.members?.fetch(goal.discordId);
    // if (user?.roles?.cache?.some((role) => role.name === "podmate")) {
    //   console.log("ADDING USER GOAL: " + goal.discordId);
    //   res += `<@${goal.discordId}>` + ": " + missesMap(goal.misses) + "\n";
    // }
    res += `<@${goal.discordId}>` + ": " + missesMap(goal.misses) + "\n";
  });
  res +=
    "\n" +
    "Hey everyone! Each day we will send out a progress update. \
🟩 = on track! 🟨 = missed update yesterday 🟥 = complete your next objective or note in the skip channel that it’s an off day so your role doesn’t change to “kicked”!";

  console.log(res);
  return res;
};

const missesMap = (misses: number) => {
  const map: { [i: number]: string } = {
    0: "🟩",
    1: "🟨",
    2: "🟥",
  };
  return map[misses];
};
