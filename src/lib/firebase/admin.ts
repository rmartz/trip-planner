import { type App, cert, getApps, initializeApp } from "firebase-admin/app";
import { type Auth, getAuth } from "firebase-admin/auth";
import { type Database, getDatabase } from "firebase-admin/database";
import { type Firestore, getFirestore } from "firebase-admin/firestore";

export function getAdminApp(): App {
  const existing = getApps().find((a) => a.name === "[DEFAULT]");
  if (existing) return existing;

  return initializeApp({
    credential: cert({
      projectId: process.env["FIREBASE_PROJECT_ID"],
      clientEmail: process.env["FIREBASE_CLIENT_EMAIL"],
      privateKey: process.env["FIREBASE_PRIVATE_KEY"]?.replace(/\\n/g, "\n"),
    }),
    // Only needed for Realtime Database — remove if using Firestore only
    databaseURL: process.env["FIREBASE_DATABASE_URL"],
  });
}

export function getAdminAuth(): Auth {
  return getAuth(getAdminApp());
}

export function getAdminFirestore(): Firestore {
  return getFirestore(getAdminApp());
}

export function getAdminDatabase(): Database {
  return getDatabase(getAdminApp());
}
