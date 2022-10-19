import { readActivePods } from "../../resolvers/pod";
import { LOCAL_TODAY } from "../../constants";
import { WeeklyGoal } from "../../entities/WeeklyGoal";
import { addDays, mdyDate } from "../../utils/timeZoneUtil";
import { checkIfLastGoal } from "./checkIfLastGoal";
import { readWeeklyGoalByFitnessPodIdAndType, readWeeklyGoalByStudyPodIdAndType, readWeeklyGoalByType, updateWeeklyGoalMisses, updateWeeklyGoalToCompleted } from "../../resolvers/weeklyGoal";
import { readActiveEventsByDateAndWeeklyGoalAndTimezone, readAllEventsByDateAndTimezone, updateEventToCompleted, updateEventToInactive } from "../../resolvers/event";
import { readPodGoalsLeftTodayCategoryChannelByPodId } from "../../utils/channelUtil";
import { readUser } from "../../resolvers/user";
import { GoalType } from "../../types/dbTypes";
import { GUILD } from "../discordScheduler";
import { TextChannel } from "discord.js";

export const updateGoalsYesterday = async (
  timeZoneIsUTCMidnight?: string
) => {
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
    // console.log("HERE ARE EVENTS THAT WILL BE CHECKED FOR: ", date_yesterday, " FOR TIMEZONE ", timeZoneIsUTCMidnight, events_incompleted_yesterday, "users missed yesterday: ", events_incompleted_yesterday_usernames, "pod id", podId);
    
    // 3 looping through all active events individually
    if (events_incompleted_yesterday && podType && podId) {
      let goalsLeftCategoryChannel = await readPodGoalsLeftTodayCategoryChannelByPodId(podId, podType);
      const goalsLeftChannels = GUILD()?.channels.cache.filter(c => c.parentId === goalsLeftCategoryChannel?.id)
      
      // 4. for each event yesterday incompleted, remove their channels from the category or update misses
      // await events_incompleted_yesterday.forEach(async (event) => {
      for (const event of events_incompleted_yesterday) {
        const user_id = event.discordId
        const user_incompleted_yesterday = await readUser(user_id)
        const user_channels = goalsLeftChannels?.filter(c => c.name === user_incompleted_yesterday?.discordUsername.toLowerCase())
        
        // incompleted goal, update misses += 1
        if (user_channels?.size) { 
          const weekly_goal = await readWeeklyGoalByType(user_id, podType);
          updateEventToInactive(user_id, date_yesterday, podType);
          if (weekly_goal) { updateWeeklyGoalMisses(user_id, podType, weekly_goal.misses + 1) }

          for (const c of user_channels) {
            await c[1].delete()
            console.log("updateGoalsYesterday this user DID NOT complete their event yesterday: ", user_incompleted_yesterday?.discordUsername)
          }
          // user_channels.forEach(c => c.delete()); // delete extras if those exist
        } else { // completed channel and channel was deleted via react
          // update missed = 0
          updateEventToCompleted(user_id, date_yesterday, podType as GoalType)
          updateWeeklyGoalToCompleted(user_id, podType as GoalType)
          console.log("updateGoalsYesterday this user completed their event yesterday: ", user_incompleted_yesterday?.discordUsername)
        }
      }


      // clear all channels with messages 2+ days ago to clean up discord UI
      goalsLeftChannels?.forEach((guildChannel) => {
        let channel_id = guildChannel.id
        let channel = GUILD()?.channels.cache.filter(c => c.id === channel_id)
        let channel_text = channel?.get(channel_id) as TextChannel
        channel_text.messages.fetch({ limit: 1 }).then((msg) => {
          const msgTimestamp = msg.first()?.createdTimestamp
          if (msgTimestamp) {
            // difference is in milliseconds
            const days_elapsed = (Date.now() - msgTimestamp) / (1000 * 60 * 60 * 24)
            if (days_elapsed > 2) {
              guildChannel.delete()
              console.log("deleting channel that was here for 2+ days, it was sent on ", msgTimestamp.toString())
            }
          }
        })
      })

      // check if any goal yesterday (regardless of completed or incompleted) expired
      const events_yesterday = await readAllEventsByDateAndTimezone(date_yesterday, timeZoneIsUTCMidnight as string)
      for (const event of events_yesterday) {
        // check if event was the last goal
        checkIfLastGoal(event.discordId, date_yesterday, event.type);
      }
    }
  }
}