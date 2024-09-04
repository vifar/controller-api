import { Request, Response } from "express";
import { validationResult } from "express-validator";
import { v4 } from "uuid";
import { prisma } from "..";
import { userLogin } from "../service/userService";
import { getErrorMessage } from "../utils/error";

export const login = async (req: Request, res: Response) => {
  const result = validationResult(req);
  if (!result.isEmpty()) {
    return res.send({ errors: result.array() });
  }

  const { userId, password } = req.body;
  console.log(userId, password);
  try {
    const jwtToken = await userLogin(userId, password);
    res.status(200).send({ msg: "Login Successful", token: jwtToken });
  } catch (error) {
    return res.status(500).send(getErrorMessage(error));
  }
};

export const generateKey = async (req: Request, res: Response) => {
  const { userId } = req.body;

  const serialKey = v4();
  await prisma.user
    .update({
      where: { userId: userId },
      data: {
        key: serialKey,
      },
    })
    .catch((err) => {
      res.status(400).send(err);
    });

  return res.status(200).send({ msg: serialKey });
};

export const validate = async (req: Request, res: Response) => {
  const result = validationResult(req);
  if (!result.isEmpty()) {
    return res.send({ errors: result.array() });
  }

  const { userId, key } = req.body;

  const user = await prisma.user
    .findUnique({
      where: {
        userId: userId,
        key: key,
      },
    })
    .catch((err) => {
      res.status(400).send(err);
    });

  if (!user) {
    return res.status(202).send({ errors: [{ msg: "Not Found" }] });
  }

  return res.status(200).send({ msg: true });
};
