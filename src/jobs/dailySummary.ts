// import { TextChannel } from "discord.js";
import { CLIENT, TODAY } from "../constants";
// import AppDataSource from "../dataSource";
// import { changeTimeZone, mdyDate } from "../utils/timeZoneUtil";
import { WeeklyGoal } from "../entities/WeeklyGoal";
import { deactivateMember } from "./member/onMemberLeave";
import inspirational_quotes from "../utils/quotes.json";
// import { readPodCategoryChannelsByPodId } from "../utils/channelUtil";
import { readActivePods } from "../resolvers/pod";
import { readWeeklyGoalByFitnessPodIdAndType, readWeeklyGoalByStudyPodIdAndType, updateWeeklyGoalStatusToInactive } from "../resolvers/weeklyGoal";
import { updateEventToInactiveByWeeklyGoal } from "../resolvers/event";
import { GUILD, ROLE_IDS } from "./discordScheduler";
require("dotenv").config();

export const dailySummary = async () => {
  // iterate through every pod
  const activePods = await readActivePods();

  for (const pod of activePods) {
    const podId = pod.id;
    const podType = pod.type;

    // TODO: get rid of 
    if (podId != 2) {
      continue
    }

    // get all active weekly goals for that pod id
    let podActiveWeeklyGoals: WeeklyGoal[] = []
    if (podType === 'fitness') {
      podActiveWeeklyGoals = await readWeeklyGoalByFitnessPodIdAndType(podId, podType)
    } else if (podType === 'study') {
      podActiveWeeklyGoals = await readWeeklyGoalByStudyPodIdAndType(podId, podType)
    }

    // if there are active goals for the pod
    if (podActiveWeeklyGoals) {
      // ensure all pod active weekly goals end dates have not passed yet, if they have, set the goal to inactive
      let tempWeeklyGoals: WeeklyGoal[] = []
      for (const goal of podActiveWeeklyGoals) {
        console.log("CHECKING FOR USER ", goal.userId, goal.adjustedEndDate.getDate(), TODAY().getDate())
        if (goal.adjustedEndDate.getDate() < TODAY().getDate()) {
          console.log("DISABLED GOAL BECAUSE goal.adjustedEndDate.getDate() < TODAY().getDate()", goal.discordId)
          updateWeeklyGoalStatusToInactive(goal.id)
          updateEventToInactiveByWeeklyGoal(goal.id)
        } else if (goal.isActive) {
          tempWeeklyGoals.push(goal)
          console.log("ADDING GOAL: ", goal.discordId)
        }
      }
      podActiveWeeklyGoals = tempWeeklyGoals

      // TODO: comment this back in
      // // send daily summary into daily chat updates for that pod id
      // const categoryChannels = await readPodCategoryChannelsByPodId(podId, podType);
      // categoryChannels?.forEach(async (channel) => {
      //   const dailyUpdatesChannel = channel.id;
      //   if (channel.name === "🚩daily-updates-chat") {
      //     // hardcoding test-channel id
      //     let channel = CLIENT.channels.cache.get(dailyUpdatesChannel) as TextChannel;

      //     // updates
      //     channel.send((await buildSummary(podActiveWeeklyGoals)) as string);

      //     // explanation
      //     const daily_summary_description =
      //       "Hey everyone! Each day we will send out a progress update 🚩\n🟩 = on track! 🟨 = missed recent goal 🟥 = complete your next goal so your role doesn’t change to “kicked”!";
      //     channel.send(daily_summary_description);
      //   }
      // });
    }
  }
};

// TODO: comment back in
// const buildSummary = async (activeGoals: WeeklyGoal[]) => {
//   // start with an inspirational quote
//   const randomInt = (min: number, max: number) =>
//     Math.floor(Math.random() * (max - min + 1) + min);
//   const index = randomInt(0, inspirational_quotes.length); // random index to be used
//   const quote_json = inspirational_quotes[index];
//   const text = "*" + quote_json.text + "*";
//   const author = quote_json.from.toUpperCase();
//   const quote_to_send = text + "\n" + author + "\n\n";

//   let res = quote_to_send;

//   for (const goal of activeGoals) {
//     // if you can't find the user, don't post them
//     try {
//       await CLIENT.users.fetch(goal.discordId)

//       // display their support role
//       let supportIcon = ''
//       await GUILD()?.members.fetch(goal.discordId).then((user) => {
//         if (user.roles.cache.some((role) => role === ROLE_IDS()['lifeChangerRoleId'])) {
//           supportIcon += '🔮'
//         } else if (user.roles.cache.some((role) => role === ROLE_IDS()['legendRoleId'])) {
//           supportIcon += '🔱'
//         } else if (user.roles.cache.some((role) => role === ROLE_IDS()['champRoleId'])) {
//           supportIcon += '👑'
//         } else if (user.roles.cache.some((role) => role === ROLE_IDS()['preChampRoleId'])) {
//           supportIcon += '🔆'
//         } else if (user.roles.cache.some((role) => role === ROLE_IDS()['supportPlusRoleId'])) {
//           supportIcon += '💫'
//         } else if (user.roles.cache.some((role) => role === ROLE_IDS()['supportRoleId'])) {
//           supportIcon += '⭐'
//         }
//       })

//       let misses = missesMap(goal.misses);
//       if (misses === "🟩" || misses === "🟨" || misses === "🟥") {
//         res += `<@${goal.discordId}>` + supportIcon + ": " + missesMap(goal.misses) + "\n";
//       } else {
//         console.log("MISSES IS UNDEFINED FOR USER ID: ", goal.discordId);
//       }
//     } catch {
//       console.log("ERROR! Assuming user has left server", goal.discordId);
//       deactivateMember(goal.discordId);
//     }
//   }

//   return res;
// };

// const missesMap = (misses: number) => {
//   const map: { [i: number]: string } = {
//     0: "🟩",
//     1: "🟨",
//     2: "🟥",
//   };
//   return map[misses];
// }

// const supportMap = (role: string) => {
//   const map: { [i: string]: string } = {
//     'newMember' : newMemberRoleId,
//     'podmate' : podmateRoleId,
//     'support' : supportRoleId,
//     'supportPlus' : supportPlusRoleId,
//     'preChamp' : preChampRoleId,
//     'champ' : champRoleId,
//     'legend' : legendRoleId,
//     'lifeChanger' : lifeChangerRoleId,
//   }
// }

// // compute streaks here
// const LOCAL_TODAY_WITH_TIMEZONE = LOCAL_TODAY(goal.timeZone);
// const Difference_In_Time_From_Goal_Start =
//   LOCAL_TODAY_WITH_TIMEZONE.getTime() - goal.adjustedStartDate.getTime();
// let streak_length =
//   Math.round(Difference_In_Time_From_Goal_Start / (1000 * 3600 * 24)) - 1; // start date comes the day after

// const recently_missed_event = await AppDataSource.query(
//   `
//   SELECT * FROM event
//   WHERE "goalId" = '${goal.id}'
//   AND CAST("adjustedDate" AS date) < '${mdyDate(LOCAL_TODAY_WITH_TIMEZONE)}'
//   AND "completed" = false
//   AND "isActive" = true
//   ORDER BY "id" DESC
//   LIMIT 1
//   `
// );

// if (recently_missed_event.length) {
//   const missed_event_date = changeTimeZone(
//     new Date(recently_missed_event[0].adjustedDate),
//     goal.timeZone
//   );
//   const local_today = LOCAL_TODAY()
//     new Date(mdyDate(LOCAL_TODAY_WITH_TIMEZONE)),
//     goal.timeZone
//   );
//   const Difference_In_Time_Event =
//     local_today.getTime() - missed_event_date.getTime();
//   const Difference_In_Days_Event =
//     Math.floor(Difference_In_Time_Event / (1000 * 3600 * 24)) - 1;
//   streak_length = Math.min(streak_length, Difference_In_Days_Event);
// }