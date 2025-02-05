import { db, eq, Users, Sessions } from "astro:db";
import type { User, Session } from "db/config";
import {
  encodeBase32LowerCaseNoPadding,
  encodeHexLowerCase,
} from "@oslojs/encoding";
import { sha256 } from "@oslojs/crypto/sha2";

export function generateSessionToken(): string {
  const bytes = new Uint8Array(20);
  crypto.getRandomValues(bytes);
  const token = encodeBase32LowerCaseNoPadding(bytes);

  return token;
}

export async function createSession(
  token: string,
  userId: number,
): Promise<Session> {
  const sessionId = encodeHexLowerCase(sha256(new TextEncoder().encode(token)));
  const session: Session = {
    id: sessionId,
    userId,
    expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30),
  };
  await db.insert(Sessions).values(session);
  return session;
}

export async function validateSessionToken(
  token: string,
): Promise<SessionValidationResult> {
  const sessionId = encodeHexLowerCase(sha256(new TextEncoder().encode(token)));
  const result = await db
    .select({ user: Users, session: Sessions })
    .from(Sessions)
    .innerJoin(Users, eq(Sessions.userId, Users.id))
    .where(eq(Sessions.id, sessionId));

  // Check if there is a result
  if (result.length < 1) {
    return { session: null, user: null };
  }

  const { session, user } = result[0];

  // Check if the session has expired
  if (Date.now() >= session.expiresAt.getTime()) {
    await db.delete(Sessions).where(eq(Sessions.id, sessionId));
    return { session: null, user: null };
  }

  // Check if we're within 15 days of the session's expiration date
  if (Date.now() >= session.expiresAt.getTime() - 1000 * 60 * 60 * 24 * 15) {
    session.expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 30);
    await db
      .update(Sessions)
      .set({ expiresAt: session.expiresAt })
      .where(eq(Sessions.id, sessionId));
  }

  return { session, user };
}

export async function invalidateSession(sessionId: string): Promise<void> {
  await db.delete(Sessions).where(eq(Sessions.id, sessionId));
}

export type SessionValidationResult =
  | { session: Session; user: User }
  | { session: null; user: null };
