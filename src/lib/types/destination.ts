export interface Destination {
  destinationId: string;
  uid: string;
  name: string;
  seasonality?: string;
  tripIds: string[];
}

export interface TripDestination {
  destinationId: string;
  catalogUid: string;
  name: string;
  stopId: string;
  stopName: string;
  tripId: string;
}
