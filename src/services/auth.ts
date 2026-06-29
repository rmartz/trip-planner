import {
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  GoogleAuthProvider,
  OAuthProvider,
  sendPasswordResetEmail,
  signInWithCustomToken,
  signInWithEmailAndPassword,
  signInWithPopup,
} from "firebase/auth";
import { getClientAuth } from "@/lib/firebase/client";

export async function signIn(email: string, password: string) {
  return signInWithEmailAndPassword(getClientAuth(), email, password);
}

export async function signUp(email: string, password: string) {
  return createUserWithEmailAndPassword(getClientAuth(), email, password);
}

export async function sendPasswordReset(email: string) {
  return sendPasswordResetEmail(getClientAuth(), email);
}

export async function signInWithGoogle() {
  const credential = await signInWithPopup(
    getClientAuth(),
    new GoogleAuthProvider(),
  );
  try {
    await createSession(await credential.user.getIdToken());
  } catch (err) {
    await firebaseSignOut(getClientAuth());
    throw err;
  }
}

export async function signInWithApple() {
  const credential = await signInWithPopup(
    getClientAuth(),
    new OAuthProvider("apple.com"),
  );
  try {
    await createSession(await credential.user.getIdToken());
  } catch (err) {
    await firebaseSignOut(getClientAuth());
    throw err;
  }
}

/**
 * Staging/preview debug auth: mint a custom token for a synthetic test uid and
 * sign in with it. The endpoint is 404 in production, so this path is inert
 * there. Mirrors signInWithGoogle's session handshake so the synthetic session
 * authorizes exactly like a real one.
 */
export async function signInWithSyntheticProfile(uid: string) {
  const response = await fetch("/api/debug/impersonate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ uid }),
  });
  if (!response.ok) throw new Error("Failed to impersonate profile");
  const { customToken } = (await response.json()) as { customToken: string };
  const credential = await signInWithCustomToken(getClientAuth(), customToken);
  try {
    await createSession(await credential.user.getIdToken());
  } catch (err) {
    await firebaseSignOut(getClientAuth());
    throw err;
  }
}

export async function signOut() {
  return firebaseSignOut(getClientAuth());
}

export async function createSession(idToken: string) {
  const response = await fetch("/api/auth/session", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ idToken }),
  });
  if (!response.ok) throw new Error("Failed to create session");
}

export async function deleteSession() {
  const response = await fetch("/api/auth/session", { method: "DELETE" });
  if (!response.ok) throw new Error("Failed to delete session");
}
