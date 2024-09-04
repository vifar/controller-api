import { PrismaClient } from "@prisma/client";
import cors from "cors";
import { CronJob } from "cron";
import express, { Request } from "express";
import { body, query } from "express-validator";
import {
  getByUserId,
  getByUserIdAndSymbol,
  getList,
  insertSymbols,
  update,
} from "./controller/SymbolController";
import { generateKey, login, validate } from "./controller/UserController";

const job = new CronJob(
  "0 11 * * 1-5",
  function () {
    // await Controller.update(
    //   { mode: 2, status: 0 },
    //   {
    //     where: {
    //       [Op.or]: [{ mode: 1 }, { mode: 0 }],
    //     },
    //   }
    // );
    // TODO turn all symbols to off
  },
  null,
  true,
  "America/New_York"
);

const server = express();
export const prisma = new PrismaClient();

async function main() {
  await prisma.$connect();

  server.use(express.json());
  server.use(cors<Request>());
  server.use(express.urlencoded({ extended: false }));

  server.get("/list", getList);
  server.get(
    "/getByUserId",
    query("userId").notEmpty().trim().escape(),
    getByUserId
  );
  server.get(
    "/getByUserIdAndSymbol",
    query("userId").notEmpty().trim().escape(),
    query("symbol").notEmpty().trim().escape(),
    getByUserIdAndSymbol
  );

  server.post("/insert", body("userId").notEmpty().trim(), insertSymbols);
  server.post("/update", body("id").notEmpty(), update);

  server.post("/login", login);
  server.post("/generateKey", body("userId").notEmpty().trim(), generateKey);
  server.post(
    "/validate",
    body("userId").notEmpty().trim(),
    body("key").notEmpty().trim(),
    validate
  );

  server.listen(process.env.PORT, async () => {
    console.log("Listening on port: " + process.env.PORT);
  });

  job.start();
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
