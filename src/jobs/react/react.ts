// react with some emojis if there's an image

import { Guild } from "discord.js";
import {
  CLIENT,
  DAILY_UPDATES_CHAT_CHANNEL_ID,
  LOCAL_TODAY,
} from "../../constants";
import { Event } from "../../entities/Event";
import { WeeklyGoal } from "../../entities/WeeklyGoal";
import { mdyDate } from "../../utils/timeZoneUtil";
import { checkIfLastGoal } from "../goalsLeftToday/checkIfLastGoal";
import { nudge } from "./nudge";

export const reactToImages = (GUILD: Guild) => {
  CLIENT.on("messageCreate", async (msg) => {
    if (
      msg.attachments.size > 0 &&
      msg.channelId === DAILY_UPDATES_CHAT_CHANNEL_ID
    ) {
      // delete goals left channel if the user has one
      const user_id = msg.author.id;

      const weekly_goal = await WeeklyGoal.findOne({
        where: { discordId: user_id },
        order: { id: "DESC" },
      });
      if (!weekly_goal) return;
      const localTodayWithTimeZone = LOCAL_TODAY(
        weekly_goal?.timeZone as string
      );
      const date_today = mdyDate(localTodayWithTimeZone);

      const event = await Event.findOne({
        where: {
          discordId: msg.author.id,
          adjustedDate: date_today,
          isActive: true,
        },
      });

      console.log(
        "REACTING TO: ",
        msg.author.username,
        " WITH GOALLEFTCHANNELID: ",
        event?.goalLeftChannelId,
        " FOR TODAY: ",
        date_today,
        " FOR EVENT ID: ",
        event?.id,
        " AND DISCORD ID: ",
        msg.author.id,
        " AND DATE WITHOUT MDY DATE FUNCTION IS: ",
        localTodayWithTimeZone
      );

      let userCustomChannel = GUILD?.channels.cache.find(
        (channel) => channel.name === msg.author.username
      );
      console.log(
        "HERE IS THE CUSTOM CHANNEL ",
        userCustomChannel,
        " FOR ",
        msg.author.username
      );
      if (event?.goalLeftChannelId || userCustomChannel) {
        setTimeout(() => {
          nudge(user_id); // to delete and only show once
        }, 250 * 1);

        console.log("updating stuffs and deleting");
        if (event?.goalLeftChannelId) {
          // delete their identified goal left channel id
          console.log("deleting goal left channel id");
          let goal_left_channel = CLIENT?.channels.cache.get(
            event.goalLeftChannelId
          );

          setTimeout(() => {
            goal_left_channel?.delete();
          }, 1000 * 3);
        } else if (userCustomChannel) {
          // delete their named channel
          console.log("deleting user custom created channel");
          setTimeout(() => {
            userCustomChannel?.delete();
          }, 1000 * 3);
        }

        // check if they just completed their last weekly goal
        checkIfLastGoal(user_id, date_today, GUILD);
      }

      // just in case they don't have a channel id but we still want to update
      Event.update(
        { discordId: user_id, adjustedDate: date_today, isActive: true },
        { completed: true, goalLeftChannelId: "" }
      );
      WeeklyGoal.update({ discordId: user_id, isActive: true }, { misses: 0 });

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
