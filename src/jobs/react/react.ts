// react with some emojis if there's an image

import { deleteGoalLeftTodayChannelByChannelId, readTypeFromChannelName } from "../../utils/channelUtil";
import { CLIENT, LOCAL_TODAY } from "../../constants";
import { mdyDate } from "../../utils/timeZoneUtil";
import { checkIfLastGoal } from "../goalsLeftToday/checkIfLastGoal";
import {
  readWeeklyGoalByType,
  updateWeeklyGoalToCompleted,
} from "../../resolvers/weeklyGoal";
import { GoalType } from "../../types/dbTypes";
import {
  updateEventToCompleted,
} from "../../resolvers/event";

export const reactToImages = () => {
  CLIENT.on("messageCreate", async (msg) => {
    const msgChannel = msg.guild?.channels.cache.get(msg.channelId);
    const msgCategoryChannel = msg.guild?.channels.cache.get(
      msgChannel?.parentId as string
    );

    if (
      msg.attachments.size > 0 &&
      msgChannel?.name.includes("daily-updates-chat")
    ) {
      let pod_type = readTypeFromChannelName(
        msgCategoryChannel?.name as string
      );
      const user_id = msg.author.id;

      const weekly_goal = await readWeeklyGoalByType(
        user_id,
        pod_type as GoalType
      );
      
      if (!weekly_goal) return;
      const localTodayWithTimeZone = LOCAL_TODAY(weekly_goal?.timeZone as string);
      const date_today = mdyDate(localTodayWithTimeZone);

      console.log("UPDATING AND REACTING TO: ", msg.author.username);

      // Updates 1. isActive 2. completion 3. misses and 4. goals left today channel
      deleteGoalLeftTodayChannelByChannelId(msg.channelId, msg.author.id)
      updateEventToCompleted(user_id, date_today, pod_type as GoalType);
      updateWeeklyGoalToCompleted(user_id, pod_type as GoalType);
      checkIfLastGoal(user_id, date_today, pod_type as GoalType);

      // Reacts
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
