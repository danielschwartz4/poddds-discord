import { WeeklyGoal } from "../entities/WeeklyGoal";
import { ADMIN_USER_IDS, CLIENT } from "./discordScheduler";

export const onMemberLeave = () => {
    CLIENT.on('guildMemberRemove', (member) => {
        ADMIN_USER_IDS.forEach((val) => {
            CLIENT.users.fetch(val as string).then((user) => {
                user.send("poddds -- AUTOMATIC MEMBER LEFT: " + member.user.username + " AND THEIR WEEKLY GOALS WERE DEACTIVATED");
            });
        });
        WeeklyGoal.update({ discordId: member.id }, { isActive: false})
    });
}