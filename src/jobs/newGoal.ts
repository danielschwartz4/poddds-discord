// bot handling when a new member posts a new goal

import { Client } from "discord.js";

// how do I figure out what types these are?
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
      let idx: String;

      // notify admins of new podmate
      admin_ids.forEach((val) => {
        client.users.fetch(val as string).then((user) => {
          user.send(
            "poddds -- NEW PODMATE ALERT!\n" +
              from_username +
              " says that their weekly goal and evidence will be:\n" +
              msg.content
          );
        });
      });

      // TODO: Automatically remove new member role and add podmate role to msg.author.roles
    }
  });
};
