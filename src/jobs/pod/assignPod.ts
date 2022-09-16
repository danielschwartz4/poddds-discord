import { GuildMember, Role, TextChannel } from "discord.js";
import { LessThan } from "typeorm";
import { Pod } from "../../entities/Pod";
import { User } from "../../entities/User";
import { GoalType } from "../../types/dbTypes";
import { CLIENT } from "../discordScheduler";
import { createPodCategory } from "./createPodCategory";

export const assignPod = async (
  type: GoalType,
  user: GuildMember,
  resp: string
) => {
  const dbUser = await User.findOne({
    where: {
      discordId: user?.id,
    },
  });
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
    // !! send resp to goals channel
    const pod = await Pod.create({
      numMembers: 1,
      type: type,
    }).save();
    if (pod) {
      type == "exercise"
        ? await User.update({ discordId: user?.id }, { exercisePodId: pod?.id })
        : await User.update({ discordId: user?.id }, { studyPodId: pod?.id });
      const role_id = await user?.guild?.roles.create({
        name: type + pod?.id,
        color: "Random",
        reason: "This pod is for " + type + "!",
      });
      await user?.roles?.add(role_id as Role);
      const c = await createPodCategory(type, pod?.id);
      // Get weekly-goals-setting channel id
      const channelId = c?.children.cache
        ?.filter((c) => c.name == "🏁weekly-goals-setting")
        .keys()
        .next().value;

      let channel = CLIENT.channels.cache.get(
        channelId as string
      ) as TextChannel;
      await channel.send(resp);
    }
  } else {
    // 1. Change users podId and increment pod numMembers
    // !! send resp to goals channel
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
    await user?.roles?.add(role_id as Role);
    // !! Get pod category from guild with type + pod.id
  }
};
