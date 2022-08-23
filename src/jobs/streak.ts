import { Client, Guild, Role, TextChannel } from "discord.js";
import cron from "node-cron";
import { User } from "../entities/User";

interface cronScheduler {
  guild?: Guild;
  role?: Role;
}

// as example runs every min
const cronScheduler = async (
  client: Client<boolean>,
  server_id: string,
  streak_channel_id: string
) => {
  // update streaks daily from database numbers using cron, everyday @ midnight
  cron.schedule("0 0 * * *", async () => {
    console.log("running cron!");
    const guild = client.guilds.cache.get(server_id);

    const users = await User.find();
    // iterate through all users in usersDB
    users.forEach(async (user: User) => {
      let user_id = user.discordId;
      if (user.startedGoalAt) {
        const curr_date = new Date();

        let user_streak_seconds =
          (user.startedGoalAt.getTime() - curr_date.getTime()) / 1000;
        let user_streak = user_streak_seconds / (60 * 60 * 24);

        // Track the streak of podmate
        guild?.members.fetch(user_id).then((user) => {
          if (user.roles.cache.some((role) => role.name === "podmate")) {
            // Update the role if the streak is above a certain amount
            let three_streak_id = guild.roles.cache.find(
              (r) => r.name === "3 days active streak!"
            );
            let seven_streak_id = guild.roles.cache.find(
              (r) => r.name === "7 days active streak!"
            );

            if (user_streak > 3) {
              user.roles.add(three_streak_id as Role);
              (
                client.channels.cache.get(streak_channel_id) as TextChannel
              ).send(
                "<@" +
                  user.id +
                  ">" +
                  " just reached their 3 days active streak! 🔥🔥🔥"
              );
            } else {
              user.roles.remove(three_streak_id as Role);
            }
            if (user_streak > 7) {
              user.roles.add(seven_streak_id as Role);
              (
                client.channels.cache.get(streak_channel_id) as TextChannel
              ).send(
                "<@" +
                  user.id +
                  ">" +
                  " just reached their 7 days active streak! 🔥🔥🔥🔥🔥🔥🔥"
              );
            } else {
              user.roles.remove(seven_streak_id as Role);
            }
          }
        });
      }
    });
  });
};

export default cronScheduler;
