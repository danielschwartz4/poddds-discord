import { CLIENT } from "../../constants";
import { User } from "../../entities/User";
import { readAllUsers } from "../../resolvers/user";
import { readLastWeeklyGoalByType } from "../../resolvers/weeklyGoal";

export const createGoalReminder = async () => {
  console.log("CREATE GOAL REMINDER");
  const users = await readAllUsers();

  users.forEach(async (userObject: User) => {
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

      // if the user does not have an active weekly goal, send them this reminder
      if (!fitnessWeeklyGoal) {
        CLIENT.users.fetch(userObject.discordId).then((user) => {
          console.log(
            "Weekly reminder being set to the following user: ",
            userObject.discordUsername
          );
          if (user) {
            try {
              user.send(
                "Hey! ⌚ Automatic weekly reminder from poddds mod here to **CREATE A GOAL!**⌚\n✅ Make sure you head over to **GOAL SETTING** and type **/set-current-goal** to get started on your new goal!"
              );
            } catch {
              console.log(
                "THERE WAS AN ERROR SENDING TO THE FOLLOWING USER: ",
                userObject.discordUsername,
                " WITH DB ID: ",
                userObject.id
              );
            }
          }
        });
      }
      // if the user does not have an active weekly goal, send them this reminder
      if (!studyWeeklyGoal) {
        CLIENT.users.fetch(userObject.discordId).then((user) => {
          console.log(
            "Weekly reminder being set to the following user: ",
            userObject.discordUsername
          );
          if (user) {
            try {
              user.send(
                "Hey! ⌚ Automatic weekly reminder from poddds mod here to **CREATE A GOAL!**⌚\n✅ Make sure you head over to **GOAL SETTING** and type **/set-current-goal** to get started on your new goal!"
              );
            } catch {
              console.log(
                "THERE WAS AN ERROR SENDING TO THE FOLLOWING USER: ",
                userObject.discordUsername,
                " WITH DB ID: ",
                userObject.id
              );
            }
          }
        });
      }
    }
  });
};
