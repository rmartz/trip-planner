import type { TransportLegSummary } from "@/components/transport/TransportPlannerOverviewView";

export function computeTransportGapCount(legs: TransportLegSummary[]): number {
  return legs.reduce((total, { demand, supply }) => {
    const seats = supply.reduce((acc, offer) => acc + offer.seatCount, 0);
    const legGap = demand.needRide - seats;
    return total + (legGap > 0 ? legGap : 0);
  }, 0);
}
