import nodemailer from 'nodemailer';
import { ApiError } from './errors';

// Create transporter
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// Verify connection on startup
transporter.verify((error, success) => {
  if (error) {
    console.error('SMTP connection error:', error);
  } else {
    console.log('SMTP server is ready to send emails');
  }
});

// Email templates
export const emailTemplates = {
  verification: (name: string, link: string) => ({
    subject: 'Verify Your Email',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Welcome, ${name}!</h2>
        <p>Thank you for registering. Please verify your email address by clicking the link below:</p>
        <p>
          <a href="${link}" style="background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px;">
            Verify Email
          </a>
        </p>
        <p>Or copy this link: <br/>${link}</p>
        <p>This link expires in 24 hours.</p>
        <hr />
        <p style="color: #666; font-size: 12px;">If you didn't create an account, ignore this email.</p>
      </div>
    `,
    text: `Welcome, ${name}! Verify your email by clicking: ${link}`,
  }),

  passwordResetOtp: (otp: string) => ({
    subject: 'Password Reset OTP',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Password Reset Request</h2>
        <p>Your OTP for password reset is:</p>
        <p style="font-size: 32px; font-weight: bold; letter-spacing: 5px; background: #f4f4f4; display: inline-block; padding: 10px 20px; border-radius: 5px;">
          ${otp}
        </p>
        <p>This OTP expires in 15 minutes.</p>
        <p>If you didn't request this, please ignore this email.</p>
      </div>
    `,
    text: `Your password reset OTP is: ${otp}. It expires in 15 minutes.`,
  }),
};

// Generic send email function
export const sendEmail = async (to: string, subject: string, html: string, text?: string) => {
  try {
    const info = await transporter.sendMail({
      from: `"${process.env.SMTP_FROM_NAME || 'LMS Platform'}" <${process.env.SMTP_FROM_EMAIL || process.env.SMTP_USER}>`,
      to,
      subject,
      text: text || html.replace(/<[^>]*>/g, ''), // fallback to plain text from HTML
      html,
    });
    console.log(`Email sent: ${info.messageId}`);
    return info;
  } catch (error) {
    console.error('Email sending failed:', error);
    throw new ApiError(500, 'Failed to send email');
  }
};