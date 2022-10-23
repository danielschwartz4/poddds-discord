import { CategoryChannel } from "discord.js";
import { readActiveEventsByDateAndWeeklyGoalAndTimezone } from "../../resolvers/event";
import { readActivePods } from "../../resolvers/pod";
import {
  readActiveWeeklyGoalByGoalId,
  readWeeklyGoalByFitnessPodIdAndType,
  readWeeklyGoalByStudyPodIdAndType,
} from "../../resolvers/weeklyGoal";
import {
  createGoalsLeftTodayCategory,
  createGoalsLeftTodayChannel,
  readPodCategoryChannelByPodId,
  readPodGoalsLeftTodayCategoryChannelByPodId,
} from "../../utils/channelUtil";
import { LOCAL_TODAY } from "../../constants";
import { Event } from "../../entities/Event";
import { WeeklyGoal } from "../../entities/WeeklyGoal";
import { mdyDate } from "../../utils/timeZoneUtil";
import { deactivateMember } from "../member/onMemberLeave";
import { deactivateGoalsAndEvents } from "./deactivateGoals";
import { readUser } from "../../resolvers/user";
import { GUILD } from "../discordScheduler";
import { botDMNotification } from "../../utils/adminNotifs";

export const updateGoalsToday = async (
  timeZoneIsUTCMidnight?: string
) => {
  // add goalsChannels for today if there is no channel id and if it's their day
  const date_today = mdyDate(LOCAL_TODAY(timeZoneIsUTCMidnight as string)); // use local today because you want to find the local date based on the timezone and update and display that

  const activePods = await readActivePods();
  for (const pod of activePods) {
    const podId = pod.id;
    const podType = pod.type;
    if (!podId || !podType) { botDMNotification("MODS", "ERROR IN UPDATE GOALS TODAY" + podId + podType) }

    // 1. get all active weekly goals for that pod id
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
      let goalsLeftCategoryChannel =
        await readPodGoalsLeftTodayCategoryChannelByPodId(
          podId,
          podType,
        );
      // 2. if there isn't a category channel, create one under their pod's GOALS LEFT TODAY category
      if (!goalsLeftCategoryChannel) {
        const podCategoryChannel = await readPodCategoryChannelByPodId(
          podId,
          podType,
        );
        goalsLeftCategoryChannel = await createGoalsLeftTodayCategory(
          podCategoryChannel?.rawPosition as number,
          podType,
          podId
        );
      }

      // 3. get events for day based on resolver and for the pod based on active weekly goals
      let goalIds: number[] = [];
      for (const weeklyGoal of podActiveWeeklyGoals) {
        goalIds.push(weeklyGoal.id);
      }
      const events_for_day =
        await readActiveEventsByDateAndWeeklyGoalAndTimezone(
          date_today,
          goalIds,
          timeZoneIsUTCMidnight as string
        );

      // 4. ADD THESE EVENTS TO THE CATEGORY CHANNEL!
      events_for_day.forEach(async (event: Event) => {
        let user_id = event.discordId;

        // 5. if their role isn't a podmate, then deactivate their goals !! issue here (need to create a helper function to activate goals and events given a discord id now :/)
        let userDiscordObject = await GUILD()?.members
          .fetch(user_id)
          .catch((err) => {
            console.log("ERROR! Assuming user has left server", err);
            deactivateMember(user_id);
          });
        if (
          userDiscordObject?.roles.cache.some((role) => role.name === "kicked")
        ) {
          deactivateGoalsAndEvents(user_id); // they are kicked
        }

        // 6. Create a channel for each valid due today
        console.log("updating goals left today for user id ", user_id, " username ", userDiscordObject?.user.username, " for pod id ", podId)
        let user = await readUser(user_id);
        let weekly_goal = await readActiveWeeklyGoalByGoalId(event.goalId);
        if (user && weekly_goal) {
          createGoalsLeftTodayChannel(
            user,
            goalsLeftCategoryChannel as CategoryChannel,
            weekly_goal,
            timeZoneIsUTCMidnight as string,
            podType,
            podId
          );
        }
      });
    }
  }
};
