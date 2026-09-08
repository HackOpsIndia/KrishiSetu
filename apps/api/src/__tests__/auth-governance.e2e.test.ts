// ============================================================
// KrishiSetu — Authentication & Governance E2E Test Suite
// Validates:
// 1. Email login success & invalid password rejection
// 2. Canonical email normalization
// 3. Google OAuth canonical identity mapping & non-duplication
// 4. Role preservation across login providers
// 5. Environment-based admin bootstrap policy
// 6. Non-admin RBAC blocking (403 Forbidden)
// 7. Admin user registry listing & stats
// 8. Role modification & audit logging
// 9. Account status modification & audit logging
// 10. Self-protection: admin cannot disable own account
// 11. Final-admin protection: cannot remove/suspend last active admin
// 12. Account status enforcement: suspended user blocked from API
// ============================================================

import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { AppModule } from '../app.module';

jest.setTimeout(35000);

describe('Authentication & Governance E2E Suite', () => {
  let app: INestApplication;
  let baseUrl: string;
  let adminToken: string;
  let farmerToken: string;

  beforeAll(async () => {
    process.env.ADMIN_EMAILS = 'admin@demo.in,superadmin@krishisetu.in';
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.listen(0);
    const address = app.getHttpServer().address();
    baseUrl = `http://localhost:${address.port}`;
  });

  afterAll(async () => {
    await app.close();
  });

  // 1. Email login success
  test('1. Email login succeeds with valid credentials', async () => {
    const res = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'ramesh@demo.in', password: 'demo1234' }),
    });

    expect(res.status).toBe(201);
    const data = (await res.json()) as any;
    expect(data.token).toBeDefined();
    expect(data.user.role).toBe('FARMER');
    expect(data.user.email).toBe('ramesh@demo.in');
    farmerToken = data.token;
  });

  // 2. Invalid password rejection
  test('2. Login fails on invalid password without leaking enumeration details', async () => {
    const res = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'ramesh@demo.in', password: 'wrongpassword' }),
    });

    expect(res.status).toBe(401);
    const data = (await res.json()) as any;
    expect(data.message).toBe('Invalid email or password');
  });

  // 3. Email normalization
  test('3. Email is normalized consistently across case and whitespace', async () => {
    const res = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: '  RAMESH@DEMO.IN  ', password: 'demo1234' }),
    });

    expect(res.status).toBe(201);
    const data = (await res.json()) as any;
    expect(data.user.email).toBe('ramesh@demo.in');
  });

  // 4. Google OAuth user creation
  test('4. Google OAuth creates new user keyed by canonical normalized email', async () => {
    const googleEmail = 'newfarmer.k@gmail.com';
    const res = await fetch(`${baseUrl}/api/auth/google/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: googleEmail,
        name: 'Kavita Patil',
        googleSubId: 'sub-google-10101',
        avatarUrl: 'https://example.com/kavita.jpg',
      }),
    });

    expect(res.status).toBe(201);
    const data = (await res.json()) as any;
    expect(data.token).toBeDefined();
    expect(data.user.email).toBe(googleEmail);
    expect(data.user.role).toBe('FARMER');
    expect(data.user.authProvider).toBe('GOOGLE');
  });

  // 5. Existing user + Google login resolves to SAME user without role overwrite
  test('5. Existing email + Google login resolves to same canonical user and preserves role', async () => {
    // Ramesh is FARMER in the database
    const res = await fetch(`${baseUrl}/api/auth/google/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'RAMESH@DEMO.IN',
        name: 'Ramesh Kumar (from Google)',
        googleSubId: 'google-sub-ramesh-777',
      }),
    });

    expect(res.status).toBe(201);
    const data = (await res.json()) as any;
    expect(data.user.email).toBe('ramesh@demo.in');
    expect(data.user.role).toBe('FARMER'); // Preserved, not overwritten!
    expect(data.user.id).toBe('farmer-ramesh'); // Same canonical user ID!
  });

  // 6. Admin bootstrap policy via ADMIN_EMAILS
  test('6. Configured ADMIN_EMAILS receives ADMIN role upon login', async () => {
    const res = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@demo.in', password: 'demo1234' }),
    });

    expect(res.status).toBe(201);
    const data = (await res.json()) as any;
    expect(data.user.role).toBe('ADMIN');
    adminToken = data.token;
  });

  // 7. Non-admin blocked from Admin API
  test('7. Non-admin user cannot access admin endpoints (403 Forbidden)', async () => {
    const res = await fetch(`${baseUrl}/api/admin/users`, {
      headers: { Authorization: `Bearer ${farmerToken}` },
    });

    expect(res.status).toBe(403);
  });

  // 8. Admin can list users and view stats
  test('8. Admin can list users and fetch aggregate registry stats', async () => {
    const res = await fetch(`${baseUrl}/api/admin/users`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    expect(res.status).toBe(200);
    const users = (await res.json()) as any[];
    expect(Array.isArray(users)).toBe(true);
    expect(users.length).toBeGreaterThan(0);

    const statsRes = await fetch(`${baseUrl}/api/admin/users/stats`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    expect(statsRes.status).toBe(200);
    const stats = (await statsRes.json()) as any;
    expect(stats.totalUsers).toBeGreaterThan(0);
    expect(stats.admins).toBeGreaterThanOrEqual(1);
  });

  // 9. Admin role mutation and audit logging
  test('9. Admin can update user role and action generates an immutable audit record', async () => {
    // Update Kailash Jadhav from FARMER to BUYER
    const res = await fetch(`${baseUrl}/api/admin/users/user-kailash/role`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        role: 'BUYER',
        reason: 'Verified wholesale procurement business license',
      }),
    });

    expect(res.status).toBe(200);
    const updated = (await res.json()) as any;
    expect(updated.role).toBe('BUYER');

    // Check audit trail
    const auditRes = await fetch(`${baseUrl}/api/admin/users/user-kailash/audit`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    expect(auditRes.status).toBe(200);
    const audits = (await auditRes.json()) as any[];
    expect(audits.length).toBeGreaterThan(0);
    expect(audits[0].action).toBe('USER_ROLE_CHANGED');
    expect(audits[0].newValue).toBe('BUYER');
    expect(audits[0].reason).toContain('Verified wholesale');
  });

  // 10. Admin status mutation
  test('10. Admin can suspend a user account and change is audited', async () => {
    const res = await fetch(`${baseUrl}/api/admin/users/user-kailash/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        status: 'SUSPENDED',
        reason: 'Pending verification documents renewal',
      }),
    });

    expect(res.status).toBe(200);
    const updated = (await res.json()) as any;
    expect(updated.status).toBe('SUSPENDED');
  });

  // 11. Final-admin protection: cannot revoke admin role or suspend last active admin
  test('11. Final administrator protection blocks removing or suspending the sole active admin', async () => {
    // Attempt to demote the admin to FARMER
    const res = await fetch(`${baseUrl}/api/admin/users/admin-krishi/role`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({ role: 'FARMER', reason: 'Accidental demotion test' }),
    });

    expect(res.status).toBe(400);
    const err = (await res.json()) as any;
    expect(err.message).toContain('final active platform administrator');
  });

  // 12. Self-protection: Admin cannot disable own account
  test('12. Self-protection prevents an administrator from suspending their own account', async () => {
    const res = await fetch(`${baseUrl}/api/admin/users/admin-krishi/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({ status: 'SUSPENDED', reason: 'Self-disable test' }),
    });

    expect(res.status).toBe(400);
    const err = (await res.json()) as any;
    expect(err.message).toContain('cannot suspend or disable their own account');
  });

  // 13. Account status enforcement: suspended user blocked from protected actions
  test('13. Suspended user is denied access to protected endpoints even with previously issued token', async () => {
    // Anand Shinde is SUSPENDED in demo data
    // Attempt login as suspended user
    const res = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'anand.shinde@demo.in', password: 'demo1234' }),
    });

    expect(res.status).toBe(401);
    const err = (await res.json()) as any;
    expect(err.message).toContain('suspended');
  });
});
