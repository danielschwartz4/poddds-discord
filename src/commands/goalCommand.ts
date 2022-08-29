import { Client } from "discord.js";

export const goalCommand = (client: Client<boolean>, serverId: string) => {
  const guild = client.guilds.cache.get(serverId);
  let commands;
  if (guild) {
    commands = guild.commands;
  } else {
    commands = client.application?.commands;
  }

  commands?.create({
    name: "new-goal",
    description: "create goal",
    type: 1,
    options: newGoalOptions,
  });
};

const completionChoices = [
  {
    name: "🟢",
    type: 5,
    value: "on",
  },
  {
    name: "🔴",
    type: 5,
    value: "off",
  },
];

const newGoalOptions = [
  {
    name: "time-zone",
    description:
      "Enter your time zone! (important so we can contact you on time)",
    type: 3,
    required: true,
    // Signs on names and values are opposite because value represents ETC/GMT time which is useful for conversion later
    choices: [
      {
        name: "GMT-12:00",
        value: "+12",
      },
      {
        name: "GMT-11:00",
        value: "+11",
      },
      {
        name: "GMT-10:00",
        value: "+10",
      },
      {
        name: "GMT-09:00",
        value: "+9",
      },
      {
        name: "GMT-08:00",
        value: "+8",
      },
      {
        name: "GMT-07:00",
        value: "+7",
      },
      {
        name: "GMT-06:00",
        value: "+6",
      },
      {
        name: "GMT-05:00",
        value: "+5",
      },
      {
        name: "GMT-04:00",
        value: "+4",
      },
      {
        name: "GMT-03:00",
        value: "+3",
      },
      {
        name: "GMT-02:00",
        value: "+2",
      },
      {
        name: "GMT-01:00",
        value: "+1",
      },
      {
        name: "GMT+00:00",
        value: "-0",
      },
      {
        name: "GMT+01:00",
        value: "-1",
      },
      {
        name: "GMT+02:00",
        value: "-2",
      },
      {
        name: "GMT+03:00",
        value: "-3",
      },
      {
        name: "GMT+04:00",
        value: "-4",
      },
      {
        name: "GMT+05:00",
        value: "-5",
      },
      {
        name: "GMT+06:00",
        value: "-6",
      },
      {
        name: "GMT+07:00",
        value: "-7",
      },
      {
        name: "GMT+08:00",
        value: "-8",
      },
      {
        name: "GMT+09:00",
        value: "-9",
      },
      {
        name: "GMT+10:00",
        value: "-10",
      },
      {
        name: "GMT+11:00",
        value: "-11",
      },
      {
        name: "GMT+12:00",
        value: "-12",
      },
    ],
  },
  {
    name: "goal",
    description:
      "What will you do this week? (e.g. I will run a mile on Mondays, Wednesdays, and Fridays)",
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
    name: "sunday",
    description: "Choose green for an ON day and red for an OFF day!",
    type: 3,
    required: true,
    choices: completionChoices,
  },
  {
    name: "monday",
    description: "Choose green for an ON day and red for an OFF day!",
    type: 3,
    required: true,
    choices: completionChoices,
  },
  {
    name: "tuesday",
    description: "Choose green for an ON day and red for an OFF day!",
    type: 3,
    required: true,
    choices: completionChoices,
  },
  {
    name: "wednesday",
    description: "Choose green for an ON day and red for an OFF day!",
    type: 3,
    required: true,
    choices: completionChoices,
  },
  {
    name: "thursday",
    description: "Choose green for an ON day and red for an OFF day!",
    type: 3,
    required: true,
    choices: completionChoices,
  },
  {
    name: "friday",
    description: "Choose green for an ON day and red for an OFF day!",
    type: 3,
    required: true,
    choices: completionChoices,
  },
  {
    name: "saturday",
    description: "Choose green for an ON day and red for an OFF day!",
    type: 3,
    required: true,
    choices: completionChoices,
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

// const newGoalOptions = [
// {
//   name: "monday",
//   description: "What will you do on Monday (e.g. run a mile)",
//   type: 3,
//   required: true,
//   default: "skip",
// },
//   {
//     name: "tuesday",
//     description: "What will you do on Tuesday (e.g. rest)",
//     type: 3,
//     required: true,
//     default: "skip",
//   },
//   {
//     name: "wednesday",
//     description: "What will you do on Wednesday (e.g. Do 30 pushups)",
//     type: 3,
//     required: true,
//     default: "skip",
//   },
//   {
//     name: "thursday",
//     description: "What will you do on Thursday (e.g. Drink 2 liters of water)",
//     type: 3,
//     required: true,
//   },
//   {
//     name: "friday",
//     description: "What will you do on Friday (e.g. rest)",
//     type: 3,
//     required: true,
//   },
//   {
//     name: "saturday",
//     description:
//       "What will you do on Saturday (e.g. walk around the block twice)",
//     type: 3,
//     required: true,
//   },
//   {
//     name: "sunday",
//     description: "What will you do on Sunday (e.g. rest)",
//     type: 3,
//     required: true,
//   },
//   {
//     name: "evidence",
//     description:
//       "How will you prove you completed your task? (e.g. I'll take a photo of my watch)",
//     type: 3,
//     required: true,
//   },
//   {
//     name: "duration",
//     description: "Enter the number of days you will work do this (e.g. 7)",
//     type: 3,
//     required: true,
//     choices: [
//       {
//         name: "7 days",
//         value: "7",
//       },
//       {
//         name: "14 days",
//         value: "14",
//       },
//       {
//         name: "21 days",
//         value: "21",
//       },
//       {
//         name: "28 days",
//         value: "28",
//       },
//     ],
//   },
// ];
