import { Event } from "../../entities/Event";
import { Client } from "discord.js";
import moment from "moment";

export const clearGoalsToday = async (client: Client<boolean>) => {
  const date_today = moment().format("l");
  const events_today = await Event.find({ where: { date: date_today } });
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
