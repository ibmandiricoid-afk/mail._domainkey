/**
 * Types definition for J.A.R.V.I.S Panel
 */

export interface EmailTemplate {
  id: string;
  name: string;
  category: "General" | "Marketing" | "Support" | "Personal";
  subject: string;
  message: string;
  createdAt: number;
}

export interface WarmUpSchedule {
  enabled: boolean;
  preset: "conservative" | "standard" | "aggressive" | "custom";
  currentDay: number;
  startLimit: number;
  rampStep: number;
  maxDailyLimit: number;
  delayBetweenEmailsSec: number;
  sentTodayCount: number;
  todayDate: string;
  reputationScore: number;
  autoPauseOnError: boolean;
}

export interface SmtpConfig {
  host: string;
  port: string;
  username: string;
  password: "";
  senderEmail: string;
  fromName: string;
  replyTo: string;
  dailyLimit: string;
  connectionType: "STARTTLS" | "SSL" | "NONE";
  logoUrl: string;
  sendingAvatarUrl?: string;
  emailSignature?: string;
  enableSignature?: boolean;
  unsubscribeUrl?: string;
  enableUnsubscribe?: boolean;
  warmUpSchedule?: WarmUpSchedule;
  // Microsoft Graph API and OAuth2 configuration
  providerType?: "smtp" | "microsoft_graph";
  microsoftClientId?: string;
  microsoftClientSecret?: string;
  microsoftTenantId?: string;
  microsoftAuthType?: "client_credentials" | "auth_code";
  microsoftAccessToken?: string;
  microsoftRefreshToken?: string;
  microsoftTokenExpiry?: number;
}

export interface LogEntry {
  timestamp: string;
  type: "info" | "success" | "warning" | "error";
  message: string;
}

export interface SpamReport {
  score: number;
  level: "Excellent" | "Good" | "Risky" | "Likely Spam";
  color: string;
  tips: string[];
}

export interface BankingNotification {
  id: string;
  type: "sent" | "opened" | "clicked";
  title: string;
  message: string;
  recipient: string;
  subject: string;
  ip?: string;
  timestamp: string;
}

export interface EmailValidationRecord {
  id: string;
  email: string;
  domain: string;
  status: "Valid" | "Invalid" | "Unknown";
  reason: string;
  hasMxRecord?: boolean;
  typoSuggestion?: string | null;
  timestamp: string;
}

