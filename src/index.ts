import Bree from "bree";
import express from "express";
import discordScheduler from "./jobs/discordScheduler";


const main = async () => {
  const app = express();
  app.set("trust proxy", 1);

  // Add cors
  // app.use(cors(corsOptions));

  discordScheduler();

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

  app.listen(parseInt(process.env.PORT as string) || 4000, () => {
    console.log("server started on port 4000");
  });
};

main().catch((err) => {
  console.log("BREE ERROR BELOW")
  console.log(err);
});
