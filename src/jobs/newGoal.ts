// bot handling when a new member posts a new goal

import { Client } from "discord.js";

// how do I figure out what types these are?
export const newGoalAlert = (
  client: Client<boolean>,
  goal_channel_id: String,
  admin_ids: String[]
) => {
  client.on("messageCreate", async (msg) => {
    const from_username = msg.author.username;
    if (
      msg.channelId === goal_channel_id &&
      msg.member?.roles?.cache.some((role) => role.name === "new member")
    ) {
      let idx: String;
      for (idx in admin_ids) {
        client.users.fetch(admin_ids[idx]).then((user) => {
          user.send(
            "poddds -- NEW POTENTIAL PODMATE ALERT!\n" +
              from_username +
              " says that their weekly goal and evidence will be:\n" +
              msg.content
          );
        });
      }
    }
  });
};
