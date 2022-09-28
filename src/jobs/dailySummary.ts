import { Guild, TextChannel } from "discord.js";
import { CLIENT, LOCAL_TODAY } from "../constants";
import AppDataSource from "../dataSource";
import { changeTimeZone, mdyDate } from "../utils/timeZoneUtil";
import { WeeklyGoal } from "../entities/WeeklyGoal";
import { deactivateMember } from "./member/onMemberLeave";
import inspirational_quotes from "../utils/quotes.json";
import { readPodCategoryChannelsByPodId } from "../utils/channelUtil";
import { readActivePods } from "../resolvers/pod";
import { readWeeklyGoalByFitnessPodIdAndType, readWeeklyGoalByStudyPodIdAndType } from "../resolvers/weeklyGoal";
require("dotenv").config();

export const dailySummary = async (GUILD: Guild) => {
  // iterate through every pod
  const activePods = await readActivePods();

  for (const pod of activePods) {
    const podId = pod.id;
    const podType = pod.type;
    // get all active weekly goals for that pod id
    let podActiveWeeklyGoals: WeeklyGoal[] = []
    if (podType === 'fitness') {
      podActiveWeeklyGoals = await readWeeklyGoalByFitnessPodIdAndType(podId, podType)
      console.log("f", podId, podType, podActiveWeeklyGoals)
    } else if (podType === 'study') {
      podActiveWeeklyGoals = await readWeeklyGoalByStudyPodIdAndType(podId, podType)
      console.log("s", podId, podType, podActiveWeeklyGoals)
    }

    console.log(podId, podType, podActiveWeeklyGoals)
    // if there are active goals for the pod
    if (podActiveWeeklyGoals) {
      // send daily summary into daily chat updates for that pod id
      const categoryChannels = await readPodCategoryChannelsByPodId(podId, podType, GUILD);
      console.log("categoryChannels: ", categoryChannels)
      categoryChannels?.forEach(async (channel) => {
        const dailyUpdatesChannel = channel.id;
        if (channel.name === "🚩daily-updates-chat") {
          // hardcoding test-channel id
          let channel = CLIENT.channels.cache.get(
            dailyUpdatesChannel
          ) as TextChannel;
          channel.send((await buildSummary(podActiveWeeklyGoals)) as string);
          const daily_summary_description =
            "Hey everyone! Each day we will send out a progress update 🚩\n🟩 = on track! 🟨 = missed recent goal 🟥 = complete your next goal so your role doesn’t change to “kicked”!";
          channel.send(daily_summary_description);
        }
      });
    }
  }
};

const buildSummary = async (activeGoals: WeeklyGoal[]) => {
  // start with an inspirational quote
  const randomInt = (min: number, max: number) =>
    Math.floor(Math.random() * (max - min + 1) + min);
  const index = randomInt(0, inspirational_quotes.length); // random index to be used
  const quote_json = inspirational_quotes[index];
  const text = "*" + quote_json.text + "*";
  const author = quote_json.from.toUpperCase();
  const quote_to_send = text + "\n" + author + "\n\n";
  // channel.send(quote_to_send);

  let res = quote_to_send;

  for (const goal of activeGoals) {
    // if you can't find the user, don't post them
    await CLIENT.users.fetch(goal.discordId).catch((err) => {
      console.log("ERROR! Assuming user has left server", err);
      deactivateMember(goal.discordId);
    });

    // compute streaks here
    const LOCAL_TODAY_WITH_TIMEZONE = LOCAL_TODAY(goal.timeZone);
    const Difference_In_Time_From_Goal_Start =
      LOCAL_TODAY_WITH_TIMEZONE.getTime() - goal.adjustedStartDate.getTime();
    let streak_length =
      Math.round(Difference_In_Time_From_Goal_Start / (1000 * 3600 * 24)) - 1; // start date comes the day after
    console.log(
      "streak_length",
      streak_length,
      "LOCAL TODAY IS ",
      LOCAL_TODAY_WITH_TIMEZONE
    );

    const recently_missed_event = await AppDataSource.query(
      `
      SELECT * FROM event
      WHERE "goalId" = '${goal.id}'
      AND CAST("adjustedDate" AS date) < '${mdyDate(LOCAL_TODAY_WITH_TIMEZONE)}'
      AND "completed" = false
      AND "isActive" = true
      ORDER BY "id" DESC
      LIMIT 1
      `
    );

    if (recently_missed_event.length) {
      const missed_event_date = changeTimeZone(
        new Date(recently_missed_event[0].adjustedDate),
        goal.timeZone
      );
      const local_today = changeTimeZone(
        new Date(mdyDate(LOCAL_TODAY_WITH_TIMEZONE)),
        goal.timeZone
      );
      console.log(local_today, missed_event_date);
      const Difference_In_Time_Event =
        local_today.getTime() - missed_event_date.getTime();
      const Difference_In_Days_Event =
        Math.floor(Difference_In_Time_Event / (1000 * 3600 * 24)) - 1;
      console.log("Difference_In_Days_Event", Difference_In_Days_Event);
      streak_length = Math.min(streak_length, Difference_In_Days_Event);
    }

    console.log("STREAK FOR USER ", goal.discordId, " IS ", streak_length);
    // if (streak_length > 2) { // disabled streaks because people's ids for dates are probably still messed until October, might want to just create a column for streaks and track active events completed
    //   res += `<@${goal.discordId}>` + ": " + missesMap(goal.misses) + " 🔥**" + streak_length + "**\n";
    // } else {

    let misses = missesMap(goal.misses);
    if (misses === "🟩" || misses === "🟨" || misses === "🟥") {
      res += `<@${goal.discordId}>` + ": " + missesMap(goal.misses) + "\n";
    } else {
      console.log("MISSES IS UNDEFINED FOR USER ID: ", goal.discordId);
    }
    // }
  }
  //   res +=
  //     "\n" +
  //     "Hey everyone! Each day we will send out a progress update. \
  // 🟩 = on track! 🟨 = missed recent goal 🟥 = complete your next goal or note in the break channel so your role doesn’t change to “kicked”!";

  // console.log(res);
  return res;
};

const missesMap = (misses: number) => {
  const map: { [i: number]: string } = {
    0: "🟩",
    1: "🟨",
    2: "🟥",
  };
  return map[misses];
}