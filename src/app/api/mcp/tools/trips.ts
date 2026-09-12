import { z } from "zod";
import { toDateKey } from "@/lib/dates";
import { defineTool } from "@/server/mcp";
import { createTripForUser, getTripsForUser } from "@/services/trips";

/**
 * MCP tools for the trips domain.
 *
 * Both wrap the same `@/services/trips` functions the HTTP routes call — the
 * MCP surface adds no business logic of its own, only argument parsing and
 * identity injection (see the epic, #517). Every action here is already
 * reachable in the UI.
 */

/** Local `YYYY-MM-DD` → local-midnight `Date`, mirroring the trips HTTP route's parsing. */
function parseLocalDate(value: string): Date {
  const [year, month, day] = value.split("-");
  return new Date(Number(year), Number(month) - 1, Number(day));
}

const isoDate = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Expected a YYYY-MM-DD date");

export const listTripsTool = defineTool({
  name: "list_trips",
  title: "List trips",
  description: "List the trips the signed-in user is a member of.",
  scopes: ["trips:read"],
  inputSchema: z.object({}),
  handler: async (_args, identity) => {
    const trips = await getTripsForUser(identity.uid);
    const summary = trips.map((trip) => ({
      tripId: trip.tripId,
      name: trip.name,
      startDate: toDateKey(trip.startDate),
      endDate: toDateKey(trip.endDate),
    }));
    return {
      content: [{ type: "text", text: JSON.stringify(summary, undefined, 2) }],
    };
  },
});

export const createTripTool = defineTool({
  name: "create_trip",
  title: "Create trip",
  description:
    "Create a new trip owned by the signed-in user. Dates are YYYY-MM-DD.",
  scopes: ["trips:write"],
  inputSchema: z.object({
    name: z.string().min(1),
    startDate: isoDate,
    endDate: isoDate,
  }),
  handler: async ({ name, startDate, endDate }, identity) => {
    const tripId = await createTripForUser(
      identity.uid,
      name.trim(),
      parseLocalDate(startDate),
      parseLocalDate(endDate),
    );
    return {
      content: [{ type: "text", text: JSON.stringify({ tripId }) }],
    };
  },
});
