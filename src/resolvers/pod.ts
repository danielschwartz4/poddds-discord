import { MoreThan } from "typeorm";
import { Pod } from "../entities/Pod";

export const readPods = async () => {
  return await Pod.find({ where: { numMembers: MoreThan(0) } });
};
