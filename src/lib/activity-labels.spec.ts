import { afterEach, describe, expect, it } from "vitest";
import { cleanup } from "@testing-library/react";
import { TimeOfDaySlot } from "@/lib/types/activity";
import { slotLabel } from "./activity-labels";

afterEach(cleanup);

describe("slotLabel", () => {
  it("returns 'Afternoon' for Afternoon slot", () => {
    expect(slotLabel(TimeOfDaySlot.Afternoon)).toBe("Afternoon");
  });

  it("returns 'Early Morning' for EarlyMorning slot", () => {
    expect(slotLabel(TimeOfDaySlot.EarlyMorning)).toBe("Early Morning");
  });

  it("returns 'Evening' for Evening slot", () => {
    expect(slotLabel(TimeOfDaySlot.Evening)).toBe("Evening");
  });

  it("returns 'Late Evening' for LateEvening slot", () => {
    expect(slotLabel(TimeOfDaySlot.LateEvening)).toBe("Late Evening");
  });

  it("returns 'Morning' for Morning slot", () => {
    expect(slotLabel(TimeOfDaySlot.Morning)).toBe("Morning");
  });
});
