import { Guild } from "discord.js";
import { readActivePods } from "../../resolvers/pod";
import { LOCAL_TODAY } from "../../constants";
import { WeeklyGoal } from "../../entities/WeeklyGoal";
import { addDays, mdyDate } from "../../utils/timeZoneUtil";
import { checkIfLastGoal } from "./checkIfLastGoal";
import { readWeeklyGoalByFitnessPodIdAndType, readWeeklyGoalByStudyPodIdAndType, readWeeklyGoalByType, updateWeeklyGoalMisses, updateWeeklyGoalToCompleted } from "../../resolvers/weeklyGoal";
import { readActiveEventsByDateAndWeeklyGoalAndTimezone, updateEventToCompleted, updateEventToInactive } from "../../resolvers/event";
import { readPodGoalsLeftTodayCategoryChannelByPodId } from "../../utils/channelUtil";
import { readUser } from "../../resolvers/user";
import { GoalType } from "../../types/dbTypes";

export const updateGoalsYesterday = async (
  GUILD: Guild,
  timeZoneIsUTCMidnight?: string
) => {
  console.log("updating goals yesterday for timezone ", timeZoneIsUTCMidnight);
  const localTodayWithTimeZone = LOCAL_TODAY(timeZoneIsUTCMidnight as string);
  const date_yesterday = mdyDate(addDays(localTodayWithTimeZone, -1));

  // 1. iterate through each pod
  const activePods = await readActivePods()
  for (const pod of activePods) {
    const podId = pod.id
    const podType = pod.type

    // find what pod active weekly goals are
    let podActiveWeeklyGoals: WeeklyGoal[] = []
    if (podType === 'fitness') {
      podActiveWeeklyGoals = await readWeeklyGoalByFitnessPodIdAndType(podId, podType)
    } else if (podType === 'study') {
      podActiveWeeklyGoals = await readWeeklyGoalByStudyPodIdAndType(podId, podType)
    }

    // 2. get all pod events active yesterday
    let goalIds: number[] = []
    podActiveWeeklyGoals.forEach((weeklyGoal) => {goalIds.push(weeklyGoal.id)})
    const events_incompleted_yesterday = await readActiveEventsByDateAndWeeklyGoalAndTimezone(date_yesterday, goalIds, timeZoneIsUTCMidnight as string)
    let events_incompleted_yesterday_usernames: string[] = []
    for (const event of events_incompleted_yesterday) {
      const user_incompleted_yesterday = await readUser(event.discordId)
      events_incompleted_yesterday_usernames.push(user_incompleted_yesterday?.discordUsername as string)
    }
    console.log("HERE ARE EVENTS THAT WILL BE CHECKED FOR: ", date_yesterday, " FOR TIMEZONE ", timeZoneIsUTCMidnight, events_incompleted_yesterday, "users missed yesterday: ", events_incompleted_yesterday_usernames, "pod id", podId);
    
    // 3 looping through all active events individually
    if (events_incompleted_yesterday && podType && podId) {
      let goalsLeftCategoryChannel = await readPodGoalsLeftTodayCategoryChannelByPodId(podId, podType, GUILD);
      const goalsLeftChannels = GUILD.channels.cache.filter(c => c.parentId === goalsLeftCategoryChannel?.id)
      
      // 4. for each event yesterday incompleted, remove their channels from the category or update misses
      events_incompleted_yesterday.forEach(async (event) => {
        const user_id = event.discordId
        const user_incompleted_yesterday = await readUser(user_id)
        const user_channels = goalsLeftChannels.filter(c => c.name === user_incompleted_yesterday?.discordUsername)
        
        // incompleted goal, update misses += 1
        if (user_channels.size) { 
          const weekly_goal = await readWeeklyGoalByType(user_id, podType);
          updateEventToInactive(user_id, date_yesterday, podType);
          if (weekly_goal) { updateWeeklyGoalMisses(user_id, podType, weekly_goal.misses + 1) }

          user_channels.forEach(c => c.delete()); // delete extras if those exist
        } else { // completed channel and channel was deleted via react
          // update missed = 0
          updateEventToCompleted(user_id, date_yesterday, podType as GoalType)
          updateWeeklyGoalToCompleted(user_id, podType as GoalType)
        }

        // check if event was the last goal
        checkIfLastGoal(event.discordId, date_yesterday, GUILD, event.type);
      })
    }
  }
}