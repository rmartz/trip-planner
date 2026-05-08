import { TransportationStatus } from "@/lib/types/transportation";

export const TRANSPORTATION_STATUS_PICKER_COPY = {
  legSubheading: "your status per leg",
  statusLabels: {
    [TransportationStatus.Driving]: "Driving",
    [TransportationStatus.DrivingWithSeats]: "Have own car",
    [TransportationStatus.FlyingOrOther]: "Skipping this leg",
    [TransportationStatus.NeedTransportation]: "Need a ride",
    [TransportationStatus.RidingWith]: "No reply",
  } satisfies Record<TransportationStatus, string>,
} as const;
