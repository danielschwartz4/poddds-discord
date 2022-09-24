import { Role } from "discord.js";
import { CLIENT } from "../../constants";
import { User } from "../../entities/User";

// bot handling when a new member posts a new goal
export const newMember = () => {
  CLIENT.on("guildMemberAdd", async (user) => {
    // auto assign role of new member
    let new_member_role_id = user.guild.roles.cache.find(
      (r) => r.name === "new member"
    );

    user.roles.add(new_member_role_id as Role);

    // intro message
    CLIENT.users.fetch(user.id).then(async (user) => {
      user.send(
        "what’s up " +
          `<@${user.id}>` +
          "! mod from poddds here 👋\nmake a goal in #💪goals-setting to get access to the rest of the server. let me know if you have any questions 🎉"
      );
    });
    console.log("intro message sent to ", user.displayName);

    // add member id and stuff to DB
    const newUser = await User.find({ where: { discordId: user.id } });
    console.log(newUser);
    if (!newUser.length) {
      await User.create({
        discordUsername: user.displayName,
        discordId: user.id,
      }).save();
    }
  });
};
