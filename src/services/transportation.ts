import { FieldValue } from "firebase-admin/firestore";
import { getAdminFirestore } from "@/lib/firebase/admin";
import { firebaseToTransportationEntry } from "@/lib/firebase/schema/transportation";
import {
  type TransportationEntry,
  TransportationStatus,
  type TransportCarOffer,
  type TransportLegDemand,
  TransportOfferVisibility,
} from "@/lib/types/transportation";
import { NotFoundError } from "./errors";
import { getLegById } from "./legs";
import { writeNotificationsForTransportOffer } from "./notify-offer";

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

  const ridersPerDriverUid = new Map<string, number>();
  for (const entry of memberEntries) {
    if (
      entry.status === TransportationStatus.RidingWith &&
      entry.ridingWithUid !== undefined
    ) {
      ridersPerDriverUid.set(
        entry.ridingWithUid,
        (ridersPerDriverUid.get(entry.ridingWithUid) ?? 0) + 1,
      );
    }
  }

  const supply: TransportCarOffer[] = memberEntries
    .filter((e) => e.status === TransportationStatus.DrivingWithSeats)
    .map((e) => {
      const inviteeCount = ridersPerDriverUid.get(e.uid) ?? 0;
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

export interface SeatOfferCandidates {
  candidateUids: string[];
  offeredToUids: string[];
}

export async function getSeatOfferCandidates(
  driverUid: string,
  tripId: string,
  legId: string,
): Promise<SeatOfferCandidates> {
  const { data } = await getSeatOfferingEntry(driverUid, tripId, legId);
  const candidateUids = await getEligibleOffereeUids(driverUid, tripId, legId);

  return {
    candidateUids: Array.from(candidateUids),
    offeredToUids: getOfferedUidsFromEntry(data).filter((uid) =>
      candidateUids.has(uid),
    ),
  };
}

export async function setSeatOffer(
  driverUid: string,
  tripId: string,
  legId: string,
  offeredToUids: string[],
): Promise<void> {
  const { ref, data } = await getSeatOfferingEntry(driverUid, tripId, legId);
  const previousOfferedUids = new Set(getOfferedUidsFromEntry(data));

  const uniqueOfferedUids = Array.from(new Set(offeredToUids));
  const eligibleOffereeUids = await getEligibleOffereeUids(
    driverUid,
    tripId,
    legId,
  );

  if (!uniqueOfferedUids.every((uid) => eligibleOffereeUids.has(uid))) {
    throw new Error(
      "All offered guests must be trip members who need transportation for this leg.",
    );
  }

  await ref.update({
    offeredToUids: uniqueOfferedUids,
    updatedAt: FieldValue.serverTimestamp(),
  });

  const newlyOfferedUids = uniqueOfferedUids.filter(
    (uid) => !previousOfferedUids.has(uid),
  );
  if (newlyOfferedUids.length > 0) {
    try {
      const leg = await getLegById(tripId, legId);
      await writeNotificationsForTransportOffer(
        tripId,
        leg?.name ?? "",
        newlyOfferedUids,
      );
    } catch {
      // A notification failure must never break the seat-offer update itself.
    }
  }
}

async function getSeatOfferingEntry(
  driverUid: string,
  tripId: string,
  legId: string,
): Promise<{
  ref: FirebaseFirestore.DocumentReference;
  data: Record<string, unknown>;
}> {
  const db = getAdminFirestore();
  const snapshot = await db
    .collection("trips")
    .doc(tripId)
    .collection("transportation")
    .where("legId", "==", legId)
    .where("uid", "==", driverUid)
    .get();

  const doc = snapshot.docs[0];
  if (!doc) {
    throw new NotFoundError("Transportation entry not found for this driver.");
  }

  const data = doc.data();
  if (data["status"] !== TransportationStatus.DrivingWithSeats) {
    throw new Error(
      "Only drivers offering seats can surface availability to guests.",
    );
  }

  return { ref: doc.ref, data };
}

async function getEligibleOffereeUids(
  driverUid: string,
  tripId: string,
  legId: string,
): Promise<Set<string>> {
  const db = getAdminFirestore();
  const snapshot = await db
    .collection("trips")
    .doc(tripId)
    .collection("transportation")
    .where("legId", "==", legId)
    .get();

  return new Set(
    snapshot.docs
      .filter(
        (doc) =>
          doc.data()["status"] === TransportationStatus.NeedTransportation,
      )
      .map((doc) => doc.data()["uid"] as string)
      .filter((uid) => uid !== driverUid),
  );
}

function getOfferedUidsFromEntry(data: Record<string, unknown>): string[] {
  const offeredToUids = data["offeredToUids"];

  if (
    !Array.isArray(offeredToUids) ||
    !offeredToUids.every((uid): uid is string => typeof uid === "string")
  ) {
    return [];
  }

  return offeredToUids;
}
