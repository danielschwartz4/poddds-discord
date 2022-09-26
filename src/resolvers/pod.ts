import { MoreThan } from "typeorm";
import { Pod } from "../entities/Pod";

export const readActivePods = () => {
  return Pod.find({ where: { numMembers: MoreThan(0) } });
};
