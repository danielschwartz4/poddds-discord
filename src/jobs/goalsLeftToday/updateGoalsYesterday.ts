import { addDays, mdyDate } from "../../utils/timeZoneUtil";
import { IsNull, Not } from "typeorm";
import { Event } from "../../entities/Event";
import { WeeklyGoal } from "../../entities/WeeklyGoal";
import { LOCAL_TODAY } from "../../constants";
import { readLastWeeklyGoal } from "../../utils/weeklyGoalResolvers";
import { expiredGoalNotif } from "../expiredGoalNotif";
import { readLastActiveUserEvent } from "../../utils/eventResolvers";
import { CLIENT } from "../discordScheduler";

export const updateGoalsYesterday = async (
  timeZoneIsUTCMidnight?: string
) => {
  console.log("updating goals yesterday for timezone ", timeZoneIsUTCMidnight)
  const localTodayWithTimeZone = LOCAL_TODAY(timeZoneIsUTCMidnight as string)
  const date_yesterday = mdyDate(addDays(localTodayWithTimeZone, -1));
  let events_missed_yesterday;
  if (timeZoneIsUTCMidnight) {
    events_missed_yesterday = await Event.find({
      where: {
        adjustedDate: date_yesterday,
        goalLeftChannelId: Not(IsNull() || ""),
        timeZone: timeZoneIsUTCMidnight,
        isActive: true,
      },
    });
  } else {
    events_missed_yesterday = await Event.find({
      where: {
        adjustedDate: date_yesterday,
        goalLeftChannelId: Not(IsNull() || ""),
        isActive: true,
      },
    });
  }

  // Goes through all goalLeftChannels and then if the channel exists, it'll mark it as +1 misses, otherwise, it won't do anything
  if (events_missed_yesterday.length) {
    events_missed_yesterday.forEach(async (event: Event) => {
      let user_id = event.discordId;
      const goal_left_channel = CLIENT.channels.cache.get(
        event.goalLeftChannelId
      );
      if (!goal_left_channel) {
        // if the channel doesn't exist, exit
        Event.update(
          {
            discordId: user_id,
            adjustedDate: date_yesterday,
            timeZone: timeZoneIsUTCMidnight,
            isActive: true,
          },
          { completed: true, goalLeftChannelId: "" }
        );
        WeeklyGoal.update(
          { discordId: user_id, isActive: true },
          { misses: 0 }
        );
      } else {
        Event.update(
          {
            discordId: user_id,
            adjustedDate: date_yesterday,
            timeZone: timeZoneIsUTCMidnight,
            isActive: true,
          },
          { completed: false, goalLeftChannelId: "" }
        );
        const weekly_goal = await WeeklyGoal.findOne({
          where: { discordId: user_id, isActive: true },
        });
        if (weekly_goal) {
          WeeklyGoal.update(
            { discordId: user_id, isActive: true },
            { misses: (weekly_goal?.misses as number) + 1 }
          );
        }
        
        goal_left_channel?.delete();
      }

      // check if they just completed their last weekly goal
      readLastActiveUserEvent(user_id).then(async (res) => {
        // compare only dates and not time
        if (res?.adjustedDate === date_yesterday) {
          let weekly_goal_res = await readLastWeeklyGoal(user_id)
          if (weekly_goal_res) { // if weekly goal is already set to inactive, don't send it
            expiredGoalNotif(CLIENT, user_id, weekly_goal_res as WeeklyGoal)
          }
        }          
      })
    });
  }
};
