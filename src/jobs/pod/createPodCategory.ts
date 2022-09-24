import { ChannelType, PermissionsBitField } from "discord.js";
import { GUILD } from "../../constants";
import { GoalType } from "../../types/dbTypes";

export const createPodCategory = async (type: GoalType, podId: number) => {
  // Create permissions
  let pod_role_id = GUILD?.roles.cache.find((r) => r.name === type + podId);
  // let pod_role_id = guild?.roles.cache.get(type + podId);
  let everyone_role_id = GUILD?.roles.cache.get(GUILD?.id);

  const channel_permission_overwrites = [
    {
      id: pod_role_id?.id as string,
      allow: [PermissionsBitField.Flags.ViewChannel],
    },
    {
      id: everyone_role_id?.id as string,
      deny: [PermissionsBitField.Flags.ViewChannel],
    },
  ];
  const pod_category = await GUILD?.channels.create({
    name:
      type === "exercise"
        ? "--- 💪 " + type + " pod " + podId
        : "--- 📚 " + type + " pod " + podId,
    type: ChannelType.GuildCategory,
    permissionOverwrites: channel_permission_overwrites,
  });

  await GUILD?.channels.create({
    name: "💬general",
    type: ChannelType.GuildText,
    permissionOverwrites: channel_permission_overwrites,
    parent: pod_category?.id,
  });
  await GUILD?.channels.create({
    name: "🚩daily-updates-chat",
    type: ChannelType.GuildText,
    permissionOverwrites: channel_permission_overwrites,
    parent: pod_category?.id,
  });
  await GUILD?.channels.create({
    name: "🏁goals-setting",
    type: ChannelType.GuildText,
    permissionOverwrites: channel_permission_overwrites,
    parent: pod_category?.id,
  });
  await GUILD?.channels.create({
    name: "🛑break",
    type: ChannelType.GuildText,
    permissionOverwrites: channel_permission_overwrites,
    parent: pod_category?.id,
  });
  await GUILD?.channels.create({
    name: "🔥self-promo",
    type: ChannelType.GuildText,
    permissionOverwrites: channel_permission_overwrites,
    parent: pod_category?.id,
  });
  await GUILD?.channels.create({
    name: "🚪leave-pod",
    type: ChannelType.GuildText,
    permissionOverwrites: channel_permission_overwrites,
    parent: pod_category?.id,
  });

  return pod_category;
};
