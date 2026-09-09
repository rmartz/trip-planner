"use client";

import { Button } from "@/components/ui/button";
import { LODGING_HOST_GUEST_PICKER_COPY } from "./LodgingHostGuestPickerView.copy";

const COPY = LODGING_HOST_GUEST_PICKER_COPY;

export interface LodgingGuestCandidate {
  displayName: string;
  uid: string;
}

export interface LodgingHostGuestPickerViewProps {
  guests: LodgingGuestCandidate[];
  isSubmitting: boolean;
  onSave: () => void;
  onToggleGuest: (uid: string) => void;
  selectedUids: ReadonlySet<string>;
}

export function LodgingHostGuestPickerView({
  guests,
  isSubmitting,
  onSave,
  onToggleGuest,
  selectedUids,
}: LodgingHostGuestPickerViewProps) {
  return (
    <div className="flex flex-col gap-4 p-4">
      <header className="flex flex-col gap-0.5">
        <h2 className="text-lg font-semibold">{COPY.heading}</h2>
        <p className="text-xs text-muted-foreground">{COPY.headingSubtext}</p>
      </header>

      {guests.length === 0 ? (
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          {COPY.noGuestsText}
        </p>
      ) : (
        <ul className="flex flex-col gap-2">
          {guests.map((guest) => (
            <li key={guest.uid}>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={selectedUids.has(guest.uid)}
                  onChange={() => {
                    onToggleGuest(guest.uid);
                  }}
                />
                {guest.displayName}
              </label>
            </li>
          ))}
        </ul>
      )}

      <Button type="button" disabled={isSubmitting} onClick={onSave}>
        {COPY.saveButton}
      </Button>
    </div>
  );
}
