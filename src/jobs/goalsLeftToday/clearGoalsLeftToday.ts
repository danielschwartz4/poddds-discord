import { Client } from "discord.js";
import { TODAY } from "../../constants";
import { Event } from "../../entities/Event";
import { mdyDate } from "../../utils/timeZoneUtil";

export const clearGoalsToday = async (client: Client<boolean>) => {
  // const date_today = moment().format("l");
  const date_today = mdyDate(TODAY);

  const events_today = await Event.find({
    where: { adjustedDate: date_today },
  });
  console.log(events_today);
  if (events_today) {
    let goal_left_channel = client.channels.cache.get(
      events_today[0].goalLeftChannelId
    );
    console.log(goal_left_channel?.id as string);
    // doesn't really catch bc goal_left_channel = "" sometimes
    events_today.forEach(async (event: Event) => {
      const goal_left_channel = client.channels.cache.get(
        event.goalLeftChannelId
      );
      goal_left_channel?.delete();
    });
  }
};
