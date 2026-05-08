import { getNonAccountMemberByToken } from "@/services/members";
import { getAdminFirestore } from "@/lib/firebase/admin";
import { firebaseToTrip } from "@/lib/firebase/schema/trip";
import { ClaimActions } from "./ClaimActions";

interface PageProps {
  params: Promise<{ token: string }>;
}

export default async function ClaimPage({ params }: PageProps) {
  const { token } = await params;

  const nonAccountMember = await getNonAccountMemberByToken(token);

  if (!nonAccountMember) {
    return <ClaimActions claimContext={undefined} claimToken={undefined} />;
  }

  const db = getAdminFirestore();
  const tripDoc = await db
    .collection("trips")
    .doc(nonAccountMember.tripId)
    .get();
  const trip = tripDoc.exists
    ? firebaseToTrip(tripDoc.id, tripDoc.data() ?? {})
    : undefined;

  const claimContext = trip
    ? {
        memberName: nonAccountMember.name,
        tripName: trip.name,
        plannerName: nonAccountMember.proxiedBy,
        dateRange: `${trip.startDate.toLocaleDateString()} – ${trip.endDate.toLocaleDateString()}`,
      }
    : undefined;

  return <ClaimActions claimContext={claimContext} claimToken={token} />;
}
