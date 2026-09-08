// ============================================================
// KrishiSetu — Email OTP & SMTP Notification E2E Test Suite
// Validates:
// 1. OTP generation (6 digits numeric, safe response)
// 2. OTP secure SHA-256 hashing (no plaintext stored)
// 3. OTP expiration enforcement
// 4. OTP verification success (issues JWT, marks isEmailVerified)
// 5. Invalid OTP rejection
// 6. Expired OTP rejection
// 7. OTP single-use consumption (reuse rejected)
// 8. Max attempts limit (5 attempts invalidates challenge)
// 9. Resend cooldown rate-limiting (60 seconds)
// 10. Email normalization (trim & lowercase canonical mapping)
// 11. Existing email + OTP maps to existing user
// 12. Existing email + Google maps to same user
// 13. Existing email + password maps to same user
// 14. Suspended user cannot use OTP
// 15. Disabled user cannot use OTP
// 16. Password reset via OTP flow
// 17. Demo mode functions without SMTP
// 18. Production mode checks SMTP configuration
// 19. Email service failure does not corrupt transaction state
// 20. Admin security notification generation
// ============================================================

import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as crypto from 'crypto';
import { AppModule } from '../app.module';
import { AuthService, inMemoryChallenges, inMemoryUsers } from '../auth/auth.service';
import { EmailService } from '../email/email.service';

jest.setTimeout(35000);

describe('Email OTP & SMTP Notification E2E Suite', () => {
  let app: INestApplication;
  let baseUrl: string;
  let authService: AuthService;
  let emailService: EmailService;

  beforeAll(async () => {
    process.env.DEMO_MODE = 'true';
    process.env.ADMIN_EMAILS = 'admin@demo.in,superadmin@krishisetu.in';
    process.env.OTP_RESEND_COOLDOWN_SECONDS = '60';

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.listen(0);
    const address = app.getHttpServer().address();
    baseUrl = `http://localhost:${address.port}`;

    authService = app.get<AuthService>(AuthService);
    emailService = app.get<EmailService>(EmailService);
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(() => {
    emailService.clearSentEmails();
  });

  // 1. OTP generation
  test('1. OTP generation produces 6-digit numeric OTP and safe response', async () => {
    const testEmail = 'otp.test1@krishisetu.demo';
    const res = await fetch(`${baseUrl}/api/auth/otp/request`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: testEmail }),
    });

    expect(res.status).toBe(201);
    const data = (await res.json()) as any;
    expect(data.success).toBe(true);
    expect(data.email).toBe(testEmail);
    expect(data.expiresInMinutes).toBe(10);
    expect(data.demoOtp).toBeDefined();
    expect(data.demoOtp).toMatch(/^\d{6}$/);

    // Email dispatch recorded in buffer
    const lastEmail = emailService.getLastEmail();
    expect(lastEmail).not.toBeNull();
    expect(lastEmail?.to).toBe(testEmail);
    expect(lastEmail?.subject).toContain('login code');
  });

  // 2. OTP hashing
  test('2. OTP is securely stored as SHA-256 hash and not plaintext', async () => {
    const testEmail = 'otp.hash@krishisetu.demo';
    const res = await fetch(`${baseUrl}/api/auth/otp/request`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: testEmail }),
    });

    const data = (await res.json()) as any;
    const otp = data.demoOtp;
    expect(otp).toBeDefined();

    const expectedHash = crypto.createHash('sha256').update(otp).digest('hex');
    const challengeKey = `${testEmail}:LOGIN`;
    const challenge = inMemoryChallenges.get(challengeKey);

    expect(challenge).toBeDefined();
    expect(challenge?.codeHash).toBe(expectedHash);
    expect(challenge?.codeHash).not.toBe(otp); // Never plaintext
  });

  // 3. OTP verification success
  test('3. Valid OTP verification issues JWT token and marks email verified', async () => {
    const testEmail = 'otp.verify@krishisetu.demo';
    const reqRes = await fetch(`${baseUrl}/api/auth/otp/request`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: testEmail }),
    });
    const { demoOtp } = (await reqRes.json()) as any;

    const verifyRes = await fetch(`${baseUrl}/api/auth/otp/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: testEmail, otp: demoOtp }),
    });

    expect(verifyRes.status).toBe(201);
    const verifyData = (await verifyRes.json()) as any;
    expect(verifyData.token).toBeDefined();
    expect(verifyData.user.email).toBe(testEmail);
    expect(verifyData.user.isEmailVerified).toBe(true);
  });

  // 4. Invalid OTP rejection
  test('4. Incorrect OTP is rejected with remaining attempts counter', async () => {
    const testEmail = 'otp.invalid@krishisetu.demo';
    await fetch(`${baseUrl}/api/auth/otp/request`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: testEmail }),
    });

    const verifyRes = await fetch(`${baseUrl}/api/auth/otp/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: testEmail, otp: '000000' }),
    });

    expect(verifyRes.status).toBe(401);
    const err = (await verifyRes.json()) as any;
    expect(err.message).toContain('Incorrect verification code');
  });

  // 5. Expired OTP rejection
  test('5. Expired OTP challenge is rejected', async () => {
    const testEmail = 'otp.expired@krishisetu.demo';
    await fetch(`${baseUrl}/api/auth/otp/request`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: testEmail }),
    });

    // Artificially expire the challenge
    const key = `${testEmail}:LOGIN`;
    const challenge = inMemoryChallenges.get(key);
    if (challenge) {
      challenge.expiresAt = new Date(Date.now() - 60000); // 1 minute in the past
    }

    const verifyRes = await fetch(`${baseUrl}/api/auth/otp/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: testEmail, otp: '123456' }),
    });

    expect(verifyRes.status).toBe(400);
    const err = (await verifyRes.json()) as any;
    expect(err.message).toContain('expired');
  });

  // 6. OTP single-use consumption
  test('6. OTP cannot be reused after successful verification', async () => {
    const testEmail = 'otp.reuse@krishisetu.demo';
    const reqRes = await fetch(`${baseUrl}/api/auth/otp/request`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: testEmail }),
    });
    const { demoOtp } = (await reqRes.json()) as any;

    // First verification: success
    const v1 = await fetch(`${baseUrl}/api/auth/otp/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: testEmail, otp: demoOtp }),
    });
    expect(v1.status).toBe(201);

    // Second verification with same OTP: rejected
    const v2 = await fetch(`${baseUrl}/api/auth/otp/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: testEmail, otp: demoOtp }),
    });
    expect(v2.status).toBe(400);
    const err = (await v2.json()) as any;
    expect(err.message).toContain('Invalid or expired');
  });

  // 7. Max attempts lockout
  test('7. Exceeding maximum verification attempts invalidates the challenge', async () => {
    const testEmail = 'otp.maxattempts@krishisetu.demo';
    await fetch(`${baseUrl}/api/auth/otp/request`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: testEmail }),
    });

    // Make 5 incorrect attempts
    for (let i = 0; i < 4; i++) {
      const res = await fetch(`${baseUrl}/api/auth/otp/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: testEmail, otp: '111111' }),
      });
      expect(res.status).toBe(401);
    }

    // 5th attempt: exhausts and invalidates
    const finalRes = await fetch(`${baseUrl}/api/auth/otp/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: testEmail, otp: '111111' }),
    });
    expect(finalRes.status).toBe(400);
    const err = (await finalRes.json()) as any;
    expect(err.message).toContain('Maximum verification attempts exceeded');
  });

  // 8. Resend cooldown rate-limiting
  test('8. Requesting OTP within cooldown period is rate-limited', async () => {
    const testEmail = 'otp.cooldown@krishisetu.demo';
    const r1 = await fetch(`${baseUrl}/api/auth/otp/request`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: testEmail }),
    });
    expect(r1.status).toBe(201);

    // Immediate second request within 60s
    const r2 = await fetch(`${baseUrl}/api/auth/otp/request`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: testEmail }),
    });
    expect(r2.status).toBe(400);
    const err = (await r2.json()) as any;
    expect(err.message).toContain('Please wait');
  });

  // 9. Email normalization
  test('9. Email normalization applies lowercase and trimming consistently', async () => {
    const rawEmail = '  Ramesh@DEMO.in  ';
    const normalized = authService.normalizeEmail(rawEmail);
    expect(normalized).toBe('ramesh@demo.in');

    // Request with unnormalized email
    const key = `ramesh@demo.in:LOGIN`;
    inMemoryChallenges.delete(key); // Clear cooldown if any

    const res = await fetch(`${baseUrl}/api/auth/otp/request`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: rawEmail }),
    });

    expect(res.status).toBe(201);
    const data = (await res.json()) as any;
    expect(data.email).toBe('ramesh@demo.in');
  });

  // 10. Existing email + OTP maps to existing user
  test('10. Existing user authenticating with OTP retains role and identity', async () => {
    const key = `ramesh@demo.in:LOGIN`;
    inMemoryChallenges.delete(key);

    const reqRes = await fetch(`${baseUrl}/api/auth/otp/request`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'ramesh@demo.in' }),
    });
    const { demoOtp } = (await reqRes.json()) as any;

    const verifyRes = await fetch(`${baseUrl}/api/auth/otp/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'ramesh@demo.in', otp: demoOtp }),
    });

    expect(verifyRes.status).toBe(201);
    const data = (await verifyRes.json()) as any;
    expect(data.user.id).toBe('farmer-ramesh');
    expect(data.user.role).toBe('FARMER');
    expect(data.user.name).toBe('Ramesh Kumar');
  });

  // 11. Existing email + Google maps to same user
  test('11. Existing user logging in via Google resolves to canonical user without duplication', async () => {
    const res = await fetch(`${baseUrl}/api/auth/google/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: '  Ramesh@demo.in  ',
        googleSubId: 'google-sub-ramesh-canonical',
      }),
    });

    expect(res.status).toBe(201);
    const data = (await res.json()) as any;
    expect(data.user.id).toBe('farmer-ramesh');
    expect(data.user.role).toBe('FARMER');
  });

  // 12. Existing email + password maps to same user
  test('12. Existing user logging in via password resolves to the identical canonical user', async () => {
    const res = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'ramesh@demo.in', password: 'demo1234' }),
    });

    expect(res.status).toBe(201);
    const data = (await res.json()) as any;
    expect(data.user.id).toBe('farmer-ramesh');
    expect(data.user.role).toBe('FARMER');
  });

  // 13. Suspended user cannot use OTP
  test('13. Suspended user is blocked from requesting OTP', async () => {
    const res = await fetch(`${baseUrl}/api/auth/otp/request`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'anand.shinde@demo.in' }),
    });

    expect(res.status).toBe(401);
    const data = (await res.json()) as any;
    expect(data.message).toContain('suspended');
  });

  // 14. Disabled user cannot use OTP
  test('14. Disabled user is blocked from authenticating via OTP', async () => {
    inMemoryUsers.set('disabled.user@demo.in', {
      id: 'disabled-user-01',
      email: 'disabled.user@demo.in',
      name: 'Disabled Farmer',
      role: 'FARMER',
      status: 'DISABLED',
      authProvider: 'EMAIL',
      verificationStatus: 'UNVERIFIED',
      isActive: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const res = await fetch(`${baseUrl}/api/auth/otp/request`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'disabled.user@demo.in' }),
    });

    expect(res.status).toBe(401);
  });

  // 15. Password reset via OTP flow
  test('15. Complete forgot password & reset via OTP flow works seamlessly', async () => {
    const resetEmail = 'pwd.reset@krishisetu.demo';
    // Register candidate user
    await authService.register({
      email: resetEmail,
      password: 'initialPass123',
      name: 'Reset Test User',
      role: 'FARMER',
    });

    // 1. Request forgot password
    const forgotRes = await fetch(`${baseUrl}/api/auth/password/forgot`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: resetEmail }),
    });
    expect(forgotRes.status).toBe(201);
    const forgotData = (await forgotRes.json()) as any;
    expect(forgotData.demoOtp).toBeDefined();

    // 2. Submit new password with OTP
    const resetRes = await fetch(`${baseUrl}/api/auth/password/reset`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: resetEmail,
        otp: forgotData.demoOtp,
        newPassword: 'newSecretPassword2026',
      }),
    });
    expect(resetRes.status).toBe(201);

    // 3. Login with new password
    const loginRes = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: resetEmail,
        password: 'newSecretPassword2026',
      }),
    });
    expect(loginRes.status).toBe(201);
  });

  // 16. Demo mode without SMTP
  test('16. Demo mode operates without external SMTP credentials and logs simulated emails', async () => {
    expect(emailService.isDemoMode).toBe(true);
    const result = await emailService.sendOtpEmail('demo.evaluator@sih.gov.in', {
      otp: '789123',
      expiryMinutes: 10,
      name: 'SIH Evaluator',
    });

    expect(result.success).toBe(true);
    expect(result.simulated).toBe(true);
    expect(emailService.getSentEmails().length).toBeGreaterThan(0);
  });

  // 17. Production mode requires valid SMTP configuration
  test('17. Production mode safely detects and reports unconfigured SMTP', async () => {
    // Temporarily simulate production mode with unconfigured SMTP
    process.env.DEMO_MODE = 'false';
    const prodResult = await emailService.sendEmail({
      to: 'prod.test@krishisetu.gov.in',
      subject: 'Production SMTP Verification',
      html: '<p>Test</p>',
    });

    expect(prodResult.success).toBe(false);
    expect(prodResult.error).toContain('Production SMTP delivery failure');

    // Restore demo mode
    process.env.DEMO_MODE = 'true';
  });

  // 18. Email service failure does not corrupt transaction state
  test('18. Email delivery failure does not roll back or corrupt business transaction operations', async () => {
    // Spying sendEmail to simulate delivery failure
    const sendSpy = jest.spyOn(emailService, 'sendEmail').mockResolvedValueOnce({
      success: false,
      error: 'Simulated connection timeout to SMTP host',
      timestamp: new Date(),
      simulated: false,
    });

    // Requesting OTP should handle the error safely without unhandled exception
    const res = await fetch(`${baseUrl}/api/auth/otp/request`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'resilience.test@krishisetu.demo' }),
    });

    expect(res.status).toBe(201);
    sendSpy.mockRestore();
  });

  // 19. Admin security notification generation on role modification
  test('19. Admin role grant triggers security email alert', async () => {
    const alertUserEmail = 'security.alert@krishisetu.demo';
    const registered = await authService.register({
      email: alertUserEmail,
      password: 'password123',
      name: 'Security Alert User',
      role: 'FARMER',
    });

    emailService.clearSentEmails();

    // Login as admin
    const adminLoginRes = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@demo.in', password: 'demo1234' }),
    });
    const { token: adminToken } = (await adminLoginRes.json()) as any;

    // Promote to ADMIN
    const patchRes = await fetch(`${baseUrl}/api/admin/users/${registered.user.id}/role`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        role: 'ADMIN',
        reason: 'State Hub elevation',
      }),
    });

    expect(patchRes.status).toBe(200);

    // Verify security email was dispatched
    const sent = emailService.getSentEmails();
    const securityEmail = sent.find((e) => e.to === alertUserEmail);
    expect(securityEmail).toBeDefined();
    expect(securityEmail?.subject).toContain('security update');
  });

  // 20. Public auth config endpoint exposes OTP parameters
  test('20. Auth config metadata exposes demoMode, otpExpiryMinutes, otpLength, and resendCooldownSeconds', async () => {
    const res = await fetch(`${baseUrl}/api/auth/config`);
    expect(res.status).toBe(200);
    const cfg = (await res.json()) as any;
    expect(cfg.demoMode).toBe(true);
    expect(cfg.otpExpiryMinutes).toBe(10);
    expect(cfg.otpLength).toBe(6);
    expect(cfg.resendCooldownSeconds).toBe(60);
  });
});
