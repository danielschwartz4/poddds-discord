import { ChannelType, Client, Role, TextChannel, PermissionsBitField, Channel } from "discord.js";
import { User } from "../entities/User";
import { Task } from "../entities/Task";
import moment from "moment";
import { updateGoalsYesterday } from "./goalsLeftToday/updateGoalsYesterday";
import { IsNull, Not } from "typeorm";
import { isNonNullType } from "graphql";

export const updateGoalsToday = async (
  client: Client<boolean>,
  server_id: string,
  daily_updates_channel_id: string,
) => {
    updateGoalsYesterday(client)

    // add goalsChannels for today if there is no channel id and if it's their day 
    const guild = client.guilds.cache.get(server_id);
    const date_today = moment().format('l')
    const tasks_for_day = await Task.find({where: { date: date_today, goalLeftChannelId: (IsNull() || undefined), completed: false  }})
    
    // Create a channel in the "GOALS LEFT TODAY" category
    let podmate_role_id = guild?.roles.cache.find((r) => r.name === "podmate");
    let everyone_role_id = guild?.roles.cache.find((r) => r.name === "@everyone");
    const channel_permission_overwrites = [
        {
            id: podmate_role_id?.id as string,
            allow: [PermissionsBitField.Flags.ViewChannel]
        },{
            id: everyone_role_id?.id as string,
            deny: [PermissionsBitField.Flags.ViewChannel]
        }
    ]  

    // check if category channel exists
    let category_channel = guild?.channels.cache.find(channel => channel.name === "GOALS LEFT TODAY"); 
    if (!category_channel) {
        category_channel = await guild?.channels.create({ 
            name: "GOALS LEFT TODAY", 
            type: ChannelType.GuildCategory, 
            permissionOverwrites: channel_permission_overwrites,
            position: 2,
        })
    }

    // Create a channel for each task due today
    tasks_for_day.forEach(async(task: Task) => {
        let user_id = task.discordId;
        let user = await User.findOne({ where: {discordId: user_id}})

        if (user) {
            guild?.channels.create({ 
                name: user.discordUsername, 
                type: ChannelType.GuildText, 
                permissionOverwrites: channel_permission_overwrites, 
                parent: category_channel?.id,
            }).then((goal_left_channel_id) => {
                if (task.description) {
                    (client.channels.cache.get(goal_left_channel_id.id) as TextChannel).send(`<@${user?.discordId}>` + "\nToday's your day! Complete part of your weekly goal by sending a picture of evidence in: " + `<#${daily_updates_channel_id}>\n` + task.description)
                }
                Task.update({ discordId: user_id, date: date_today }, { goalLeftChannelId: goal_left_channel_id.id as string});
            })            
        }        
    })
};

