import { addDays, flipSign } from "./utils/timeZoneUtil";

export const __prod__ = process.env.NODE_ENV === "production";
export const TODAY = () => {
    let returnObject = addDays(new Date(), 0)
    return returnObject as Date;
}

export const LOCAL_TODAY = (timeZone: string) => {
    let timeZoneFlipped = flipSign(timeZone)
    let localDateObject = new Date().toLocaleString("en-GB", {
        timeZone: "Etc/GMT" + timeZoneFlipped,
    })

    // reformat into ISO time
    let splitDateTime = localDateObject.split(", ")
    let splitDate = splitDateTime[0].split("/")
    let Y = splitDate[2]
    let D = splitDate[1]
    let M = splitDate[0]
    let date = Y + "-" + M + "-" + D
    let localTime = splitDateTime[1]
    let newLocalDateObject = new Date(date + "T" + localTime + "Z")

    return newLocalDateObject;
}