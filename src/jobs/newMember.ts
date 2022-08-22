import { Client, Role } from "discord.js";
import { User } from "../entities/User";

// bot handling when a new member posts a new goal
// how do I figure out what types these are?
export const newMember = (client: Client<boolean>) => {
  client.on("guildMemberAdd", async (user) => {
    console.log("IN NEW MEMBER");
    // auto assign role of new member
    let new_member_role_id = user.guild.roles.cache.find(
      (r) => r.name === "new member"
    );

    user.roles.add(new_member_role_id as Role);

    // add member id and stuff to DB
    const newUser = await User.find({ where: { discordId: user.id } });
    console.log(newUser);
    if (!newUser.length) {
      await User.create({
        discordUsername: user.displayName,
        discordId: user.id,
      }).save();
    }
    console.log("new user added: " + newUser);
  });
};
