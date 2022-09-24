import { ADMIN_USER_IDS, CLIENT } from "../../constants";
import { User } from "../../entities/User";
import { deactivateGoalsAndEvents } from "../goalsLeftToday/deactivateGoals";

export const onMemberLeave = () => {
  CLIENT.on("guildMemberRemove", (member) => {
    deactivateMember(member.user.id);
  });
};

export const deactivateMember = async (userId: string) => {
  const userObject = await User.findOne({ where: { discordId: userId } });
  console.log("A MEMBER LEFT: ", userObject?.discordUsername, userId);
  ADMIN_USER_IDS.forEach((val) => {
    CLIENT.users.fetch(val as string).then((user) => {
      user.send(
        "poddds -- AUTOMATIC MEMBER LEFT: " +
          userObject?.discordUsername +
          " AND THEIR WEEKLY GOALS WERE DEACTIVATED"
      );
    });
  });
  deactivateGoalsAndEvents(userId);
};
