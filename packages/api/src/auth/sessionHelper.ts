import {
  encodeBase32LowerCaseNoPadding,
  encodeHexLowerCase,
} from "@oslojs/encoding";
import { sha256 } from "@oslojs/crypto/sha2";
import { sessions, users, type Db } from "db";
import { eq } from "drizzle-orm";
import type { Session, User } from "db";

export type SessionValidationResult =
  | { session: Session; user: User }
  | { session: null; user: null };

const THIRTY_DAYS = 1000 * 60 * 60 * 24 * 30;
const FIFTEEN_DAYS = 1000 * 60 * 60 * 24 * 15;

export type SessionHelper = ReturnType<typeof createSessionHelper>;

export const createSessionHelper = (db: Db) => {
  function generateSessionToken(): string {
    const bytes = new Uint8Array(20);
    crypto.getRandomValues(bytes);
    const token = encodeBase32LowerCaseNoPadding(bytes);
    return token;
  }

  async function createSession(
    token: string,
    userId: string
  ): Promise<Session> {
    const sessionId = encodeHexLowerCase(
      sha256(new TextEncoder().encode(token))
    );
    const session: Session = {
      id: sessionId,
      userId,
      expiresAt: new Date(Date.now() + THIRTY_DAYS),
    };
    await db.insert(sessions).values(session);
    return session;
  }

  async function validateSessionToken(
    token: string
  ): Promise<SessionValidationResult> {
    const sessionId = encodeHexLowerCase(
      sha256(new TextEncoder().encode(token))
    );
    const result = await db
      .select({ user: users, session: sessions })
      .from(sessions)
      .innerJoin(users, eq(sessions.userId, users.id))
      .where(eq(sessions.id, sessionId));
    if (!result?.length) {
      return { session: null, user: null };
    }
    const row = result[0];
    if (!row?.user || !row?.session) {
      return { session: null, user: null };
    }
    const { user, session } = row;
    if (Date.now() >= session.expiresAt.getTime()) {
      await db.delete(sessions).where(eq(sessions.id, session.id));
      return { session: null, user: null };
    }
    if (Date.now() >= session.expiresAt.getTime() - FIFTEEN_DAYS) {
      session.expiresAt = new Date(Date.now() + THIRTY_DAYS);
      await db
        .update(sessions)
        .set({
          expiresAt: session.expiresAt,
        })
        .where(eq(sessions.id, session.id));
    }
    return { session, user };
  }

  async function invalidateSession(sessionId: string): Promise<void> {
    await db.delete(sessions).where(eq(sessions.id, sessionId));
  }

  async function invalidateAllSessions(userId: string): Promise<void> {
    await db.delete(sessions).where(eq(sessions.userId, userId));
  }

  return {
    generateSessionToken,
    createSession,
    validateSessionToken,
    invalidateSession,
    invalidateAllSessions,
  };
};
