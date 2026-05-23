interface LegGapInput {
  demand: { needRide: number };
  supply: { seatCount: number }[];
}

export function computeTransportGapCount(legs: LegGapInput[]): number {
  return legs.reduce((total, { demand, supply }) => {
    const seats = supply.reduce((acc, offer) => acc + offer.seatCount, 0);
    const legGap = demand.needRide - seats;
    return total + (legGap > 0 ? legGap : 0);
  }, 0);
}
