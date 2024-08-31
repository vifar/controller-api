import { CronJob } from "cron";
import express from "express";
import { getSymbolList } from "./controller/SymbolController";
import { login } from "./controller/UserController";
import { SequelizeInstance } from "./db/sequelize";

const job = new CronJob(
  "0 11 * * 1-5",
  function () {
    // await Controller.update(
    //     { mode: 2, status: 0 },
    //     {
    //       where: {
    //         [Op.or]: [{ mode: 1 }, { mode: 0 }],
    //       },
    //     }
    //   );
    // TODO turn all symbols to off
  },
  null,
  true,
  "America/New_York"
);

export const seqInstance = new SequelizeInstance().GetInstance();

const router = express();

router.use(express.json());
router.use(express.urlencoded({ extended: false }));

router.get("/list", getSymbolList);

router.post("/login", login);

// router.get(
//   "/getByUser",
//   query("userId").notEmpty().trim().escape(),
//   async (req, res) => {
//     const result = validationResult(req);
//     if (!result.isEmpty()) {
//       return res.send({ errors: result.array() });
//     }

//     const { userId } = req.query;

//     const { count, rows } = await Controller.findAndCountAll({
//       where: {
//         userId: userId,
//       },
//     }).catch((err) => {
//       res.status(400).send(err);
//     });

//     if (!rows) {
//       return res.status(202).send({ errors: [{ msg: "Not Found" }] });
//     }
//     if (rows.length == 0) {
//       return res.status(202).send({ errors: [{ msg: "No Records Found" }] });
//     }

//     rows.sort((a, b) => {
//       let fa = a.symbol.toLowerCase(),
//         fb = b.symbol.toLowerCase();

//       if (fa < fb) {
//         return -1;
//       }
//       if (fa > fb) {
//         return 1;
//       }
//       return 0;
//     });

//     return res.status(200).send({ controller: rows });
//   }
// );

// router.get(
//   "/getByUserAndSymbol",
//   query("userId").notEmpty().trim().escape(),
//   query("symbol").notEmpty().trim().escape(),
//   async (req, res) => {
//     const result = validationResult(req);
//     if (!result.isEmpty()) {
//       return res.send({ errors: result.array() });
//     }

//     const { userId, symbol } = req.query;

//     console.log(symbol.slice(0, 6));

//     const { count, rows } = await Controller.findAndCountAll({
//       where: {
//         userId: userId,
//         symbol: symbol.slice(0, 6),
//       },
//     }).catch((err) => {
//       res.status(400).send(err);
//     });

//     if (!rows) {
//       return res.status(202).send({ errors: [{ msg: "Not Found" }] });
//     }
//     if (rows.length == 0) {
//       return res.status(202).send({ errors: [{ msg: "No Records Found" }] });
//     }

//     rows.sort((a, b) => {
//       let fa = a.symbol.toLowerCase(),
//         fb = b.symbol.toLowerCase();

//       if (fa < fb) {
//         return -1;
//       }
//       if (fa > fb) {
//         return 1;
//       }
//       return 0;
//     });

//     return res.status(200).send({ controller: rows });
//   }
// );

// router.post(
//   "/update",
//   body("userId").notEmpty().trim().escape(),
//   body("symbol").notEmpty().trim().escape(),
//   body("mode").notEmpty().trim().escape(),
//   async (req, res) => {
//     // RECEIVED
//     // 0 = BUY
//     // 1 = SELL

//     const result = validationResult(req);
//     if (!result.isEmpty()) {
//       return res.send({ errors: result.array() });
//     }

//     console.log(req.body);

//     const { userId, symbol, mode } = req.body;

//     let status;
//     if (mode == 1 || mode == "SELL" || mode == 0 || mode == "BUY") {
//       status = 1;
//     } else {
//       status = 0;
//     }

//     let update;
//     if (mode == "SELL") {
//       update = 1;
//     } else if (mode == "BUY") {
//       update = 0;
//     } else {
//       update = mode;
//     }

//     await Controller.update(
//       { status: status, mode: update },
//       {
//         where: {
//           symbol: symbol,
//           userId: userId,
//         },
//       }
//     ).catch((err) => {
//       res.status(400).send(err);
//     });

//     console.log("Record updated.");

//     return res.status(200).send({ msg: "Update Successful" });
//   }
// );

// router.post(
//   "/insert",
//   body("userId").notEmpty().trim().escape(),
//   body("status").notEmpty().trim().escape(),
//   body("symbol").notEmpty().trim().escape(),
//   async (req, res) => {
//     const result = validationResult(req);
//     if (!result.isEmpty()) {
//       return res.send({ errors: result.array() });
//     }

//     console.log(req.body);
//     const { userId, symbol, status } = req.body;

//     const tempController = await Controller.create(
//       {
//         userId: userId,
//         status: status,
//         symbol: symbol.slice(0, 6),
//       },
//       {
//         fields: ["userId", "status", "symbol"],
//       }
//     ).catch((err) => {
//       res.status(400).send(err);
//     });

//     await tempController.save();

//     console.log("Record inserted.");

//     return res.status(200).send({ msg: "Insert Successful" });
//   }
// );

// router.post(
//   "/generateKey",
//   body("userId").notEmpty().trim(),
//   body("name").notEmpty().trim(),
//   async (req, res) => {
//     let serialKey = random
//       .randomAlphanumeric(24, "uppercase")
//       .match(/.{1,6}/g)
//       .join("-");

//     const { userId, name } = req.body;

//     await Key.create(
//       {
//         userId: userId,
//         key: serialKey,
//         name: name,
//       },
//       {
//         fields: ["userId", "key", "name"],
//       }
//     ).catch((err) => {
//       res.status(400).send(err);
//     });
//     return res.status(200).send({ msg: serialKey });
//   }
// );

// router.post(
//   "/validate",
//   body("userId").notEmpty().trim(),
//   body("key").notEmpty().trim(),
//   body("name").notEmpty().trim(),
//   async (req, res) => {
//     const result = validationResult(req);
//     if (!result.isEmpty()) {
//       return res.send({ errors: result.array() });
//     }

//     const { userId, key, name } = req.body;

//     const { count, rows } = await Key.findAndCountAll({
//       where: {
//         userId: userId,
//         key: key,
//         name: name,
//       },
//     }).catch((err) => {
//       res.status(400).send(err);
//     });

//     if (!rows) {
//       return res.status(202).send({ errors: [{ msg: "Not Found" }] });
//     }
//     if (rows.length == 0) {
//       return res.status(202).send({ errors: [{ msg: "No Records Found" }] });
//     }

//     return res.status(200).send({ msg: true });
//   }
// );

router.listen(process.env.PORT || 3000, async () => {
  const port = process.env.PORT != undefined ? process.env.PORT : 3000;
  console.log("\nListening on port: " + port);
});
