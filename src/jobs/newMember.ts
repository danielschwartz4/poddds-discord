import { Client, Role } from "discord.js";

// bot handling when a new member posts a new goal
// how do I figure out what types these are?
export const newMember = (client: Client<boolean>) => {
    client.on('guildMemberAdd', async user => {
        // auto assign role of new member
        let new_member_role_id = user.guild.roles.cache.find(r => r.name === "new member");
        user.roles.add(new_member_role_id)

        // TODO: add member id and stuff to DB
    })
}