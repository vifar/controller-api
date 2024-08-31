import { Request, Response } from "express";
import { validationResult } from "express-validator";
import { userLogin } from "../service/userService";
import { getErrorMessage } from "../utils/error";

export const login = async (req: Request, res: Response) => {
  const result = validationResult(req);
  if (!result.isEmpty()) {
    return res.send({ errors: result.array() });
  }

  const { userId, password } = req.body;

  try {
    const jwtToken = await userLogin(userId, password);
    res.status(200).send({ msg: "Login Successful", token: jwtToken });
  } catch (error) {
    return res.status(500).send(getErrorMessage(error));
  }
};
