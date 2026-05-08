"use client";

import { Button } from "@/components/ui/button";
import { REMOVE_LEG_CONFIRM_MODAL_COPY } from "./RemoveLegConfirmModalView.copy";

export interface RemoveLegConfirmModalViewProps {
  legName: string;
  affectedGuestUids: string[];
  isRemoving: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function RemoveLegConfirmModalView({
  legName,
  affectedGuestUids,
  isRemoving,
  onConfirm,
  onCancel,
}: RemoveLegConfirmModalViewProps) {
  return (
    <div className="flex flex-col gap-4 rounded-lg border bg-background p-5 shadow-md">
      <h2 className="text-base font-semibold">
        {REMOVE_LEG_CONFIRM_MODAL_COPY.title}
      </h2>

      <p className="text-sm text-muted-foreground">
        {affectedGuestUids.length > 0
          ? REMOVE_LEG_CONFIRM_MODAL_COPY.bodyWithGuests(
              affectedGuestUids.length,
            )
          : REMOVE_LEG_CONFIRM_MODAL_COPY.bodyNoGuests}
      </p>

      {affectedGuestUids.length > 0 && (
        <div className="flex flex-col gap-1">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            {REMOVE_LEG_CONFIRM_MODAL_COPY.affectedGuestsLabel}
          </p>
          <ul className="flex flex-col gap-0.5">
            {affectedGuestUids.map((uid) => (
              <li key={uid} className="font-mono text-sm">
                {uid}
              </li>
            ))}
          </ul>
        </div>
      )}

      <p className="text-sm font-medium">{legName}</p>

      <div className="flex gap-2">
        <Button variant="destructive" disabled={isRemoving} onClick={onConfirm}>
          {REMOVE_LEG_CONFIRM_MODAL_COPY.confirmButton}
        </Button>
        <Button variant="outline" onClick={onCancel}>
          {REMOVE_LEG_CONFIRM_MODAL_COPY.cancelButton}
        </Button>
      </div>
    </div>
  );
}
