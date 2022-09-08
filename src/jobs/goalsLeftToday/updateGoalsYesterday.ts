import { Client } from "discord.js";
import { addDays, mdyDate } from "../../utils/timeZoneUtil";
import { IsNull, Not } from "typeorm";
import { Event } from "../../entities/Event";
import { WeeklyGoal } from "../../entities/WeeklyGoal";
import { TODAY } from "../../constants";

export const updateGoalsYesterday = async (
  client: Client<boolean>,
  timeZoneIsUTCMidnight?: string
) => {
  // const date_yesterday = moment().subtract(1, "days").format("l");
  const date_yesterday = mdyDate(addDays(TODAY(), -1));
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
      const goal_left_channel = client.channels.cache.get(
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
        WeeklyGoal.update(
          { discordId: user_id, isActive: true },
          { misses: (weekly_goal?.misses as number) + 1 }
        );
        goal_left_channel?.delete();
      }
    });
  }
};
