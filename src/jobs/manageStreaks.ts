import { Client, Guild, Role } from "discord.js";
import cron from "node-cron";
import { User } from "../entities/User";
import { UserResolver } from "../resolvers/user";

interface cronScheduler {
  guild?: Guild;
  role?: Role;
}

// as example runs every min
const cronScheduler = async (client: Client<boolean>, server_id: string) => {
  // update streaks daily from database numbers using cron
  // cron.schedule('*/1 * * * *', async () => {

  console.log("running cron!");
  // const user_streak = 3
  // const USER_ID = "743590338337308754"
  const guild = client.guilds.cache.get(server_id);

  const users = await User.find();
  console.log("USERS FOUND");
  console.log(users);

  // TODO: iterate through all users in usersDB
  //   for (user in users) {
  //     // TODO: Update vars
  //     let user_id = user.id;
  //     let user_streak = curr_date - usercreatedAt;

  //     // TODO: Track the streak of podmate
  //     guild.members.fetch(user_id).then((user: any) => {
  //       if (user.roles.cache.some((role) => role.name === "podmate")) {
  //         // Update the role if the streak is above a certain amount
  //         let r: Role;
  //         let three_streak_id = guild.roles.cache.find(
  //           (r) => r.name === "3 days active streak!"
  //         );
  //         let seven_streak_id = guild.roles.cache.find(
  //           (r) => r.name === "7 days active streak!"
  //         );

  //         user_streak > 3
  //           ? user.roles.add(three_streak_id)
  //           : user.roles.remove(three_streak_id);
  //         user_streak > 7
  //           ? user.roles.add(seven_streak_id)
  //           : user.roles.remove(seven_streak_id);
  //       }
  //     });
  //   }

  // });
};

export default cronScheduler;
