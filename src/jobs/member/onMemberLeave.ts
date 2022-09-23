import { ADMIN_USER_IDS, CLIENT } from "../discordScheduler";
import { deactivateGoalsAndEvents } from "../goalsLeftToday/deactivateGoals";

export const onMemberLeave = () => {
  CLIENT.on("guildMemberRemove", (member) => {
    deactivateMember(member.user.id, member.user.username);
  });
};

export const deactivateMember = (userId: string, username: string) => {
  console.log("A MEMBER LEFT: ", username, userId);
  ADMIN_USER_IDS.forEach((val) => {
    CLIENT.users.fetch(val as string).then((user) => {
      user.send(
        "poddds -- AUTOMATIC MEMBER LEFT: " +
          username +
          " AND THEIR WEEKLY GOALS WERE DEACTIVATED"
      );
    });
  });
  deactivateGoalsAndEvents(userId);
};
