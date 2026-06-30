export const InviteError = {
  Expired: "expired",
  Revoked: "revoked",
  Used: "used",
} as const;
export type InviteError = (typeof InviteError)[keyof typeof InviteError];

export const InviteMode = {
  GroupUse: "group-use",
  SingleUse: "single-use",
} as const;
export type InviteMode = (typeof InviteMode)[keyof typeof InviteMode];

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
