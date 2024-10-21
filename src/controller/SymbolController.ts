import { Request, Response } from "express";
import { validationResult } from "express-validator";
import { prisma } from "..";
import { DAY_SYMBOLS, SWING_SYMBOLS } from "../enums/symbols";
import { getListFromEnum } from "../service/symbolService";
import { getErrorMessage } from "../utils/error";

export const getList = async (req: Request, res: Response) => {
  try {
    const foundUser = await getListFromEnum();
    res.status(200).send(foundUser);
  } catch (error) {
    return res.status(500).send(getErrorMessage(error));
  }
};

export const getByUserId = async (req: Request, res: Response) => {
  const result = validationResult(req);
  if (!result.isEmpty()) {
    return res.send({ errors: result.array() });
  }

  const { userId, type } = req.query;

  const statuses = await prisma.symbolStatus
    .findMany({
      where: {
        AND: [
          {
            userId: {
              equals: userId as string,
            },
            tradeType: {
              equals: type as string,
            },
          },
        ],
      },
    })
    .catch((err: Error) => {
      res.status(400).send(err);
    });

  if (!statuses) {
    return res.status(202).send({ errors: [{ msg: "Not Found" }] });
  }
  if (statuses.length == 0) {
    return res.status(202).send({ errors: [{ msg: "No Records Found" }] });
  }

  statuses.sort((a: { symbol: string; }, b: { symbol: string; }) => {
    let fa = a.symbol.toLowerCase(),
      fb = b.symbol.toLowerCase();

    if (fa < fb) {
      return -1;
    }
    if (fa > fb) {
      return 1;
    }
    return 0;
  });

  return res.status(200).send({ controller: statuses });
};

export const getByUserIdAndSymbol = async (req: Request, res: Response) => {
  const result = validationResult(req);
  if (!result.isEmpty()) {
    return res.send({ errors: result.array() });
  }

  const { userId, symbol, key } = req.query;

  const validUser = await prisma.user.findFirst({
    where: { userId: userId as string, key: key as string },
  });

  if (!validUser) {
    return res.status(202).send({ errors: [{ msg: "Invalid User" }] });
  }

  const symbolStatus = await prisma.symbolStatus
    .findFirst({
      where: {
        userId: {
          equals: userId as string,
        },
        symbol: {
          equals: symbol as string,
        },
      },
    })
    .catch((err: Error) => {
      res.status(400).send(err);
    });

  if (!symbolStatus) {
    return res.status(202).send({ errors: [{ msg: "Not Found" }] });
  }

  delete (symbolStatus as any).status;

  return res.status(200).send({ controller: symbolStatus });
};

export const getByUserIdAndSymbolV2 = async (req: Request, res: Response) => {
  console.log("Body", req.body);

  const result = validationResult(req);
  console.log("Validation Result", result);
  if (!result.isEmpty()) {
    console.log("Validation failed, sending error response");
    return res.send({ errors: result.array() });
  }

  const { userId, symbol, key, type } = req.body;
  console.log(
    "Extracted params: userId =",
    userId,
    ", symbol =",
    symbol,
    ", key =",
    key,
    ", type =",
    type
  );

  const validUser = await prisma.user.findFirst({
    where: { userId: userId as string, key: key as string },
  });
  console.log("Valid user found");

  if (!validUser) {
    console.log("Invalid user, sending error response");
    return res.status(202).send({ errors: [{ msg: "Invalid User" }] });
  }

  try {
    const symbolStatus = await prisma.symbolStatus.findFirst({
      where: {
        userId: {
          equals: userId as string,
        },
        symbol: {
          equals: symbol as string,
        },
        tradeType: {
          equals: type as string,
        },
      },
    });
    console.log("Symbol status found:", symbolStatus);

    if (!symbolStatus) {
      console.log("Symbol status not found, sending error response");
      return res.status(202).send({ errors: [{ msg: "Not Found" }] });
    }

    return res.status(200).send({ controller: symbolStatus });
  } catch (err) {
    console.error("Error fetching symbol status:", err);
    return res.status(400).send(err);
  }
};

export const update = async (req: Request, res: Response) => {
  const result = validationResult(req);
  if (!result.isEmpty()) {
    return res.send({ errors: result.array() });
  }

  const { id, type, mode } = req.body;

  let statusUpdate, modeUpdate;

  if (type == "day") {
    const parsedSignal = parseSignal(mode);

    await prisma.symbolStatus
      .update({
        where: {
          id: id,
        },
        data: {
          status: parsedSignal.statusUpdate,
          mode: parsedSignal.modeUpdate,
          tradeType: type,
        },
      })
      .catch((err: Error) => {
        res.status(400).send(err);
      });
  }

  return res.status(200).send({ msg: "Update Successful" });
};

const parseSignal = (mode: string) => {
  let statusUpdate = "",
    modeUpdate = "";

  if (mode == "1" || mode == "SELL") {
    statusUpdate = "1"; // ON
    modeUpdate = "1"; // SELL
  } else if (mode == "0" || mode == "BUY") {
    statusUpdate = "1"; // ON
    modeUpdate = "0"; // BUY
  } else {
    statusUpdate = "0"; // OFF
    modeUpdate = "2"; // OFF
  }

  return { statusUpdate, modeUpdate };
};

export const insertSymbols = async (req: Request, res: Response) => {
  const result = validationResult(req);
  if (!result.isEmpty()) {
    return res.send({ errors: result.array() });
  }

  const { userId } = req.body;

  const daySymbols = Object.values(DAY_SYMBOLS)
    .filter((value) => typeof value === "string")
    .map((value) => value);

  const swingSymbols: string[] = Object.values(SWING_SYMBOLS)
    .filter((value) => typeof value === "string")
    .map((value) => value);

  for (let i = 0; i < daySymbols.length; i++) {
    await prisma.symbolStatus
      .create({
        data: {
          userId: userId,
          symbol: daySymbols[i],
          tradeType: "day",
          mode: "2",
          status: "0",
        },
      })
      .catch((err: Error) => {
        res.status(400).send(err);
      });
  }

  for (let i = 0; i < swingSymbols.length; i++) {
    await prisma.symbolStatus
      .create({
        data: {
          userId: userId,
          symbol: swingSymbols[i],
          tradeType: "swing",
          mode: "2",
          status: "0",
        },
      })
      .catch((err: Error) => {
        res.status(400).send(err);
      });
  }

  return res.status(200).send({ msg: "Insert Successful" });
};

export const resetSymbols = async () => {
  await prisma.symbolStatus
    .updateMany({
      where: {
        tradeType: "day",
      },
      data: {
        mode: "2",
      },
    })
    .catch((err: Error) => {
      throw new Error("Reset Day Symbols Error: " + err);
    });

  console.log("Day Symbols Reset Successful");
};

export const updateSignal = async (req: Request, res: Response) => {
  console.log('Received request to update signal');

  const result = validationResult(req);
  if (!result.isEmpty()) {
    console.log('Validation errors:', result.array());
    return res.send({ errors: result.array() });
  }

  const { userId, symbol, tradeType, signalOne, signalTwo } = req.body;
  console.log('Request body:', { userId, symbol, tradeType, signalOne, signalTwo });

  let parsedSignal: any = {};
  if (signalOne == "1" && signalTwo == "1") {
    parsedSignal = parseSignal("1");
  } else if (signalOne == "0" && signalTwo == "0") {
    parsedSignal = parseSignal("0");
  } else {
    parsedSignal = parseSignal("2");
  }
  console.log('Parsed signal:', parsedSignal);

  try {
    await prisma.symbolStatus
      .updateMany({
        where: {
          userId: userId,
          symbol: symbol,
          tradeType: tradeType,
        },
        data: {
          signalOne: signalOne,
          signalTwo: signalTwo,
          mode: parsedSignal.modeUpdate,
          status: parsedSignal.statusUpdate,
        },
      });
    console.log('Updated symbol status successfully');
  } catch (err) {
    console.error('Error updating symbol status:', err);
    return res.status(400).send(err);
  }

  console.log('Sending response...');
  return res.status(200).send({ msg: "Update Successful" });
};

