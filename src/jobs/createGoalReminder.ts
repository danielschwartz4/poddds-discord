import { Client } from "discord.js"
import { User } from "../entities/User"
import { readAllUsers } from "../utils/userResolvers"
import { readLastWeeklyGoal } from "../utils/weeklyGoalResolvers"

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
                                "Hey! ⌚ Automatic weekly reminder from poddds mod here to create a goal!⌚\n✅ Make sure you head over to #goals-setting and type /set-current-goal to get started on your new goal!"
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