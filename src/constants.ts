import { addDays } from "./utils/timeZoneUtil";

export const __prod__ = process.env.NODE_ENV === "production";
export const TODAY = () => {
    let returnObject = addDays(new Date(), 0)
    console.log("HERE IS THE VALUE OF TODAY: ", returnObject)
    return returnObject as Date;
}