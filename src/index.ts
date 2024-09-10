import { PrismaClient } from "@prisma/client";
import cors from "cors";
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

export const server = express();
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
    query("type").notEmpty().trim().escape(),
    getByUserId
  );
  server.get(
    "/getByUserIdAndSymbol",
    query("userId").notEmpty().trim().escape(),
    query("symbol").notEmpty().trim().escape(),
    query("type").notEmpty().trim().escape(),
    getByUserIdAndSymbol
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
