import { WeeklyGoal } from "../entities/WeeklyGoal";
import { CLIENT, SERVER_ID } from "./discordScheduler";

export const cleanWeeklyGoals = async () => {
  const guild = CLIENT.guilds.cache.get(SERVER_ID as string);
  let activeGoals = await WeeklyGoal.find({ where: { isActive: true } });
  activeGoals.forEach((goal: WeeklyGoal) => {
    guild?.members?.fetch(goal.discordId).then((user) => {
      if (user.roles.cache.some((role) => role.name !== "podmate")) {
        WeeklyGoal.update({ discordId: user.id }, { isActive: false });
      }
    });
  });
};
