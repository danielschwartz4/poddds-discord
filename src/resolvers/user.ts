import { Pod } from "src/entities/Pod";
import { User } from "../entities/User";

export const readAllUsers = async () => {
  return await User.find();
};

export const readPodUsers = async (pod: Pod) => {
  const type = pod?.type;
  let users;

  if (type === "exercise") {
    users = await User.find({
      where: {
        exercisePodId: pod?.id,
      },
    });
  } else if (type === "study") {
    users = await User.find({
      where: {
        studyPodId: pod?.id,
      },
    });
  }
};
