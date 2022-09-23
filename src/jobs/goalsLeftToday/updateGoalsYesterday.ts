import { addDays, mdyDate } from "../../utils/timeZoneUtil";
import { IsNull, Not } from "typeorm";
import { Event } from "../../entities/Event";
import { WeeklyGoal } from "../../entities/WeeklyGoal";
import { LOCAL_TODAY } from "../../constants";
import { CLIENT } from "../discordScheduler";
import { checkIfLastGoal } from "./checkIfLastGoal";

export const updateGoalsYesterday = async (timeZoneIsUTCMidnight?: string) => {
  console.log("updating goals yesterday for timezone ", timeZoneIsUTCMidnight);
  const localTodayWithTimeZone = LOCAL_TODAY(timeZoneIsUTCMidnight as string);
  const date_yesterday = mdyDate(addDays(localTodayWithTimeZone, -1));
  let events_missed_yesterday;
  if (timeZoneIsUTCMidnight) {
    events_missed_yesterday = await Event.find({
      where: {
        adjustedDate: date_yesterday,
        goalLeftChannelId: Not(IsNull() || ""),
        timeZone: timeZoneIsUTCMidnight,
        isActive: true,
        completed: false,
      },
    });
  } else {
    events_missed_yesterday = await Event.find({
      where: {
        adjustedDate: date_yesterday,
        goalLeftChannelId: Not(IsNull() || ""),
        isActive: true,
        completed: false,
      },
    });
  }

  // COMPLETED GOAL NOTIFICATION: check all users weekly goal in that time zone just in case they had a break
  let activeWeeklyGoalsInTimezone = await WeeklyGoal.find({
    where: {
      isActive: true,
      timeZone: timeZoneIsUTCMidnight,
    },
  });
  activeWeeklyGoalsInTimezone.forEach((res) => {
    checkIfLastGoal(res.discordId, date_yesterday);
  });

  // debugging messages
  console.log("HERE WERE THE EVENTS MISSED YESTERDAY:");
  console.log(events_missed_yesterday);

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
    });
  }
};
