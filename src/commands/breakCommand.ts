import { Client } from "discord.js";

export const breakCommand = (client: Client<boolean>, serverId: string) => {
  const guild = client.guilds.cache.get(serverId);
  let commands;
  if (guild) {
    commands = guild.commands;
  } else {
    commands = client.application?.commands;
  }

  commands?.create({
    name: "break",
    description: "break",
    type: 1,
    options: newGoalOptions,
  });
};

const newGoalOptions = [
  {
    name: "start-date",
    description:
      "When will your break start within the next week (including today)?",
    type: 3,
    required: true,
    choices: [
      {
        name: "sunday",
        value: "0",
      },
      {
        name: "monday",
        value: "1",
      },
      {
        name: "tuesday",
        value: "2",
      },
      {
        name: "wednesday",
        value: "3",
      },
      {
        name: "thursday",
        value: "4",
      },
      {
        name: "friday",
        value: "5",
      },
      {
        name: "saturday",
        value: "6",
      },
    ],
  },
  {
    name: "duration",
    description: "How many days will your break be?",
    type: 4,
    required: true,
  },
];
