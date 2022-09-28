import { Guild, GuildMember, Role } from "discord.js";
import {
  ADMIN_USER_IDS,
  CLIENT,
  FITNESS_GOALS_CHANNEL_ID,
  LOCAL_TODAY,
  STUDY_GOALS_CHANNEL_ID,
} from "../../constants";
import { Event } from "../../entities/Event";
import { User } from "../../entities/User";
import { WeeklyGoal } from "../../entities/WeeklyGoal";
import { GoalType } from "../../types/dbTypes";
import { buildDays } from "../../utils/buildDaysUtil";
import { parseInteractionResponse } from "../../utils/goalUtils";
import {
  InteractionResponse,
  transformInteractionData,
} from "../../utils/interactionData";
import { addDays, flipSign, int2day, mdyDate } from "../../utils/timeZoneUtil";
import { deactivateGoalsAndEvents } from "../goalsLeftToday/deactivateGoals";
import { assignPod } from "../pod/assignPod";

export const createGoal = (GUILD: Guild) => {
  CLIENT.on("interactionCreate", async (interaction) => {
    if (!interaction.isChatInputCommand()) return;
    let type;
    if (interaction?.channelId === FITNESS_GOALS_CHANNEL_ID) {
      type = "fitness";
    } else if (interaction?.channelId === STUDY_GOALS_CHANNEL_ID) {
      type = "study";
    }
    if (interaction.commandName === "set-current-goal") {
      const cleanedData = transformInteractionData(
        interaction.options.data as InteractionResponse[]
      );
      const timeZone = cleanedData["time-zone"];
      const localTodayWithTimeZone = LOCAL_TODAY(flipSign(timeZone));

      const resp = parseInteractionResponse(interaction, cleanedData);
      interaction.reply(resp);
      if (cleanedData) {
        // Get userId to pass into WeeklyGoal
        const user = await User.findOne({
          where: { discordId: interaction?.user?.id },
        });
        // get day of the week
        const daysObj = buildDays(cleanedData);
        const startDate = localTodayWithTimeZone;
        const endDate = addDays(
          localTodayWithTimeZone,
          parseInt(cleanedData["duration"])
        );
        await deactivateGoalsAndEvents(interaction?.user?.id, type as GoalType);
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
              type: type as GoalType,
              isActive: true,
            }).save();
          }
        }
      }
      const from_username = interaction.user.username;
      console.log(interaction.user);
      const user = await GUILD.members.fetch(interaction.user.id);
      console.log(user);
      console.log("BEFORE ASSIGN POD");
      // Assign user to pod and send resp to that goals channel
      console.log("here");
      console.log(resp);
      // Add podmate role
      let role_id = user?.guild?.roles?.cache.find((r) => r.name === "podmate");
      await user?.roles?.add(role_id as Role);
      assignPod(type as GoalType, user as GuildMember, resp, GUILD);
      if (user?.roles.cache.some((role) => role.name === "new member")) {
        // Notify admins of new podmate
        ADMIN_USER_IDS.forEach((val) => {
          CLIENT.users.fetch(val as string).then((user) => {
            user.send(
              "poddds bot DM message -- NEW PODMATE ALERT! DM them if there's no evidence or anything is unclear\n" +
                from_username +
                " says that their weekly goal and evidence will be:\n" +
                resp
            );
          });
        });

        // Automatically remove new member role and add podmate role to msg.author.roles
        GUILD?.members.fetch(interaction.user.id).then((user: any) => {
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
