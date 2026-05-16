"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import type { FirebaseError } from "firebase/app";
import {
  createSession,
  signIn,
  signInWithApple,
  signInWithGoogle,
} from "@/services/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SIGN_IN_COPY } from "./copy";

export default function SignInForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | undefined>();
  const [loading, setLoading] = useState(false);

  function getRedirectPath() {
    const next = searchParams.get("next");
    return next?.startsWith("/") && !next.startsWith("//") ? next : "/";
  }

  function handleSignInError(err: unknown) {
    const code = (err as FirebaseError).code;
    const messages = SIGN_IN_COPY.errors;
    setError((messages as Record<string, string>)[code] ?? messages.default);
  }

  async function handleSubmit(e: React.SyntheticEvent) {
    e.preventDefault();
    setError(undefined);
    setLoading(true);
    try {
      const credential = await signIn(email, password);
      await createSession(await credential.user.getIdToken());
      router.push(getRedirectPath());
    } catch (err) {
      handleSignInError(err);
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogleSignIn() {
    setError(undefined);
    setLoading(true);
    try {
      await signInWithGoogle();
      router.push(getRedirectPath());
    } catch (err) {
      handleSignInError(err);
    } finally {
      setLoading(false);
    }
  }

  async function handleAppleSignIn() {
    setError(undefined);
    setLoading(true);
    try {
      await signInWithApple();
      router.push(getRedirectPath());
    } catch (err) {
      handleSignInError(err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-full max-w-sm space-y-6">
      <h1 className="text-2xl font-semibold">{SIGN_IN_COPY.title}</h1>
      <div className="space-y-3">
        <Button
          variant="outline"
          disabled={loading}
          onClick={() => void handleGoogleSignIn()}
          className="w-full"
        >
          {SIGN_IN_COPY.googleButton}
        </Button>
        <Button
          variant="outline"
          disabled={loading}
          onClick={() => void handleAppleSignIn()}
          className="w-full"
        >
          {SIGN_IN_COPY.appleButton}
        </Button>
      </div>
      <div className="flex items-center gap-3 text-sm text-gray-400">
        <hr className="flex-1" />
        <span>{SIGN_IN_COPY.orDivider}</span>
        <hr className="flex-1" />
      </div>
      <form
        onSubmit={(e) => {
          void handleSubmit(e);
        }}
        className="space-y-4"
      >
        <div className="space-y-1">
          <Label htmlFor="email">{SIGN_IN_COPY.emailLabel}</Label>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
            }}
            placeholder={SIGN_IN_COPY.emailPlaceholder}
            className="w-full"
          />
        </div>
        <div className="space-y-1">
          <Label htmlFor="password">{SIGN_IN_COPY.passwordLabel}</Label>
          <Input
            id="password"
            type="password"
            autoComplete="current-password"
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
          {SIGN_IN_COPY.submitButton}
        </Button>
      </form>
      <div className="flex items-center justify-between text-sm">
        <Link href="/forgot-password" className="underline">
          {SIGN_IN_COPY.forgotPasswordLink}
        </Link>
        <span>
          {SIGN_IN_COPY.signUpPrompt}{" "}
          <Link href="/sign-up" className="underline">
            {SIGN_IN_COPY.signUpLink}
          </Link>
        </span>
      </div>
    </div>
  );
}
