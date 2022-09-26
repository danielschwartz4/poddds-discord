import { readUser } from "../../resolvers/user";
import { ADMIN_USER_IDS, CLIENT } from "../../constants";
import { deactivateGoalsAndEvents } from "../goalsLeftToday/deactivateGoals";

export const onMemberLeave = () => {
  CLIENT.on("guildMemberRemove", (member) => {
    deactivateMember(member.user.id);
  });
};

export const deactivateMember = async (userId: string) => {
  const userObject = await readUser(userId);
  ADMIN_USER_IDS.forEach((val) => {
    CLIENT.users.fetch(val as string).then((user) => {
      user.send(
        "poddds bot DM message -- AUTOMATIC MEMBER LEFT: " +
          userObject?.discordUsername +
          " AND THEIR WEEKLY GOALS WERE DEACTIVATED"
      );
    });
  });
  deactivateGoalsAndEvents(userId);
};
