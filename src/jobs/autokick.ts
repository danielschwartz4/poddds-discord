import { Client, Role } from "discord.js";
import { WeeklyGoal } from "../entities/WeeklyGoal";
import { ADMIN_USER_IDS } from "./discordScheduler";

export const autokick = async (
  client: Client<boolean>,
  server_id: string,
  timeZoneIsUTCMidnight: string
) => {
  const guild = client.guilds.cache.get(server_id);

  let podmate_role_id = guild?.roles.cache.find(
    (r: Role) => r.name === "podmate"
  );
  let kicked_role_id = guild?.roles.cache.find(
    (r: Role) => r.name === "kicked"
  );

  const activeGoals = await WeeklyGoal.find({
    where: { isActive: true, timeZone: timeZoneIsUTCMidnight },
  });

  // kick users that have active weekly goals after 3 misses
  activeGoals.forEach(async (goal: WeeklyGoal) => {
    const userId = goal.discordId;
    // if 2 misses, DM the person with a warning message
    if (goal.misses == 2) {
      client.users.fetch(userId).then(async (user_to_kick) => {
        let kick_msg = "❕ Automatic warning message from poddds mod here! ❕\n\n 👀 You've missed your weekly goal for 3 days in a row \n 📝 Complete your next objective or note in the skip channel that it's an off day so you don't get moved to kicked! \n🌟 Consistency does not mean perfection! Therefore, by completing your task and posting in #daily-updates-chat, you'll get moved back to 0 misses immediately!\n\n **If you get moved to kicked, you'll have to message the mods to be let back into the server, once you decide to recommit.** Cheers! 🍻"
        user_to_kick.send(kick_msg);
        ADMIN_USER_IDS.forEach((val: string) => {
          client.users.fetch(val as string).then((user) => {
            user.send("poddds bot sent to " + user_to_kick.username + ":\n" + kick_msg);
          });
        });
      });
    }

    // if more than 2 misses, change role of person to kicked
    if (goal.misses > 2) {
      client.users.fetch(userId).then((user_to_kick) => {
        let kick_msg = "‼ You've been put into the kicked role in the poddds community ‼\n\n🤗 We know things happen, so **if the community has helped you and you want to join back in again, message the mods saying what happened once you decide to recommit** \n\nFeel free to reach out using the #general channel for support in the meantime 🙂"
        user_to_kick.send(kick_msg);
        ADMIN_USER_IDS.forEach((val: string) => {
          client.users.fetch(val as string).then((user) => {
            user.send("poddds bot sent to " + user_to_kick.username + ":\n" + kick_msg);
          });
        });
      });
      const user = await guild?.members.fetch(userId);
      user?.roles.add(kicked_role_id as Role);
      user?.roles.remove(podmate_role_id as Role);
      WeeklyGoal.update({ discordId: userId }, { isActive: false });
    }
  });
};

// // kick users that have no active weekly goals after 7 days, only updating and sending messages at midnight
// const users = await User.find({});
// users.forEach(async (userObject: User) => {
//   const user = await guild?.members.fetch(userObject.discordId);

//   // If their role is a new member
//   // if createdAt date is 6 days ago, send a warning message
//   // if createdAt date is 7 days ago, change role of person to kicked
//   if (user?.roles.cache.some((role) => role.name === "new member")) {
//     const current_date = TODAY;

//     // only send messages once during our timezone EST
//     if (timeZoneIsUTCMidnight == "-5") {
//       let timeDifference =
//         current_date.getTime() - userObject.createdAt.getTime();
//       let daysDifference = timeDifference / (1000 * 3600 * 24);
//       if (daysDifference == 6) {
//         client.users.fetch(user.id).then((user) => {
//           user.send(
//             "Automatic warning message from poddds mod here! ❕ \nYou've been a new member and haven't created a weekly goal for 6 days. 👀\nCreate a weekly goal in #weekly-goals-setting by typing /new-goal so you don't get moved to kicked tomorrow! 📝 \nIf you get moved to kicked, you'll have to message the mods what happened to be let back into the server, once you decide to recommit. Cheers!🍻"
//           );
//         });
//       }

//       if (daysDifference > 6) {
//         client.users.fetch(user.id).then((user) => {
//           user.send(
//             "‼ You've been put into the kicked role in the poddds community. We know things happen, so if the community has helped you and you want to join back in again, message the mods saying what happened once you decide to recommit. Feel free to reach out using the #general channel for support in the meantime. 🙂"
//           );
//         });
//         user.roles.add(kicked_role_id as Role);
//         user.roles.remove(new_member_role_id as Role);
//       }
//     }

//     // If their role is a podmate
//     // find most recent weekly_goal
//     // if adjustedEndDate of weekly_goal is 6 days ago, send a warning message
//     // if adjustedEndDate of weekly_goal is 7 days ago, change role of person to kicked
//   } else if (user?.roles.cache.some((role) => role.name === "podmate")) {
//     let recentWeeklyGoal = await WeeklyGoal.findOne({
//       where: { discordId: userObject.discordId },
//       order: { id: "DESC" },
//     });

//     // only send messages once during timezone
//     if (recentWeeklyGoal?.timeZone == timeZoneIsUTCMidnight) {
//       const current_date = TODAY;
//       if (recentWeeklyGoal?.adjustedEndDate) {
//         let timeDifference =
//           current_date.getTime() -
//           recentWeeklyGoal?.adjustedEndDate?.getTime();
//         let daysDifference = timeDifference / (1000 * 3600 * 24);
//         if (daysDifference == 6) {
//           client.users.fetch(user.id).then((user) => {
//             user.send(
//               "Automatic warning message from poddds mod here! ❕ \nYou've been a podmate and haven't created a new weekly goal for 6 days. 👀\nCreate a weekly goal in #weekly-goals-setting by typing /new-goal so you don't get moved to kicked tomorrow! 📝 \nIf you get moved to kicked, you'll have to message the mods what happened to be let back into the server, once you decide to recommit. Cheers!🍻"
//             );
//           });
//         }

//         if (daysDifference > 6) {
//           client.users.fetch(user.id).then((user) => {
//             user.send(
//               "‼ You've been put into the kicked role in the poddds community. We know things happen, so if the community has helped you and you want to join back in again, message the mods saying what happened once you decide to recommit. Feel free to reach out using the #general channel for support in the meantime. 🙂"
//             );
//           });
//           user.roles.add(kicked_role_id as Role);
//           user.roles.remove(podmate_role_id as Role);
//         }
//       }
//     }
//   }
// });
