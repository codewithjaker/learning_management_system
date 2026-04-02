// import { db } from '../db';
// import { users } from '../db/schema/users';
// import { eq } from 'drizzle-orm';
// import { comparePassword, hashPassword } from '../utils/password';
// import { generateToken } from '../utils/jwt';
// import { BadRequestError, UnauthorizedError } from '../utils/errors';
// import type { RegisterInput, LoginInput } from '../validations/auth.validation';

// export class AuthService {
//   async register(data: RegisterInput) {
//     // Check if email exists using direct query
//     const existingUser = await db
//       .select()
//       .from(users)
//       .where(eq(users.email, data.email))
//       .limit(1);

//     if (existingUser.length > 0) {
//       throw new BadRequestError('Email already registered');
//     }

//     const hashedPassword = await hashPassword(data.password);
//     const [user] = await db
//       .insert(users)
//       .values({
//         ...data,
//         password: hashedPassword,
//       })
//       .returning();

//     const token = generateToken(user.id);
//     return { user, token };
//   }

//   async login(data: LoginInput) {
//     const [user] = await db
//       .select()
//       .from(users)
//       .where(eq(users.email, data.email))
//       .limit(1);

//     if (!user) {
//       throw new UnauthorizedError('Invalid email or password');
//     }

//     const isValid = await comparePassword(data.password, user.password);
//     if (!isValid) {
//       throw new UnauthorizedError('Invalid email or password');
//     }

//     const token = generateToken(user.id);
//     return { user, token };
//   }
// }

// export const authService = new AuthService();


// import { db } from '../db';
// import { users } from '../db/schema/users';
// import { verificationTokens } from '../db/schema/verificationTokens';
// import { eq } from 'drizzle-orm';
// import { hashPassword, comparePassword } from '../utils/password';
// import { generateToken } from '../utils/jwt';
// import { randomBytes } from 'crypto';
// import { BadRequestError, UnauthorizedError } from '../utils/errors';
// import { sessionService } from './session.service';
// import type { RegisterInput, LoginInput } from '../validations/auth.validation';
// import e from 'express';

// // Helper to generate OTP (6-digit)
// const generateOtp = () => Math.floor(100000 + Math.random() * 900000).toString();

// // Mock email sending (replace with nodemailer)
// const sendEmail = async (to: string, subject: string, text: string) => {
//   console.log(`Sending email to ${to}: ${subject} - ${text}`);
//   // In production, use nodemailer or a service like SendGrid
// };

// export class AuthService {
//   async register(data: RegisterInput, userAgent?: string, ipAddress?: string) {
//     const existing = await db.select().from(users).where(eq(users.email, data.email)).limit(1);
//     if (existing.length) throw new BadRequestError('Email already registered');

//     const hashedPassword = await hashPassword(data.password);
//     const [user] = await db.insert(users).values({
//       ...data,
//       password: hashedPassword,
//       isActive: true, // but email not verified yet
//     }).returning();

//     // Generate email verification token
//     const token = randomBytes(32).toString('hex');
//     const expiresAt = new Date();
//     expiresAt.setHours(expiresAt.getHours() + 24);
//     await db.insert(verificationTokens).values({
//       userId: user.id,
//       token,
//       type: 'email_verification',
//       expiresAt,
//     });

//     // Send verification email
//     const verificationLink = `${process.env.APP_URL}/verify-email?token=${token}`;
//     await sendEmail(user.email, 'Verify your email', `Click here: ${verificationLink}`);

//     // Create session and generate tokens
//     const { accessToken, refreshToken } = await this.createSessionAndTokens(user.id, userAgent, ipAddress);

//     return { user: { id: user.id, email: user.email, fullName: user.fullName, role: user.role }, accessToken, refreshToken };
//   }

//   async login(data: LoginInput, userAgent?: string, ipAddress?: string) {
//     const [user] = await db.select().from(users).where(eq(users.email, data.email)).limit(1);
//     if (!user) throw new UnauthorizedError('Invalid email or password');
//     if (!user.isActive) throw new UnauthorizedError('Account is disabled');
//     if (!(await comparePassword(data.password, user.password))) throw new UnauthorizedError('Invalid email or password');

//     const { accessToken, refreshToken } = await this.createSessionAndTokens(user.id, userAgent, ipAddress);

//     return { user: { id: user.id, email: user.email, fullName: user.fullName, role: user.role }, accessToken, refreshToken };
//   }

//   private async createSessionAndTokens(userId: number, userAgent?: string, ipAddress?: string) {
//     const refreshToken = randomBytes(64).toString('hex');
//     await sessionService.createSession(userId, refreshToken, userAgent, ipAddress);
//     const accessToken = generateToken(userId);
//     return { accessToken, refreshToken };
//   }

//   async refreshToken(refreshToken: string) {
//     const session = await sessionService.getSessionByRefreshToken(refreshToken);
//     if (!session || session.isRevoked || session.expiresAt < new Date()) {
//       throw new UnauthorizedError('Invalid or expired refresh token');
//     }
//     const newAccessToken = generateToken(session.userId);
//     return { accessToken: newAccessToken };
//   }

//   async logout(refreshToken: string) {
//     const session = await sessionService.getSessionByRefreshToken(refreshToken);
//     if (session) await sessionService.revokeSession(session.id);
//   }

//   async logoutAll(userId: number, currentRefreshToken?: string) {
//     const currentSession = currentRefreshToken ? await sessionService.getSessionByRefreshToken(currentRefreshToken) : null;
//     await sessionService.revokeAllUserSessions(userId, currentSession?.id);
//   }

//   async forgotPassword(email: string) {
//     const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1);
//     if (!user) throw new BadRequestError('Email not found');

//     const otp = generateOtp();
//     const expiresAt = new Date();
//     expiresAt.setMinutes(expiresAt.getMinutes() + 15);
//     await db.insert(verificationTokens).values({
//       userId: user.id,
//       token: otp,
//       type: 'password_reset',
//       expiresAt,
//     });

//     await sendEmail(user.email, 'Password Reset OTP', `Your OTP is: ${otp}`);
//     return { message: 'OTP sent to email' };
//   }

//   async verifyOtp(email: string, otp: string) {
//     const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1);
//     if (!user) throw new BadRequestError('Email not found');

//     const [token] = await db.select().from(verificationTokens).where(eq(verificationTokens.token, otp)).limit(1);
//     if (!token || token.userId !== user.id || token.type !== 'password_reset' || token.isUsed || token.expiresAt < new Date()) {
//       throw new BadRequestError('Invalid or expired OTP');
//     }
//     // Mark as used (but we may still allow reset once)
//     await db.update(verificationTokens).set({ isUsed: true }).where(eq(verificationTokens.id, token.id));
//     return { valid: true };
//   }

//   async resendOtp(email: string) {
//     const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1);
//     if (!user) throw new BadRequestError('Email not found');

//     // Invalidate old OTPs for this user
//     await db.update(verificationTokens).set({ isUsed: true }).where(eq(verificationTokens.userId, user.id));

//     const otp = generateOtp();
//     const expiresAt = new Date();
//     expiresAt.setMinutes(expiresAt.getMinutes() + 15);
//     await db.insert(verificationTokens).values({
//       userId: user.id,
//       token: otp,
//       type: 'password_reset',
//       expiresAt,
//     });

//     await sendEmail(user.email, 'Password Reset OTP', `Your OTP is: ${otp}`);
//     return { message: 'OTP resent' };
//   }

//   async resetPassword(email: string, otp: string, newPassword: string) {
//     const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1);
//     if (!user) throw new BadRequestError('Email not found');

//     const [token] = await db.select().from(verificationTokens).where(eq(verificationTokens.token, otp)).limit(1);
//     if (!token || token.userId !== user.id || token.type !== 'password_reset' || token.isUsed || token.expiresAt < new Date()) {
//       throw new BadRequestError('Invalid or expired OTP');
//     }

//     const hashedPassword = await hashPassword(newPassword);
//     await db.update(users).set({ password: hashedPassword, updatedAt: new Date() }).where(eq(users.id, user.id));
//     await db.update(verificationTokens).set({ isUsed: true }).where(eq(verificationTokens.id, token.id));

//     // Revoke all sessions (logout all devices)
//     await sessionService.revokeAllUserSessions(user.id);

//     return { message: 'Password reset successful' };
//   }

//   async changePassword(userId: number, currentPassword: string, newPassword: string) {
//     const [user] = await db.select().from(users).where(eq(users.id, userId)).limit(1);
//     if (!user) throw new UnauthorizedError('User not found');
//     if (!(await comparePassword(currentPassword, user.password))) {
//       throw new BadRequestError('Current password is incorrect');
//     }
//     const hashedPassword = await hashPassword(newPassword);
//     await db.update(users).set({ password: hashedPassword, updatedAt: new Date() }).where(eq(users.id, userId));
//     return { message: 'Password changed' };
//   }

//   async verifyEmail(token: string) {
//     const [verification] = await db.select().from(verificationTokens).where(eq(verificationTokens.token, token)).limit(1);
//     if (!verification || verification.type !== 'email_verification' || verification.isUsed || verification.expiresAt < new Date()) {
//       throw new BadRequestError('Invalid or expired verification token');
//     }
//     await db.update(users).set({ isActive: true }).where(eq(users.id, verification.userId));
//     await db.update(verificationTokens).set({ isUsed: true }).where(eq(verificationTokens.id, verification.id));
//     return { message: 'Email verified' };
//   }

//   async resendVerification(email: string) {
//     const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1);
//     if (!user) throw new BadRequestError('Email not found');
//     if (user.isActive) throw new BadRequestError('Email already verified');

//     // Invalidate old tokens
//     await db.update(verificationTokens).set({ isUsed: true }).where(eq(verificationTokens.userId, user.id));

//     const token = randomBytes(32).toString('hex');
//     const expiresAt = new Date();
//     expiresAt.setHours(expiresAt.getHours() + 24);
//     await db.insert(verificationTokens).values({
//       userId: user.id,
//       token,
//       type: 'email_verification',
//       expiresAt,
//     });

//     const verificationLink = `${process.env.APP_URL}/verify-email?token=${token}`;
//     await sendEmail(user.email, 'Verify your email', `Click here: ${verificationLink}`);
//     return { message: 'Verification email resent' };
//   }

//   async getUserSessions(userId: number) {
//     return sessionService.getUserSessions(userId);
//   }

//   async revokeSession(userId: number, sessionId: number) {
//     const session = await db.select().from(sessions).where(eq(sessions.id, sessionId)).limit(1);
//     if (!session || session[0].userId !== userId) throw new BadRequestError('Session not found');
//     await sessionService.revokeSession(sessionId);
//   }
// }

// export const authService = new AuthService();


// src/services/auth.service.ts
import { db } from '../db';
import { users } from '../db/schema/users';
import { sessions } from '../db/schema/sessions';
import { verificationTokens } from '../db/schema/verificationTokens';
import { eq, and, lt } from 'drizzle-orm';
import { randomBytes } from 'crypto';
import { hashPassword, comparePassword } from '../utils/password';
import { generateToken } from '../utils/jwt';
import { sendEmail, emailTemplates } from '../utils/email';
import { BadRequestError, UnauthorizedError } from '../utils/errors';
import { sessionService } from './session.service';
import type { RegisterInput, LoginInput } from '../validations/auth.validation';

// Helper to generate 6-digit OTP
const generateOtp = () => Math.floor(100000 + Math.random() * 900000).toString();

export class AuthService {
  // ========== REGISTRATION & LOGIN ==========
  async register(data: RegisterInput, userAgent?: string, ipAddress?: string) {
    // Check existing user
    const existing = await db.select().from(users).where(eq(users.email, data.email)).limit(1);
    if (existing.length) throw new BadRequestError('Email already registered');

    const hashedPassword = await hashPassword(data.password);
    const [user] = await db
      .insert(users)
      .values({
        ...data,
        password: hashedPassword,
        isActive: false, // email not verified yet
      })
      .returning();

    // Create email verification token (valid 24h)
    const token = randomBytes(32).toString('hex');
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24);
    await db.insert(verificationTokens).values({
      userId: user.id,
      token,
      type: 'email_verification',
      expiresAt,
    });

    // Send verification email
    const verificationLink = `${process.env.APP_URL}/api/auth/verify-email?token=${token}`;
    const { subject, html, text } = emailTemplates.verification(user.fullName, verificationLink);
    await sendEmail(user.email, subject, html, text);

    // Create session and tokens
    const { accessToken, refreshToken } = await this.createSessionAndTokens(user.id, userAgent, ipAddress);

    return {
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
      },
      accessToken,
      refreshToken,
    };
  }

  async login(data: LoginInput, userAgent?: string, ipAddress?: string) {
    const [user] = await db.select().from(users).where(eq(users.email, data.email)).limit(1);
    if (!user) throw new UnauthorizedError('Invalid email or password');
    if (!user.isActive) throw new UnauthorizedError('Account is disabled. Please verify your email.');
    const isPasswordValid = await comparePassword(data.password, user.password);
    if (!isPasswordValid) throw new UnauthorizedError('Invalid email or password');

    const { accessToken, refreshToken } = await this.createSessionAndTokens(user.id, userAgent, ipAddress);

    return {
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
      },
      accessToken,
      refreshToken,
    };
  }

  private async createSessionAndTokens(userId: number, userAgent?: string, ipAddress?: string) {
    const refreshToken = randomBytes(64).toString('hex');
    await sessionService.createSession(userId, refreshToken, userAgent, ipAddress);
    const accessToken = generateToken(userId);
    return { accessToken, refreshToken };
  }

  // ========== TOKEN REFRESH & LOGOUT ==========
  async refreshToken(refreshToken: string) {
    const session = await sessionService.getSessionByRefreshToken(refreshToken);
    if (!session || session.isRevoked || session.expiresAt < new Date()) {
      throw new UnauthorizedError('Invalid or expired refresh token');
    }
    const newAccessToken = generateToken(session.userId);
    return { accessToken: newAccessToken };
  }

  async logout(refreshToken: string) {
    const session = await sessionService.getSessionByRefreshToken(refreshToken);
    if (session) await sessionService.revokeSession(session.id);
  }

  async logoutAll(userId: number, currentRefreshToken?: string) {
    let currentSessionId: number | undefined;
    if (currentRefreshToken) {
      const session = await sessionService.getSessionByRefreshToken(currentRefreshToken);
      currentSessionId = session?.id;
    }
    await sessionService.revokeAllUserSessions(userId, currentSessionId);
  }

  // ========== PASSWORD RESET (OTP) ==========
  async forgotPassword(email: string) {
    const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1);
    if (!user) throw new BadRequestError('Email not found');

    const otp = generateOtp();
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 15);
    await db.insert(verificationTokens).values({
      userId: user.id,
      token: otp,
      type: 'password_reset',
      expiresAt,
    });

    const { subject, html, text } = emailTemplates.passwordResetOtp(otp);
    await sendEmail(user.email, subject, html, text);
    return { message: 'OTP sent to email' };
  }

  async verifyOtp(email: string, otp: string) {
    const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1);
    if (!user) throw new BadRequestError('Email not found');

    const [token] = await db
      .select()
      .from(verificationTokens)
      .where(eq(verificationTokens.token, otp))
      .limit(1);
    if (!token || token.userId !== user.id || token.type !== 'password_reset' || token.isUsed || token.expiresAt < new Date()) {
      throw new BadRequestError('Invalid or expired OTP');
    }
    // Mark as used (allows only one reset per OTP)
    await db.update(verificationTokens).set({ isUsed: true }).where(eq(verificationTokens.id, token.id));
    return { valid: true };
  }

  async resendOtp(email: string) {
    const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1);
    if (!user) throw new BadRequestError('Email not found');

    // Invalidate previous OTPs
    await db.update(verificationTokens).set({ isUsed: true }).where(eq(verificationTokens.userId, user.id));

    const otp = generateOtp();
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 15);
    await db.insert(verificationTokens).values({
      userId: user.id,
      token: otp,
      type: 'password_reset',
      expiresAt,
    });

    const { subject, html, text } = emailTemplates.passwordResetOtp(otp);
    await sendEmail(user.email, subject, html, text);
    return { message: 'OTP resent' };
  }

  async resetPassword(email: string, otp: string, newPassword: string) {
    const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1);
    if (!user) throw new BadRequestError('Email not found');

    const [token] = await db
      .select()
      .from(verificationTokens)
      .where(eq(verificationTokens.token, otp))
      .limit(1);
    if (!token || token.userId !== user.id || token.type !== 'password_reset' || token.isUsed || token.expiresAt < new Date()) {
      throw new BadRequestError('Invalid or expired OTP');
    }

    const hashedPassword = await hashPassword(newPassword);
    await db.update(users).set({ password: hashedPassword, updatedAt: new Date() }).where(eq(users.id, user.id));
    await db.update(verificationTokens).set({ isUsed: true }).where(eq(verificationTokens.id, token.id));

    // Revoke all sessions after password change
    await sessionService.revokeAllUserSessions(user.id);
    return { message: 'Password reset successful' };
  }

  // ========== CHANGE PASSWORD (AUTHENTICATED) ==========
  async changePassword(userId: number, currentPassword: string, newPassword: string) {
    const [user] = await db.select().from(users).where(eq(users.id, userId)).limit(1);
    if (!user) throw new UnauthorizedError('User not found');
    const isValid = await comparePassword(currentPassword, user.password);
    if (!isValid) throw new BadRequestError('Current password is incorrect');

    const hashedPassword = await hashPassword(newPassword);
    await db.update(users).set({ password: hashedPassword, updatedAt: new Date() }).where(eq(users.id, userId));
    return { message: 'Password changed' };
  }

  // ========== EMAIL VERIFICATION ==========
  async verifyEmail(token: string) {
    const [verification] = await db
      .select()
      .from(verificationTokens)
      .where(eq(verificationTokens.token, token))
      .limit(1);
    if (!verification || verification.type !== 'email_verification' || verification.isUsed || verification.expiresAt < new Date()) {
      throw new BadRequestError('Invalid or expired verification token');
    }
    await db.update(users).set({ isActive: true }).where(eq(users.id, verification.userId));
    await db.update(verificationTokens).set({ isUsed: true }).where(eq(verificationTokens.id, verification.id));
    return { message: 'Email verified successfully' };
  }

  async resendVerification(email: string) {
    const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1);
    if (!user) throw new BadRequestError('Email not found');
    if (user.isActive) throw new BadRequestError('Email already verified');

    // Invalidate previous verification tokens
    await db.update(verificationTokens).set({ isUsed: true }).where(eq(verificationTokens.userId, user.id));

    const token = randomBytes(32).toString('hex');
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24);
    await db.insert(verificationTokens).values({
      userId: user.id,
      token,
      type: 'email_verification',
      expiresAt,
    });

    const verificationLink = `${process.env.APP_URL}/api/auth/verify-email?token=${token}`;
    const { subject, html, text } = emailTemplates.verification(user.fullName, verificationLink);
    await sendEmail(user.email, subject, html, text);
    return { message: 'Verification email resent' };
  }

  // ========== SESSION MANAGEMENT ==========
  async getUserSessions(userId: number) {
    return sessionService.getUserSessions(userId);
  }

  async revokeSession(userId: number, sessionId: number) {
    const session = await db.select().from(sessions).where(eq(sessions.id, sessionId)).limit(1);
    if (!session.length || session[0].userId !== userId) {
      throw new BadRequestError('Session not found');
    }
    await sessionService.revokeSession(sessionId);
  }
}

export const authService = new AuthService();