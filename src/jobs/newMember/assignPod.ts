import { GuildMember, Role } from "discord.js";
import { LessThan } from "typeorm";
import { Pod } from "../../entities/Pod";
import { User } from "../../entities/User";
import { GoalType } from "../../types/dbTypes";

export const assignPod = async (type: GoalType, user: GuildMember) => {
  const dbUser = await User.findOne({
    where: {
      discordId: user?.id,
    },
  });
  // !! Check this
  if (type == "exercise" && dbUser?.exercisePodId) {
    return;
  }
  if (type == "study" && dbUser?.studyPodId) {
    return;
  }
  // find target pod in database
  const pod = await Pod.findOne({
    where: {
      type: type,
      numMembers: LessThan(20),
    },
    order: { numMembers: "ASC" },
  });

  if (pod == null) {
    // 1. Create new pod with one member
    // 2. Change user's podId
    // 3. Add new pod role
    // 4. Assign user role
    const pod = await Pod.create({
      numMembers: 1,
      type: type,
    }).save();
    if (pod) {
      console.log(pod?.id);
      type == "exercise"
        ? User.update({ discordId: user?.id }, { exercisePodId: pod?.id })
        : User.update({ discordId: user?.id }, { studyPodId: pod?.id });
      const role_id = await user?.guild?.roles.create({
        name: type + pod?.id,
        color: "Random",
        reason: "This pod is for " + type + "!",
      });
      user?.roles?.add(role_id as Role);
    }
  } else {
    // 1. Change users podId and increment pod numMembers
    // !! 2. Assign user role BY TIMEZONE
    type == "exercise"
      ? User.update({ discordId: user?.id }, { exercisePodId: pod?.id })
      : User.update({ discordId: user?.id }, { studyPodId: pod?.id });
    Pod.update({ id: pod?.id }, { numMembers: pod?.numMembers + 1 });
    console.log("type + pod?.id");
    console.log(type + pod?.id);
    let role_id = user?.guild?.roles?.cache.find(
      (r) => r.name === type + pod?.id
    );
    console.log(role_id);
    user?.roles?.add(role_id as Role);
  }
};
