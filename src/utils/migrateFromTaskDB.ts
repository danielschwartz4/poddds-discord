import { WeeklyGoal } from "../entities/WeeklyGoal";
import { Task } from "../entities/Task";
import { Event } from "../entities/Event";
import { User } from "../entities/User";

export const migrateFromTaskDB = async () => {
  //   const tasks = await Task.find();

  console.log("in migrate db");
  const users = await User.find();
  console.log("users");
  // iterate through all users in userDB
  users.forEach(async (user: User) => {
    const tasks = await Task.find({ where: { discordId: user.discordId } });

    // iterate through all users in taskDB
    tasks.forEach(async (task: Task) => {
      let weeklyGoalId = await WeeklyGoal.findOne({
        where: { discordId: task.discordId },
      });
      if (!weeklyGoalId) {
        // create weekly goal
        weeklyGoalId = await WeeklyGoal.create({
          discordId: task.discordId,
          isActive: true,
          description: task.description,
          goalLeftChannelId: task.goalLeftChannelId,
          misses: 0,
        }).save();
      }

      Event.create({
        discordId: task.discordId,
        goalId: weeklyGoalId.id,
        adjustedDate: task.date,
        completed: task.completed,
        isActive: true,
        goalLeftChannelId: task.goalLeftChannelId,
      }).save();
    });
  });
};
