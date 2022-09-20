import { ChannelType, PermissionsBitField } from "discord.js";
import { GoalType } from "src/types/dbTypes";
import { CLIENT, SERVER_ID } from "../discordScheduler";

export const createPodCategory = async (type: GoalType, podId: number) => {
  const guild = CLIENT.guilds.cache.get(SERVER_ID as string);
  // Create permissions
  let pod_role_id = guild?.roles.cache.find((r) => r.name === type + podId);
  // let pod_role_id = guild?.roles.cache.get(type + podId);
  let everyone_role_id = guild?.roles.cache.get(guild?.id);

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
  const pod_category = await guild?.channels.create({
    name:
      type === "exercise"
        ? "--- 💪 " + type + " pod " + podId
        : "--- 📚 " + type + " pod " + podId,
    type: ChannelType.GuildCategory,
    permissionOverwrites: channel_permission_overwrites,
  });

  // await guild?.channels.create({
  //   name: "💬general",
  //   type: ChannelType.GuildText,
  //   permissionOverwrites: channel_permission_overwrites,
  //   parent: pod_category?.id,
  // });
  // await guild?.channels.create({
  //   name: "🚩daily-updates-chat",
  //   type: ChannelType.GuildText,
  //   permissionOverwrites: channel_permission_overwrites,
  //   parent: pod_category?.id,
  // });
  await guild?.channels.create({
    name: "🏁weekly-goals-setting",
    type: ChannelType.GuildText,
    permissionOverwrites: channel_permission_overwrites,
    parent: pod_category?.id,
  });
  // await guild?.channels.create({
  //   name: "🛑break",
  //   type: ChannelType.GuildText,
  //   permissionOverwrites: channel_permission_overwrites,
  //   parent: pod_category?.id,
  // });
  // await guild?.channels.create({
  //   name: "🔥self-promo",
  //   type: ChannelType.GuildText,
  //   permissionOverwrites: channel_permission_overwrites,
  //   parent: pod_category?.id,
  // });
  await guild?.channels.create({
    name: "🚪leave-pod",
    type: ChannelType.GuildText,
    permissionOverwrites: channel_permission_overwrites,
    parent: pod_category?.id,
  });

  return pod_category;
};
