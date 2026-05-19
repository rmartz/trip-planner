export enum InviteError {
  Expired = "expired",
  Revoked = "revoked",
  Used = "used",
}

export enum InviteMode {
  GroupUse = "group-use",
  SingleUse = "single-use",
}

export const SINGLE_USE_TTL_DAYS = 7;
export const GROUP_USE_TTL_DAYS = 30;

export interface InviteLink {
  token: string;
  tripId: string;
  mode: InviteMode;
  createdAt: Date;
  expiresAt: Date;
  revokedAt?: Date;
}
