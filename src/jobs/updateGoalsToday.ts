import {
  ChannelType,
  Client,
  PermissionsBitField,
  TextChannel,
} from "discord.js";
import { IsNull } from "typeorm";
import { TODAY } from "../constants";
import { Event } from "../entities/Event";
import { User } from "../entities/User";
import { WeeklyGoal } from "../entities/WeeklyGoal";
import { mdyDate } from "../utils/timeZoneUtil";
import { updateGoalsYesterday } from "./goalsLeftToday/updateGoalsYesterday";

export const updateGoalsToday = async (
  client: Client<boolean>,
  server_id: string,
  daily_updates_channel_id: string,
  timeZoneIsUTCMidnight?: string
) => {
  updateGoalsYesterday(client, timeZoneIsUTCMidnight);

  // add goalsChannels for today if there is no channel id and if it's their day
  const guild = client.guilds.cache.get(server_id);
  const date_today = mdyDate(TODAY);
  let events_for_day;

  if (timeZoneIsUTCMidnight) {
    events_for_day = await Event.find({
      where: {
        adjustedDate: date_today,
        goalLeftChannelId: IsNull() || "",
        completed: false,
        timeZone: timeZoneIsUTCMidnight,
        isActive: true,
      },
    });
  } else {
    events_for_day = await Event.find({
      where: {
        adjustedDate: date_today,
        goalLeftChannelId: IsNull() || "",
        completed: false,
        isActive: true,
      },
    });
  }
  console.log("HERE ARE EVENTS FOR DATE: ", date_today)
  console.log(events_for_day);

  // Create a channel in the "GOALS LEFT TODAY" category
  let podmate_role_id = guild?.roles.cache.find((r) => r.name === "podmate");
  let everyone_role_id = guild?.roles.cache.find((r) => r.name === "@everyone");
  const channel_permission_overwrites = [
    {
      id: podmate_role_id?.id as string,
      allow: [PermissionsBitField.Flags.ViewChannel],
    },
    {
      id: everyone_role_id?.id as string,
      deny: [PermissionsBitField.Flags.ViewChannel],
    },
  ];

  // check if category channel exists
  let category_channel = guild?.channels.cache.find(
    (channel) => channel.name === "--- GOALS LEFT TODAY"
  );
  if (!category_channel) {
    category_channel = await guild?.channels.create({
      name: "--- GOALS LEFT TODAY",
      type: ChannelType.GuildCategory,
      permissionOverwrites: channel_permission_overwrites,
    });
  }

  // Create a channel for each event due today
  events_for_day.forEach(async (event: Event) => {
    let user_id = event.discordId;
    let user = await User.findOne({ where: { discordId: user_id } });
    let weekly_goal = await WeeklyGoal.findOne({
      where: { id: event.goalId, isActive: true },
    });
    if (user) {
      guild?.channels
        .create({
          name: user.discordUsername,
          type: ChannelType.GuildText,
          permissionOverwrites: channel_permission_overwrites,
          parent: category_channel?.id,
        })
        .then((goal_left_channel_id) => {
          if (weekly_goal?.description) {
            (
              client.channels.cache.get(goal_left_channel_id.id) as TextChannel
            ).send(
              `<@${user?.discordId}>` +
                "\nToday's your day! Complete part of your weekly goal by sending a picture of evidence in: " +
                `<#${daily_updates_channel_id}>\n` +
                "🚧 Goal: " + weekly_goal?.description + 
                "\n🖼 Evidence: " + weekly_goal?.evidence
            );
          }
          const date_today = mdyDate(TODAY);
          Event.update(
            { discordId: user_id, adjustedDate: date_today, isActive: true },
            { goalLeftChannelId: goal_left_channel_id.id as string }
          );
        });
    }
  });
};
