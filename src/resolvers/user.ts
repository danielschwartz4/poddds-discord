import { Pod } from "../entities/Pod";
import { User } from "../entities/User";

export const createUser = (discordUsername: string, discordId: string) => {
  return User.create({ discordUsername, discordId }).save();
};

export const readUser = (discordId: string) => {
  return User.findOne({ where: { discordId } });
};

export const readAllUsers = () => {
  return User.find();
};

export const readPodUsers = (pod: Pod) => {
  const type = pod?.type;
  let users;

  if (type === "fitness") {
    users = User.find({
      where: {
        fitnessPodId: pod?.id,
      },
    });
  } else if (type === "study") {
    users = User.find({
      where: {
        studyPodId: pod?.id,
      },
    });
  }
  return users;
};
