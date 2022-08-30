// Change timezone given gmt (e.g. -6)
export function changeTimeZone(date: Date, timeZone: string) {
  return new Date(
    date.toLocaleString("en-US", {
      timeZone,
    })
  );
}

// Add days to date
export const addDays = (date: Date, days: number) => {
  var date = new Date();
  date.setDate(date.getDate() + days);
  return date;
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
  return year + "-" + month + "-" + day;
};

export const todayAdjusted = (gmt: string) => {
  const date = new Date();
  return changeTimeZone(date, gmt);
};
