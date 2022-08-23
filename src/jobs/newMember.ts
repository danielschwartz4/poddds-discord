import { Client, Role } from "discord.js";
import { User } from "../entities/User";

// bot handling when a new member posts a new goal
export const newMember = (client: Client<boolean>) => {
  client.on("guildMemberAdd", async (user) => {
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
  });
};
