/**
 * Builds a type predicate that narrows an arbitrary value to a member of a
 * string enum. Use it instead of `value as SomeEnum` when a raw string (request
 * body, `<select>` value, JSON payload) must be treated as an enum member: the
 * membership check makes the narrowing sound rather than asserted.
 *
 * Only valid for string enums — numeric enums carry reverse-mapping keys in
 * `Object.values()`.
 */
export function createEnumGuard<T extends Record<string, string>>(
  enumObject: T,
) {
  const values: ReadonlySet<string> = new Set(Object.values(enumObject));
  return (value: unknown): value is T[keyof T] =>
    typeof value === "string" && values.has(value);
}
