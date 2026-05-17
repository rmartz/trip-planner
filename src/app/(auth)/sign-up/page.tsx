"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { FirebaseError } from "firebase/app";
import { createSession, signUp } from "@/services/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SIGN_UP_COPY } from "./copy";

export default function SignUpPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | undefined>();
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.SyntheticEvent) {
    e.preventDefault();
    setError(undefined);
    setLoading(true);
    try {
      const credential = await signUp(email, password);
      await createSession(await credential.user.getIdToken());
      router.push("/");
    } catch (err) {
      const code = (err as FirebaseError).code;
      const messages = SIGN_UP_COPY.errors;
      setError((messages as Record<string, string>)[code] ?? messages.default);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-full max-w-sm space-y-6">
      <h1 className="text-2xl font-semibold">{SIGN_UP_COPY.title}</h1>
      <form
        onSubmit={(e) => {
          void handleSubmit(e);
        }}
        className="space-y-4"
      >
        <div className="space-y-1">
          <Label htmlFor="email">{SIGN_UP_COPY.emailLabel}</Label>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
            }}
            placeholder={SIGN_UP_COPY.emailPlaceholder}
            className="w-full"
          />
        </div>
        <div className="space-y-1">
          <Label htmlFor="password">{SIGN_UP_COPY.passwordLabel}</Label>
          <Input
            id="password"
            type="password"
            autoComplete="new-password"
            required
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
            }}
            className="w-full"
          />
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <Button type="submit" disabled={loading} className="w-full">
          {SIGN_UP_COPY.submitButton}
        </Button>
      </form>
      <p className="text-sm">
        {SIGN_UP_COPY.signInPrompt}{" "}
        <Link href="/sign-in" className="underline">
          {SIGN_UP_COPY.signInLink}
        </Link>
      </p>
    </div>
  );
}
