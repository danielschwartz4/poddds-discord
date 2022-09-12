import { Client } from "discord.js"
import { readLastActiveUserEvent } from "../utils/eventResolvers"
import { User } from "../entities/User"
import { readAllUsers } from "../utils/userResolvers"

export const createGoalReminder = async (
    client: Client<boolean>
) => {
    console.log("CREATE GOAL REMINDER")
    const users = await readAllUsers()

    users.forEach(async (userObject: User) => {
        let userOnServer = await client.users.fetch(userObject.discordId)
        if (userOnServer && !userOnServer.bot) {
            const weeklyGoal = await readLastActiveUserEvent(userObject.discordId)

            console.log("Weekly reminder being set to the following users")
            // if the user does not have an active weekly goal, send them this reminder
            if (!weeklyGoal) {
                client.users.fetch(userObject.discordId).then((user) => {
                    console.log(user)
                    if (user) {
                        try {
                            user.send(
                                "Hey! ⌚ Automatic weekly reminder to create a goal from poddds mod here ⌚\n✅ Make sure you head over to #weekly-goals-setting and type /set-current-goal to get started on your new goal!"
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