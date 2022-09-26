import DiscordJS, { GatewayIntentBits, Partials } from "discord.js";
import { addDays, flipSign } from "./utils/timeZoneUtil";

export const __prod__ = process.env.NODE_ENV === "production";
export const TODAY = () => {
  let returnObject = addDays(new Date(), 0);
  return returnObject as Date;
};

export const LOCAL_TODAY = (timeZone: string) => {
  let timeZoneFlipped = flipSign(timeZone);
  let localDateObject = addDays(new Date(), 7).toLocaleString("en-GB", {
    timeZone: "Etc/GMT" + timeZoneFlipped,
  });

  // reformat into ISO time
  let splitDateTime = localDateObject.split(", ");
  let splitDate = splitDateTime[0].split("/");
  let Y = splitDate[2];
  let D = splitDate[0];
  let M = splitDate[1];
  let date = Y + "-" + M + "-" + D;
  let localTime = splitDateTime[1];
  let newLocalDateObject = new Date(date + "T" + localTime + "Z");

  return newLocalDateObject;
};

// NOTE: Ensure that you invite the bot to every channel or make them admin
export const SERVER_ID = !__prod__
  ? process.env.TEST_SERVER_ID
  : process.env.PROD_SERVER_ID;
export const DAILY_UPDATES_CHAT_CHANNEL_ID = !__prod__
  ? process.env.TEST_DAILY_UPDATES_CHAT_CHANNEL_ID
  : process.env.PROD_DAILY_UPDATES_CHAT_CHANNEL_ID;
export const ADMIN_USER_IDS = ["743590338337308754", "933066784867766342"]; // for updates
export const ROLES_CHANNEL_ID = !__prod__
  ? process.env.TEST_ROLES_CHANNEL_ID
  : process.env.PROD_ROLES_CHANNEL_ID;

// Add discord
export const CLIENT = new DiscordJS.Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildPresences,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.Guilds,
    GatewayIntentBits.DirectMessages,
    GatewayIntentBits.DirectMessageTyping,
    GatewayIntentBits.DirectMessageReactions,
  ],
  partials: [Partials.Channel],
});

// export const GUILD = CLIENT?.guilds.cache.get(SERVER_ID as string);
