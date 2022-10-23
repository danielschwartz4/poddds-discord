import { CLIENT, LOCAL_TODAY } from "../../constants";
import AppDataSource from "../../dataSource";
import { WeeklyGoal } from "../../entities/WeeklyGoal";
import {
  InteractionResponse,
  transformInteractionData,
} from "../../utils/interactionData";
import { addDays, mdyDate } from "../../utils/timeZoneUtil";
import { GUILD } from "../discordScheduler";
import { deleteGoalLeftTodayChannelByChannelId } from "../goalsLeftToday/deleteGoalLeftTodayChannel";

export const createBreak = () => {
  CLIENT.on("interactionCreate", async (interaction) => {
    if (!interaction.isChatInputCommand()) return;
    if (interaction.commandName === "break") {
      const currChannelId = interaction.channelId;
      const currChannelName = GUILD()?.channels.cache.get(currChannelId)?.name;
      if (!currChannelName?.includes("break")) {
        interaction.reply({
          content: `You can only use the break command in the #⏸ break channel of your pod!`,
          ephemeral: true,
        });
        return;
      }
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

      console.log("BREAK COMMAND BY ", interaction.user.username);

      // delete event from goals left today if it's there
      if (mdyDate(startDate) == mdyDate(LOCAL_TODAY(timeZone))) {
        deleteGoalLeftTodayChannelByChannelId(
          interaction.channelId as string,
          interaction.user.id
        );
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
