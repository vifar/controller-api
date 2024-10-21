import { PrismaClient } from "@prisma/client";
import cors from "cors";
import express, { Request } from "express";
import { body, query } from "express-validator";
import cron from "node-cron";
import {
  getByUserId,
  getByUserIdAndSymbolV2,
  getList,
  insertSymbols,
  resetSymbols,
  update,
  updateSignal,
} from "./controller/SymbolController";
import { generateKey, login, validate } from "./controller/UserController";

export const server = express();
export const prisma = new PrismaClient();

const nySessionReset = cron.schedule(
  "0 11 * * *",
  () => {
    console.log("Running task at 11 AM CST, Monday to Friday");
    resetSymbols();
  },
  {
    timezone: "America/Chicago",
  }
);

const asiaSessionReset = cron.schedule(
  "0 22 * * *",
  () => {
    console.log("Running task at 10 PM (23:00) CST, Monday to Friday");
    resetSymbols();
  },
  {
    timezone: "America/Chicago",
  }
);

async function main() {
  await prisma.$connect();

  server.use(express.json());
  server.use(cors<Request>());
  server.use(express.urlencoded({ extended: false }));

  server.get("/list", getList);
  server.get(
    "/getByUserId",
    query("userId").notEmpty().trim().escape(),
    query("type").notEmpty().trim().escape(),
    getByUserId
  );
  // server.get(
  //   "/getByUserIdAndSymbol",
  //   query("userId").notEmpty().trim().escape(),
  //   query("symbol").notEmpty().trim().escape(),
  //   query("type").notEmpty().trim().escape(),
  //   query("key").notEmpty().trim().escape(),
  //   getByUserIdAndSymbol
  // );
  server.post(
    "/getByUserIdAndSymbol",
    body("userId").notEmpty().trim().escape(),
    body("symbol").notEmpty().trim().escape(),
    body("type").notEmpty().trim().escape(),
    body("key").notEmpty().trim().escape(),
    getByUserIdAndSymbolV2
  );

  server.post(
    "/updateSignal",
    body("userId").notEmpty(),
    body("symbol").notEmpty(),
    body("tradeType").notEmpty(),
    body("signalOne").notEmpty(),
    body("signalTwo").notEmpty(),
    updateSignal
  );

  server.post("/insert", body("userId").notEmpty().trim(), insertSymbols);
  server.post(
    "/update",
    body("id").notEmpty(),
    body("type").notEmpty(),
    update
  );

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

    nySessionReset.start();
    asiaSessionReset.start();
  });
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
