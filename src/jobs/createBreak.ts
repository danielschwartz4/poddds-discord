import { Client } from "discord.js";
import { TODAY } from "../constants";
import AppDataSource from "../dataSource";
import {
  InteractionResponse,
  transformInteractionData,
} from "../utils/interactionData";
import { addDays, int2day, mdyDate } from "../utils/timeZoneUtil";

export const createBreak = (client: Client<boolean>) => {
  client.on("interactionCreate", async (interaction) => {
    if (!interaction.isChatInputCommand()) return;
    if (interaction.commandName === "break") {
      const cleanedData = transformInteractionData(
        interaction.options.data as InteractionResponse[]
      );

      const res = await AppDataSource.query(
        `
        UPDATE event
        SET "isActive" = false
        WHERE "discordId" = '${interaction.user.id}'
        AND CAST("adjustedDate" AS date) >= '${mdyDate(
          new Date(cleanedData["start-date"])
        )}'
        AND CAST("adjustedDate" AS date) < '${mdyDate(
          addDays(
            new Date(cleanedData["start-date"]),
            parseInt(cleanedData["duration"])
          )
        )}'
			`
      );

      // Get the UTC start day based on their timezone
      // Set isActive to false for all days from this start date to duration
      if (res) {
        new Date(cleanedData["start-date"]).getDay() == TODAY().getDay()
          ? interaction.reply(
              interaction.user.username +
                " is taking a break for " +
                cleanedData.duration +
                " days, starting today!"
            )
          : interaction.reply(
              interaction.user.username +
                " is taking a break for " +
                cleanedData.duration +
                " days, starting on " +
                int2day(new Date(cleanedData["start-date"]).getDay()) +
                "!"
            );
      }
    }
  });
};
