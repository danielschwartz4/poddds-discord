import { ADMIN_USER_IDS, CLIENT } from "../constants";
import { User } from "../entities/User";

export const newPodmateNotification = (from_username: string, resp: string) => {
  ADMIN_USER_IDS.forEach((val) => {
    CLIENT.users.fetch(val as string).then((user) => {
      user.send(
        "**poddds bot DM message NEW PODMATE ALERT!** DM them if there's no evidence or anything is unclear\n" +
          from_username +
          " says that their weekly goal and evidence will be:\n" +
          resp
      );
    });
  });
};

export const memberLeaveNotification = (userObject: User) => {
  ADMIN_USER_IDS.forEach((val) => {
    CLIENT.users.fetch(val as string).then((user) => {
      user.send(
        "poddds bot DM message -- AUTOMATIC MEMBER LEFT: " +
          userObject?.discordUsername +
          " AND THEIR WEEKLY GOALS WERE DEACTIVATED"
      );
    });
  });
};

export const botDMNotification = (DM_username: string, content: string) => {
  ADMIN_USER_IDS.forEach((val: string) => {
    CLIENT.users.fetch(val as string).then((user) => {
      user.send(
        "**poddds bot DM message TO " + DM_username + ":**\n" + content
      );
    });
  });
};
