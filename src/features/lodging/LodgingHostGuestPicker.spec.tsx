import { afterEach, describe, expect, it, vi } from "vitest";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { LodgingHostGuestPicker } from "./LodgingHostGuestPicker";
import { LODGING_HOST_GUEST_PICKER_COPY } from "./LodgingHostGuestPickerView.copy";

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

function renderWithQueryClient(ui: React.ReactElement) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });

  return render(
    <QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>,
  );
}

function getRequestUrl(input: RequestInfo | URL): string {
  if (typeof input === "string") {
    return input;
  }

  if (input instanceof URL) {
    return input.toString();
  }

  return input.url;
}

describe("LodgingHostGuestPicker", () => {
  it("renders eligible guests from the connected queries", async () => {
    vi.spyOn(global, "fetch").mockImplementation((input) => {
      const url = getRequestUrl(input);

      if (url.endsWith("/members")) {
        return Promise.resolve(
          new Response(
            JSON.stringify({
              accountMembers: [
                {
                  uid: "uid-guest",
                  tripId: "trip-1",
                  role: "guest",
                  joinedAt: "2025-06-01T00:00:00.000Z",
                  memberUids: ["uid-host", "uid-guest"],
                  displayName: "Alice",
                },
              ],
            }),
            { status: 200 },
          ),
        );
      }

      if (url.endsWith("/lodging/invitees")) {
        return Promise.resolve(
          new Response(
            JSON.stringify({
              candidateUids: ["uid-guest"],
              invitedUids: ["uid-guest"],
            }),
            { status: 200 },
          ),
        );
      }

      return Promise.reject(new Error(`Unexpected fetch: ${url}`));
    });

    renderWithQueryClient(
      <LodgingHostGuestPicker stopId="stop-1" tripId="trip-1" />,
    );

    await waitFor(() => {
      const checkbox = screen.getByLabelText("Alice");
      if (!(checkbox instanceof HTMLInputElement)) {
        throw new Error("Expected Alice checkbox to be an input.");
      }
      expect(checkbox.checked).toBe(true);
    });
  });

  it("saves the selected invitees through the PUT endpoint", async () => {
    const fetchSpy = vi
      .spyOn(global, "fetch")
      .mockImplementation((input, init) => {
        const url = getRequestUrl(input);

        if (url.endsWith("/members")) {
          return Promise.resolve(
            new Response(
              JSON.stringify({
                accountMembers: [
                  {
                    uid: "uid-guest",
                    tripId: "trip-1",
                    role: "guest",
                    joinedAt: "2025-06-01T00:00:00.000Z",
                    memberUids: ["uid-host", "uid-guest"],
                    displayName: "Alice",
                  },
                ],
              }),
              { status: 200 },
            ),
          );
        }

        if (url.endsWith("/lodging/invitees") && init?.method === undefined) {
          return Promise.resolve(
            new Response(
              JSON.stringify({
                candidateUids: ["uid-guest"],
                invitedUids: [],
              }),
              { status: 200 },
            ),
          );
        }

        if (url.endsWith("/lodging/invitees") && init?.method === "PUT") {
          return Promise.resolve(
            new Response(JSON.stringify({ ok: true }), { status: 200 }),
          );
        }

        return Promise.reject(new Error(`Unexpected fetch: ${url}`));
      });

    renderWithQueryClient(
      <LodgingHostGuestPicker stopId="stop-1" tripId="trip-1" />,
    );

    await waitFor(() => {
      expect(
        screen.getByRole("button", {
          name: LODGING_HOST_GUEST_PICKER_COPY.saveButton,
        }),
      ).toBeDefined();
    });

    fireEvent.click(screen.getByLabelText("Alice"));
    fireEvent.click(
      screen.getByRole("button", {
        name: LODGING_HOST_GUEST_PICKER_COPY.saveButton,
      }),
    );

    await waitFor(() => {
      expect(fetchSpy).toHaveBeenCalledWith(
        "/api/trips/trip-1/stops/stop-1/lodging/invitees",
        expect.objectContaining({
          body: JSON.stringify({ invitedUids: ["uid-guest"] }),
          method: "PUT",
        }),
      );
    });
  });
});
