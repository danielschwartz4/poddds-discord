import { DaysType } from "../types/dbTypes";

export const buildDays = (cleanedData: { [key: string]: string }) => {
  let daysDict = {
    sunday: false,
    monday: false,
    tuesday: false,
    wednesday: false,
    thursday: false,
    friday: false,
    saturday: false,
  } as DaysType;

  for (const [key, value] of Object.entries(cleanedData)) {
    if (
      key == "sunday" ||
      key == "monday" ||
      key == "tuesday" ||
      key == "wednesday" ||
      key == "thursday" ||
      key == "friday" ||
      key == "saturday"
    ) {
      daysDict[key] = value === "on";
    }
  }
  return daysDict;
};
