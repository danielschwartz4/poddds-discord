import { addDays } from "./utils/timeZoneUtil";

export const __prod__ = process.env.NODE_ENV === "production";
export const TODAY = __prod__ ? new Date() : addDays(new Date(), 0);
