import { Request, Response } from "express";
import { validationResult } from "express-validator";
import { prisma } from "..";
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

  const { userId } = req.query;

  const statuses = await prisma.symbolStatus
    .findMany({
      where: {
        userId: {
          equals: userId as string,
        },
      },
    })
    .catch((err) => {
      res.status(400).send(err);
    });

  if (!statuses) {
    return res.status(202).send({ errors: [{ msg: "Not Found" }] });
  }
  if (statuses.length == 0) {
    return res.status(202).send({ errors: [{ msg: "No Records Found" }] });
  }

  statuses.sort((a, b) => {
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

  const { userId, symbol } = req.query;

  const statuses = await prisma.symbolStatus
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
    .catch((err) => {
      res.status(400).send(err);
    });

  if (!statuses) {
    return res.status(202).send({ errors: [{ msg: "Not Found" }] });
  }

  return res.status(200).send({ controller: statuses });
};

export const update = async (req: Request, res: Response) => {
  const result = validationResult(req);
  if (!result.isEmpty()) {
    return res.send({ errors: result.array() });
  }

  const { id, strategy, mode } = req.body;

  let swingStatus, dayStatus, swingUpdate, dayUpdate;

  if (strategy == "day") {
    if (mode == "1" || mode == "SELL" || mode == "0" || mode == "BUY") {
      dayStatus = "1"; // ON
    } else {
      dayStatus = "0"; // OFF
    }

    if (mode == "1" || mode == "SELL") {
      dayUpdate = "1"; // SELL
    } else if (mode == "0" || mode == "BUY") {
      dayUpdate = "0"; // BUY
    } else {
      dayUpdate = "2"; // CANCEL
    }

    await prisma.symbolStatus
      .update({
        where: {
          id: id,
        },
        data: {
          dayStatus: dayStatus,
          dayMode: dayUpdate,
        },
      })
      .catch((err) => {
        res.status(400).send(err);
      });
  } else if (strategy == "swing") {
    if (mode == "1" || mode == "SELL" || mode == "0" || mode == "BUY") {
      swingStatus = "1";
    } else {
      swingStatus = "0";
    }

    if (mode == "1" || mode == "SELL") {
      swingUpdate = "1";
    } else if (mode == "0" || mode == "BUY") {
      swingUpdate = "0"; // BUY
    } else {
      swingUpdate = "2"; // CANCEL
    }

    await prisma.symbolStatus
      .update({
        where: {
          id: id,
        },
        data: {
          swingStatus: swingStatus,
          swingMode: swingUpdate,
        },
      })
      .catch((err) => {
        res.status(400).send(err);
      });
  }

  console.log("Record updated.");

  return res.status(200).send({ msg: "Update Successful" });
};

export const insertSymbols = async (req: Request, res: Response) => {
  const result = validationResult(req);
  if (!result.isEmpty()) {
    return res.send({ errors: result.array() });
  }

  const { userId } = req.body;

  const symbolList = await getListFromEnum();

  for (let i = 0; i < symbolList.length; i++) {
    await prisma.symbolStatus
      .create({
        data: {
          userId: userId,
          symbol: symbolList[i],
          swingStatus: "0",
          swingMode: "0",
          dayMode: "0",
          dayStatus: "0",
        },
      })
      .catch((err) => {
        res.status(400).send(err);
      });
  }

  return res.status(200).send({ msg: "Insert Successful" });
};
