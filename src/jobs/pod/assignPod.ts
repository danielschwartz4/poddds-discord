import {
  CategoryChannel,
  GuildMember,
  Role,
  TextChannel,
} from "discord.js";
import { LessThan } from "typeorm";
import { CLIENT } from "../../constants";
import { Pod } from "../../entities/Pod";
import { User } from "../../entities/User";
import { GoalType } from "../../types/dbTypes";
import { GUILD } from "../discordScheduler";
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
  // find target pod in database
  //
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
    // 5. send resp to goals channel
    const pod = await Pod.create({
      numMembers: 1,
      type: type,
    }).save();
    if (pod) {
      type == "fitness"
        ? await User.update({ discordId: user?.id }, { fitnessPodId: pod?.id })
        : await User.update({ discordId: user?.id }, { studyPodId: pod?.id });
      const role_id = await user?.guild?.roles.create({
        name: type + "-" + pod?.id,
        color: "Random",
        reason: "This pod is for " + type + "!",
      });
      await user?.roles?.add(role_id as Role);

      const category = await createPodCategory(type, pod?.id);
      // Get 🏁view-goals channel id
      const channelId = category?.children.cache
        ?.filter((channel) => channel.name == "🏁view-goals")
        .keys()
        .next().value;

      let channel = CLIENT.channels.cache.get(
        channelId as string
      ) as TextChannel;
      await channel.send(resp);
    }
  } else {
    // 1. Change users podId and increment pod numMembers
    // 2. send resp to goals channel
    // TODO 3. Assign user role BY TIMEZONE

    // if the user goal expired and they're in a pod, just send a message instead of doing updates
    if (
      (type == "fitness" &&
        dbUser?.fitnessPodId != null &&
        dbUser?.fitnessPodId != -1) ||
      (type == "study" &&
        dbUser?.studyPodId != null &&
        dbUser?.studyPodId != -1)
    ) {
      type == "fitness"
        ? await sendMessage(type, resp, dbUser.fitnessPodId)
        : await sendMessage(type, resp, dbUser.studyPodId);
      return;
    }

    type == "fitness"
      ? await User.update({ discordId: user?.id }, { fitnessPodId: pod?.id })
      : await User.update({ discordId: user?.id }, { studyPodId: pod?.id });

    Pod.update({ id: pod?.id }, { numMembers: pod?.numMembers + 1 });
    let role_id = user?.guild?.roles?.cache.find(
      (r) => r.name === type + "-" + pod?.id
    );
    console.log("SEEKING ROLE", type, pod?.id, type + pod?.id, " GOT ", role_id?.name);
    await user?.roles?.add(role_id as Role);
    sendMessage(type, resp, pod?.id);
  }
};

const sendMessage = async (
  type: GoalType,
  resp: string,
  podId: number
) => {
  let category = GUILD()?.channels?.cache?.filter(
    (category) =>
      category.name ==
      (type === "fitness"
        ? "--- 💪 " + type + " pod " + podId
        : "--- 📚 " + type + " pod " + podId)
  );

  const categoryId = category?.keys().next().value;
  let categoryChannel = CLIENT.channels.cache.get(
    categoryId
  ) as CategoryChannel;

  const channelId = categoryChannel?.children.cache
    ?.filter((channel) => channel.name.includes("view-goals"))
    .keys()
    .next().value;

  let channel = CLIENT.channels.cache.get(channelId as string) as TextChannel;
  await channel.send(resp);
};
