import { CategoryChannel, ChannelType, Guild, PermissionsBitField, TextChannel } from "discord.js";
import { CLIENT, LOCAL_TODAY } from "../constants";
import { User } from "../entities/User";
import { WeeklyGoal } from "../entities/WeeklyGoal";
import { updateEventGoalLeftChannelId } from "../resolvers/event";
import { readUser } from "../resolvers/user";
import { GoalType } from "../types/dbTypes";
import { colorBooleanMapper } from "./goalUtils";

export const createGoalsLeftTodayCategory = async (GUILD: Guild, position: number) => {
  const podmate_role_id = GUILD?.roles.cache.find((r) => r.name === "podmate");
  const everyone_role_id = GUILD?.roles.cache.find((r) => r.name === "@everyone");
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
  const categoryChannel = await GUILD?.channels.create({
    name: "--- GOALS LEFT TODAY",
    type: ChannelType.GuildCategory,
    permissionOverwrites: channel_permission_overwrites,
    position
  });

  return categoryChannel
}

export const createGoalsLeftTodayChannel = async (GUILD: Guild, user: User, category_channel: CategoryChannel, weekly_goal: WeeklyGoal, timeZoneIsUTCMidnight: string, date_today: string) => {
  const podmate_role_id = GUILD?.roles.cache.find((r) => r.name === "podmate");
  const everyone_role_id = GUILD?.roles.cache.find((r) => r.name === "@everyone");
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

  // create a new channel
  GUILD?.channels.create({
    name: user.discordUsername,
    type: ChannelType.GuildText,
    permissionOverwrites: channel_permission_overwrites,
    parent: category_channel?.id,
  }).then(async (goal_left_channel_id) => {
    if (weekly_goal?.description) {
      var Difference_In_Time = weekly_goal.adjustedEndDate.getTime() - LOCAL_TODAY(timeZoneIsUTCMidnight as string).getTime();
      // To calculate the no. of days between two dates
      var Difference_In_Days = Math.round(Difference_In_Time / (1000 * 3600 * 24)) + 1;
      let days_left_message = Difference_In_Days + " days left!";
      if (Difference_In_Days === 1) { days_left_message = "1 day left! 🏁 🏃‍♂️" }

      let dates = "";
      if (weekly_goal.days) {
        dates =
          "S-" +
          colorBooleanMapper(weekly_goal.days["sunday"]) +
          "  M-" +
          colorBooleanMapper(weekly_goal.days["monday"]) +
          "  T-" +
          colorBooleanMapper(weekly_goal.days["tuesday"]) +
          "  W-" +
          colorBooleanMapper(weekly_goal.days["wednesday"]) +
          "  T-" +
          colorBooleanMapper(weekly_goal.days["thursday"]) +
          "  F-" +
          colorBooleanMapper(weekly_goal.days["friday"]) +
          "  S-" +
          colorBooleanMapper(weekly_goal.days["saturday"]);
      }

      (
        CLIENT.channels.cache.get(goal_left_channel_id.id) as TextChannel
      ).send(
        // fix starting below
        "Today's your day! Complete your goal by sending evidence in **🚩daily-updates-chat**\n" +
          "🚧 **Goal**: " +
          weekly_goal?.description +
          "\n🖼 **Evidence**: " +
          weekly_goal?.evidence +
          "\n🔥 **" +
          days_left_message +
          "**" +
          "\n" +
          dates
      );
    let res = await updateEventGoalLeftChannelId(user.discordId, date_today, goal_left_channel_id.id as string)
    console.log("Event updated with goal left channel id", res)
    }
  });
}

export const readTypeFromChannelName = (name: string) => {
    name = name.toLowerCase()
    let type;
    if (name.includes('exercise pod') || name.includes('fitness pod')) {
        type = 'exercise'
    } else if (name.includes('study pod')) {
        type = 'study'
    }
    return type
}

export const readPodCategoryChannelsByType = async (discordId: string, type: GoalType, GUILD: Guild) => {
    const userObject = await readUser(discordId)
    let podName: string;
    if (type === 'exercise') {
      podName = "--- 💪 exercise pod " + userObject?.exercisePodId
    } else if (type === 'study') {
      podName = "--- 📚 study pod " + userObject?.studyPodId
    }
    if (!type) return
    const userPodCategoryChannel = GUILD?.channels.cache.find((channel) => channel.name === podName)
    const categoryChannels = GUILD.channels.cache.filter(c => c.parentId === userPodCategoryChannel?.id)
    return categoryChannels
}

export const readPodCategoryChannelsByPodId = async (podId: number, type: GoalType, GUILD: Guild) => {
    let podName: string;
    if (type === 'exercise') {
      podName = "--- 💪 exercise pod " + podId
    } else if (type === 'study') {
      podName = "--- 📚 study pod " + podId
    }
    if (!type) return
    const userPodCategoryChannel = GUILD?.channels.cache.find((channel) => channel.name === podName)
    const categoryChannels = GUILD.channels.cache.filter(c => c.parentId === userPodCategoryChannel?.id)
    return categoryChannels
}

export const readPodCategoryChannelByPodId = async (podId: number, type: GoalType, GUILD: Guild) => {
  let podName: string;
  if (type === 'exercise') {
    podName = "--- 💪 exercise pod " + podId
  } else if (type === 'study') {
    podName = "--- 📚 study pod " + podId
  }
  if (!type) return
  const userPodCategoryChannel = GUILD?.channels.cache.find((channel) => channel.name === podName)
  return userPodCategoryChannel as CategoryChannel
}

export const readPodGoalsLeftTodayCategoryChannelByPodId = async (podId: number, type: GoalType, GUILD: Guild) => {
  let podName: string;
  if (type === 'exercise') {
    podName = "--- goals left today, fitness pod " + podId
  } else if (type === 'study') {
    podName = "--- goals left today, study pod " + podId
  }
  if (!type) return
  const userPodCategoryChannel = GUILD?.channels.cache.find((channel) => channel.name === podName)
  // const categoryChannels = GUILD.channels.cache.filter(c => c.parentId === userPodCategoryChannel?.id) // this is how you get the children objects of the category
  return userPodCategoryChannel
}