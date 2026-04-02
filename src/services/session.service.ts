// src/services/session.service.ts
import { db } from '../db';
import { sessions } from '../db/schema/sessions';
import { eq, and, lt } from 'drizzle-orm';
import { randomBytes } from 'crypto';

export class SessionService {
  async createSession(userId: number, refreshToken: string, userAgent?: string, ipAddress?: string, expiresInDays = 7) {
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + expiresInDays);

    const [session] = await db.insert(sessions).values({
      userId,
      refreshToken,
      userAgent,
      ipAddress,
      expiresAt,
    }).returning();
    return session;
  }

  async getSessionByRefreshToken(refreshToken: string) {
    const [session] = await db.select().from(sessions).where(eq(sessions.refreshToken, refreshToken)).limit(1);
    return session;
  }

  async revokeSession(sessionId: number) {
    await db.update(sessions).set({ isRevoked: true, updatedAt: new Date() }).where(eq(sessions.id, sessionId));
  }

  async revokeAllUserSessions(userId: number, exceptSessionId?: number) {
    const condition = eq(sessions.userId, userId);
    if (exceptSessionId) {
      await db.update(sessions).set({ isRevoked: true }).where(and(condition, eq(sessions.id, exceptSessionId)));
    } else {
      await db.update(sessions).set({ isRevoked: true }).where(condition);
    }
  }

  async getUserSessions(userId: number) {
    return db.select().from(sessions).where(and(eq(sessions.userId, userId), eq(sessions.isRevoked, false)));
  }

  async cleanupExpiredSessions() {
    await db.delete(sessions).where(lt(sessions.expiresAt, new Date()));
  }
}

export const sessionService = new SessionService();