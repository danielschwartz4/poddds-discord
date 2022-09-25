import { Guild, Role } from "discord.js";
import { ADMIN_USER_IDS, CLIENT, LOCAL_TODAY } from "../../constants";
import { Event } from "../../entities/Event";
import { WeeklyGoal } from "../../entities/WeeklyGoal";
import { mdyDate } from "../../utils/timeZoneUtil";
import { deactivateMember } from "./onMemberLeave";

export const autoKickMember = async (
  timeZoneIsUTCMidnight: string,
  GUILD: Guild
) => {
  let podmate_role_id = GUILD?.roles.cache.find(
    (r: Role) => r.name === "podmate"
  );
  let kicked_role_id = GUILD?.roles.cache.find(
    (r: Role) => r.name === "kicked"
  );
  let new_member_role_id = GUILD?.roles.cache.find(
    (r: Role) => r.name === "new member"
  );

  const activeGoals = await WeeklyGoal.find({
    where: { isActive: true, timeZone: timeZoneIsUTCMidnight },
  });

  // kick users that have active weekly goals after 3 misses
  activeGoals.forEach(async (goal: WeeklyGoal) => {
    const userId = goal.discordId;
    // if 2 misses, DM the person with a warning message
    if (goal.misses == 2) {
      const activeGoalToday = await Event.find({
        where: {
          discordId: userId,
          isActive: true,
          adjustedDate: mdyDate(LOCAL_TODAY(timeZoneIsUTCMidnight)),
        },
      });

      if (activeGoalToday.length) {
        CLIENT.users
          .fetch(userId)
          .then(async (user_to_kick) => {
            let kick_warning_msg =
              "❕ Automatic warning message from poddds mod here! ❕\n\n 👀 You've missed your weekly goal for 3 days in a row \n 📝 Complete your next objective or note in the skip channel that it's an off day so you don't get moved to kicked! \n🌟 Consistency does not mean perfection! Therefore, by completing your task and posting in #daily-updates-chat, you'll get moved back to 0 misses immediately!\n\n **If you get moved to kicked, you'll have to message the mods to be let back into the server, once you decide to recommit.** Cheers! 🍻";
            user_to_kick.send(kick_warning_msg);
            ADMIN_USER_IDS.forEach((val: string) => {
              CLIENT.users.fetch(val as string).then((user) => {
                user.send(
                  "poddds bot sent to " +
                    user_to_kick.username +
                    ":\n" +
                    kick_warning_msg
                );
              });
            });
          })
          .catch((err) => {
            console.log("ERROR! Assuming user has left server", err);
            deactivateMember(userId);
          });
      }
    }

    // if more than 2 misses, change role of person to kicked
    if (goal.misses > 2) {
      CLIENT.users
        .fetch(userId)
        .then((user_to_kick) => {
          let kick_msg =
            "‼ You've been put into the kicked role in the poddds community ‼\n\n🤗 We know things happen, so **if the community has helped you and you want to join back in again, message the mods saying what happened once you decide to recommit** \n\nFeel free to reach out using the #general channel for support in the meantime 🙂";
          user_to_kick.send(kick_msg);
          ADMIN_USER_IDS.forEach((val: string) => {
            CLIENT.users.fetch(val as string).then((user) => {
              user.send(
                "poddds bot sent to " + user_to_kick.username + ":\n" + kick_msg
              );
            });
          });
        })
        .catch((err) => {
          console.log("ERROR! Assuming user has left server", err);
          deactivateMember(userId);
        });
      // else if client.users.fetch is an error because it's an unknown member, then deactivate weekly goals of member

      const user = await GUILD?.members.fetch(userId);
      user?.roles.add(kicked_role_id as Role);
      user?.roles.remove(podmate_role_id as Role);
      user?.roles.remove(new_member_role_id as Role);
      WeeklyGoal.update({ discordId: userId }, { isActive: false });
    }
  });
};
