// @ts-nocheck
import { db } from '../db';
import { users } from '../db/schema/users';
import { SystemSetting, systemSettings } from '../db/schema/settings';
import { emailSettings } from '../db/schema/emailSettings';
import { sessions } from '../db/schema/sessions';
import { eq } from 'drizzle-orm';
import { hashPassword, comparePassword } from '../utils/password';
import { NotFoundError, BadRequestError } from '../utils/errors';
import { ProfileUpdateInput, ChangePasswordInput, SystemSettingsInput, EmailSettingsInput } from '../types/settings.types';
import { CreateSystemSettingsInput } from '../validations/settings.validation';

export class SettingsService {
    // ========== Profile ==========
    async getProfile(userId: number) {
        const [user] = await db
            .select({ id: users.id, fullName: users.fullName, email: users.email, bio: users.bio, avatar: users.avatar })
            .from(users)
            .where(eq(users.id, userId));
        if (!user) throw new NotFoundError('User');
        return user;
    }

    async updateProfile(userId: number, data: ProfileUpdateInput) {
        const [updated] = await db
            .update(users)
            .set({ ...data, updatedAt: new Date() })
            .where(eq(users.id, userId))
            .returning({ id: users.id, fullName: users.fullName, email: users.email, bio: users.bio, avatar: users.avatar });
        if (!updated) throw new NotFoundError('User');
        return updated;
    }

    // ========== Change Password ==========
    async changePassword(userId: number, data: ChangePasswordInput) {
        const [user] = await db.select({ password: users.password }).from(users).where(eq(users.id, userId));
        if (!user) throw new NotFoundError('User');
        const isValid = await comparePassword(data.currentPassword, user.password);
        if (!isValid) throw new BadRequestError('Current password is incorrect');
        const hashed = await hashPassword(data.newPassword);
        await db.update(users).set({ password: hashed, updatedAt: new Date() }).where(eq(users.id, userId));
        return { message: 'Password changed successfully' };
    }

    // ========== System Settings ==========
    async createSystemSettings(data: any) {
        const existing = await db.select().from(systemSettings).limit(1);
        if (existing.length > 0) {
            throw new BadRequestError('System settings already exist. Use PUT to update.');
        }
        const [settings] = await db.insert(systemSettings).values(data).returning();
        return settings;
    }

    async getSystemSettings() {
        let settings = await db.select().from(systemSettings).limit(1);
        if (settings.length === 0) {
            // Insert default settings
            const [defaultSettings] = await db.insert(systemSettings).values({}).returning();
            return defaultSettings;
        }
        return settings[0];
    }

    async updateSystemSettings(data: any) {
        const existing = await this.getSystemSettings();
        const [updated] = await db
            .update(systemSettings)
            .set({ ...data, updatedAt: new Date() })
            .where(eq(systemSettings.id, existing.id))
            .returning();
        return updated;
    }

    async deleteSystemSettings() {
        const existing = await db.select().from(systemSettings).limit(1);
        if (existing.length === 0) throw new NotFoundError('System settings not found');
        // Reset to default values
        const [reset] = await db
            .update(systemSettings)
            .set({
                siteName: 'LMS Platform',
                siteLogo: null,
                siteDescription: 'Learning Management System',
                contactEmail: 'admin@example.com',
                timezone: 'UTC',
                dateFormat: 'YYYY-MM-DD',
                currency: 'USD',
                enableRegistration: true,
                enableEmailVerification: true,
                maintenanceMode: false,
                updatedAt: new Date(),
            })
            .where(eq(systemSettings.id, existing[0].id))
            .returning();
        return reset;
    }

    // ========== Email Settings ==========
    async createEmailSettings(data: any) {
        const existing = await db.select().from(emailSettings).limit(1);
        if (existing.length > 0) {
            throw new BadRequestError('Email settings already exist. Use PUT to update.');
        }
        const [settings] = await db.insert(emailSettings).values(data).returning();
        return settings;
    }

    async getEmailSettings() {
        let settings = await db.select().from(emailSettings).limit(1);
        if (settings.length === 0) {
            const [defaultSettings] = await db.insert(emailSettings).values({}).returning();
            return defaultSettings;
        }
        return settings[0];
    }

    async updateEmailSettings(data: any) {
        const existing = await this.getEmailSettings();
        const [updated] = await db
            .update(emailSettings)
            .set({ ...data, updatedAt: new Date() })
            .where(eq(emailSettings.id, existing.id))
            .returning();
        return updated;
    }

    async deleteEmailSettings() {
        const existing = await db.select().from(emailSettings).limit(1);
        if (existing.length === 0) throw new NotFoundError('Email settings not found');
        // Reset to default values
        const [reset] = await db
            .update(emailSettings)
            .set({
                smtpHost: 'smtp.example.com',
                smtpPort: 587,
                smtpSecure: false,
                smtpUser: '',
                smtpPass: '',
                fromEmail: 'noreply@example.com',
                fromName: 'LMS System',
                updatedAt: new Date(),
            })
            .where(eq(emailSettings.id, existing[0].id))
            .returning();
        return reset;
    }


    // ========== Sessions ==========
    async getUserSessions(userId: number) {
        return db
            .select({ id: sessions.id, userAgent: sessions.userAgent, ipAddress: sessions.ipAddress, expiresAt: sessions.expiresAt, createdAt: sessions.createdAt, isRevoked: sessions.isRevoked })
            .from(sessions)
            .where(eq(sessions.userId, userId))
            .orderBy(sessions.createdAt);
    }

    async revokeSession(sessionId: number, userId: number) {
        const [session] = await db.select().from(sessions).where(eq(sessions.id, sessionId));
        if (!session || session.userId !== userId) throw new NotFoundError('Session');
        await db.update(sessions).set({ isRevoked: true, updatedAt: new Date() }).where(eq(sessions.id, sessionId));
        return { message: 'Session revoked' };
    }
}

export const settingsService = new SettingsService();