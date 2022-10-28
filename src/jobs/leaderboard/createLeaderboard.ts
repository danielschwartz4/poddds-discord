import { CLIENT } from "../../constants";
import {
  InteractionResponse,
  transformInteractionData,
} from "../../utils/interactionData";

export const createLeaderboard = () => {
  CLIENT.on("interactionCreate", async (interaction) => {
    if (!interaction.isChatInputCommand()) return;

    if (interaction.commandName === "create-leaderboard") {
      const cleanedData = transformInteractionData(
        interaction.options.data as InteractionResponse[]
      );
      console.log(cleanedData);

      interaction.reply(
        "🏆Leaderboard created!🏆 \n\n 1️⃣ React below 🙋 if you want to join this week's pair leaderboard \n 2️⃣ Participants will be paired up by timezone at the start of the week \n 3️⃣ Your ranking depends on both of your consistency! 🥇🥈🥉"
      );
    }
  });
};
