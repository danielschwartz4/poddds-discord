import { Event } from "../../entities/Event";
import { Client } from "discord.js";
import moment from "moment";
import { IsNull, Not } from "typeorm";
import { User } from "../../entities/User";
import { WeeklyGoal } from "../../entities/WeeklyGoal";

export const updateGoalsYesterday = async (client: Client<boolean>) => {
  const date_yesterday = moment().subtract(1, "days").format("l");
  const events_missed_yesterday = await Event.find({
    where: {
      date: date_yesterday,
      goalLeftChannelId: Not(IsNull() || ""),
    },
  });

  // Goes through all goalLeftChannels and then if the channel exists, it'll mark it as +1 misses, otherwise, it won't do anything
  if (events_missed_yesterday.length) {
    events_missed_yesterday.forEach(async (event: Event) => {
      console.log("UPDATING MISSED LOG FOR THE FOLLOWING TASK");
      console.log(event);
      let user_id = event.discordId;
      const goal_left_channel = client.channels.cache.get(
        event.goalLeftChannelId
      );
      if (!goal_left_channel) {
        // if the channel doesn't exist, exit
        Event.update(
          { discordId: user_id, date: date_yesterday },
          { completed: true, goalLeftChannelId: "" }
        );
        WeeklyGoal.update({ discordId: user_id }, { misses: 0 });
      } else {
        Event.update(
          { discordId: user_id, date: date_yesterday },
          { completed: false, goalLeftChannelId: "" }
        );
        const weekly_goal = await WeeklyGoal.findOne({
          where: { discordId: user_id },
        });
        WeeklyGoal.update(
          { discordId: user_id },
          { misses: (weekly_goal?.misses as number) + 1 }
        );
        goal_left_channel?.delete();
      }
    });
  }
};
