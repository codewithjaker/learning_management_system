import { z } from 'zod';

export const registerSchema = z.object({
  body: z.object({
    email: z.string().email(),
    password: z.string().min(6),
    fullName: z.string().min(1),
    role: z.enum(['student','instructor','admin']).optional().default('student'),
  }),
});

export const loginSchema = z.object({
  body: z.object({
    email: z.string().email(),
    password: z.string(),
  }),
});

// Refresh token
export const refreshTokenSchema = z.object({
  body: z.object({
    refreshToken: z.string(),
  }),
});

// Forgot password (send OTP)
export const forgotPasswordSchema = z.object({
  body: z.object({
    email: z.string().email(),
  }),
});

// Verify OTP (for password reset)
export const verifyOtpSchema = z.object({
  body: z.object({
    email: z.string().email(),
    otp: z.string().length(6),
  }),
});

// Resend OTP
export const resendOtpSchema = z.object({
  body: z.object({
    email: z.string().email(),
  }),
});

// Reset password (with OTP)
export const resetPasswordSchema = z.object({
  body: z.object({
    email: z.string().email(),
    otp: z.string().length(6),
    newPassword: z.string().min(6),
  }),
});

// Change password (authenticated)
export const changePasswordSchema = z.object({
  body: z.object({
    currentPassword: z.string(),
    newPassword: z.string().min(6),
  }),
});

// Verify email
export const verifyEmailSchema = z.object({
  query: z.object({
    token: z.string(),
  }),
});

// Resend verification email
export const resendVerificationSchema = z.object({
  body: z.object({
    email: z.string().email(),
  }),
});

// Update user profile
export const updateMeSchema = z.object({
  body: z.object({
    fullName: z.string().min(1).optional(),
    bio: z.string().optional(),
    avatar: z.string().url().optional(),
  }),
});


// Infer the body types
export type RegisterInput = z.infer<typeof registerSchema>['body'];
export type LoginInput = z.infer<typeof loginSchema>['body'];
export type RefreshTokenInput = z.infer<typeof refreshTokenSchema>['body'];