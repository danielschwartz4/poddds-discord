import { Role } from "discord.js";
import {
  readAllActiveGoalsForTimezone,
  updateAllUserWeeklyGoalsToInactive,
  updateWeeklyGoalAndEventsActive,
} from "../../resolvers/weeklyGoal";
import { CLIENT, LOCAL_TODAY } from "../../constants";
import { mdyDate } from "../../utils/timeZoneUtil";
import { deactivateMember } from "./onMemberLeave";
import { readActiveEvent } from "../../resolvers/event";
import { GUILD, ROLE_IDS } from "../discordScheduler";
import { removeRole } from "../../resolvers/role";
import { deleteGoalLeftTodayChannelByPodType } from "../../utils/channelUtil";
import { botDMNotification } from "../../utils/adminNotifs";

export const autoKickMember = async (timeZoneIsUTCMidnight: string) => {
  const activeGoals = await readAllActiveGoalsForTimezone(
    timeZoneIsUTCMidnight
  );
  
  // kick users that have active weekly goals after 3 misses
  let users_notified: string[] = [];
  for (const goal of activeGoals) {
    // activeGoals.forEach(async (goal: WeeklyGoal) => {
    const userId = goal.discordId;
    if (!users_notified.includes(userId)) {
      // if 2 misses, DM the person with a warning message
      if (goal.misses == 2) {
        const activeGoalToday = await readActiveEvent(
          userId,
          mdyDate(LOCAL_TODAY(timeZoneIsUTCMidnight))
        );

        if (activeGoalToday.length) {
          // if they have an active event today where they can do something about it
          try {
            CLIENT.users
            .fetch(userId)
            .then(async (user_to_kick) => {
              let kick_warning_msg =
                "❕ Automatic warning message from poddds mod here! ❕\n\n 👀 You've missed your weekly goal for 3 days in a row \n 📝 Complete your next objective or note in the skip channel that it's an off day so you don't get moved to kicked! \n🌟 Consistency does not mean perfection! Therefore, by completing your task and posting in #daily-updates-chat, you'll get moved back to 🟩 / 0 misses immediately!\n\n **If you get moved to kicked, you'll have to message the mods to be let back into the server, once you decide to recommit.** Cheers! 🍻";
              user_to_kick.send(kick_warning_msg);
            })
          } catch {
            console.log("autoKickMember.ts 1 ERROR! Assuming user has left server", userId);
            deactivateMember(userId);
          }
          
        }
        users_notified.push(userId);
      }

      // if more than 2 misses, change role of person to kicked
      if (goal.misses > 2) {
        try {
          const user_to_kick = await CLIENT.users.fetch(userId)

          await GUILD()?.members.fetch(goal.discordId).then(async (user) => {
            if (user.roles.cache.some((r) => r.name.includes('fitness')) && user.roles.cache.some((r) => r.name.includes('study'))) {
              // remove pod role
              removeRole(user, goal.type)

              // deactivate their goal
              updateWeeklyGoalAndEventsActive(goal.id)

              // notify them
              let kick_msg ="‼ You've been kicked from your " + goal.type + " pod ‼";
              user_to_kick?.send(kick_msg);

            } else {
              // kick them
              let kick_msg ="‼ You've been put into the kicked role in the poddds community ‼\n\n🤗 We know things happen, so **if the community has helped you and you want to join back in again, message the mods to rejoin once you decide to recommit** 🙂";
              user_to_kick?.send(kick_msg);

              try {
                user?.roles.set([ROLE_IDS()['kickedRoleId'] as Role]) // remove all roles and set to kicked
              } catch {
                botDMNotification(user.displayName, " -- TRIED KICKING THEM BUT RAN INTO AN ISSUE! CHECK HEROKU LOGS")
              }
              updateAllUserWeeklyGoalsToInactive(userId);

              // remove their channel names from the server in goals left today if they still remain
              deleteGoalLeftTodayChannelByPodType(goal.type, goal.discordId)

              users_notified.push(userId);
            }
          })
        } catch {
          console.log("autoKickMember ERROR! Assuming user has left server", userId);
          deactivateMember(userId);
          continue
        }
      }
    }
  }
};
