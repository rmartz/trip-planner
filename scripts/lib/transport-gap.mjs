// Pure, dependency-free reimplementation of the server-side transportGapCount
// computation, kept in plain ESM so the `.mjs` backfill script can import it.
//
// This MUST stay faithful to the TypeScript runtime logic in:
//   - src/services/transportation.ts  (computeLegSummary)
//   - src/lib/trips/transport.ts       (computeTransportGapCount)
// The TS modules remain authoritative for the running app; this file mirrors them
// for the one-off admin backfill, which cannot import the path-aliased,
// firebase-admin-coupled TS services. The shared spec
// (src/lib/trips/backfill-transport-gap.spec.ts) pins this mirror to the same
// expected outputs so the two cannot silently drift.

// Mirrors TransportationStatus in src/lib/types/transportation.ts.
export const TransportationStatus = {
  Driving: "driving",
  DrivingWithSeats: "driving-with-seats",
  FlyingOrOther: "flying-or-other",
  NeedTransportation: "need-transportation",
  RidingWith: "riding-with",
};

// Mirrors firebaseToTransportationEntry: an unrecognized status falls back to
// NeedTransportation, so an unknown value is treated as demand, not ignored.
function normalizeStatus(status) {
  return Object.values(TransportationStatus).includes(status)
    ? status
    : TransportationStatus.NeedTransportation;
}

// Mirrors computeLegSummary + computeTransportGapCount for a single leg.
// `entries` are the transportation entries for this leg; only entries whose uid
// is a trip member are counted.
function computeLegGap(memberUidSet, entries) {
  const memberEntries = entries.filter((entry) => memberUidSet.has(entry.uid));

  let needRide = 0;
  for (const entry of memberEntries) {
    if (
      normalizeStatus(entry.status) === TransportationStatus.NeedTransportation
    ) {
      needRide++;
    }
  }

  // Count riders assigned to each driver so their offered seats are reduced by
  // the passengers who already committed to riding with them.
  const ridersPerDriverUid = new Map();
  for (const entry of memberEntries) {
    if (
      normalizeStatus(entry.status) === TransportationStatus.RidingWith &&
      entry.ridingWithUid !== undefined
    ) {
      ridersPerDriverUid.set(
        entry.ridingWithUid,
        (ridersPerDriverUid.get(entry.ridingWithUid) ?? 0) + 1,
      );
    }
  }

  let seats = 0;
  for (const entry of memberEntries) {
    if (
      normalizeStatus(entry.status) === TransportationStatus.DrivingWithSeats
    ) {
      const inviteeCount = ridersPerDriverUid.get(entry.uid) ?? 0;
      seats += Math.max((entry.seatCount ?? 0) - inviteeCount, 0);
    }
  }

  const legGap = needRide - seats;
  return legGap > 0 ? legGap : 0;
}

// Computes the total transportGapCount for a trip from its active legs, all of
// its transportation entries, and the set of member uids. Surplus seats on one
// leg never offset a deficit on another — gaps are summed per leg.
export function computeTransportGapCountFromDocs(legs, entries, memberUids) {
  const memberUidSet = new Set(memberUids);

  const entriesByLegId = new Map();
  for (const entry of entries) {
    const bucket = entriesByLegId.get(entry.legId) ?? [];
    bucket.push(entry);
    entriesByLegId.set(entry.legId, bucket);
  }

  return legs.reduce((total, leg) => {
    const legEntries = entriesByLegId.get(leg.legId) ?? [];
    return total + computeLegGap(memberUidSet, legEntries);
  }, 0);
}
