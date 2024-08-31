import jwt from "jsonwebtoken";
import { User } from "../db/entity/User";

export async function userLogin(
  userId: string,
  password: string
): Promise<string> {
  const validUser = await User.findOne({
    where: { userId: userId, password: password },
  });

  if (validUser == null) {
    throw new Error("Invalid, please try again.");
  }

  console.log("Found User: ", validUser?.userId);

  const jwtToken = jwt.sign(
    { id: validUser?.id, email: validUser?.email },
    `${process.env.JWT_TOKEN}`,
    { expiresIn: "4h" }
  );

  return jwtToken;
}
