import { CategoryChannel, Guild } from "discord.js";
import { readActiveEventsByDateAndWeeklyGoal } from "../../resolvers/event";
import { readActivePods } from "../../resolvers/pod";
import { readActiveWeeklyGoalByGoalId, readWeeklyGoalByFitnessPodIdAndType, readWeeklyGoalByStudyPodIdAndType } from "../../resolvers/weeklyGoal";
import { createGoalsLeftTodayCategory, createGoalsLeftTodayChannel, readPodCategoryChannelByPodId, readPodGoalsLeftTodayCategoryChannelByPodId } from "../../utils/channelUtil";
import {
  LOCAL_TODAY,
} from "../../constants";
import { Event } from "../../entities/Event";
import { WeeklyGoal } from "../../entities/WeeklyGoal";
import { mdyDate } from "../../utils/timeZoneUtil";
import { deactivateMember } from "../member/onMemberLeave";
import { deactivateGoalsAndEvents } from "./deactivateGoals";
import { readUser } from "../../resolvers/user";

export const updateGoalsToday = async (
  GUILD: Guild,
  timeZoneIsUTCMidnight?: string
) => {
  // add goalsChannels for today if there is no channel id and if it's their day
  const date_today = mdyDate(LOCAL_TODAY(timeZoneIsUTCMidnight as string)); // use local today because you want to find the local date based on the timezone and update and display that

  const activePods = await readActivePods()
  console.log("activePods", activePods)
  for (const pod of activePods) {
    const podId = pod.id
    const podType = pod.type

    // 1. get all active weekly goals for that pod id
    let podActiveWeeklyGoals: WeeklyGoal[] = []
    if (podType === 'fitness') {
      podActiveWeeklyGoals = await readWeeklyGoalByFitnessPodIdAndType(podId, podType)
    } else if (podType === 'study') {
      podActiveWeeklyGoals = await readWeeklyGoalByStudyPodIdAndType(podId, podType)
    }
    console.log('podActiveWeeklyGoals', podActiveWeeklyGoals)

    // if there are active goals for the pod
    if (podActiveWeeklyGoals && podType && podId) {
      let goalsLeftCategoryChannel = await readPodGoalsLeftTodayCategoryChannelByPodId(podId, podType, GUILD);
      // 2. if there isn't a category channel, create one under their pod's GOALS LEFT TODAY category
      if (!goalsLeftCategoryChannel) {
        const podCategoryChannel = await readPodCategoryChannelByPodId(podId, podType, GUILD);
        goalsLeftCategoryChannel = await createGoalsLeftTodayCategory(GUILD, podCategoryChannel?.rawPosition as number, podType, podId)
      }

      // 3. get events for day based on resolver and for the pod based on active weekly goals
      let goalIds: number[] = []
      podActiveWeeklyGoals.forEach((weeklyGoal) => {goalIds.push(weeklyGoal.id)})
      const events_for_day = await readActiveEventsByDateAndWeeklyGoal(date_today, goalIds)
      console.log("HERE ARE EVENTS THAT WILL BE UPDATED TO IS ACTIVE AND POSTED WHERE TODAY IS: ", date_today, " FOR TIMEZONE ", timeZoneIsUTCMidnight, events_for_day);

      // 4. ADD THESE EVENTS TO THE CATEGOR CHANNEL!
      events_for_day.forEach(async (event: Event) => {
        let user_id = event.discordId;

        // 5. if their role isn't a podmate, then deactivate their goals !! issue here (need to create a helper function to activate goals and events given a discord id now :/)
        let userDiscordObject = await GUILD?.members.fetch(user_id).catch((err) => {
          console.log("ERROR! Assuming user has left server", err);
          deactivateMember(user_id);
        });
        if (userDiscordObject && userDiscordObject?.roles.cache.some((role) => role.name === "kicked")) {
          deactivateGoalsAndEvents(user_id); // they are kicked
        }

        // 6. Create a channel for each valid due today
        let user = await readUser(user_id)
        let weekly_goal = await readActiveWeeklyGoalByGoalId(event.goalId); 
        if (user && weekly_goal) {
          const goalsLeftTodayList = GUILD.channels.cache.filter(c => c.parentId === goalsLeftCategoryChannel?.id)

          let alreadyDisplayed = false
          for (const channel of goalsLeftTodayList) {
            if (channel[1].name === user?.discordUsername) {
              alreadyDisplayed = true
            }
          }
          if (!alreadyDisplayed) {
            createGoalsLeftTodayChannel(GUILD, user, goalsLeftCategoryChannel as CategoryChannel, weekly_goal, timeZoneIsUTCMidnight as string)
          }
        }
      });
    }
  }
}
