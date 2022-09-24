import { CLIENT, GUILD, TODAY } from "../constants";
import { addDays } from "../utils/timeZoneUtil";

export const breakCommand = () => {
  let commands;
  if (GUILD) {
    commands = GUILD.commands;
  } else {
    commands = CLIENT.application?.commands;
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
        name: "today",
        value: `${addDays(TODAY(), 0)}`,
      },
      {
        name: "tomorrow",
        value: `${addDays(TODAY(), 1)}`,
      },
      {
        name: "two days from now",
        value: `${addDays(TODAY(), 2)}`,
      },
      {
        name: "three days from now",
        value: `${addDays(TODAY(), 3)}`,
      },
      // {
      //   name: `${
      //     int2day(addDays(TODAY(), 4).getDay()) +
      //     ", " +
      //     addDays(TODAY(), 4).getMonth() +
      //     "/" +
      //     addDays(TODAY(), 4).getDate()
      //   }`,
      //   value: `${addDays(TODAY(), 4)}`,
      // },
      // {
      //   name: `${
      //     int2day(addDays(TODAY(), 5).getDay()) +
      //     ", " +
      //     addDays(TODAY(), 5).getMonth() +
      //     "/" +
      //     addDays(TODAY(), 5).getDate()
      //   }`,
      //   value: `${addDays(TODAY(), 5)}`,
      // },
      // {
      //   name: `${
      //     int2day(addDays(TODAY(), 6).getDay()) +
      //     ", " +
      //     addDays(TODAY(), 6).getMonth() +
      //     "/" +
      //     addDays(TODAY(), 6).getDate()
      //   }`,
      //   value: `${addDays(TODAY(), 6)}`,
      // },
    ],
  },
  {
    name: "duration",
    description: "How many days will your break be?",
    type: 4,
    required: true,
    choices: [
      {
        name: "1 day",
        value: 1,
      },
      {
        name: "2 days",
        value: 2,
      },
      {
        name: "3 days",
        value: 3,
      },
      {
        name: "4 days",
        value: 4,
      },
      {
        name: "5 days",
        value: 5,
      },
      {
        name: "6 days",
        value: 6,
      },
      {
        name: "7 days",
        value: 7,
      },
    ],
  },
];
