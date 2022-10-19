import { PermissionsBitField } from "discord.js";
import { readAllUsers } from "../resolvers/user";
import { GUILD } from "../jobs/discordScheduler";
import { createVoiceChannel, readChannelByName } from "../utils/channelUtil";
import { readActiveGoalById } from "../resolvers/weeklyGoal";

export const displayRabidUsersCount = async () => {
  let displayChannelName = "4+ Weeks Users: ";
  const activeGoalsChannel = readChannelByName(displayChannelName);
  if (activeGoalsChannel) {
    activeGoalsChannel.delete();
  }

  const mod_role_id = GUILD()?.roles.cache.find((r) => r.name === "🛡 mod");
  const everyone_role_id = GUILD()?.roles.cache.find(
    (r) => r.name === "@everyone"
  );
  const channel_permission_overwrites = [
    {
      id: mod_role_id?.id as string,
      allow: [PermissionsBitField.Flags.ViewChannel],
    },
    {
      id: everyone_role_id?.id as string,
      deny: [
        PermissionsBitField.Flags.ViewChannel,
        PermissionsBitField.Flags.Connect,
      ],
    },
  ];
  const allUsers = await readAllUsers();
  let count = 0;

  for (const user of allUsers) {
    await GUILD()
      ?.members.fetch(user.discordId)
      .then(async (userDiscord) => {
        if (
          userDiscord.roles.cache.some((role) => role.name === "🚀 podmate")
        ) {
          const activeGoal = await readActiveGoalById(user.discordId);

          if (activeGoal.length) {
            // calculate today - created at date, and if they have an active goal
            let days = new Date().getTime() - user.createdAt.getTime();
            let weeks = days / (24 * 3600 * 1000 * 7);

            if (weeks >= 4) {
              console.log(
                "USER HERE FOR 4+ WEEKS, REACH OUT TO THIS PERSON AND BUILD FOR THEM: ",
                user.discordUsername
              );
              count += 1;
            }
          }
        }
      })
      .catch(() => {});
  }

  displayChannelName += count;
  createVoiceChannel(displayChannelName, channel_permission_overwrites, 1);
};
