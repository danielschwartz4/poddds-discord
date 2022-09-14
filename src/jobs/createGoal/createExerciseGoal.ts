import { Client, GuildMember, Role } from "discord.js";
import { GoalType } from "src/types/dbTypes";
import { LOCAL_TODAY } from "../../constants";
import { Event } from "../../entities/Event";
import { User } from "../../entities/User";
import { WeeklyGoal } from "../../entities/WeeklyGoal";
import { buildDays } from "../../utils/buildDaysUtil";
import {
  GoalResponse,
  transformInteractionData,
} from "../../utils/interactionData";
import { addDays, flipSign, int2day, mdyDate } from "../../utils/timeZoneUtil";
import { deactivateGoalsAndEvents } from "../goalsLeftToday/deactivateGoals";
import { assignPod } from "../newMember/assignPod";
import { parseGoalResponse } from "./goalUtils";

export const createGoal = (
  client: Client<boolean>,
  admin_ids: string[],
  server_id: string
) => {
  client.on("interactionCreate", async (interaction) => {
    if (!interaction.isChatInputCommand()) return;
    let type;
    if (interaction.commandName === "set-current-exercise-goal") {
      type = "exercise";
    } else if (interaction.commandName === "set-current-study-goal") {
      type = "study";
    }
    if (
      interaction.commandName === "set-current-exercise-goal" ||
      interaction.commandName === "set-current-study-goal"
    ) {
      const cleanedData = transformInteractionData(
        interaction.options.data as GoalResponse[]
      );
      const timeZone = cleanedData["time-zone"];
      const localTodayWithTimeZone = LOCAL_TODAY(timeZone);

      const resp = parseGoalResponse(interaction, cleanedData);
      interaction.reply(resp);
      if (cleanedData) {
        // Get userId to pass into WeeklyGoal
        const user = await User.findOne({
          where: { discordId: interaction?.user?.id },
        });
        // get day of the week
        const daysObj = buildDays(cleanedData);
        const startDate = addDays(localTodayWithTimeZone, 1);
        const endDate = addDays(
          localTodayWithTimeZone,
          parseInt(cleanedData["duration"])
        );
        deactivateGoalsAndEvents(interaction?.user?.id);
        const weekly_goal = await WeeklyGoal.create({
          description: cleanedData["goal"],
          evidence: cleanedData["evidence"],
          discordId: interaction.user.id,
          adjustedStartDate: startDate,
          adjustedEndDate: endDate,
          days: daysObj,
          isActive: true,
          timeZone: flipSign(cleanedData["time-zone"]),
          userId: user?.id,
          type: type as GoalType,
        }).save();
        for (let i = 1; i <= parseInt(cleanedData["duration"]); i++) {
          const date = addDays(localTodayWithTimeZone, i);
          const day = date.getDay();
          const val = cleanedData[int2day(day)];
          const formattedDate = mdyDate(date);

          if (val === "on") {
            await Event.create({
              adjustedDate: formattedDate,
              discordId: interaction.user.id,
              goalId: weekly_goal.id,
              timeZone: flipSign(cleanedData["time-zone"]),
              isActive: true,
            }).save();
          }
        }
      }
      const from_username = interaction.user.username;
      const guild = client.guilds.cache.get(server_id);
      const user = await guild?.members.fetch(interaction.user.id);
      console.log("BEFORE ASSIGN POD");
      // Assign user to pod
      assignPod(type as GoalType, user as GuildMember);
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
      }
    }
  });
};
