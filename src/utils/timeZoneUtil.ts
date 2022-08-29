export function changeTimeZone(date: Date, timeZone: string) {
  return new Date(
    date.toLocaleString("en-US", {
      timeZone,
    })
  );
}

export const addDays = (days: number) => {
  var date = new Date();
  date.setDate(date.getDate() + days);
  return date;
};
