import Bree from "bree";
import express from "express";
import discordScheduler from "./jobs/discordScheduler";
import DiscordJS, { GatewayIntentBits, TextChannel } from "discord.js";

const main = async () => {
  const app = express();
  app.set("trust proxy", 1);

  // Add cors
  // app.use(cors(corsOptions));

  // const bree = new Bree({
  //   root: "dist/jobs/",
  //   jobs: [
  //     {
  //       name: "sendScheduledEmail",
  //       path: "./dist/jobs/discordScheduler.js",
  //       // cron: "* * * * *",
  //       interval: "Every 1 second",
  //       worker: {
  //         workerData: {
  //           description: "This job will send emails.",
  //         },
  //       },
  //     },
  //   ],
  // });

  // bree.start();

  discordScheduler();

  app.listen(parseInt(process.env.PORT as string) || 4000, () => {
    console.log("server started on port 4000");
  });
};

main().catch((err) => {
  console.log(err);
});
