import { Request, Response } from "express";
import { getListFromEnum } from "../service/symbolService";
import { getErrorMessage } from "../utils/error";

export const getSymbolList = async (req: Request, res: Response) => {
  try {
    const foundUser = await getListFromEnum();
    res.status(200).send(foundUser);
  } catch (error) {
    return res.status(500).send(getErrorMessage(error));
  }
};
