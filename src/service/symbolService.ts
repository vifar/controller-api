import { DAY_SYMBOLS } from "../enums/symbols";

export async function getListFromEnum(): Promise<string[]> {
  const symbolArr: string[] = Object.values(DAY_SYMBOLS)
    .filter((value) => typeof value === "string")
    .map((value) => value);

  return symbolArr;
}
