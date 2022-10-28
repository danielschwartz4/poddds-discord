import { Leaderboard } from "../entities/Leaderboard";

export const createLeaderboard = (startDate: Date) => {
  return Leaderboard.create({ startDate }).save();
};

export const readLeaderboard = (id: number) => {
  return Leaderboard.findOne({ where: { id } });
};
