import {
  ChannelType,
  PermissionsBitField,
  TextChannel,
} from "discord.js";
import { IsNull } from "typeorm";
import { LOCAL_TODAY } from "../constants";
import { Event } from "../entities/Event";
import { User } from "../entities/User";
import { WeeklyGoal } from "../entities/WeeklyGoal";
import { mdyDate } from "../utils/timeZoneUtil";
import { CLIENT, DAILY_UPDATES_CHAT_CHANNEL_ID, SERVER_ID } from "./discordScheduler";
import { deactivateGoalsAndEvents } from "./goalsLeftToday/deactivateGoals";
import { updateGoalsYesterday } from "./goalsLeftToday/updateGoalsYesterday";

export const updateGoalsToday = async (
  timeZoneIsUTCMidnight?: string
) => {
  await updateGoalsYesterday(timeZoneIsUTCMidnight);

  // add goalsChannels for today if there is no channel id and if it's their day
  const guild = CLIENT.guilds.cache.get(SERVER_ID as string);
  const date_today = mdyDate(LOCAL_TODAY(timeZoneIsUTCMidnight as string)); // use local today because you want to find the local date based on the timezone and update and display that
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
  console.log("HERE ARE EVENTS THAT WILL BE UPDATED TO IS ACTIVE AND POSTED WHERE TODAY IS: ", date_today, " FOR TIMEZONE ", timeZoneIsUTCMidnight)
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

    // if their role isn't a podmate, then deactivate their goals !! issue here (need to create a helper function to activate goals and events given a discord id now :/)
    let userDiscordObject = await guild?.members.fetch(user_id);
    if (userDiscordObject) {
      if (userDiscordObject?.roles.cache.some((role) => role.name === "podmate")) {
        '' // just checking if ONE of their roles is podmate
      } else {
        deactivateGoalsAndEvents(user_id) // none of their roles is podmate
      }
    }

    let user = await User.findOne({ where: { discordId: user_id } });
    let weekly_goal = await WeeklyGoal.findOne({
      where: { id: event.goalId, isActive: true },
    });
    if (user && weekly_goal) {
      guild?.channels
        .create({
          name: user.discordUsername,
          type: ChannelType.GuildText,
          permissionOverwrites: channel_permission_overwrites,
          parent: category_channel?.id,
        })
        .then(async (goal_left_channel_id) => {
          if (weekly_goal?.description) {
            (
              CLIENT.channels.cache.get(goal_left_channel_id.id) as TextChannel
            ).send(
              // `<@${user?.discordId}>` +
                "Today's your day! Complete part of your weekly goal by sending a picture of evidence in: " +
                `<#${DAILY_UPDATES_CHAT_CHANNEL_ID}>\n` +
                "🚧 Goal: " + weekly_goal?.description + 
                "\n🖼 Evidence: " + weekly_goal?.evidence
            );
          }
          let res = await Event.update(
            { discordId: user_id, adjustedDate: date_today, isActive: true },
            { goalLeftChannelId: goal_left_channel_id.id as string }
          );
          console.log("NEW EVENT WITH GOAL LEFT CHANNEL ID UPDATED FOR USER ", user_id, " ON ", date_today)
          console.log(res)
        });
    }
  });
};
