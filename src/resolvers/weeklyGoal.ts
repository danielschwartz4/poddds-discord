import { WeeklyGoal } from "../entities/WeeklyGoal";
import { Event } from "../entities/Event";
import { GoalType } from "../types/dbTypes";
import AppDataSource from "../dataSource";

export const readActiveWeeklyGoalByGoalId = (goalId: number) => {
  return WeeklyGoal.findOne({where: { id: goalId, isActive: true }});
}

export const readWeeklyGoalByType = (discordId: string, type: GoalType) => {
  return WeeklyGoal.findOne({
    where: {
      discordId,
      isActive: true,
      type,
    },
    order: {
      id: "DESC",
    },
  });
};

export const readAllActiveGoals = () => {
  return WeeklyGoal.find({
    where: { isActive: true },
  });
};

export const readAllActiveGoalsForTimezone = (timeZone: string) => {
  return WeeklyGoal.find({
    where: { isActive: true, timeZone },
  });
};

export const readLastWeeklyGoalByType = (discordId: string, type: GoalType) => {
  return WeeklyGoal.findOne({
    where: {
      discordId: discordId,
      isActive: true,
      type,
    },
    order: {
      id: "DESC"
    }
  });
};

export const readWeeklyGoalByFitnessPodIdAndType = (podId: number, type: GoalType) => {
  return AppDataSource.getRepository(WeeklyGoal)
  .createQueryBuilder("w")
  .innerJoinAndSelect("w.user", "u", 'u.id=w."userId"')
  .where('u."fitnessPodId"=:fitnessPodId', { fitnessPodId: podId })
  .andWhere('w."isActive"=:isActive', { isActive: true })
  .andWhere('w.type=:type', { type })
  .orderBy('w.misses', 'DESC')
  .getMany();
}

export const readWeeklyGoalByStudyPodIdAndType = (podId: number, type: GoalType) => {
  return AppDataSource.getRepository(WeeklyGoal)
  .createQueryBuilder("w")
  .innerJoinAndSelect("w.user", "u", 'u.id=w."userId"')
  .where('u."studyPodId"=:studyPodId', { studyPodId: podId })
  .andWhere('w."isActive"=:isActive', { isActive: true })
  .andWhere('w.type=:type', { type })
  .orderBy('w.misses', 'DESC')
  .getMany();
}

export const updateWeeklyGoalToCompleted = ( discordId: string, type: GoalType) => {
  return  WeeklyGoal.update({ discordId, isActive: true, type }, { misses: 0 });
}

export const updateWeeklyGoalMisses = ( discordId: string, type: GoalType, misses: number) => {
  return  WeeklyGoal.update({ discordId, isActive: true, type }, { misses });
}

export const updateWeeklyGoalStatusToInactiveByType = (discordId: string, type: GoalType) => {
  return WeeklyGoal.update(
    { discordId: discordId, isActive: true, type },
    { isActive: false }
  );
};

export const updateWeeklyGoalAndEventsActive = (weeklyGoalId: number) => {
  WeeklyGoal.update({ id: weeklyGoalId }, { isActive: true });
  Event.update({ goalId: weeklyGoalId }, { isActive: true });
};

export const updateAllUserWeeklyGoalsToInactive = (discordId: string) => {
  WeeklyGoal.update({ discordId }, { isActive: false });
};

export const updateUserWeeklyGoalsToInactiveByType = (
  discordId: string,
  type: GoalType
) => {
  WeeklyGoal.update({ discordId, type }, { isActive: false });
};
