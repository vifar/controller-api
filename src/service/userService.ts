import jwt from "jsonwebtoken";
import { prisma } from "..";

export async function userLogin(
  userId: string,
  password: string
): Promise<string> {
  const validUser = await prisma.user.findFirst({
    where: { userId: userId, password: password },
  });

  if (validUser == null) {
    throw new Error("Invalid, please try again.");
  }

  const jwtToken = jwt.sign(
    { id: validUser?.id, email: validUser?.email },
    `${process.env.JWT_TOKEN}`,
    { expiresIn: "4h" }
  );

  return jwtToken;
}
