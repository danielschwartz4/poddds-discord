import { Client, TextChannel } from "discord.js";
import { WeeklyGoal } from "../entities/WeeklyGoal";
import { SERVER_ID } from "./discordScheduler";
import { updateWeeklyGoalStatusToInactive } from "../utils/weeklyGoalResolvers";

export const expiredGoalNotif = async (
    client: Client<boolean>,
    discordId: string,
    weekly_goal: WeeklyGoal
) => {
    console.log("EXPIRED GOAL: ", weekly_goal)
    var Difference_In_Time = weekly_goal.adjustedEndDate.getTime() - weekly_goal.adjustedStartDate.getTime();
    // To calculate the no. of days between two dates
    var Difference_In_Days = (Difference_In_Time / (1000 * 3600 * 24)) + 1;

    const guild = client.guilds.cache.get(SERVER_ID as string);
    let selfPromoChannel = guild?.channels.cache.find(
        (channel) => channel.name === "🔥self-promo"
    );

    let msg = await (
        client.channels.cache.get(selfPromoChannel?.id as string) as TextChannel
    ).send(
    "🎉 " + `<@${discordId}>` + " has finished their " + Difference_In_Days + " days goal! 🎉\n" +
        "🚧 Goal: " + weekly_goal?.description + 
        "\n🖼 Evidence: " + weekly_goal?.evidence
    );
    msg.react("🔥");
    
    updateWeeklyGoalStatusToInactive(discordId)
}