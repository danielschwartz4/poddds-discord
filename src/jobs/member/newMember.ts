import { Role } from "discord.js";
import { createUser, readUser } from "../../resolvers/user";
import { CLIENT } from "../../constants";

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
          "! mod from poddds here 👋\nType /set-current in #💪fitness-goals or #📚study-goals to create a goal and get access to the rest of the server. let me know if you have any questions 🎉"
      );
    });

    // add member id and stuff to DB
    const newUser = await readUser(user.id);
    if (!newUser) {
      await createUser(user.displayName, user.id);
    }
  });
};
