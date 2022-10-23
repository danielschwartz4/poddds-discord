import { ChannelType, PermissionsBitField } from "discord.js";
import { GoalType } from "../../types/dbTypes";
import { GUILD } from "../discordScheduler";

export const createPodCategory = async (type: GoalType, podId: number) => {
  // Create permissions
  const pod_role_id = GUILD()?.roles.cache.find(
    (r) => r.name === type + "-" + podId
  );
  const everyone_role_id = GUILD()?.roles.cache.find(
    (r) => r.name === "@everyone"
  );

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

  const goal_setting_permissions = [
    {
      id: pod_role_id?.id as string,
      allow: [PermissionsBitField.Flags.ViewChannel],
    },
    {
      id: everyone_role_id?.id as string,
      deny: [
        PermissionsBitField.Flags.ViewChannel,
        PermissionsBitField.Flags.SendMessages,
      ],
    },
  ];

  const pod_category = await GUILD()?.channels.create({
    name:
      type === "fitness"
        ? "--- 💪 " + type + " pod " + podId
        : "--- 📚 " + type + " pod " + podId,
    type: ChannelType.GuildCategory,
    permissionOverwrites: channel_permission_overwrites,
  });

  await GUILD()?.channels.create({
    name: "💬general",
    type: ChannelType.GuildText,
    permissionOverwrites: channel_permission_overwrites,
    parent: pod_category?.id,
  });
  await GUILD()?.channels.create({
    name: "🚩daily-updates-chat",
    type: ChannelType.GuildText,
    permissionOverwrites: channel_permission_overwrites,
    parent: pod_category?.id,
  });
  await GUILD()?.channels.create({
    name: "🏁view-goals",
    type: ChannelType.GuildText,
    permissionOverwrites: goal_setting_permissions,
    parent: pod_category?.id,
  });
  await GUILD()?.channels.create({
    name: "⏸break",
    type: ChannelType.GuildText,
    permissionOverwrites: channel_permission_overwrites,
    parent: pod_category?.id,
  });
  await GUILD()?.channels.create({
    name: "🔥wins",
    type: ChannelType.GuildText,
    permissionOverwrites: channel_permission_overwrites,
    parent: pod_category?.id,
  });
  await GUILD()?.channels.create({
    name: "🚪leave-pod",
    type: ChannelType.GuildText,
    permissionOverwrites: channel_permission_overwrites,
    parent: pod_category?.id,
  });

  return pod_category;
};
