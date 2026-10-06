import { describe, expect, it } from "vitest";
import { createEnumGuard } from "./enum-guard";

enum Fruit {
  Apple = "apple",
  Banana = "banana",
}

const isFruit = createEnumGuard(Fruit);

describe("createEnumGuard", () => {
  it("accepts a string that is an enum value", () => {
    expect(isFruit("apple")).toBe(true);
  });

  it("rejects a string that is an enum key rather than a value", () => {
    expect(isFruit("Apple")).toBe(false);
  });

  it("rejects an unknown string", () => {
    expect(isFruit("cherry")).toBe(false);
  });

  it("rejects a non-string value", () => {
    expect(isFruit(42)).toBe(false);
  });
});
