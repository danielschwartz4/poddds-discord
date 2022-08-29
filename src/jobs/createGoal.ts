import { CacheType, Client, Interaction, Role } from "discord.js";
import moment, { duration } from "moment";
import { Event } from "../entities/Event";
import { WeeklyGoal } from "../entities/WeeklyGoal";
import { buildDays } from "../utils/buildDaysUtil";
import { addDays, changeTimeZone } from "../utils/timeZoneUtil";

export const createGoal = (
  client: Client<boolean>,
  admin_ids: string[],
  server_id: string
) => {
  const daysTest = {
    0: {
      isSelected: false,
    },
    1: {
      isSelected: false,
    },
    2: {
      isSelected: true,
    },
    3: {
      isSelected: false,
    },
    4: {
      isSelected: true,
    },
    5: {
      isSelected: false,
    },
    6: {
      isSelected: true,
    },
  };
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
        console.log(cleanedData);
        // get day of the week
        const daysObj = buildDays(cleanedData);
        const startDate = changeTimeZone(
          new Date(),
          "Etc/GMT" + cleanedData["time-zone"]
        );
        const endDate = changeTimeZone(
          addDays(parseInt(cleanedData["duration"])),
          "Etc/GMT" + cleanedData["time-zone"]
        );
        console.log(startDate, endDate);

        WeeklyGoal.create({
          description: cleanedData["goal"],
          evidence: cleanedData["evidence"],
          discordId: interaction.user.id,
          startDate: startDate,
          endDate: endDate,
          days: daysObj,
          isActive: true,
        });
        for (let i = 1; i <= parseInt(cleanedData["duration"]); i++) {
          const day = moment().add(i, "days").format("dddd").toLowerCase();
          const date = moment().add(i, "days").format("l");
          const val = cleanedData[day];
          const description =
            "Goal: " +
            cleanedData["goal"] +
            " \n" +
            "Evidence: " +
            cleanedData["evidence"];
          if (val === "on") {
            Event.create({
              date: date,
              discordId: interaction.user.id,
              // description: description,
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
        // await User.update(
        //   { discordId: interaction.user.id },
        //   { startedGoalAt: moment(new Date()) }
        // );
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
