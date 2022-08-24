import express from "express";
import AppDataSource from "./dataSource";
import discordScheduler from "./jobs/discordScheduler";
import moment from "moment";

const connect2Database = async (): Promise<void> => {
  AppDataSource.initialize()
    .then(() => {
      console.log("Data Source has been initialized!");
    })
    .catch((err) => {
      console.error("Error during Data Source initialization", err);
    });
};

const main = async () => {
  console.log("HELLO");
  console.log(moment().add(2, "days").format("dddd"));
  connect2Database().then(async () => {
    console.log("Connected to database");
  });

  const app = express();
  app.set("trust proxy", 1);

  discordScheduler();

  app.listen(parseInt(process.env.PORT as string) || 4000, () => {
    console.log("server started on port 4000");
  });
};

main().catch((err) => {
  console.log("BREE ERROR BELOW");
  console.log(err);
});
