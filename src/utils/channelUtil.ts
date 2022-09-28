import { Guild } from "discord.js";
import { readUser } from "../resolvers/user";
import { GoalType } from "../types/dbTypes";

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

export const getPodCategoryChannelsByType = async (
  discordId: string,
  type: GoalType,
  GUILD: Guild
) => {
  const userObject = await readUser(discordId);
  let podName: string;
  if (type === "fitness") {
    podName = "--- 💪 fitness pod " + userObject?.fitnessPodId;
  } else if (type === "study") {
    podName = "--- 📚 study pod " + userObject?.studyPodId;
  }
  if (!type) return;
  const userPodCategoryChannel = GUILD?.channels.cache.find(
    (channel) => channel.name === podName
  );
  const categoryChannels = GUILD.channels.cache.filter(
    (c) => c.parentId === userPodCategoryChannel?.id
  );
  return categoryChannels;
};

export const getPodCategoryChannelsByPodId = async (
  podId: number,
  type: GoalType,
  GUILD: Guild
) => {
  let podName: string;
  if (type === "fitness") {
    podName = "--- 💪 fitness pod " + podId;
  } else if (type === "study") {
    podName = "--- 📚 study pod " + podId;
  }
  if (!type) return;
  const userPodCategoryChannel = GUILD?.channels.cache.find(
    (channel) => channel.name === podName
  );
  const categoryChannels = GUILD.channels.cache.filter(
    (c) => c.parentId === userPodCategoryChannel?.id
  );
  return categoryChannels;
};
