import { CLIENT, TODAY } from "../constants";
import { WeeklyGoal } from "../entities/WeeklyGoal";
import inspirational_quotes from "../utils/quotes.json";
import { readActivePods } from "../resolvers/pod";
import {
  readWeeklyGoalByFitnessPodIdAndType,
  readWeeklyGoalByStudyPodIdAndType,
  updateWeeklyGoalStatusToInactive,
} from "../resolvers/weeklyGoal";
import { GUILD, ROLE_IDS } from "./discordScheduler";
import { deactivateMember } from "./member/onMemberLeave";
import { readSupport } from "../resolvers/support";
import { readPodCategoryChannelsByPodId } from "../utils/channelUtil";
import { TextChannel } from "discord.js";
import { updateEventToInactiveByWeeklyGoal } from "../resolvers/event";
require("dotenv").config();

export const dailySummary = async () => {
  // iterate through every pod
  const activePods = await readActivePods();

  for (const pod of activePods) {
    const podId = pod.id;
    const podType = pod.type;

    // get all active weekly goals for that pod id
    let podActiveWeeklyGoals: WeeklyGoal[] = [];
    if (podType === "fitness") {
      podActiveWeeklyGoals = await readWeeklyGoalByFitnessPodIdAndType(
        podId,
        podType
      );
    } else if (podType === "study") {
      podActiveWeeklyGoals = await readWeeklyGoalByStudyPodIdAndType(
        podId,
        podType
      );
    }

    // if there are active goals for the pod
    if (podActiveWeeklyGoals) {
      // ensure all pod active weekly goals end dates have not passed yet, if they have, set the goal to inactive
      let tempWeeklyGoals: WeeklyGoal[] = [];
      for (const goal of podActiveWeeklyGoals) {
        if (goal.endDate.setHours(0, 0, 0, 0) < TODAY().setHours(0, 0, 0, 0)) {
          updateWeeklyGoalStatusToInactive(goal.id);
          updateEventToInactiveByWeeklyGoal(goal.id);
        } else if (goal.isActive) {
          tempWeeklyGoals.push(goal);
        }
      }
      podActiveWeeklyGoals = tempWeeklyGoals;

      // send daily summary into daily chat updates for that pod id
      const categoryChannels = await readPodCategoryChannelsByPodId(
        podId,
        podType
      );
      categoryChannels?.forEach(async (channel) => {
        const dailyUpdatesChannel = channel.id;
        if (channel.name === "🚩daily-updates-chat") {
          // hardcoding test-channel id
          let channel = CLIENT.channels.cache.get(
            dailyUpdatesChannel
          ) as TextChannel;

          // updates
          channel.send((await buildSummary(podActiveWeeklyGoals)) as string);

          // explanation
          const daily_summary_description =
            "Hey everyone! Each day we will send out a progress update 🚩\n🟩 = on track! 🟨 = missed recent goal 🟥 = complete your next goal so your role doesn’t change to “kicked”!\n⭐The symbol and number next to your name is your role and how many support points you have. Check out the **❓┆faq** channel for more info!";
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

  let res = quote_to_send;

  for (const goal of activeGoals) {
    // if you can't find the user, don't post them
    try {
      await CLIENT.users.fetch(goal.discordId);

      // display their support role
      let supportIcon = "";
      await GUILD()
        ?.members.fetch(goal.discordId)
        .then((user) => {
          if (
            user.roles.cache.some(
              (role) => role === ROLE_IDS()["lifeChangerRoleId"]
            )
          ) {
            supportIcon += "🔮";
          } else if (
            user.roles.cache.some((role) => role === ROLE_IDS()["legendRoleId"])
          ) {
            supportIcon += "🔱";
          } else if (
            user.roles.cache.some((role) => role === ROLE_IDS()["champRoleId"])
          ) {
            supportIcon += "👑";
          } else if (
            user.roles.cache.some(
              (role) => role === ROLE_IDS()["preChampRoleId"]
            )
          ) {
            supportIcon += "🔆";
          } else if (
            user.roles.cache.some(
              (role) => role === ROLE_IDS()["supportPlusRoleId"]
            )
          ) {
            supportIcon += "💫";
          } else if (
            user.roles.cache.some(
              (role) => role === ROLE_IDS()["supportRoleId"]
            )
          ) {
            supportIcon += "⭐";
          }
        });

      // show how many support points they have
      const user_support = await readSupport(goal.discordId);
      if (user_support && user_support.points != 0) {
        supportIcon += user_support.points;
      }

      let misses = missesMap(goal.misses);
      if (misses === "🟩" || misses === "🟨" || misses === "🟥") {
        res +=
          `<@${goal.discordId}>` +
          supportIcon +
          ": " +
          missesMap(goal.misses) +
          "\n";
      } else {
        console.log("MISSES IS UNDEFINED FOR USER ID: ", goal.discordId);
      }
    } catch {
      console.log("ERROR! Assuming user has left server", goal.discordId);
      deactivateMember(goal.discordId);
    }
  }

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
