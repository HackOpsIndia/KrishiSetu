// ============================================================
// Email Types & Interfaces — KrishiSetu Notification Engine
// ============================================================

export interface EmailRecipient {
  email: string;
  name?: string;
}

export interface SendEmailOptions {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  from?: string;
  replyTo?: string;
}

export interface EmailDeliveryResult {
  success: boolean;
  messageId?: string;
  simulated?: boolean;
  error?: string;
  timestamp: Date;
}

export interface EmailHealthStatus {
  service: 'KrishiSetu SMTP Email Service';
  mode: 'PRODUCTION_SMTP' | 'DEMO_SIMULATED';
  configured: boolean;
  connected: boolean;
  host?: string;
  port?: number;
  fromAddress?: string;
  details?: string;
}

export interface OtpEmailData {
  name?: string;
  otp: string;
  expiryMinutes: number;
  purpose?: 'LOGIN' | 'EMAIL_VERIFICATION' | 'PASSWORD_RESET' | 'SENSITIVE_ACTION';
}

export interface WelcomeEmailData {
  name: string;
  email: string;
  role: string;
}

export interface PasswordResetEmailData {
  name?: string;
  otp: string;
  expiryMinutes: number;
}

export interface OfferNotificationData {
  recipientName: string;
  buyerName: string;
  commodityName: string;
  quantityQtl: number;
  pricePerQtl: number;
  netRealisablePricePerQtl?: number;
  lotId: string;
  offerId: string;
}

export interface OfferAcceptedData {
  recipientName: string;
  actorName: string;
  commodityName: string;
  quantityQtl: number;
  agreedPricePerQtl: number;
  totalValue: number;
  lotId: string;
}

export interface TransactionUpdateData {
  recipientName: string;
  transactionId: string;
  commodityName: string;
  quantityQtl: number;
  status: string;
  note?: string;
  driverPhone?: string;
  vehicleType?: string;
}

export interface PaymentNotificationData {
  recipientName: string;
  transactionId: string;
  amount: number;
  status: string;
  referenceNumber?: string;
  method?: string;
  paidAt?: Date;
}

export interface SecurityAlertData {
  recipientName: string;
  email: string;
  eventType: 'ADMIN_ROLE_GRANTED' | 'ADMIN_ROLE_REVOKED' | 'ACCOUNT_SUSPENDED' | 'ACCOUNT_DISABLED' | 'PASSWORD_CHANGED';
  details: string;
  timestamp: Date;
  ipAddress?: string;
}
