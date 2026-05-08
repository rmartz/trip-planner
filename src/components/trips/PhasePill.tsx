import { cn } from "@/lib/utils";
import { TripPhase } from "@/lib/types/trip";
import { PHASE_PILL_COPY } from "./PhasePill.copy";

export interface PhasePillProps {
  phase: TripPhase;
}

export function PhasePill({ phase }: PhasePillProps) {
  return (
    <span
      className={cn(
        "font-mono text-xs tracking-wide",
        phase === TripPhase.Settled
          ? "text-zinc-400 dark:text-zinc-600"
          : "text-zinc-500 dark:text-zinc-400",
      )}
    >
      {PHASE_PILL_COPY[phase]}
    </span>
  );
}
