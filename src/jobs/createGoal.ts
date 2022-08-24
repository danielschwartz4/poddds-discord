import { CacheType, Client, Interaction } from "discord.js";
const wait = require("node:timers/promises").setTimeout;

export const createGoal = (client: Client<boolean>) => {
  client.on("interactionCreate", async (interaction) => {
    if (!interaction.isChatInputCommand()) return;
    console.log("BEFORE");
    if (interaction.commandName === "new-goal") {
      // await interaction.reply("Goal created! 🚀🚀🚀");
      // await wait(1000);
      const resp = parseGoalResponse(
        interaction,
        interaction.options.data as GoalResponse[]
      );
      await interaction.reply(resp);
    }
  });
};

const parseGoalResponse = (
  interactionData: Interaction<CacheType>,
  req: GoalResponse[]
) => {
  const cleanedData = transformInteractionData(req);
  const userId = interactionData.user.id;

  return (
    "<@" +
    userId +
    ">" +
    " created a new goal! \n" +
    ` **Goal**: ${cleanedData["goal"]}. \n **Evidence:** ${cleanedData["evidence"]} \n **Commitment:** ${cleanedData["duration"]} days! \n` +
    " S-" +
    colorMapper(cleanedData["sunday"]) +
    "  M-" +
    colorMapper(cleanedData["monday"]) +
    "  T-" +
    colorMapper(cleanedData["tuesday"]) +
    "  W-" +
    colorMapper(cleanedData["wednesday"]) +
    "  T-" +
    colorMapper(cleanedData["thursday"]) +
    "  F-" +
    colorMapper(cleanedData["friday"]) +
    "  S-" +
    colorMapper(cleanedData["saturday"])
  );
};

const transformInteractionData = (interactionData: GoalResponse[]) => {
  const res: { [key: string]: string } = {};
  interactionData.forEach((ele) => {
    res[ele.name] = ele.value;
  });
  return res;
};

const colorMapper = (option: string) => {
  return option == "off" ? "🔴" : "🟢";
};

type GoalResponse = {
  name: string;
  type: number;
  value: string;
};
