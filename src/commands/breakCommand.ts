import { Client } from "discord.js";
import { TODAY } from "../constants";
import { addDays, int2day, mdyDate } from "../utils/timeZoneUtil";

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
    description: "When will your break start within the next week?",
    type: 3,
    required: true,
    choices: [
      {
        name: "Today",
        value: "0",
      },
      {
        name: "Tomorrow",
        value: "1",
      },
      {
        name: `${
          int2day(addDays(TODAY(), 2).getDay()) +
          ", " +
          mdyDate(addDays(TODAY(), 2))
        }`,
        value: "2",
      },
      {
        name: `${
          int2day(addDays(TODAY(), 3).getDay()) +
          ", " +
          mdyDate(addDays(TODAY(), 3))
        }`,
        value: "3",
      },
      {
        name: `${
          int2day(addDays(TODAY(), 4).getDay()) +
          ", " +
          mdyDate(addDays(TODAY(), 4))
        }`,
        value: "4",
      },
      {
        name: `${
          int2day(addDays(TODAY(), 5).getDay()) +
          ", " +
          mdyDate(addDays(TODAY(), 5))
        }`,
        value: "5",
      },
      {
        name: `${
          int2day(addDays(TODAY(), 6).getDay()) +
          ", " +
          mdyDate(addDays(TODAY(), 6))
        }`,
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
