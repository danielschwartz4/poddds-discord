// react with some emojis if there's an image

import { Client } from "discord.js";
import { readLastWeeklyGoal } from "../utils/weeklyGoalResolvers";
import { TODAY } from "../constants";
import { Event } from "../entities/Event";
import { WeeklyGoal } from "../entities/WeeklyGoal";
import { mdyDate } from "../utils/timeZoneUtil";
import { expiredGoalNotif } from "./expiredGoalNotif";

export const reactToImages = (
  client: Client<boolean>,
  daily_updates_channel_id: String
) => {
  console.log("REACT!")
  client.on("messageCreate", async (msg) => {
    if (
      msg.attachments.size > 0 &&
      msg.channelId === daily_updates_channel_id
    ) {
      // delete goals left channel if the user has one
      const user_id = msg.author.id;

      const date_today = mdyDate(TODAY);
      const event = await Event.findOne({
        where: {
          discordId: msg.author.id,
          adjustedDate: date_today,
          isActive: true,
        },
      });

      if (event?.goalLeftChannelId) {
        console.log("THERE wAS A GOAL LEFT CHANNEL ID")
        let goal_left_channel = client.channels.cache.get(
          event.goalLeftChannelId
        );
        Event.update(
          { discordId: user_id, adjustedDate: date_today, isActive: true },
          { completed: true, goalLeftChannelId: "" }
        );
        WeeklyGoal.update(
          { discordId: user_id, isActive: true },
          { misses: 0 }
        );
        console.log("goal_left_channel", goal_left_channel);
        setTimeout(() => {
          goal_left_channel?.delete();
        }, 1000 * 3);

        // check if they just completed their last weekly goal
        readLastWeeklyGoal(user_id).then((res) => {
          // compare only dates and not time
          if (res?.adjustedEndDate.toISOString().split('T')[0] === TODAY.toISOString().split('T')[0]) {
            expiredGoalNotif(client, user_id, res)
          }          
        })
      }

      console.log("An attachment was added!");
      setTimeout(() => {
        msg.react("🔥");
      }, 1000 * 3);
      setTimeout(() => {
        msg.react("🙌");
      }, 1000 * 4);
      setTimeout(() => {
        msg.react("💯");
      }, 1000 * 5);
      setTimeout(() => {
        msg.react("💪");
      }, 1000 * 6);
    }
  });
};
