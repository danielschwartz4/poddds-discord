import { LeaderboardPair } from "src/entities/LeaderboardPair";

export const createLeaderboardPair = (
  userIdA: number,
  userIdB: number,
  leaderboardId: number
) => {
  return LeaderboardPair.create({ userIdA, userIdB, leaderboardId }).save();
};

export const readLeaderboard = (id: number) => {
  return LeaderboardPair.findOne({ where: { id } });
};
