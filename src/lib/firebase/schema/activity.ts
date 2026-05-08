import type { DocumentData } from "firebase/firestore";
import {
  TimeOfDaySlot,
  TimeOfDaySlotType,
  TransportationMode,
} from "@/lib/types/activity";
import type {
  Activity,
  ActivityGroupSize,
  ActivityTimeOfDaySlot,
} from "@/lib/types/activity";

function toTimeOfDaySlot(value: unknown): ActivityTimeOfDaySlot | undefined {
  if (
    typeof value !== "object" ||
    value === null ||
    !("type" in value) ||
    !("slots" in value)
  ) {
    return undefined;
  }

  const { type, slots } = value as {
    type: TimeOfDaySlotType;
    slots: unknown;
  };
  const resolvedSlots = Array.isArray(slots) ? (slots as TimeOfDaySlot[]) : [];

  return { type, slots: resolvedSlots };
}

function toGroupSize(value: unknown): ActivityGroupSize | undefined {
  if (typeof value !== "object" || value === null) {
    return undefined;
  }

  const raw = value as { min?: unknown; max?: unknown };
  const min = typeof raw.min === "number" ? raw.min : undefined;
  const max = typeof raw.max === "number" ? raw.max : undefined;

  return { min, max };
}

export function firebaseToActivity(
  activityId: string,
  stopId: string,
  tripId: string,
  data: DocumentData,
): Activity {
  return {
    activityId,
    stopId,
    tripId,
    name: (data["name"] as string | undefined) ?? "",
    ...(data["description"] !== undefined
      ? { description: data["description"] as string }
      : {}),
    estimatedDurationMinutes:
      (data["estimatedDurationMinutes"] as number | undefined) ?? 0,
    ...(toTimeOfDaySlot(data["timeOfDaySlot"]) !== undefined
      ? { timeOfDaySlot: toTimeOfDaySlot(data["timeOfDaySlot"]) }
      : {}),
    ...(toGroupSize(data["groupSize"]) !== undefined
      ? { groupSize: toGroupSize(data["groupSize"]) }
      : {}),
    ...(data["costPerPerson"] !== undefined
      ? { costPerPerson: data["costPerPerson"] as number }
      : {}),
    ...(data["transportationRequired"] !== undefined
      ? {
          transportationRequired: data[
            "transportationRequired"
          ] as TransportationMode,
        }
      : {}),
  };
}

export function activityToFirebase(
  activity: Omit<Activity, "activityId" | "stopId" | "tripId">,
): {
  name: string;
  estimatedDurationMinutes: number;
  description?: string;
  timeOfDaySlot?: ActivityTimeOfDaySlot;
  groupSize?: ActivityGroupSize;
  costPerPerson?: number;
  transportationRequired?: TransportationMode;
} {
  return {
    name: activity.name,
    estimatedDurationMinutes: activity.estimatedDurationMinutes,
    ...(activity.description !== undefined
      ? { description: activity.description }
      : {}),
    ...(activity.timeOfDaySlot !== undefined
      ? { timeOfDaySlot: activity.timeOfDaySlot }
      : {}),
    ...(activity.groupSize !== undefined
      ? { groupSize: activity.groupSize }
      : {}),
    ...(activity.costPerPerson !== undefined
      ? { costPerPerson: activity.costPerPerson }
      : {}),
    ...(activity.transportationRequired !== undefined
      ? { transportationRequired: activity.transportationRequired }
      : {}),
  };
}
