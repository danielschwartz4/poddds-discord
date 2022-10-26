import { CategoryChannel, ChannelType, PermissionsBitField, TextChannel } from "discord.js";
import { GUILD } from "../jobs/discordScheduler";
import { CLIENT, LOCAL_TODAY, TODAY } from "../constants";
import { User } from "../entities/User";
import { WeeklyGoal } from "../entities/WeeklyGoal";
import { readUser } from "../resolvers/user";
import { GoalType } from "../types/dbTypes";
import { colorBooleanMapper } from "./goalUtils";
import { expiredGoalNotif } from "../jobs/goal/expiredGoalNotif";
import { readSupport } from "../resolvers/support";

export const createTextChannel = (channelName: string, channel_permission_overwrites: any[], position?: number) => {
  return GUILD()?.channels.create({
    name: channelName,
    type: ChannelType.GuildText,
    permissionOverwrites: channel_permission_overwrites,
    position
  });
}

export const createVoiceChannel = (channelName: string, channel_permission_overwrites: any[], position?: number) => {
  return GUILD()?.channels.create({
    name: channelName,
    type: ChannelType.GuildVoice,
    permissionOverwrites: channel_permission_overwrites,
    position
  });
}

export const createGoalsLeftTodayCategory = async (position: number, type: GoalType, podId: number) => {
  const podmate_role_id = GUILD()?.roles.cache.find(
    (r) => r.name === type + "-" + podId
  );
  const everyone_role_id = GUILD()?.roles.cache.find((r) => r.name === "@everyone");
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

  const name_descriptor = type + " pod " + podId
  const goals_position = position + 1

  const categoryChannel = await GUILD()?.channels.create({
    name: "--- goals left today, " + name_descriptor,
    type: ChannelType.GuildCategory,
    permissionOverwrites: channel_permission_overwrites,
    position: goals_position
  });

  return categoryChannel
}

export const createGoalsLeftTodayChannel = async (user: User, category_channel: CategoryChannel, weekly_goal: WeeklyGoal, timeZoneIsUTCMidnight: string, podType: GoalType, podId: number) => {
  const podmate_role_id = GUILD()?.roles.cache.find(
    (r) => r.name === podType + "-" + podId
  );
  const everyone_role_id = GUILD()?.roles.cache.find((r) => r.name === "@everyone");
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
  GUILD()?.channels.create({
    name: user.discordUsername,
    type: ChannelType.GuildText,
    permissionOverwrites: channel_permission_overwrites,
    parent: category_channel?.id,
  }).then(async (goal_left_channel) => {
    if (weekly_goal?.description) {
      var Difference_In_Time = weekly_goal.adjustedEndDate.getTime() - LOCAL_TODAY(timeZoneIsUTCMidnight as string).getTime();
      // To calculate the no. of days between two dates
      var Difference_In_Days = Math.round(Difference_In_Time / (1000 * 3600 * 24));
      let days_left_message = Difference_In_Days + " days left!";
      if (Difference_In_Days === 1) { days_left_message = "1 day left! 🏁 🏃‍♂️ " + `<@${user.discordId}>` }
      if (Difference_In_Days < 1) { expiredGoalNotif(user.discordId, podType, weekly_goal) } // backup code in case expired goal notif doesn't trigger somehow

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

      const userSupport = await readSupport(weekly_goal.discordId);
      const userSupportPoints = userSupport?.points;
      (
        CLIENT.channels.cache.get(goal_left_channel.id) as TextChannel
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
          dates + 
          "\n**⭐ Support points: **" + userSupportPoints
      );
    }
  });
}

export const readTypeFromChannelName = (name: string) => {
  name = name.toLowerCase();
  let type;
  if (name.includes("fitness pod") || name.includes("fitness pod")) {
    type = "fitness";
  } else if (name.includes("study pod")) {
    type = "study";
  }
  return type;
};

export const readChannelByName = (channelName: string) => {
  return GUILD()?.channels.cache.find((channel) => channel.name.includes(channelName))
}

export const readPodCategoryChannelsByType = async (discordId: string, type: GoalType) => {
    const userObject = await readUser(discordId)
    let podName: string;
    if (type === 'fitness') {
      podName = "--- 💪 fitness pod " + userObject?.fitnessPodId
    } else if (type === 'study') {
      podName = "--- 📚 study pod " + userObject?.studyPodId
    }
    if (!type) return
    const userPodCategoryChannel = GUILD()?.channels.cache.find((channel) => channel.name === podName)
    const categoryChannels = GUILD()?.channels.cache.filter(c => c.parentId === userPodCategoryChannel?.id)
    return categoryChannels
}

export const readPodCategoryChannelsByPodId = async (podId: number, type: GoalType) => {
    let podName: string;
    if (type === 'fitness') {
      podName = "--- 💪 fitness pod " + podId
    } else if (type === 'study') {
      podName = "--- 📚 study pod " + podId
    }
    if (!type) return
    const userPodCategoryChannel = GUILD()?.channels.cache.find((channel) => channel.name === podName)
    const categoryChannels = GUILD()?.channels.cache.filter(c => c.parentId === userPodCategoryChannel?.id)
    return categoryChannels
}

export const readPodCategoryChannelByPodId = async (podId: number, type: GoalType) => {
  let podName: string;
  if (type === 'fitness') {
    podName = "--- 💪 fitness pod " + podId
  } else if (type === 'study') {
    podName = "--- 📚 study pod " + podId
  }
  if (!type) return
  const userPodCategoryChannel = GUILD()?.channels.cache.find((channel) => channel.name === podName)
  return userPodCategoryChannel as CategoryChannel
}

export const readPodGoalsLeftTodayCategoryChannelByPodId = async (podId: number, type: GoalType) => {
  let podName = "--- goals left today, " + type + " pod " + podId
  const userPodCategoryChannel = GUILD()?.channels.cache.find((channel) => channel.name === podName)
  return userPodCategoryChannel
}

export const deleteGoalLeftTodayChannel = async (podId: number, podType: GoalType, userId: string) => {
  let goalsLeftCategoryChannel = await readPodGoalsLeftTodayCategoryChannelByPodId(podId, podType);
  const goalsLeftChannels = GUILD()?.channels.cache.filter(c => c.parentId === goalsLeftCategoryChannel?.id)
  
  const user = await readUser(userId)

  // if the username is found in goals left today as a channel, delete it
  const userChannels = goalsLeftChannels?.filter(c => c.name === user?.discordUsername.toLowerCase())
  userChannels?.forEach((channel) => {
      setTimeout(() => {
          channel?.delete();
      }, 1000 * 3);
  })
}

export const deleteGoalLeftTodayChannelByPodType = async (podType: GoalType, userId: string) => {
  const user = await readUser(userId)

  // figure out podId
  let podId
  if (podType == 'fitness') {
      podId = user?.fitnessPodId
  } else if (podType = 'study') {
      podId = user?.studyPodId
  }

  let goalsLeftCategoryChannel = await readPodGoalsLeftTodayCategoryChannelByPodId(podId as number, podType);
  const goalsLeftChannels = GUILD()?.channels.cache.filter(c => c.parentId === goalsLeftCategoryChannel?.id)
  
  // if the username is found in goals left today as a channel, delete it
  const userChannels = goalsLeftChannels?.filter(c => c.name === user?.discordUsername.toLowerCase())
  userChannels?.forEach((channel) => {
      setTimeout(() => {
          channel?.delete();
      }, 1000 * 3);
  })
}

export const deleteGoalLeftTodayChannelByChannelId = async (channelId: string, userId: string) => {
  const channel = CLIENT.channels.cache.get(channelId) as TextChannel;

  const podType = channel?.parent?.name.includes("💪")
      ? "fitness"
      : "study";
  const podId = parseInt(channel?.parent?.name.split(" ").pop() as string);

  let goalsLeftCategoryChannel = await readPodGoalsLeftTodayCategoryChannelByPodId(podId, podType);
  const goalsLeftChannels = GUILD()?.channels.cache.filter(c => c.parentId === goalsLeftCategoryChannel?.id)
  
  const user = await readUser(userId)

  // if the username is found in goals left today as a channel, delete it
  const userChannels = goalsLeftChannels?.filter(c => c.name === user?.discordUsername.toLowerCase())
  userChannels?.forEach((channel) => {
      setTimeout(() => {
          channel?.delete();
      }, 1000 * 3);
  })
}

export const clearOldGoalsLeftTodayChannels = async (podId: number, podType: GoalType) => {
  let goalsLeftCategoryChannel = await readPodGoalsLeftTodayCategoryChannelByPodId(podId, podType);
  const goalsLeftChannels = GUILD()?.channels.cache.filter(c => c.parentId === goalsLeftCategoryChannel?.id)
  goalsLeftChannels?.forEach((guildChannel) => {
    let channel_id = guildChannel.id
    let channel = GUILD()?.channels.cache.filter(c => c.id === channel_id)
    let channel_text = channel?.get(channel_id) as TextChannel
    channel_text.messages.fetch({ limit: 1 }).then((msg) => {
      const msgTimestamp = msg.first()?.createdTimestamp
      if (msgTimestamp) {
        // difference is in milliseconds
        const days_elapsed = (TODAY().getTime() - msgTimestamp) / (1000 * 60 * 60 * 24)
        if (days_elapsed > 1) {
          console.log("deleting channel that was here for 1+ days for ", guildChannel.name, " in pod ", podId)
          try {
            guildChannel?.delete()
          } catch {
            console.log("ERROR IN DELETING GUILD CHANNEL")
          }

        }
      }
    })
  })
}