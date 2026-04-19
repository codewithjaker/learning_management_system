export interface ProfileUpdateInput {
  fullName?: string;
  bio?: string | null;
  avatar?: string | null;
}

export interface ChangePasswordInput {
  currentPassword: string;
  newPassword: string;
}

export interface SystemSettingsInput {
  siteName?: string;
  siteLogo?: string | null;
  siteDescription?: string;
  contactEmail?: string;
  timezone?: string;
  dateFormat?: string;
  currency?: string;
  enableRegistration?: boolean;
  enableEmailVerification?: boolean;
  maintenanceMode?: boolean;
}

export interface EmailSettingsInput {
  smtpHost?: string;
  smtpPort?: number;
  smtpSecure?: boolean;
  smtpUser?: string;
  smtpPass?: string;
  fromEmail?: string;
  fromName?: string;
}