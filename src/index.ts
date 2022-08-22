import express from "express";
import path from "path";
import { DataSource } from "typeorm";
import { __prod__ } from "./constants";

const AppDataSource = new DataSource({
  type: "postgres",
  host: "localhost",
  // port: 3306,
  synchronize: __prod__ ? false : true,
  database: process.env.LOCALHOST_DATABASE,
  username: process.env.LOCALHOST_USERNAME,
  password: process.env.LOCALHOST_PASSWORD,
  migrations: [path.join(__dirname, "./migrations/*")],
  entities: ["dist/entities/*.*"],
  logging: true,
});

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
  connect2Database().then(async () => {
    console.log("Connected to database");
  });

  const app = express();
  app.set("trust proxy", 1);

  // discordScheduler();

  app.listen(parseInt(process.env.PORT as string) || 4000, () => {
    console.log("server started on port 4000");
  });
};

main().catch((err) => {
  console.log("BREE ERROR BELOW");
  console.log(err);
});

// const bree = new Bree({
//   root: "dist/jobs/",
//   jobs: [
//     {
//       name: "sendDiscordMessage",
//       path: "./dist/jobs/discordScheduler.js",
//       // cron: "* * * * *",
//       interval: "Every 5 seconds",
//       worker: {
//         workerData: {
//           description: "This job will send emails.",
//         },
//       },
//     },
//   ],
// });

// bree.start();
