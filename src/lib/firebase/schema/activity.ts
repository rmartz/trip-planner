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

function toPinnedSlot(value: unknown): TimeOfDaySlot | undefined {
  if (typeof value !== "string") {
    return undefined;
  }
  return Object.values(TimeOfDaySlot).includes(value as TimeOfDaySlot)
    ? (value as TimeOfDaySlot)
    : undefined;
}

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
  const timeOfDaySlot = toTimeOfDaySlot(data["timeOfDaySlot"]);
  const groupSize = toGroupSize(data["groupSize"]);
  const pinnedSlot =
    data["pinned"] === true && data["pinnedSlot"] !== undefined
      ? toPinnedSlot(data["pinnedSlot"])
      : undefined;
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
    ...(timeOfDaySlot !== undefined ? { timeOfDaySlot } : {}),
    ...(groupSize !== undefined ? { groupSize } : {}),
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
    ...(data["pinned"] === true ? { pinned: true as const } : {}),
    ...(pinnedSlot !== undefined ? { pinnedSlot } : {}),
  };
}

export function activityToFirebase(
  activity: Omit<Activity, "activityId" | "stopId" | "tripId">,
  tripId: string,
): {
  tripId: string;
  name: string;
  estimatedDurationMinutes: number;
  description?: string;
  timeOfDaySlot?: ActivityTimeOfDaySlot;
  groupSize?: ActivityGroupSize;
  costPerPerson?: number;
  transportationRequired?: TransportationMode;
  pinned?: true;
  pinnedSlot?: TimeOfDaySlot;
} {
  return {
    tripId,
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
    ...(activity.pinned === true ? { pinned: true as const } : {}),
    ...(activity.pinned === true && activity.pinnedSlot !== undefined
      ? { pinnedSlot: activity.pinnedSlot }
      : {}),
  };
}
