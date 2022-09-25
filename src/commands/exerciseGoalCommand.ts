import { Guild } from "discord.js";
import { CLIENT } from "../constants";

export const exerciseGoalCommand = (GUILD: Guild) => {
  let commands;
  if (GUILD) {
    commands = GUILD.commands;
  } else {
    commands = CLIENT.application?.commands;
  }

  commands?.create({
    name: "set-current-exercise-goal",
    description: "create exercise goal",
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
  {
    name: "time-zone",
    description:
      "Enter your time zone! (important so we can contact you on time)",
    type: 3,
    required: true,
    // Signs on names and values are opposite because value represents ETC/GMT time which is useful for conversion later
    choices: [
      {
        name: "GMT-12:00 (Dateline Standard Time)",
        value: "+12",
      },
      {
        name: "GMT-11:00 (Midway Island/Samoa Time)",
        value: "+11",
      },
      {
        name: "GMT-10:00 (Hawaii-Aleutian Daylight Time)",
        value: "+10",
      },
      {
        name: "GMT-09:00 (Gambier/Alaska Standard Time)",
        value: "+9",
      },
      {
        name: "GMT-08:00 (Pacific Time)",
        value: "+8",
      },
      {
        name: "GMT-07:00 (Mountain Standard Time)",
        value: "+7",
      },
      {
        name: "GMT-06:00 (Central Time/Central America)",
        value: "+6",
      },
      {
        name: "GMT-05:00 (Eastern Time/Ecuador/Columbia/Peru Time)",
        value: "+5",
      },
      {
        name: "GMT-04:00 (Canada/Guyana/Bolivia Time)",
        value: "+4",
      },
      {
        name: "GMT-03:00 (Brazil/Greenland/Argentine/French Guiana/Uruguay Time)",
        value: "+3",
      },
      {
        name: "GMT-02:00 (Mid-Atlantic Time)",
        value: "+2",
      },
      {
        name: "GMT-01:00 (Cape Verde/Azores Time",
        value: "+1",
      },
      {
        name: "GMT+00:00 (British Time)",
        value: "-0",
      },
      {
        name: "GMT+01:00 (Western Africa/Western European Time)",
        value: "-1",
      },
      {
        name: "GMT+02:00 (Central African/South African/Israel/Eastern European Time",
        value: "-2",
      },
      {
        name: "GMT+03:00 (Arabia Time)",
        value: "-3",
      },
      {
        name: "GMT+04:00 (Mauritius/Seychelles/Georgia/Armenia/Azerbaijan Time",
        value: "-4",
      },
      {
        name: "GMT+05:00 (Uzbekistan/Turkmenistan/Tajikistan/Pakistan/Maldives Time)",
        value: "-5",
      },
      {
        name: "GMT+06:00 (Bangladesh/Sri Lanka/Bhutan Time)",
        value: "-6",
      },
      {
        name: "GMT+07:00 (Indochina/Christmas Island/Krasnoyarsk Time)",
        value: "-7",
      },
      {
        name: "GMT+08:00 (China/Malaysia/Hong Kong/Singapore/Philippines/Western Australia Time)",
        value: "-8",
      },
      {
        name: "GMT+09:00 (Japan/Korea Standard Time)",
        value: "-9",
      },
      {
        name: "GMT+10:00 (Papua New Guinea/Tasmania/Victoria/New South Wales Time)",
        value: "-10",
      },
      {
        name: "GMT+11:00 (New Caledonia/Vanuatu/Solomon Island Time)",
        value: "-11",
      },
      {
        name: "GMT+12:00 (Fiji/Marshall Islands Time/New Zealand Time)",
        value: "-12",
      },
    ],
  },
];
