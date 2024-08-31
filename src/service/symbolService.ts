import { Symbols } from "../data/symbols";

export async function getListFromEnum(): Promise<string[]> {
  const symbolArr: string[] = Object.values(Symbols)
    .filter((value) => typeof value === "string")
    .map((value) => value);

  return symbolArr;
}
