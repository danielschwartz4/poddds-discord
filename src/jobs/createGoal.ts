import { CacheType, Client, Interaction, Role } from "discord.js";
import moment from "moment";
import { Task } from "../entities/Task";
import { User } from "../entities/User";

export const createGoal = (
  client: Client<boolean>,
  admin_ids: string[],
  server_id: string
) => {
  client.on("interactionCreate", async (interaction) => {
    if (!interaction.isChatInputCommand()) return;
    if (interaction.commandName === "new-goal") {
      const cleanedData = transformInteractionData(
        interaction.options.data as GoalResponse[]
      );
      const resp = parseGoalResponse(interaction, cleanedData);
      interaction.reply(resp);
      // (client.channels.cache.get(weekly_goals_channel) as TextChannel).send(
      //   resp
      // );
      if (cleanedData) {
        // get day of the week

        for (let i = 1; i <= parseInt(cleanedData["duration"]); i++) {
          const day = moment().add(i, "days").format("dddd").toLowerCase();
          const date = moment().add(i, "days").format("l");
          console.log(date);
          const val = cleanedData[day];
          const description =
            "Goal: " +
            cleanedData["goal"] +
            " \n" +
            "Evidence: " +
            cleanedData["evidence"];
          if (val === "on") {
            Task.create({
              date: date,
              discordId: interaction.user.id,
              description: description,
            }).save();
          }
        }
      }
      const from_username = interaction.user.username;
      const guild = client.guilds.cache.get(server_id);
      const user = await guild?.members.fetch(interaction.user.id);
      if (user?.roles.cache.some((role) => role.name === "new member")) {
        // Notify admins of new podmate
        admin_ids.forEach((val) => {
          client.users.fetch(val as string).then((user) => {
            user.send(
              "poddds -- NEW PODMATE ALERT! DM them if there's no evidence or anything is unclear\n" +
                from_username +
                " says that their weekly goal and evidence will be:\n" +
                resp
            );
          });
        });

        // Automatically remove new member role and add podmate role to msg.author.roles
        const guild = client.guilds.cache.get(interaction?.guildId as string);
        guild?.members.fetch(interaction.user.id).then((user: any) => {
          let new_member_role_id = user.guild.roles.cache.find(
            (r: Role) => r.name === "new member"
          );
          let podmate_role_id = user.guild.roles.cache.find(
            (r: Role) => r.name === "podmate"
          );
          user.roles.add(podmate_role_id);
          user.roles.remove(new_member_role_id);
        });
        await User.update(
          { discordId: interaction.user.id },
          { startedGoalAt: moment(new Date()) }
        );
      }
    }
  });
};

const parseGoalResponse = (
  interactionData: Interaction<CacheType>,
  cleanedData: {
    [key: string]: string;
  }
) => {
  // const cleanedData = transformInteractionData(req);
  const userId = interactionData.user.id;

  return (
    "<@" +
    userId +
    ">" +
    " created a new goal! \n" +
    ` **Goal**: ${cleanedData["goal"]}. \n **Evidence:** ${cleanedData["evidence"]} \n **Commitment:** ${cleanedData["duration"]} days! \n` +
    " S-" +
    colorMapper(cleanedData["sunday"]) +
    "  M-" +
    colorMapper(cleanedData["monday"]) +
    "  T-" +
    colorMapper(cleanedData["tuesday"]) +
    "  W-" +
    colorMapper(cleanedData["wednesday"]) +
    "  T-" +
    colorMapper(cleanedData["thursday"]) +
    "  F-" +
    colorMapper(cleanedData["friday"]) +
    "  S-" +
    colorMapper(cleanedData["saturday"])
  );
};

const transformInteractionData = (interactionData: GoalResponse[]) => {
  const res: { [key: string]: string } = {};
  interactionData.forEach((ele) => {
    res[ele.name] = ele.value;
  });
  return res;
};

const colorMapper = (option: string) => {
  return option == "off" ? "🔴" : "🟢";
};

type GoalResponse = {
  name: string;
  type: number;
  value: string;
};
