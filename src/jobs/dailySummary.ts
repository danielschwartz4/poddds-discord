import { Client, TextChannel } from "discord.js";
import AppDataSource from "../dataSource";
import { WeeklyGoal } from "../entities/WeeklyGoal";
require("dotenv").config();

export const dailySummary = async (client: Client) => {
  // const activeGoals = await WeeklyGoal.find({
  //   where: {
  //     isActive: true,
  //   },
  // });
  const qb = AppDataSource.getRepository(WeeklyGoal)
    .createQueryBuilder("g")
    .innerJoinAndSelect("g.user", "u", 'u.id=g."userId"')
    .orderBy("g.misses", "DESC")
    .where('g."isActive" = true');
  const activeGoals = await qb.getMany();
  console.log("IN DAILY SUMMARY");
  console.log(activeGoals);

  let channel = client.channels.cache.get(
    process.env.TEST_DAILY_UPDATES_CHAT_CHANNEL_ID as string
  ) as TextChannel;
  channel.send(buildSummary(activeGoals));
};

const buildSummary = (activeGoals: WeeklyGoal[]) => {
  let res = "";
  activeGoals.forEach((goal: WeeklyGoal) => {
    res += `<@${goal.discordId}>` + ": " + missesMap(goal.misses) + "\n";
  });
  res +=
    "\n" +
    "Hey everyone! Each day we will send out a progress update. \
🟩 = on track! 🟨 = missed update yesterday 🟥 = complete your next objective or note in the skip channel that it’s an off day so your role doesn’t change to “kicked”!";

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
