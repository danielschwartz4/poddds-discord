// bot handling when a new member posts a new goal

import { Client, Role } from "discord.js";
import { User } from "../entities/User";
import moment from "moment";

export const newGoalAlert = (
  client: Client<boolean>,
  goal_channel_id: String,
  admin_ids: string[]
) => {
  client.on("messageCreate", async (msg) => {
    const from_username = msg.author.username;
    if (
      msg.channelId === goal_channel_id &&
      msg.member?.roles.cache.some((role) => role.name === "new member")
    ) {
      // Notify admins of new podmate
      admin_ids.forEach((val) => {
        client.users.fetch(val as string).then((user) => {
          user.send(
            "poddds -- NEW PODMATE ALERT! DM them if there's no evidence or anything is unclear\n" +
              from_username +
              " says that their weekly goal and evidence will be:\n" +
              msg.content
          );
        });
      });

      // Automatically remove new member role and add podmate role to msg.author.roles
      const guild = client.guilds.cache.get(msg?.guildId as string);
      guild?.members.fetch(msg.author.id).then((user: any) => {
        let new_member_role_id = user.guild.roles.cache.find(
          (r: Role) => r.name === "new member"
        );
        let podmate_role_id = user.guild.roles.cache.find(
          (r: Role) => r.name === "podmate"
        );
        user.roles.add(podmate_role_id);
        user.roles.remove(new_member_role_id);
      });
      await User.update(
        { discordId: msg.author.id },
        { startedGoalAt: moment(new Date()) }
      );
    }
  });
};
