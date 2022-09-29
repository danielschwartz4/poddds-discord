// react with some emojis if there's an image

import { Guild } from "discord.js";
import { readTypeFromChannelName } from "../../utils/channelUtil";
import {
  CLIENT,
  LOCAL_TODAY,
} from "../../constants";
import { mdyDate } from "../../utils/timeZoneUtil";
import { checkIfLastGoal } from "../goalsLeftToday/checkIfLastGoal";
import { readWeeklyGoalByType, updateWeeklyGoalToCompleted } from "../../resolvers/weeklyGoal";
import { GoalType } from "../../types/dbTypes";
import { readActiveEventByType, updateEventToCompleted } from "../../resolvers/event";

export const reactToImages = (GUILD: Guild) => {
  CLIENT.on("messageCreate", async (msg) => {
    const msgChannel = msg.guild?.channels.cache.get(msg.channelId)
    const msgCategoryChannel = msg.guild?.channels.cache.get(msgChannel?.parentId as string)
    
    if (
      msg.attachments.size > 0 &&
      msgChannel?.name.includes("daily-updates-chat")
    ) {
      // delete goals left channel if the user has one
      let pod_type = readTypeFromChannelName(msgCategoryChannel?.name as string)
      const user_id = msg.author.id;

      const weekly_goal = await readWeeklyGoalByType(user_id, pod_type as GoalType)
      if (!weekly_goal) return;
      const localTodayWithTimeZone = LOCAL_TODAY(weekly_goal?.timeZone as string);
      const date_today = mdyDate(localTodayWithTimeZone);

      const event = await readActiveEventByType(msg.author.id, date_today, pod_type as GoalType)

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

      let userCustomChannels = GUILD?.channels.cache.filter(
        (channel) => channel.name === msg.author.username.toLowerCase()
      );
      for (const userChannelObject of userCustomChannels) {
        let userChannel = msg.guild?.channels.cache.get(userChannelObject[0])
        let userChannelCategory = msg.guild?.channels.cache.get(userChannel?.parentId as string)
        let userChannelCategoryName = userChannelCategory?.name

        if (readTypeFromChannelName(userChannelCategoryName as string) === pod_type) { // only if the goals left today channel type is the same
            if (event) { // only update if there is a goalLeftChannelId so you do this stuff once
              // delete their identified goal left channel id from old code
              if (userChannelObject[0] != event.goalLeftChannelId) { // user channel still there but goal left channel id was not assigned
                setTimeout(() => { userChannel?.delete() }, 1000 * 3);
              } else if (event.goalLeftChannelId) {
                let goal_left_channel = CLIENT?.channels.cache.get(event.goalLeftChannelId);
                setTimeout(() => { goal_left_channel?.delete() }, 1000 * 3);
              }

              if (!event.completed) { // only react on first post that makes it completed?
                // check if they just completed their last weekly goal
                checkIfLastGoal(user_id, date_today, GUILD, pod_type as GoalType);

                setTimeout(() => {msg.react("🔥")}, 1000 * 3);
                setTimeout(() => {msg.react("🙌")}, 1000 * 4);
                setTimeout(() => {msg.react("💯")}, 1000 * 5);
                setTimeout(() => {msg.react("💪")}, 1000 * 6);
              }

              // just in case they don't have a channel id but we still want to update
              updateEventToCompleted(user_id, date_today, pod_type as GoalType)
              updateWeeklyGoalToCompleted(user_id, pod_type as GoalType)
          }
        }
      }
    }
  });
};
