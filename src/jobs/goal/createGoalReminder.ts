import { botDMNotification } from "../../utils/adminNotifs";
import { CLIENT } from "../../constants";
import { readAllUsers } from "../../resolvers/user";
import { readLastWeeklyGoalByType } from "../../resolvers/weeklyGoal";
import { GUILD, ROLE_IDS } from "../discordScheduler";
import { Role } from "discord.js";

export const createGoalReminder = async () => {
  botDMNotification("EVERY NEW MEMBER AND INACTIVE PODMATES", "CREATE A WEEKLY GOAL REMINDER!"); // notify admins via DM
  const users = await readAllUsers();

  for (const idx of Array(users.length).keys()) {
    setTimeout(async () => {
      let userObject = users[idx]
      let userOnServer = await CLIENT.users.fetch(userObject.discordId);
      if (userOnServer && !userOnServer.bot) {
        // !! added this becuasae we need the type for readLastWeeklyGoalByType.
        // !! getting the user's most recent goal is no longer ok since they can have two goals
        const fitnessWeeklyGoal = await readLastWeeklyGoalByType(
          userObject.discordId,
          "fitness"
        );
        const studyWeeklyGoal = await readLastWeeklyGoalByType(
          userObject.discordId,
          "study"
        );

        const userGuildMember = await GUILD()?.members.fetch(userObject.discordId);
        // if the user does not have an active weekly goal, send them this reminder
        if (!fitnessWeeklyGoal && !studyWeeklyGoal && userGuildMember?.roles.cache.some((role) => role == ROLE_IDS()['podmateRoleId'] as Role)) {
          CLIENT.users.fetch(userObject.discordId).then((user) => {
            console.log(
              "Weekly reminder being set to the following user: ",
              userObject.discordUsername
            );
            if (user) {
              user.send(
                "Hey! ⌚ Automatic weekly reminder from poddds mod here to **CREATE A GOAL!**⌚\n✅ Make sure you head over to **GOAL SETTING** and type **/set-current-goal** to get started on your new goal!"
              ).catch((err) => {
                console.log(err)
              });
            }
          });
        }
      }
    }, 1000 * 60 * 2 * idx);
  }
};
