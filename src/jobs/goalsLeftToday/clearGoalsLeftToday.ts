import { Task } from "../../entities/Task";
import { Client } from "discord.js";
import moment from "moment";

export const clearGoalsToday = async (client: Client<boolean>) => {
  const date_today = moment().format("l");
  const tasks_today = await Task.find({ where: { date: date_today } });
  console.log(tasks_today);
  if (tasks_today) {
    let goal_left_channel = client.channels.cache.get(
      tasks_today[0].goalLeftChannelId
    );
    console.log(goal_left_channel?.id as string);
    let parent_left_channel = client.channels.cache.get(
      goal_left_channel?.parentId
    ); // doesn't really catch bc goal_left_channel = "" sometimes
    tasks_today.forEach(async (task: Task) => {
      const goal_left_channel = client.channels.cache.get(
        task.goalLeftChannelId
      );
      goal_left_channel?.delete();
    });
    if (parent_left_channel) {
      parent_left_channel.delete();
    }
  }
};
