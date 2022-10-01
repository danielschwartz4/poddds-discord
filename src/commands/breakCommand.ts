import { GUILD } from "../jobs/discordScheduler";
import { CLIENT } from "../constants";

export const breakCommand = () => {
  let commands;
  if (GUILD()) {
    commands = GUILD()?.commands;
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
        value: "0",
      },
      {
        name: "tomorrow",
        value: "1",
      },
      {
        name: "2 days from now",
        value: "2",
      },
      {
        name: "3 days from now",
        value: "3",
      },
      {
        name: "4 days from now",
        value: "4",
      },
      {
        name: "5 days from now",
        value: "5",
      },
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
