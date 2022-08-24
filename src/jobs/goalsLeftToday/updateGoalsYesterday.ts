import { Task } from "../../entities/Task";
import { Client } from "discord.js";
import moment from "moment";
import { IsNull, Not } from "typeorm";

export const updateGoalsYesterday = async (
    client: Client<boolean>
) => {
    const date_yesterday = moment().subtract(1, 'days').format('l')
    const tasks_missed_yesterday = await Task.find({ where: { date: date_yesterday, goalLeftChannelId: Not(IsNull() || undefined) }});

    // Goes through all goalLeftChannels and then if the channel exists, it'll mark it as +1 misses, otherwise, it won't do anything
    if (tasks_missed_yesterday.length) {
        tasks_missed_yesterday.forEach(async(task: Task) => {
            console.log("UPDATING MISSED LOG FOR THE FOLLOWING TASK")
            console.log(task)
            let user_id = task.discordId;
            const goal_left_channel = client.channels.cache.get(task.goalLeftChannelId);
            if (!goal_left_channel) { // if the channel doesn't exist, exit
                Task.update({ discordId: user_id, date: date_yesterday }, { completed: true, goalLeftChannelId: undefined });
            } else {
                Task.update({ discordId: user_id, date: date_yesterday }, { completed: false, goalLeftChannelId: undefined });
                goal_left_channel?.delete()
            }
        })
    }
}