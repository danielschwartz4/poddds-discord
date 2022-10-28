import { readActivePods } from "../../resolvers/pod";
import { LOCAL_TODAY } from "../../constants";
import { WeeklyGoal } from "../../entities/WeeklyGoal";
import { addDays, mdyDate } from "../../utils/timeZoneUtil";
import { checkIfLastGoal } from "./checkIfLastGoal";
import {
  readWeeklyGoalByFitnessPodIdAndType,
  readWeeklyGoalByStudyPodIdAndType,
  readWeeklyGoalByType,
  updateWeeklyGoalMisses,
} from "../../resolvers/weeklyGoal";
import {
  readActiveEventsByDateAndWeeklyGoalAndTimezone,
  readAllEventsByDateAndTimezone,
  updateEventToInactive,
} from "../../resolvers/event";
import { updateSupportTodayToFalse } from "../../resolvers/support";
import { botDMNotification } from "../../utils/adminNotifs";
import {
  clearOldGoalsLeftTodayChannels,
  deleteGoalLeftTodayChannel,
} from "../../utils/channelUtil";

export const updateGoalsYesterday = async (timeZoneIsUTCMidnight?: string) => {
  const localTodayWithTimeZone = LOCAL_TODAY(timeZoneIsUTCMidnight as string);
  const date_yesterday = mdyDate(addDays(localTodayWithTimeZone, -1));

  // 1. iterate through each pod
  const activePods = await readActivePods();
  for (const pod of activePods) {
    const podId = pod.id;
    const podType = pod.type;
    if (!podId || !podType) {
      botDMNotification(
        "MODS",
        "ERROR IN UPDATE GOALS YESTERDAY" + podId + podType
      );
    }

    // find what pod active weekly goals are
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

    // 2. get all pod events active yesterday
    let goalIds: number[] = [];
    for (const weeklyGoal of podActiveWeeklyGoals) {
      goalIds.push(weeklyGoal.id);
    }
    const events_incompleted_yesterday =
      await readActiveEventsByDateAndWeeklyGoalAndTimezone(
        date_yesterday,
        goalIds,
        timeZoneIsUTCMidnight as string
      );

    // 3 looping through all active events individually
    // Updates here
    if (events_incompleted_yesterday) {
      // 4. for each event yesterday incompleted, remove their channels from the category or update misses
      for (const event of events_incompleted_yesterday) {
        const user_id = event.discordId;
        console.log(
          "FOR DATE YESTERDAY:",
          date_yesterday,
          "we are looking for goal ids",
          goalIds,
          "for timezone",
          timeZoneIsUTCMidnight,
          " for user id ",
          user_id,
          " and event id ",
          event.id,
          " and goal id ",
          event.goalId
        );

        // No post update 1) isActive=F 2) isComplete=F 3) misses += 1 4) delete goal left today
        updateEventToInactive(user_id, date_yesterday, podType);
        const weekly_goal = await readWeeklyGoalByType(user_id, podType);
        if (weekly_goal) {
          updateWeeklyGoalMisses(user_id, podType, weekly_goal.misses + 1);
        }
        deleteGoalLeftTodayChannel(podId, podType, user_id);
      }
    }

    // clear all channels with messages 1+ days ago to clean up discord UI (in case people leave when their goal is still there)
    clearOldGoalsLeftTodayChannels(podId, podType);
  }

  // check if any goal yesterday (regardless of completed or incompleted) expired AND update Supports of people to false
  const events_yesterday = await readAllEventsByDateAndTimezone(
    date_yesterday,
    timeZoneIsUTCMidnight as string
  );
  for (const event of events_yesterday) {
    // check if event was the last goal
    checkIfLastGoal(event.discordId, date_yesterday, event.type);

    // update everyone's support supportedToday = false
    updateSupportTodayToFalse(event.discordId);
  }
};
