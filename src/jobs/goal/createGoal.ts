import { GuildMember, Role } from "discord.js";
import {
  CLIENT,
  FITNESS_GOALS_CHANNEL_ID,
  LOCAL_TODAY,
  STUDY_GOALS_CHANNEL_ID,
} from "../../constants";
import { Event } from "../../entities/Event";
import { User } from "../../entities/User";
import { WeeklyGoal } from "../../entities/WeeklyGoal";
import { GoalType } from "../../types/dbTypes";
import { newPodmateNotification } from "../../utils/adminNotifs";
import { buildDays } from "../../utils/buildDaysUtil";
import { parseInteractionResponse } from "../../utils/goalUtils";
import {
  InteractionResponse,
  transformInteractionData,
} from "../../utils/interactionData";
import { addDays, flipSign, int2day, mdyDate } from "../../utils/timeZoneUtil";
import { GUILD, ROLE_IDS } from "../discordScheduler";
import { deactivateGoalsAndEvents } from "../goalsLeftToday/deactivateGoals";
import { assignPod } from "../pod/assignPod";

export const createGoal = () => {
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
          timeZone: flipSign(timeZone),
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
              timeZone: flipSign(timeZone),
              type: type as GoalType,
              isActive: true,
            }).save();
          }
        }
      }
      const from_username = interaction.user.username;
      const user = await GUILD()?.members.fetch(interaction.user.id);
      // Assign user to pod and send resp to that goals channel
      // Add podmate role
      let podmate_role_id = ROLE_IDS()['podmateRoleId']
      await user?.roles?.add(podmate_role_id as Role);

      await assignPod(type as GoalType, user as GuildMember, resp);
      // Assign timezone role

      let timezone_role_id = user?.guild?.roles?.cache.find(
        (r) => r.name === "GMT" + flipSign(timeZone)
      );
      if (!user?.roles.cache.some((role) => role.name.includes("GMT"))) {
        await user?.roles?.add(timezone_role_id as Role);
      } else if (
        user?.roles.cache.filter((role) => role.name.includes("GMT")).first()
          ?.name !==
        "GMT" + flipSign(timeZone)
      ) {
        await user?.roles?.remove(
          user?.roles.cache
            .filter((role) => role.name.includes("GMT"))
            .first() as Role
        );
        await user?.roles?.add(timezone_role_id as Role);
      }

      // Handle new member roles
      if (user?.roles.cache.some((role) => role.name === "🌱 new member")) {
        // Notify admins of new podmate
        newPodmateNotification(from_username, resp);

        // Automatically remove new member role and add podmate role to msg.author.roles
        let new_member_role_id = ROLE_IDS()['newMemberRoleId']
        let podmate_role_id = ROLE_IDS()['podmateRoleId']
        user.roles.add(podmate_role_id as Role);
        user.roles.remove(new_member_role_id as Role);
      }
    }
  });
};
