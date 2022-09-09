// react with some emojis if there's an image

import { Client } from "discord.js";
import { readLastWeeklyGoal } from "../utils/weeklyGoalResolvers";
import { LOCAL_TODAY } from "../constants";
import { Event } from "../entities/Event";
import { WeeklyGoal } from "../entities/WeeklyGoal";
import { mdyDate } from "../utils/timeZoneUtil";
import { expiredGoalNotif } from "./expiredGoalNotif";

export const reactToImages = (
  client: Client<boolean>,
  daily_updates_channel_id: String
) => {
  client.on("messageCreate", async (msg) => {
    if (
      msg.attachments.size > 0 &&
      msg.channelId === daily_updates_channel_id
    ) {
      // delete goals left channel if the user has one
      const user_id = msg.author.id;

      
      const weekly_goal = await WeeklyGoal.findOne({ where: { discordId: user_id }, order: {id: "DESC" }})
      const localTodayWithTimeZone = LOCAL_TODAY(weekly_goal?.timeZone as string)
      const date_today = mdyDate(localTodayWithTimeZone);

      const event = await Event.findOne({
        where: {
          discordId: msg.author.id,
          adjustedDate: date_today,
          isActive: true,
        },
      });

      console.log("REACTING TO: ", msg.author.username, " WITH GOALLEFTCHANELID: ", event?.goalLeftChannelId, " FOR TODAY: ", date_today, " FOR EVENT ID: ", event?.id, " AND DISCORD ID: ", msg.author.id)
      if (event?.goalLeftChannelId) {
        console.log("updating stuffs and deleting")
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
        setTimeout(() => {
          goal_left_channel?.delete();
          console.log("deleted!")
        }, 1000 * 3);

        // check if they just completed their last weekly goal
        readLastWeeklyGoal(user_id).then((res) => {
          // compare only dates and not time
          if (res?.adjustedEndDate.toISOString().split('T')[0] === localTodayWithTimeZone.toISOString().split('T')[0]) {
            expiredGoalNotif(client, user_id, res)
          }          
        })
      }

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
