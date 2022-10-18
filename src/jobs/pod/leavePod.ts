import { Role, TextChannel } from "discord.js";
import { CLIENT } from "../../constants";
import { Pod } from "../../entities/Pod";
import { User } from "../../entities/User";
import {
  InteractionResponse,
  transformInteractionData,
} from "../../utils/interactionData";
import { GUILD } from "../discordScheduler";
import { deactivateGoalsAndEvents } from "../goalsLeftToday/deactivateGoals";

export const leavePod = async () => {
  CLIENT.on("interactionCreate", async (interaction) => {
    if (!interaction.isChatInputCommand()) return;
    if (interaction.commandName === "leave-pod") {
      const channel = CLIENT.channels.cache.get(
        interaction.channelId as string
      ) as TextChannel;

      const category = channel?.parent?.name.includes("💪")
        ? "fitness"
        : "study";
      console.log("LOGGING LEAVE POD CODE:");
      console.log("CHANNEL NAME", channel?.parent?.name);
      const podId = parseInt(channel?.parent?.name.split(" ").pop() as string);
      console.log("PODID");
      console.log(podId);
      console.log(podId == null);
      console.log(podId == NaN);
      console.log(!podId);

      if (podId == null || podId == NaN || !podId) {
        interaction?.reply({
          embeds: [
            {
              title: "Wrong channel!",
              description:
                "Looks like you used this command in the wrong channel. Be sure to only use the leave-pod command in the #leave-pod channel of the pod you want to leave!",
            },
          ],
          ephemeral: true,
        });
        return;
      }

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
          category == "fitness"
            ? User.update(
                { discordId: interaction?.user?.id },
                { fitnessPodId: -1 }
              )
            : User.update(
                { discordId: interaction?.user?.id },
                { studyPodId: -1 }
              );

          // 2. decrement pod count
          if (pod?.numMembers > 0) {
            Pod.update({ id: podId }, { numMembers: pod?.numMembers - 1 });
          }

          // 3. remove role
          const user = await GUILD()?.members.fetch(interaction.user.id);
          let pod_role_id = user?.guild.roles.cache.find(
            (r: Role) => r.name === category + podId
          );

          await interaction.reply(
            (user?.displayName as string) +
              " has left the pod :( Hopefully we see them again soon!"
          );
          await user?.roles.remove(pod_role_id as Role).catch((err) => {console.log("THERE WAS AN ERROR IN REMOVING ROLE, ERROR: ", err, "category + podId", category + podId, "pod_role_id", pod_role_id)});

          deactivateGoalsAndEvents(user?.id as string, category);
        }
      }
    }
  });
};
