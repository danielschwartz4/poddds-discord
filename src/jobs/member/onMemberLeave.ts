import { User } from "../../entities/User";
import { memberLeaveNotification } from "src/utils/adminNotifs";
import { CLIENT } from "../../constants";
import { readUser } from "../../resolvers/user";
import { deactivateGoalsAndEvents } from "../goalsLeftToday/deactivateGoals";

export const onMemberLeave = () => {
  CLIENT.on("guildMemberRemove", (member) => {
    deactivateMember(member.user.id);
  });
};

export const deactivateMember = async (userId: string) => {
  const userObject = await readUser(userId);
  memberLeaveNotification(userObject as User);
  deactivateGoalsAndEvents(userId);
};
