import { ADMIN_USER_IDS, CLIENT } from "./discordScheduler";

export const routeBotDMs = () => {
    // route DMs to bot to admins
  CLIENT.on("messageCreate", async (msg) => {
    if (!msg.author.bot) {
      ADMIN_USER_IDS.forEach((val: string) => {
        CLIENT.users.fetch(val as string).then((user) => {
          user.send(
            "poddds -- DM message to bot from " +
              user.username +
              " that said: \n" + msg.content
          );
        });
      });
      setTimeout(() => {
        msg.react("👍");
      }, 1000 * 3);
    }
  })
}