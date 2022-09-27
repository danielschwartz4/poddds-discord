import { CLIENT, LOCAL_TODAY } from "../constants";
import AppDataSource from "../dataSource";
import { Event } from "../entities/Event";
import { WeeklyGoal } from "../entities/WeeklyGoal";
import {
  InteractionResponse,
  transformInteractionData,
} from "../utils/interactionData";
import { addDays, mdyDate } from "../utils/timeZoneUtil";

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
        timeZone,
        " AND THE FOLLOWING WEEKLY GOAL",
        weeklyGoal
      );
      if (mdyDate(startDate) == mdyDate(LOCAL_TODAY(timeZone))) {
        let event = await Event.findOne({
          where: {
            discordId: interaction.user.id,
            isActive: true,
            adjustedDate: mdyDate(startDate),
          },
        });

        if (event) {
          const goal_left_channel = CLIENT.channels.cache.get(
            event.goalLeftChannelId
          );
          goal_left_channel?.delete();
        }
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
