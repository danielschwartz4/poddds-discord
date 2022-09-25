import { Guild, Role, TextChannel } from "discord.js";
import { CLIENT } from "../../constants";
import { Pod } from "../../entities/Pod";
import { User } from "../../entities/User";
import {
  InteractionResponse,
  transformInteractionData,
} from "../../utils/interactionData";

export const leavePod = async (GUILD: Guild) => {
  CLIENT.on("interactionCreate", async (interaction) => {
    if (!interaction.isChatInputCommand()) return;
    if (interaction.commandName === "leave-pod") {
      const channel = CLIENT.channels.cache.get(
        interaction.channelId as string
      ) as TextChannel;

      const category = channel?.parent?.name.includes("💪")
        ? "exercise"
        : "study";
      const podId = parseInt(channel?.parent?.name.split(" ").pop() as string);

      await User.findOne({
        where: {
          discordId: interaction?.user?.id,
        },
      });
      const pod = await Pod.findOne({
        where: {
          type: category,
          id: podId,
        },
      });
      if (pod == null) {
        return;
      } else {
        const cleanedData = transformInteractionData(
          interaction.options.data as InteractionResponse[]
        );
        const val = cleanedData["leave-pod-confirmation"];
        if (val == "no") {
          await interaction.reply("Cancelled request");
          return;
        } else {
          // 1. remove pod id from db
          category == "exercise"
            ? User.update(
                { discordId: interaction?.user?.id },
                { exercisePodId: -1 }
              )
            : User.update(
                { discordId: interaction?.user?.id },
                { studyPodId: -1 }
              );

          // 2. decrement pod count
          Pod.update({ id: podId }, { numMembers: pod?.numMembers - 1 });

          // 3. remove role
          const user = await GUILD?.members.fetch(interaction.user.id);
          let pod_role_id = user?.guild.roles.cache.find(
            (r: Role) => r.name === category + podId
          );

          await interaction.reply(
            (user?.displayName as string) +
              " has left the pod :( Hopefully we see them again soon!"
          );
          await user?.roles.remove(pod_role_id as Role);
        }
      }
    }
  });
};
