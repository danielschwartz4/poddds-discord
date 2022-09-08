import { Client } from "discord.js";
import {
  transformInteractionData,
  GoalResponse,
} from "../utils/interactionData";

export const createBreak = (client: Client<boolean>) => {
  client.on("interactionCreate", async (interaction) => {
    if (!interaction.isChatInputCommand()) return;
    if (interaction.commandName === "break") {
      console.log("nknkjnkj");
      const cleanedData = transformInteractionData(
        interaction.options.data as GoalResponse[]
      );
      // Get the UTC start day based on their timezone
      // Set isActive to false for all days from this start date to duration
      interaction.reply(
        interaction.user.username +
          " is taking a break for " +
          cleanedData.duration +
          " days!"
      );
    }
  });
};
