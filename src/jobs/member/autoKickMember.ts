import { Guild, Role } from "discord.js";
import { readAllActiveGoalsForTimezone, updateAllUserWeeklyGoalsToInactive } from "../../resolvers/weeklyGoal";
import { CLIENT, LOCAL_TODAY } from "../../constants";
import { mdyDate } from "../../utils/timeZoneUtil";
import { deactivateMember } from "./onMemberLeave";
import { readActiveEvent } from "../../resolvers/event";

export const autoKickMember = async (
  timeZoneIsUTCMidnight: string,
  GUILD: Guild
) => {
  const activeGoals = await readAllActiveGoalsForTimezone(timeZoneIsUTCMidnight)

  // kick users that have active weekly goals after 3 misses
  let users_notified: string[] = []
  for (const goal of activeGoals) {
  // activeGoals.forEach(async (goal: WeeklyGoal) => {
    const userId = goal.discordId;
    if (!users_notified.includes(userId)) { 
      // if 2 misses, DM the person with a warning message
      if (goal.misses == 2) {
        const activeGoalToday = await readActiveEvent(userId, mdyDate(LOCAL_TODAY(timeZoneIsUTCMidnight)))

        if (activeGoalToday.length) { // if they have an active event today where they can do something about it
          CLIENT.users
            .fetch(userId)
            .then(async (user_to_kick) => {
              let kick_warning_msg =
                "❕ Automatic warning message from poddds mod here! ❕\n\n 👀 You've missed your weekly goal for 3 days in a row \n 📝 Complete your next objective or note in the skip channel that it's an off day so you don't get moved to kicked! \n🌟 Consistency does not mean perfection! Therefore, by completing your task and posting in #daily-updates-chat, you'll get moved back to 🟩 / 0 misses immediately!\n\n **If you get moved to kicked, you'll have to message the mods to be let back into the server, once you decide to recommit.** Cheers! 🍻";
              user_to_kick.send(kick_warning_msg);
            })
            .catch((err) => {
              console.log("ERROR! Assuming user has left server", err);
              deactivateMember(userId);
            });
        }
        users_notified.push(userId)
      }

      // if more than 2 misses, change role of person to kicked
      if (goal.misses > 2) {
        CLIENT.users
          .fetch(userId)
          .then((user_to_kick) => {
            let kick_msg =
              "‼ You've been put into the kicked role in the poddds community ‼\n\n🤗 We know things happen, so **if the community has helped you and you want to join back in again, message the mods saying what happened once you decide to recommit** \n\nFeel free to reach out using the #general channel for support in the meantime 🙂";
            user_to_kick.send(kick_msg);
          })
          .catch((err) => {
            console.log("ERROR! Assuming user has left server", err);
            deactivateMember(userId);
          });
        // else if client.users.fetch is an error because it's an unknown member, then deactivate weekly goals of member

        let kicked_role_id = GUILD?.roles.cache.find(
          (r: Role) => r.name === "kicked"
        );
        const user = await GUILD?.members.fetch(userId);
        user.roles.set([kicked_role_id as Role]) // remove all roles and set to kicked
        updateAllUserWeeklyGoalsToInactive(userId);
        users_notified.push(userId)
      }
    }
  };
};
