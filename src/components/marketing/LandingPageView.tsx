"use client";

import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { LANDING_PAGE_COPY } from "./LandingPageView.copy";

export function LandingPageView() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-2xl flex-col justify-center gap-10 p-6">
      <header className="flex flex-col gap-4">
        <p className="text-sm font-semibold tracking-wide text-primary uppercase">
          {LANDING_PAGE_COPY.brand}
        </p>
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
          {LANDING_PAGE_COPY.headline}
        </h1>
        <p className="text-lg text-zinc-500 dark:text-zinc-400">
          {LANDING_PAGE_COPY.subhead}
        </p>
      </header>

      <section className="flex flex-col gap-4">
        <h2 className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
          {LANDING_PAGE_COPY.featuresHeading}
        </h2>
        <ul className="flex flex-col gap-4">
          {LANDING_PAGE_COPY.features.map((feature) => (
            <li key={feature.title} className="flex flex-col gap-1">
              <h3 className="font-medium">{feature.title}</h3>
              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                {feature.description}
              </p>
            </li>
          ))}
        </ul>
      </section>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <Link
          href="/sign-up"
          className={buttonVariants({ variant: "default", size: "lg" })}
        >
          {LANDING_PAGE_COPY.primaryCta}
        </Link>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          {LANDING_PAGE_COPY.signInPrompt}{" "}
          <Link
            href="/sign-in"
            className="font-medium text-primary underline-offset-4 hover:underline"
          >
            {LANDING_PAGE_COPY.signInCta}
          </Link>
        </p>
      </div>
    </main>
  );
}
