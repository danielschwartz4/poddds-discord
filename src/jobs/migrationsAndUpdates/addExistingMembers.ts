import { GUILD } from "../../constants";
import { User } from "../../entities/User";

export const addExistingMembers = async () => {
  GUILD?.members.fetch().then((members) => {
    members.forEach(async (user) => {
      // add member id and stuff to DB
      const newUser = await User.find({ where: { discordId: user.id } });
      if (!newUser.length) {
        if (user.roles.cache.some((role) => role.name === "podmate")) {
          await User.create({
            discordUsername: user.displayName,
            discordId: user.id,
          }).save();
        } else if (
          user.roles.cache.some((role) => role.name === "new member")
        ) {
          await User.create({
            discordUsername: user.displayName,
            discordId: user.id,
          }).save();
        }
        console.log("new user added: " + newUser);
      }
    });
  });
};
