import { CacheType, Client, Interaction } from "discord.js";
const wait = require("node:timers/promises").setTimeout;

export const createGoal = (client: Client<boolean>) => {
  client.on("interactionCreate", async (interaction) => {
    if (!interaction.isChatInputCommand()) return;
    console.log("BEFORE");
    if (interaction.commandName === "new-goal") {
      await interaction.reply("Goal created! 🚀🚀🚀");
      await wait(1000);
      const resp = parseGoalResponse(
        interaction,
        interaction.options.data as GoalResponse[]
      );
      await interaction.editReply(resp);
    }
  });
};

const parseGoalResponse = (
  interactionData: Interaction<CacheType>,
  req: GoalResponse[]
) => {
  const cleanedData = transformInteractionData(req);
  const user = interactionData.user.username;

  return (
    user +
    ` committed to a goal for ${cleanedData["duration"]} days! 🗓 \n` +
    "Monday" +
    ": " +
    cleanedData["monday"] +
    "\n" +
    "Tuesday" +
    ": " +
    cleanedData["tuesday"] +
    "\n" +
    "Wednesday" +
    ": " +
    cleanedData["wednesday"] +
    "\n" +
    "Thursday" +
    ": " +
    cleanedData["thursday"] +
    "\n" +
    "Friday" +
    ": " +
    cleanedData["friday"] +
    "\n" +
    "Saturday" +
    ": " +
    cleanedData["saturday"] +
    "\n" +
    "Sunday" +
    ": " +
    cleanedData["sunday"]
  );
};

const transformInteractionData = (interactionData: GoalResponse[]) => {
  const res: { [key: string]: string } = {};
  interactionData.forEach((ele) => {
    res[ele.name] = ele.value;
  });
  return res;
};

type GoalResponse = {
  name: string;
  type: number;
  value: string;
};
