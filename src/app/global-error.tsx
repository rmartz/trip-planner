"use client";

import * as Sentry from "@sentry/nextjs";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { GLOBAL_ERROR_COPY } from "./global-error.copy";

interface GlobalErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function GlobalError({ error, reset }: GlobalErrorProps) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <html lang="en">
      <body>
        <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-8 text-center">
          <h1 className="text-2xl font-semibold">
            {GLOBAL_ERROR_COPY.heading}
          </h1>
          <p className="text-muted-foreground">{GLOBAL_ERROR_COPY.message}</p>
          <Button onClick={reset}>{GLOBAL_ERROR_COPY.resetButton}</Button>
        </div>
      </body>
    </html>
  );
}
