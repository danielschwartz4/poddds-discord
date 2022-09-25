import { Guild } from "discord.js";
import { CLIENT } from "../constants";

export const leavePodCommand = (GUILD: Guild) => {
  let commands;
  if (GUILD) {
    commands = GUILD.commands;
  } else {
    commands = CLIENT.application?.commands;
  }

  commands?.create({
    name: "leave-pod",
    description: "leave pod",
    type: 1,
    options: newGoalOptions,
  });
};

const newGoalOptions = [
  {
    name: "leave-pod-confirmation",
    description:
      "Are you sure you want to leave the pod? You can join another once you leave",
    type: 3,
    required: true,
    choices: [
      {
        name: "Yes",
        type: 5,
        value: "yes",
      },
      {
        name: "No",
        type: 5,
        value: "no",
      },
    ],
  },
];
