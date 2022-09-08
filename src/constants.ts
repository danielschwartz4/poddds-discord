import { addDays } from "./utils/timeZoneUtil";

export const __prod__ = process.env.NODE_ENV === "production";
export const TODAY = () => {
  let returnObject = addDays(new Date(), 0);
  return returnObject as Date;
};
