export interface Destination {
  destinationId: string;
  uid: string;
  name: string;
  seasonality?: string;
  tripIds: string[];
}
