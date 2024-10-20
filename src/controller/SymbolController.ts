import { Request, Response } from "express";
import { validationResult } from "express-validator";
import { prisma } from "..";
import { getListFromEnum } from "../service/symbolService";
import { getErrorMessage } from "../utils/error";

export const getList = async (req: Request, res: Response) => {
  try {
    console.log("Getting list of symbols from enum...");
    const foundUser = await getListFromEnum();
    console.log("List of symbols:", foundUser);
    res.status(200).send(foundUser);
  } catch (error) {
    console.error("Error getting list of symbols:", error);
    res.status(500).send(getErrorMessage(error));
  }
};

export const getByUserId = async (req: Request, res: Response) => {
  const result = validationResult(req);
  if (!result.isEmpty()) {
    console.log("Validation errors:", result.array());
    res.send({ errors: result.array() });
  }

  const { userId, type } = req.query;
  console.log("User ID:", userId, "Type:", type);

  try {
    console.log("Getting symbol status by user ID and type...");
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
      .catch((err) => {
        console.error("Error getting symbol status:", err);
        res.status(400).send(err);
      });

    console.log("Symbol status:", statuses);
    if (!statuses) {
      console.log("Symbol status not found");
      res.status(202).send({ errors: [{ msg: "Not Found" }] });
    } else if (statuses.length == 0) {
      console.log("No records found");
      res.status(202).send({ errors: [{ msg: "No Records Found" }] });
    } else {
      console.log("Sorting symbol status by symbol...");
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

      console.log("Sorted symbol status:", statuses);
      res.status(200).send({ controller: statuses });
    }
  } catch (error) {
    console.error("Error getting symbol status:", error);
    res.status(500).send(getErrorMessage(error));
  }
};

export const getByUserIdAndSymbol = async (req: Request, res: Response) => {
  const result = validationResult(req);
  if (!result.isEmpty()) {
    console.log("Validation errors:", result.array());
    res.send({ errors: result.array() });
  }

  const { userId, symbol, key } = req.query;
  console.log("User ID:", userId, "Symbol:", symbol, "Key:", key);

  try {
    console.log("Getting user by user ID and key...");
    const validUser = await prisma.user.findFirst({
      where: { userId: userId as string, key: key as string },
    });

    if (!validUser) {
      console.log("Invalid user");
      res.status(202).send({ errors: [{ msg: "Invalid User" }] });
    } else {
      console.log("Getting symbol status by user ID and symbol...");
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
        .catch((err) => {
          console.error("Error getting symbol status:", err);
          res.status(400).send(err);
        });

      console.log("Symbol status:", symbolStatus);
      if (!symbolStatus) {
        console.log("Symbol status not found");
        res.status(202).send({ errors: [{ msg: "Not Found" }] });
      } else {
        console.log("Symbol status found");
        res.status(200).send({ controller: symbolStatus });
      }
    }
  } catch (error) {
    console.error("Error getting symbol status:", error);
    res.status(500).send(getErrorMessage(error));
  }
};
