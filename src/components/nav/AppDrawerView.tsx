"use client";

import Link from "next/link";
import type { Trip } from "@/lib/types/trip";
import { APP_DRAWER_COPY } from "./AppDrawer.copy";

interface NavItemProps {
  label: string;
  href: string;
  route: string;
}

function NavItem({ label, href, route }: NavItemProps) {
  return (
    <Link
      href={href}
      className="flex items-center justify-between rounded-md px-3 py-2 text-sm hover:bg-muted"
    >
      <span>{label}</span>
      <span className="font-mono text-xs text-muted-foreground">{route}</span>
    </Link>
  );
}

interface SectionHeadingProps {
  children: React.ReactNode;
}

function SectionHeading({ children }: SectionHeadingProps) {
  return (
    <p className="px-3 pt-4 pb-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
      {children}
    </p>
  );
}

interface AppDrawerUserScopeProps {
  userEmail: string;
  recentTrips: Trip[];
  onSignOut: () => void;
}

interface AppDrawerTripScopeProps {
  userEmail: string;
  activeTrip: Trip;
  otherTrips: Trip[];
  onSignOut: () => void;
}

export type AppDrawerViewProps =
  | ({ scope: "user" } & AppDrawerUserScopeProps)
  | ({ scope: "trip" } & AppDrawerTripScopeProps);

export function AppDrawerView(props: AppDrawerViewProps) {
  if (props.scope === "user") {
    const { userEmail, recentTrips, onSignOut } = props;
    return (
      <nav className="flex h-full flex-col overflow-y-auto">
        <div className="border-b border-border p-4">
          <p className="text-sm font-semibold">Trip Planner</p>
          <p className="mt-0.5 text-xs text-muted-foreground">{userEmail}</p>
        </div>

        <div className="flex-1">
          <SectionHeading>{APP_DRAWER_COPY.userSectionHeading}</SectionHeading>
          <NavItem
            label={APP_DRAWER_COPY.navTrips}
            href="/trips"
            route="/trips"
          />
          <NavItem
            label={APP_DRAWER_COPY.navDestinations}
            href="/destinations"
            route="/destinations"
          />
          <NavItem
            label={APP_DRAWER_COPY.navCalendar}
            href="/calendar"
            route="/calendar"
          />
          <NavItem
            label={APP_DRAWER_COPY.navNotifications}
            href="/notifications"
            route="/notifications"
          />
          <NavItem
            label={APP_DRAWER_COPY.navSettings}
            href="/settings"
            route="/settings"
          />

          {recentTrips.length > 0 && (
            <>
              <SectionHeading>
                {APP_DRAWER_COPY.recentTripsSectionHeading}
              </SectionHeading>
              {recentTrips.map((trip) => (
                <NavItem
                  key={trip.tripId}
                  label={trip.name}
                  href={`/trips/${trip.tripId}`}
                  route={`/trips/${trip.tripId}`}
                />
              ))}
            </>
          )}
        </div>

        <div className="border-t border-border p-4">
          <button
            onClick={onSignOut}
            className="w-full rounded-md px-3 py-2 text-left text-sm hover:bg-muted"
          >
            {APP_DRAWER_COPY.signOut}
          </button>
        </div>
      </nav>
    );
  }

  const { userEmail, activeTrip, otherTrips, onSignOut } = props;
  return (
    <nav className="flex h-full flex-col overflow-y-auto">
      <div className="border-b border-border p-4">
        <p className="text-sm font-semibold">Trip Planner</p>
        <p className="mt-0.5 text-xs text-muted-foreground">{userEmail}</p>
      </div>

      <div className="border-b border-border px-3 py-3">
        <p className="text-sm font-semibold">{activeTrip.name}</p>
      </div>

      <div className="flex-1">
        <SectionHeading>{APP_DRAWER_COPY.tripSectionHeading}</SectionHeading>
        <NavItem
          label="Trip overview"
          href={`/trips/${activeTrip.tripId}`}
          route={`/trips/${activeTrip.tripId}`}
        />
        <NavItem
          label="Members"
          href={`/trips/${activeTrip.tripId}/members`}
          route={`/trips/${activeTrip.tripId}/members`}
        />
        <NavItem
          label="Plan structure"
          href={`/trips/${activeTrip.tripId}/structure`}
          route={`/trips/${activeTrip.tripId}/structure`}
        />
        <NavItem
          label="Candidate places"
          href={`/trips/${activeTrip.tripId}/places`}
          route={`/trips/${activeTrip.tripId}/places`}
        />
        <NavItem
          label="Availability"
          href={`/trips/${activeTrip.tripId}/availability`}
          route={`/trips/${activeTrip.tripId}/availability`}
        />
        <NavItem
          label="Lodging"
          href={`/trips/${activeTrip.tripId}/lodging`}
          route={`/trips/${activeTrip.tripId}/lodging`}
        />
        <NavItem
          label="Transportation"
          href={`/trips/${activeTrip.tripId}/transportation`}
          route={`/trips/${activeTrip.tripId}/transportation`}
        />
        <NavItem
          label="Activities"
          href={`/trips/${activeTrip.tripId}/activities`}
          route={`/trips/${activeTrip.tripId}/activities`}
        />
        <NavItem
          label="Expenses"
          href={`/trips/${activeTrip.tripId}/expenses`}
          route={`/trips/${activeTrip.tripId}/expenses`}
        />
        <NavItem
          label="Balances"
          href={`/trips/${activeTrip.tripId}/balances`}
          route={`/trips/${activeTrip.tripId}/balances`}
        />
        <NavItem
          label="Archive"
          href={`/trips/${activeTrip.tripId}/archive`}
          route={`/trips/${activeTrip.tripId}/archive`}
        />

        <SectionHeading>Switch</SectionHeading>
        <NavItem
          label={APP_DRAWER_COPY.allTrips}
          href="/trips"
          route="/trips"
        />
        {otherTrips.map((trip) => (
          <NavItem
            key={trip.tripId}
            label={trip.name}
            href={`/trips/${trip.tripId}`}
            route={`/trips/${trip.tripId}`}
          />
        ))}
      </div>

      <div className="border-t border-border p-4">
        <button
          onClick={onSignOut}
          className="w-full rounded-md px-3 py-2 text-left text-sm hover:bg-muted"
        >
          {APP_DRAWER_COPY.signOut}
        </button>
      </div>
    </nav>
  );
}
