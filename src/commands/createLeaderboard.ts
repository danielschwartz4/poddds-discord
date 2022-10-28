import { CLIENT } from "../constants";
import { GUILD } from "../jobs/discordScheduler";

export const createLeaderboardCommand = () => {
  let commands;
  if (GUILD()) {
    commands = GUILD()?.commands;
  } else {
    commands = CLIENT.application?.commands;
  }

  commands?.create({
    name: "create-leaderboard",
    description: "create leaderboard",
    type: 1,
    options: newGoalOptions,
    defaultMemberPermissions: ["KickMembers"],
  });
};

const newGoalOptions = [
  {
    name: "start-date",
    description: "Start date",
    type: 3,
    required: true,
  },
  {
    name: "duration",
    description:
      "What will you do this week? (e.g. I will run a mile on Mondays, Wednesdays, and Fridays)",
    type: 3,
    required: true,
  },
];
