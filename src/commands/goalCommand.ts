import { Client } from "discord.js";

export const goalCommand = (client: Client<boolean>) => {
  const guild = client.guilds.cache.get(
    process.env.WEEKLY_GOALS_SETTING_CHANNEL_ID as string
  );
  let commands;
  if (guild) {
    commands = guild.commands;
  } else {
    commands = client.application?.commands;
  }

  // const data = new SlashCommandBuilder()
  //   .setName("gif")
  //   .setDescription("Sends a random gif!")
  //   .addStringOption((option) =>
  //     option
  //       .setName("category")
  //       .setDescription("The gif category")
  //       .setRequired(true)
  //       .addChoices(
  //         { name: "Funny", value: "gif_funny" },
  //         { name: "Meme", value: "gif_meme" },
  //         { name: "Movie", value: "gif_movie" }
  //       )
  //   );
  commands?.create({
    name: "new-goal",
    description: "create goal",
    type: 1,
    options: newGoalOptions,
  });
};

const newGoalOptions = [
  {
    name: "monday",
    description: "What will you do on Monday (e.g. run a mile)",
    type: 3,
    required: true,
  },
  {
    name: "tuesday",
    description: "What will you do on Tuesday (e.g. rest)",
    type: 3,
    required: true,
  },
  {
    name: "wednesday",
    description: "What will you do on Wednesday (e.g. Do 30 pushups)",
    type: 3,
    required: true,
  },
  {
    name: "thursday",
    description: "What will you do on Thursday (e.g. Drink 2 liters of water)",
    type: 3,
    required: true,
  },
  {
    name: "friday",
    description: "What will you do on Friday (e.g. rest)",
    type: 3,
    required: true,
  },
  {
    name: "saturday",
    description:
      "What will you do on Saturday (e.g. walk around the block twice)",
    type: 3,
    required: true,
  },
  {
    name: "sunday",
    description: "What will you do on Sunday (e.g. rest)",
    type: 3,
    required: true,
  },
  {
    name: "evidence",
    description:
      "How will you prove you completed your task? (e.g. I'll take a photo of my watch)",
    type: 3,
    required: true,
  },
  {
    name: "duration",
    description: "Enter the number of days you will work do this (e.g. 7)",
    type: 3,
    required: true,
    choices: [
      {
        name: "7 days",
        value: "7",
      },
      {
        name: "14 days",
        value: "14",
      },
      {
        name: "21 days",
        value: "21",
      },
      {
        name: "28 days",
        value: "28",
      },
    ],
  },
];
