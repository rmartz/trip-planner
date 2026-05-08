"use client";

import { useState } from "react";
import { TripRole } from "@/lib/types/trip";
import type { TripMember } from "@/lib/types/trip";
import type { NonAccountMember } from "@/lib/types/non-account-member";
import { MEMBERS_PAGE_COPY } from "./MembersPageView.copy";

interface AccountMemberRowProps {
  member: TripMember;
  currentUserRole: TripRole;
  onPromote: (uid: string) => void;
  onRemove: (uid: string) => void;
}

function AccountMemberRow({
  member,
  currentUserRole,
  onPromote,
  onRemove,
}: AccountMemberRowProps) {
  const roleLabel =
    member.role === TripRole.Planner
      ? MEMBERS_PAGE_COPY.rolePlanner
      : MEMBERS_PAGE_COPY.roleGuest;

  return (
    <div className="flex items-center justify-between rounded-lg border border-zinc-200 p-3 dark:border-zinc-800">
      <div className="flex items-center gap-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-zinc-200 text-sm font-medium dark:bg-zinc-700">
          {member.uid.charAt(0).toUpperCase()}
        </div>
        <div>
          <span className="text-sm font-medium">{member.uid}</span>
          <span className="ml-2 text-xs text-zinc-500">{roleLabel}</span>
        </div>
      </div>
      {currentUserRole === TripRole.Planner &&
        member.role === TripRole.Guest && (
          <div className="flex gap-2">
            <button
              className="text-xs text-zinc-600 underline hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
              onClick={() => {
                onPromote(member.uid);
              }}
            >
              {MEMBERS_PAGE_COPY.promoteTo}
            </button>
            <button
              className="text-xs text-red-600 underline hover:text-red-800 dark:text-red-400 dark:hover:text-red-200"
              onClick={() => {
                onRemove(member.uid);
              }}
            >
              {MEMBERS_PAGE_COPY.removeGuest}
            </button>
          </div>
        )}
    </div>
  );
}

interface NonAccountMemberRowProps {
  member: NonAccountMember;
  currentUserRole: TripRole;
}

function NonAccountMemberRow({
  member,
  currentUserRole,
}: NonAccountMemberRowProps) {
  const claimUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/m/${member.claimToken}`
      : `/m/${member.claimToken}`;

  return (
    <div className="flex items-center justify-between rounded-lg border border-dashed border-zinc-300 p-3 dark:border-zinc-700">
      <div className="flex items-center gap-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-full border border-dashed border-zinc-400 text-sm text-zinc-400">
          ?
        </div>
        <div>
          <span className="text-sm font-medium">{member.name}</span>
          <span className="ml-1 text-xs text-zinc-500">
            ({MEMBERS_PAGE_COPY.proxiedBySuffix} {member.proxiedBy})
          </span>
          <p className="text-xs text-zinc-400">
            {member.claimedBy
              ? `${MEMBERS_PAGE_COPY.linkedLabel} → ${member.claimedBy}`
              : MEMBERS_PAGE_COPY.claimPending}
          </p>
        </div>
      </div>
      {currentUserRole === TripRole.Planner && (
        <button
          className="text-xs text-zinc-600 underline hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
          onClick={() => {
            void navigator.clipboard.writeText(claimUrl);
          }}
        >
          {MEMBERS_PAGE_COPY.claimLinkLabel}
        </button>
      )}
    </div>
  );
}

interface AddNonAccountMemberFormProps {
  onSubmit: (name: string) => void;
}

function AddNonAccountMemberForm({ onSubmit }: AddNonAccountMemberFormProps) {
  const [name, setName] = useState("");

  return (
    <div className="flex gap-2">
      <input
        className="flex-1 rounded-md border border-zinc-300 px-3 py-1.5 text-sm dark:border-zinc-700 dark:bg-zinc-900"
        placeholder={MEMBERS_PAGE_COPY.addMemberPlaceholder}
        value={name}
        onChange={(e) => {
          setName(e.target.value);
        }}
      />
      <button
        className="rounded-md bg-zinc-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
        onClick={() => {
          if (name.trim()) {
            onSubmit(name.trim());
            setName("");
          }
        }}
      >
        {MEMBERS_PAGE_COPY.addMemberSubmit}
      </button>
    </div>
  );
}

export interface MembersPageViewProps {
  currentUserRole: TripRole;
  accountMembers: TripMember[];
  nonAccountMembers: NonAccountMember[];
  isLoading: boolean;
  isError: boolean;
  onPromote: (uid: string) => void;
  onRemove: (uid: string) => void;
  onAddNonAccountMember: (name: string) => void;
}

export function MembersPageView({
  currentUserRole,
  accountMembers,
  nonAccountMembers,
  isLoading,
  isError,
  onPromote,
  onRemove,
  onAddNonAccountMember,
}: MembersPageViewProps) {
  if (isLoading) {
    return (
      <p className="text-zinc-500 dark:text-zinc-400">
        {MEMBERS_PAGE_COPY.loadingText}
      </p>
    );
  }

  if (isError) {
    return (
      <p className="text-red-500 dark:text-red-400">
        {MEMBERS_PAGE_COPY.errorText}
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <section className="flex flex-col gap-3">
        <h2 className="text-sm font-semibold text-zinc-600 dark:text-zinc-400">
          {MEMBERS_PAGE_COPY.accountMembersHeading} · {accountMembers.length}
        </h2>
        {accountMembers.length === 0 ? (
          <p className="text-sm text-zinc-400">
            {MEMBERS_PAGE_COPY.emptyAccountMembers}
          </p>
        ) : (
          <div className="flex flex-col gap-2">
            {accountMembers.map((member) => (
              <AccountMemberRow
                key={member.uid}
                member={member}
                currentUserRole={currentUserRole}
                onPromote={onPromote}
                onRemove={onRemove}
              />
            ))}
          </div>
        )}
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-sm font-semibold text-zinc-600 dark:text-zinc-400">
          {MEMBERS_PAGE_COPY.nonAccountMembersHeading} ·{" "}
          {nonAccountMembers.length}
        </h2>
        {nonAccountMembers.length === 0 ? (
          <p className="text-sm text-zinc-400">
            {MEMBERS_PAGE_COPY.emptyNonAccountMembers}
          </p>
        ) : (
          <div className="flex flex-col gap-2">
            {nonAccountMembers.map((member) => (
              <NonAccountMemberRow
                key={member.nonAccountMemberId}
                member={member}
                currentUserRole={currentUserRole}
              />
            ))}
          </div>
        )}
        {currentUserRole === TripRole.Planner && (
          <div className="mt-2 flex flex-col gap-2">
            <button className="self-start text-sm font-medium text-zinc-700 dark:text-zinc-300">
              {MEMBERS_PAGE_COPY.addMemberButton}
            </button>
            <AddNonAccountMemberForm onSubmit={onAddNonAccountMember} />
          </div>
        )}
      </section>
    </div>
  );
}
