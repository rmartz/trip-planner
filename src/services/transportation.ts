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

export async function resolveDriverDisplayNames(
  uids: string[],
): Promise<Record<string, string | undefined>> {
  if (uids.length === 0) return {};
  const db = getAdminFirestore();
  const snapshots = await Promise.all(
    uids.map((uid) => db.collection("users").doc(uid).get()),
  );
  const result: Record<string, string | undefined> = {};
  for (const snap of snapshots) {
    result[snap.id] = snap.data()?.["displayName"] as string | undefined;
  }
  return result;
}

export function computeLegSummary(
  memberUids: string[],
  entries: TransportationEntry[],
  displayNameByUid: Record<string, string | undefined>,
): { demand: TransportLegDemand; supply: TransportCarOffer[] } {
  const entryUids = new Set(entries.map((e) => e.uid));

  const demand: TransportLegDemand = {
    driving: 0,
    haveOwn: 0,
    needRide: 0,
    noReply: memberUids.filter((uid) => !entryUids.has(uid)).length,
    skipLeg: 0,
  };

  for (const entry of entries) {
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

  const supply: TransportCarOffer[] = entries
    .filter((e) => e.status === TransportationStatus.DrivingWithSeats)
    .map((e) => {
      const inviteeCount = entries.filter(
        (r) =>
          r.status === TransportationStatus.RidingWith &&
          r.ridingWithUid === e.uid,
      ).length;
      return {
        driverName: displayNameByUid[e.uid] ?? e.uid,
        ...(inviteeCount > 0 ? { inviteeCount } : {}),
        routeName: e.routeName,
        seatCount: e.seatCount ?? 0,
        visibility:
          inviteeCount > 0
            ? TransportOfferVisibility.InviteOnly
            : TransportOfferVisibility.Public,
      };
    });

  return { demand, supply };
}
