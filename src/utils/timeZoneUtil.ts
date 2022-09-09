import { TODAY } from "../constants";

// Change timezone given gmt (e.g. -6)
export function changeTimeZone(date: Date, timeZone: string) {
  let timeZoneString = "Etc/GMT" + timeZone
  let returnObject = date.toLocaleString("en-US", {
    timeZone: timeZoneString,
    // timeZone: "Etc/GMT-1",
  })

  return returnObject;
}

// Add days to date
export const addDays = (date: Date, days: number) => {
  var tmpDate = new Date(date);

  tmpDate.setDate(tmpDate.getDate() + days);
  return tmpDate;
};

// mapping for for use converting Date's getDay method
export const int2day = (x: number) => {
  const dayMap: { [i: number]: string } = {
    0: "sunday",
    1: "monday",
    2: "tuesday",
    3: "wednesday",
    4: "thursday",
    5: "friday",
    6: "saturday",
  };
  return dayMap[x];
};

// Flip prefix sign of string
export const flipSign = (val: string) => {
  return val[0] == "+" ? "-" + val.slice(1) : "+" + val.slice(1);
};

// Get month formatted M-D-Y
export const mdyDate = (date: Date) => {
  var month = date.getUTCMonth() + 1; //months from 1-12
  var day = date.getUTCDate();
  var year = date.getUTCFullYear();
  return month + "-" + day + "-" + year;
};

export const todayAdjusted = (gmt: string) => {
  const date = (TODAY());
  return changeTimeZone(date, gmt);
};

export const timeZoneOffsetDict: { [i: number]: string } = {
  0: "+0",
  1: "-1",
  2: "-2",
  3: "-3",
  4: "-4",
  5: "-5",
  6: "-6",
  7: "-7",
  8: "-8",
  9: "-9",
  10: "-10",
  11: "-11",
  12: "-12",
  13: "+11",
  14: "+10",
  15: "+9",
  16: "+8",
  17: "+7",
  18: "+6",
  19: "+5",
  20: "+4",
  21: "+3",
  22: "+2",
  23: "+1",
};
