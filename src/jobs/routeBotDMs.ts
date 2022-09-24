import { ADMIN_USER_IDS, CLIENT } from "../constants";

export const routeBotDMs = () => {
  // route DMs to bot to admins
  CLIENT.on("messageCreate", (msg) => {
    if (!msg.author.bot && msg.guildId === null) {
      ADMIN_USER_IDS.forEach((val: string) => {
        CLIENT.users.fetch(val as string).then((user) => {
          user.send(
            "poddds bot DM message from " +
              msg.author.username +
              ":\n" +
              msg.content
          );
        });
      });
      setTimeout(() => {
        msg.react("👍");
      }, 1000 * 3);
    }
  });
};
