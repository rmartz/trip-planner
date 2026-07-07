import { z } from "zod";
import type { Timestamp } from "firebase-admin/firestore";
import { TimeOfDaySlot, TimeOfDaySlotType } from "@/lib/types/activity";
import type {
  ActivityGroupSize,
  ActivityTimeOfDaySlot,
} from "@/lib/types/activity";
import { ExpenseLinkedEntityType } from "@/lib/types/expense";
import type { ExpenseLinkedEntity } from "@/lib/types/expense";

// A native string enum object as produced by `enum Foo { ... }`.
type StringEnum = Record<string, string>;

/**
 * Emit a drift warning when Firestore data was present but did not match the
 * expected shape, so schema drift surfaces immediately in development. A simply
 * absent optional field is normal and is never warned about — callers must only
 * invoke this when a value was present-but-invalid.
 */
function warnDrift(fieldName: string | undefined, reason: string): void {
  if (fieldName === undefined || process.env.NODE_ENV === "production") {
    return;
  }
  console.warn(`Firestore schema drift on "${fieldName}": ${reason}.`);
}

/**
 * Coerce an unknown Firestore value into a string array, dropping non-string
 * members. Returns `[]` when the value is absent; a present non-array value is
 * treated as drift.
 */
export function toStringArray(value: unknown, fieldName?: string): string[] {
  if (value === undefined || value === null) {
    return [];
  }
  if (!Array.isArray(value)) {
    warnDrift(fieldName, "expected an array");
    return [];
  }
  return value.filter((item): item is string => typeof item === "string");
}

/**
 * Resolve an unknown Firestore value to a member of `enumObject`, falling back
 * to `defaultValue`. An absent value falls back silently; a present-but-invalid
 * value is treated as drift.
 */
export function toEnumWithDefault<T extends StringEnum>(
  enumObject: T,
  value: unknown,
  defaultValue: T[keyof T],
  fieldName?: string,
): T[keyof T] {
  const result = z.enum(enumObject).safeParse(value);
  if (result.success) {
    return result.data;
  }
  if (value !== undefined && value !== null) {
    warnDrift(fieldName, "not a recognized enum value");
  }
  return defaultValue;
}

/**
 * Resolve an unknown Firestore value to a member of `enumObject`, or
 * `undefined`. An absent value returns `undefined` silently; a
 * present-but-invalid value is treated as drift.
 */
export function toEnumOrUndefined<T extends StringEnum>(
  enumObject: T,
  value: unknown,
  fieldName?: string,
): T[keyof T] | undefined {
  const result = z.enum(enumObject).safeParse(value);
  if (result.success) {
    return result.data;
  }
  if (value !== undefined && value !== null) {
    warnDrift(fieldName, "not a recognized enum value");
  }
  return undefined;
}

const timestampToDate = z
  .custom<Timestamp>(
    (value) =>
      typeof value === "object" &&
      value !== null &&
      typeof (value as Record<string, unknown>)["toDate"] === "function",
  )
  .transform((value) => value.toDate());

/**
 * Convert a Firestore `Timestamp` (or Timestamp-like value) to a JS `Date`,
 * falling back to the current time when absent or invalid. A present-but-invalid
 * value is treated as drift and triggers a dev warning.
 */
export function toDate(value: unknown, fieldName?: string): Date {
  const result = timestampToDate.safeParse(value);
  if (!result.success) {
    if (value !== undefined && value !== null) {
      warnDrift(fieldName, "expected a Firestore Timestamp");
    }
    return new Date();
  }
  return result.data;
}

const linkedEntitySchema = z.object({
  type: z.enum(ExpenseLinkedEntityType),
  entityId: z.string(),
  label: z.string(),
});

/**
 * Tolerantly parse an optional `ExpenseLinkedEntity` sub-object, returning
 * `undefined` on failure. Absent input is silent; present-but-invalid is drift.
 */
export function toLinkedEntity(
  value: unknown,
): ExpenseLinkedEntity | undefined {
  if (value === undefined || value === null) {
    return undefined;
  }
  const result = linkedEntitySchema.safeParse(value);
  if (!result.success) {
    warnDrift("linkedEntity", "failed schema validation");
    return undefined;
  }
  return result.data;
}

const timeOfDaySlotSchema = z.object({
  type: z.enum(TimeOfDaySlotType),
  slots: z.array(z.enum(TimeOfDaySlot)),
});

/**
 * Tolerantly parse an optional `ActivityTimeOfDaySlot` sub-object, returning
 * `undefined` on failure. Absent input is silent; present-but-invalid is drift.
 */
export function toTimeOfDaySlot(
  value: unknown,
): ActivityTimeOfDaySlot | undefined {
  if (value === undefined || value === null) {
    return undefined;
  }
  const result = timeOfDaySlotSchema.safeParse(value);
  if (!result.success) {
    warnDrift("timeOfDaySlot", "failed schema validation");
    return undefined;
  }
  return result.data;
}

const groupSizeSchema = z.object({
  min: z.number().optional(),
  max: z.number().optional(),
});

/**
 * Tolerantly parse an optional `ActivityGroupSize` sub-object, returning
 * `undefined` on failure. Absent input is silent; present-but-invalid is drift.
 */
export function toGroupSize(value: unknown): ActivityGroupSize | undefined {
  if (value === undefined || value === null) {
    return undefined;
  }
  const result = groupSizeSchema.safeParse(value);
  if (!result.success) {
    warnDrift("groupSize", "failed schema validation");
    return undefined;
  }
  return result.data;
}
