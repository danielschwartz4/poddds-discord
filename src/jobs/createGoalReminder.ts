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
                user.send(
                    "Hey! ⌚ Automatic weekly reminder to create a goal from poddds mod here ⌚\n✅ Make sure you head over to #weekly-goals-setting and type /set-current-goal to get started on your new goal!"
                );
                })
            }
        }
    });
}