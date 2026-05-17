import { getAdminFirestore } from "@/lib/firebase/admin";
import { firebaseToTransportationEntry } from "@/lib/firebase/schema/transportation";
import {
  type TransportationEntry,
  TransportationStatus,
  type TransportCarOffer,
  type TransportLegDemand,
  TransportOfferVisibility,
} from "@/lib/types/transportation";

export async function getTransportationEntriesForTrip(
  tripId: string,
): Promise<TransportationEntry[]> {
  const db = getAdminFirestore();
  const snapshot = await db
    .collection("trips")
    .doc(tripId)
    .collection("transportation")
    .get();
  return snapshot.docs.map((doc) => {
    const data = doc.data();
    return firebaseToTransportationEntry(
      doc.id,
      data["legId"] as string,
      data["uid"] as string,
      data,
    );
  });
}

export { resolveDisplayNames as resolveDriverDisplayNames } from "./members";

export function computeLegSummary(
  memberUids: string[],
  entries: TransportationEntry[],
  displayNameByUid: Record<string, string | undefined>,
): { demand: TransportLegDemand; supply: TransportCarOffer[] } {
  const memberUidSet = new Set(memberUids);
  const memberEntries = entries.filter((e) => memberUidSet.has(e.uid));
  const entryUids = new Set(memberEntries.map((e) => e.uid));

  const demand: TransportLegDemand = {
    driving: 0,
    needRide: 0,
    noReply: memberUids.filter((uid) => !entryUids.has(uid)).length,
    skipLeg: 0,
  };

  for (const entry of memberEntries) {
    if (
      entry.status === TransportationStatus.Driving ||
      entry.status === TransportationStatus.DrivingWithSeats
    ) {
      demand.driving++;
    } else if (entry.status === TransportationStatus.NeedTransportation) {
      demand.needRide++;
    } else if (entry.status === TransportationStatus.FlyingOrOther) {
      demand.skipLeg++;
    }
  }

  const supply: TransportCarOffer[] = memberEntries
    .filter((e) => e.status === TransportationStatus.DrivingWithSeats)
    .map((e) => {
      const inviteeCount = memberEntries.filter(
        (r) =>
          r.status === TransportationStatus.RidingWith &&
          r.ridingWithUid === e.uid,
      ).length;
      return {
        driverName: displayNameByUid[e.uid] ?? e.uid,
        ...(inviteeCount > 0 ? { inviteeCount } : {}),
        routeName: e.routeName,
        seatCount: Math.max((e.seatCount ?? 0) - inviteeCount, 0),
        visibility:
          inviteeCount > 0
            ? TransportOfferVisibility.InviteOnly
            : TransportOfferVisibility.Public,
      };
    });

  return { demand, supply };
}
