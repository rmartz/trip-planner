"use client";

import { Button } from "@/components/ui/button";
import { INVITE_LINK_CARD_COPY } from "./InviteLinkCard.copy";

export interface InviteLinkCardProps {
  tripId: string;
  inviteToken: string;
  onRegen: () => void;
  isRegenerating: boolean;
}

export function InviteLinkCard({
  inviteToken,
  onRegen,
  isRegenerating,
}: InviteLinkCardProps) {
  const inviteUrl = `tripplnr.app/invite/${inviteToken}`;

  function handleCopy() {
    void navigator.clipboard.writeText(`https://${inviteUrl}`);
  }

  function handleShare() {
    if ("share" in navigator) {
      void navigator.share({ url: `https://${inviteUrl}` });
    } else {
      handleCopy();
    }
  }

  return (
    <div className="rounded-lg border border-dashed p-4 space-y-3">
      <p className="text-xs font-mono text-muted-foreground uppercase tracking-wide">
        {INVITE_LINK_CARD_COPY.label}
      </p>
      <code className="block rounded bg-muted px-3 py-2 text-sm break-all">
        {inviteUrl}
      </code>
      <div className="flex gap-2">
        <Button variant="ghost" size="sm" onClick={handleCopy}>
          {INVITE_LINK_CARD_COPY.copyButton}
        </Button>
        <Button variant="ghost" size="sm" onClick={handleShare}>
          {INVITE_LINK_CARD_COPY.shareButton}
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={onRegen}
          disabled={isRegenerating}
        >
          {INVITE_LINK_CARD_COPY.regenButton}
        </Button>
      </div>
    </div>
  );
}
