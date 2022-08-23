import path from "path";
import { DataSource } from "typeorm";
import { __prod__ } from "./constants";

const AppDataSource = __prod__
  ? new DataSource({
      type: "postgres",
      synchronize: true,
      database: process.env.DATABASE_URL,
      migrations: [path.join(__dirname, "./migrations/*")],
      entities: ["dist/entities/*.*"],
      logging: true,
      extra: {
        ssl: {
          rejectUnauthorized: false,
        },
      },
    })
  : new DataSource({
      type: "postgres",
      host: "localhost",
      // port: 3306,
      synchronize: true,
      database: process.env.LOCALHOST_DATABASE,
      username: process.env.LOCALHOST_USERNAME,
      password: process.env.LOCALHOST_PASSWORD,
      migrations: [path.join(__dirname, "./migrations/*")],
      entities: ["dist/entities/*.*"],
      logging: true,
      extra: {
        ssl: false,
        rejectUnauthorized: __prod__ ? true : false,
      },
    });

export default AppDataSource;
