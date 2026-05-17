"use client";

import { useState } from "react";
import Link from "next/link";
import type { FirebaseError } from "firebase/app";
import { sendPasswordReset } from "@/services/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FORGOT_PASSWORD_COPY } from "./copy";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | undefined>();
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.SyntheticEvent) {
    e.preventDefault();
    setError(undefined);
    setLoading(true);
    try {
      await sendPasswordReset(email);
      setSubmitted(true);
    } catch (err) {
      const code = (err as FirebaseError).code;
      const messages = FORGOT_PASSWORD_COPY.errors;
      setError((messages as Record<string, string>)[code] ?? messages.default);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-full max-w-sm space-y-6">
      <h1 className="text-2xl font-semibold">{FORGOT_PASSWORD_COPY.title}</h1>
      {submitted ? (
        <p className="text-sm">{FORGOT_PASSWORD_COPY.successMessage}</p>
      ) : (
        <>
          <p className="text-sm text-gray-600">
            {FORGOT_PASSWORD_COPY.description}
          </p>
          <form
            onSubmit={(e) => {
              void handleSubmit(e);
            }}
            className="space-y-4"
          >
            <div className="space-y-1">
              <Label htmlFor="email">{FORGOT_PASSWORD_COPY.emailLabel}</Label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                }}
                placeholder={FORGOT_PASSWORD_COPY.emailPlaceholder}
                className="w-full"
              />
            </div>
            {error && <p className="text-sm text-red-600">{error}</p>}
            <Button type="submit" disabled={loading} className="w-full">
              {FORGOT_PASSWORD_COPY.submitButton}
            </Button>
          </form>
        </>
      )}
      <Link href="/sign-in" className="text-sm underline">
        {FORGOT_PASSWORD_COPY.signInLink}
      </Link>
    </div>
  );
}
