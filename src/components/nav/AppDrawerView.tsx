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
  return (
    <nav className="flex h-full flex-col overflow-y-auto">
      <div className="border-b border-border p-4">
        <p className="text-sm font-semibold">{APP_DRAWER_COPY.appName}</p>
        <p className="mt-0.5 text-xs text-muted-foreground">
          {props.userEmail}
        </p>
      </div>

      {props.scope === "trip" && (
        <div className="border-b border-border px-3 py-3">
          <p className="text-sm font-semibold">{props.activeTrip.name}</p>
        </div>
      )}

      <div className="flex-1">
        {props.scope === "user" ? (
          <>
            <SectionHeading>
              {APP_DRAWER_COPY.userSectionHeading}
            </SectionHeading>
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

            {props.recentTrips.length > 0 && (
              <>
                <SectionHeading>
                  {APP_DRAWER_COPY.recentTripsSectionHeading}
                </SectionHeading>
                {props.recentTrips.map((trip) => (
                  <NavItem
                    key={trip.tripId}
                    label={trip.name}
                    href={`/trips/${trip.tripId}`}
                    route={`/trips/${trip.tripId}`}
                  />
                ))}
              </>
            )}
          </>
        ) : (
          <>
            <SectionHeading>
              {APP_DRAWER_COPY.tripSectionHeading}
            </SectionHeading>
            <NavItem
              label={APP_DRAWER_COPY.navTripOverview}
              href={`/trips/${props.activeTrip.tripId}`}
              route={`/trips/${props.activeTrip.tripId}`}
            />
            <NavItem
              label={APP_DRAWER_COPY.navMembers}
              href={`/trips/${props.activeTrip.tripId}/members`}
              route={`/trips/${props.activeTrip.tripId}/members`}
            />
            <NavItem
              label={APP_DRAWER_COPY.navPlanStructure}
              href={`/trips/${props.activeTrip.tripId}/structure`}
              route={`/trips/${props.activeTrip.tripId}/structure`}
            />
            <NavItem
              label={APP_DRAWER_COPY.navCandidatePlaces}
              href={`/trips/${props.activeTrip.tripId}/places`}
              route={`/trips/${props.activeTrip.tripId}/places`}
            />
            <NavItem
              label={APP_DRAWER_COPY.navAvailability}
              href={`/trips/${props.activeTrip.tripId}/availability`}
              route={`/trips/${props.activeTrip.tripId}/availability`}
            />
            <NavItem
              label={APP_DRAWER_COPY.navLodging}
              href={`/trips/${props.activeTrip.tripId}/lodging`}
              route={`/trips/${props.activeTrip.tripId}/lodging`}
            />
            <NavItem
              label={APP_DRAWER_COPY.navTransportation}
              href={`/trips/${props.activeTrip.tripId}/transportation`}
              route={`/trips/${props.activeTrip.tripId}/transportation`}
            />
            <NavItem
              label={APP_DRAWER_COPY.navActivities}
              href={`/trips/${props.activeTrip.tripId}/activities`}
              route={`/trips/${props.activeTrip.tripId}/activities`}
            />
            <NavItem
              label={APP_DRAWER_COPY.navExpenses}
              href={`/trips/${props.activeTrip.tripId}/expenses`}
              route={`/trips/${props.activeTrip.tripId}/expenses`}
            />
            <NavItem
              label={APP_DRAWER_COPY.navBalances}
              href={`/trips/${props.activeTrip.tripId}/balances`}
              route={`/trips/${props.activeTrip.tripId}/balances`}
            />
            <NavItem
              label={APP_DRAWER_COPY.navArchive}
              href={`/trips/${props.activeTrip.tripId}/archive`}
              route={`/trips/${props.activeTrip.tripId}/archive`}
            />

            <SectionHeading>
              {APP_DRAWER_COPY.switchSectionHeading}
            </SectionHeading>
            <NavItem
              label={APP_DRAWER_COPY.allTrips}
              href="/trips"
              route="/trips"
            />
            {props.otherTrips.map((trip) => (
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
          onClick={props.onSignOut}
          className="w-full rounded-md px-3 py-2 text-left text-sm hover:bg-muted"
        >
          {APP_DRAWER_COPY.signOut}
        </button>
      </div>
    </nav>
  );
}
