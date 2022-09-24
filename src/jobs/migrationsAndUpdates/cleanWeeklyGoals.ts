import { GUILD } from "../../constants";
import { WeeklyGoal } from "../../entities/WeeklyGoal";

export const cleanWeeklyGoals = async () => {
  let activeGoals = await WeeklyGoal.find({ where: { isActive: true } });
  activeGoals.forEach((goal: WeeklyGoal) => {
    GUILD?.members?.fetch(goal.discordId).then((user) => {
      if (user.roles.cache.some((role) => role.name === "podmate")) {
        ("");
      } else {
        WeeklyGoal.update({ discordId: user.id }, { isActive: false });
      }
    });
  });
};
