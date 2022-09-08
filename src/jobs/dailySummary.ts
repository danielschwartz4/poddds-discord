import { Client, TextChannel } from "discord.js";
import AppDataSource from "../dataSource";
import { WeeklyGoal } from "../entities/WeeklyGoal";
import { CLIENT, SERVER_ID } from "./discordScheduler";
// import { DAILY_UPDATES_CHAT_CHANNEL_ID } from "./discordScheduler";
require("dotenv").config();

export const dailySummary = async (client: Client) => {
  console.log("HERE");
  const qb = AppDataSource.getRepository(WeeklyGoal)
    .createQueryBuilder("g")
    .innerJoinAndSelect("g.user", "u", 'u.id=g."userId"')
    .orderBy("g.misses", "DESC")
    .where('g."isActive" = true');
  const activeGoals = await qb.getMany();
  console.log("IN DAILY SUMMARY");
  console.log(activeGoals);

  // hardcoding test-channel id
  // let channel = client.channels.cache.get("1017044471071912006") as TextChannel;
  let channel = client.channels.cache.get(
    process.env.TEST_DAILY_UPDATES_CHAT_CHANNEL_ID as string
  ) as TextChannel;

  console.log("AAAAA");
  const summary = await buildSummary(activeGoals);
  console.log(summary);
  channel.send(summary);
};

const buildSummary = async (activeGoals: WeeklyGoal[]) => {
  console.log("IN BUILD SUMMARY");
  let res = "";

  activeGoals.forEach(async (goal: WeeklyGoal) => {
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
