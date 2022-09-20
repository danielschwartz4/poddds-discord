import { ADMIN_USER_IDS, CLIENT } from "./discordScheduler";
import { deactivateGoalsAndEvents } from "./goalsLeftToday/deactivateGoals";

export const onMemberLeave = () => {
  CLIENT.on("guildMemberRemove", (member) => {
    deactivateMember(member.user.id)
  });
};

export const deactivateMember = (userId: string) => {
  console.log("A MEMBER LEFT: ", userId)
  ADMIN_USER_IDS.forEach((val) => {
    CLIENT.users.fetch(val as string).then((user) => {
      user.send(
        "poddds -- AUTOMATIC MEMBER LEFT: " +
        userId +
          " AND THEIR WEEKLY GOALS WERE DEACTIVATED"
      );
    });
  });
  deactivateGoalsAndEvents(userId);
}