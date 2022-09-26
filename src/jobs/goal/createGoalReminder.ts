import { Client } from "discord.js";
import { User } from "../../entities/User";
import { readAllUsers } from "../../resolvers/user";
import { readLastWeeklyGoal } from "../../resolvers/weeklyGoal";

export const createGoalReminder = async (
    client: Client<boolean>
) => {
    console.log("CREATE GOAL REMINDER")
    const users = await readAllUsers()

    users.forEach(async (userObject: User) => {
        let userOnServer = await client.users.fetch(userObject.discordId)
        if (userOnServer && !userOnServer.bot) {
            const weeklyGoal = await readLastWeeklyGoal(userObject.discordId)

            // if the user does not have an active weekly goal, send them this reminder
            if (!weeklyGoal) {
                client.users.fetch(userObject.discordId).then((user) => {
                    console.log("Weekly reminder being set to the following user: ", userObject.discordUsername)
                    if (user) {
                        try {
                            user.send(
                                "Hey! ⌚ Automatic weekly reminder from poddds mod here to **CREATE A GOAL!**⌚\n✅ Make sure you head over to **GOAL SETTING** and type **/set-current-goal** to get started on your new goal!"
                            );
                        } catch {
                            console.log("THERE WAS AN ERROR SENDING TO THE FOLLOWING USER: ", userObject.discordUsername, " WITH DB ID: ", userObject.id)
                        }
                    }
                })
            }
        }
    });
}