import { ChannelType, Client, Guild, Role, TextChannel, PermissionsBitField, Channel } from "discord.js";
import { User } from "../entities/User";
import { Task } from "../entities/Task";
import moment from "moment";
import { IsNull, Not } from "typeorm";

interface updateGoalsToday {
    guild?: Guild;
}

export const updateGoalsToday = async (
  client: Client<boolean>,
  server_id: string,
) => {
    console.log("Updating goals!");
    const guild = client.guilds.cache.get(server_id);

    // 1. clear all channels in "GOALS LEFT TODAY" category by querying 'User' table for all goalLeftChannelId != null
    // 2. add misses +1 to each discordId per goalLeftChannelId
    console.log("DELETION BEGINS HERE")
    // const old_category_channel_object = guild?.channels.cache.find(channel => channel.name === "GOALS LEFT TODAY"); // top down approach

    const users_missed = await User.find({ where: {goalLeftChannelId: Not(undefined || IsNull())}});

    // Goes through all goalLeftChannels and then if the channel exists, it'll mark it as +1 misses, otherwise, it won't do anything
    if (users_missed.length) {
        let goal_left_channel = client.channels.cache.get(users_missed[0].goalLeftChannelId);
        let parent_left_channel = client.channels.cache.get(goal_left_channel?.parentId); // doesn't really catch bc goal_left_channel = undefined sometimes
        users_missed.forEach(async(user: User) => {
            console.log("UPDATING MISSED LOG FOR THE FOLLOWING USER")
            console.log(user)
            let user_id = user.discordId;
            const goal_left_channel = client.channels.cache.get(user.goalLeftChannelId);
            if (!goal_left_channel) { // if the channel doesn't exist, exit
                User.update({ discordId: user_id }, { goalLeftChannelId: undefined });
            } else {
                parent_left_channel = client.channels.cache.get(goal_left_channel?.parentId); // only catches here
                User.update({ discordId: user_id }, { misses: user.misses + 1, goalLeftChannelId: undefined });
                goal_left_channel?.delete()
                console.log(user)
            }
        })
        if (parent_left_channel) {
            console.log("deleting parent channel")
            parent_left_channel.delete()
        }
    }
    
    console.log("FINDING TASKS")
    // Find tasks according to today's date
    const date_today = moment().format('l')
    console.log(date_today)
    const tasks_for_day = await Task.find({where: {date: date_today}})

    // Create a channel in the "GOALS LEFT TODAY" category
    let podmate_role_id = guild?.roles.cache.find(
        (r) => r.name === "podmate"
      );

    let everyone_role_id = guild?.roles.cache.find(
    (r) => r.name === "@everyone"
    );
      
    let category_channel = await guild?.channels.create({ 
        name: "GOALS LEFT TODAY", 
        type: ChannelType.GuildCategory, 
        permissionOverwrites: [
            {
                id: podmate_role_id?.id as string,
                allow: [PermissionsBitField.Flags.ViewChannel]
            },
            {
                id: everyone_role_id?.id as string,
                deny: [PermissionsBitField.Flags.ViewChannel]
            }
        ]
    })

    // Create a channel for each task due today
    tasks_for_day.forEach(async(task: Task) => {
        console.log("TASK FOR DAY BELOW");
        console.log(task)
        let user_id = task.discordId;
        let user = await User.findOne({ where: {discordId: user_id}})

        if (user) {
            guild?.channels.create({ 
                name: user.discordUsername, 
                type: ChannelType.GuildText, 
                permissionOverwrites: [
                    {
                        id: podmate_role_id?.id as string,
                        allow: [
                            PermissionsBitField.Flags.ViewChannel, 
                    ]},
                    {
                        id: everyone_role_id?.id as string,
                        deny: [PermissionsBitField.Flags.ViewChannel]
                    }
                ], 
                parent: category_channel
            }).then((goal_left_channel_id) => {
                if (task.description) {
                    (client.channels.cache.get(goal_left_channel_id.id) as TextChannel).send(task.description)
                }
                User.update({ discordId: user_id }, { goalLeftChannelId: goal_left_channel_id.id as string});
            })            
        }        
    })

    console.log("Finished updating goals!");
};

