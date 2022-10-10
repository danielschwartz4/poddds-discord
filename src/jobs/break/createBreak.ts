import { TextChannel } from "discord.js";
import { readUser } from "../../resolvers/user";
import { readPodGoalsLeftTodayCategoryChannelByPodId } from "../../utils/channelUtil";
import { CLIENT, LOCAL_TODAY } from "../../constants";
import AppDataSource from "../../dataSource";
import { WeeklyGoal } from "../../entities/WeeklyGoal";
import {
  InteractionResponse,
  transformInteractionData,
} from "../../utils/interactionData";
import { addDays, mdyDate } from "../../utils/timeZoneUtil";
import { GUILD } from "../discordScheduler";

export const createBreak = () => {
  CLIENT.on("interactionCreate", async (interaction) => {
    if (!interaction.isChatInputCommand()) return;
    if (interaction.commandName === "break") {
      const cleanedData = transformInteractionData(
        interaction.options.data as InteractionResponse[]
      );

      const weeklyGoal = await WeeklyGoal.findOne({
        where: { discordId: interaction.user.id, isActive: true },
        order: { id: "DESC" },
      });
      if (!weeklyGoal) return;
      const timeZone = weeklyGoal.timeZone;
      const startDate = addDays(
        LOCAL_TODAY(timeZone),
        parseInt(cleanedData["start-date"])
      );

      console.log(
        "BREAK COMMAND BY ",
        interaction.user.username,
        " WHERE STARTDATE: ",
        startDate,
        " AND LOCAL_TODAY(timeZone): ",
        LOCAL_TODAY(timeZone),
        " FOR TIMEZONE: ",
        timeZone
      );

      // delete event from goals left today if it's there
      if (mdyDate(startDate) == mdyDate(LOCAL_TODAY(timeZone))) {
        // 1. find the user's pod goals left today category
        // figure out which category the break command is coming from
        const channel = CLIENT.channels.cache.get(interaction.channelId as string) as TextChannel;
  
        const podType = channel?.parent?.name.includes("💪")
          ? "fitness"
          : "study";
        const podId = parseInt(channel?.parent?.name.split(" ").pop() as string);

        let goalsLeftCategoryChannel = await readPodGoalsLeftTodayCategoryChannelByPodId(podId, podType);
        const goalsLeftChannels = GUILD()?.channels.cache.filter(c => c.parentId === goalsLeftCategoryChannel?.id)
        
        const user = await readUser(interaction.user.id)

        // 2. if the username is found in goals left today as a channel, delete it
        const userChannels = goalsLeftChannels?.filter(c => c.name === user?.discordUsername.toLowerCase())
        userChannels?.forEach((channel) => {
          channel.delete()
        })
      }

      const res = await AppDataSource.query(
        `
        UPDATE event
        SET "isActive" = false
        WHERE "discordId" = '${interaction.user.id}'
        AND CAST("adjustedDate" AS date) >= '${mdyDate(startDate)}'
        AND CAST("adjustedDate" AS date) < '${mdyDate(
          addDays(startDate, parseInt(cleanedData["duration"]))
        )}'
			`
      );

      // Get the UTC start day based on their timezone
      // Set isActive to false for all days from this start date to duration
      if (res) {
        const adjMonth = startDate.getMonth() + 1;
        interaction.reply(
          interaction.user.username +
            " is taking a break for " +
            cleanedData.duration +
            " days, starting on " +
            adjMonth +
            "/" +
            startDate.getDate() +
            " (GMT" +
            timeZone +
            ") ! ⏸"
        );
      }
    }
  });
};
