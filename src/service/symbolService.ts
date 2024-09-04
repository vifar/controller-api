import { SYMBOLS } from "../enum/symbols";

export async function getListFromEnum(): Promise<string[]> {
  const symbolArr: string[] = Object.values(SYMBOLS)
    .filter((value) => typeof value === "string")
    .map((value) => value);

  return symbolArr;
}
