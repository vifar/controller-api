const { HOST, USERNAME, PASSWORD, PORT, DATABASE } = process.env;
import "dotenv/config";
import { Sequelize, SequelizeOptions } from "sequelize-typescript";
import { SymbolStatus } from "./entity/SymbolStatus";
import { User } from "./entity/User";

export class SequelizeInstance {
  seqInstance!: Sequelize;

  Sequelize() {
    this.seqInstance;
  }

  GetInstance() {
    const options: SequelizeOptions = {
      host: process.env.HOST,
      username: process.env.USERNAME,
      password: process.env.PASSWORD,
      port: Number(process.env.PORT),
      dialect: `mysql`,
      database: process.env.DATABASE,
      models: [User, SymbolStatus],
    };

    this.seqInstance = new Sequelize(options);

    return this.seqInstance;
  }
}
