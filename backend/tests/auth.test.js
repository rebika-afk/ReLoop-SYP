import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import app from '../src/app.js';
import { mockPrisma } from './mockPrisma.js';
import { generateToken } from '../src/services/authService.js';
import { env } from '../src/config/env.js';

describe('Auth Module (/api/v1/auth)', () => {
  beforeEach(() => {
    mockPrisma.reset();
  });

  describe('POST /api/v1/auth/register', () => {
    it('should successfully register a new user with USER role and set auth cookie', async () => {
      const res = await request(app)
        .post('/api/v1/auth/register')
        .send({
          name: 'Jane Doe',
          email: 'Jane@Example.com', // Test case-insensitivity
          password: 'Password123!',
          confirmPassword: 'Password123!',
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.user).toBeDefined();
      expect(res.body.data.user.email).toBe('jane@example.com');
      expect(res.body.data.user.role).toBe('USER');
      expect(res.body.data.user.passwordHash).toBeUndefined();

      // Check cookie was set
      const cookies = res.headers['set-cookie'];
      expect(cookies).toBeDefined();
      expect(cookies[0]).toContain(env.COOKIE_NAME);
      expect(cookies[0]).toContain('HttpOnly');
    });

    // Requirement 5: Block public registration of ADMIN_EMAIL without revealing it's reserved
    it('should block public registration of the reserved ADMIN_EMAIL with EMAIL_ALREADY_EXISTS', async () => {
      const res = await request(app)
        .post('/api/v1/auth/register')
        .send({
          name: 'Fake Admin',
          email: env.ADMIN_EMAIL, // admin@reloop.local
          password: 'Password123!',
          confirmPassword: 'Password123!',
        });

      expect(res.status).toBe(409);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('EMAIL_ALREADY_EXISTS');
    });

    it('should reject registration if email is already in use', async () => {
      // Seed existing user
      await mockPrisma.user.create({
        data: {
          name: 'Existing User',
          email: 'jane@example.com',
          passwordHash: await bcrypt.hash('Secret123', 10),
          role: 'USER',
        },
      });

      const res = await request(app)
        .post('/api/v1/auth/register')
        .send({
          name: 'Jane Doe 2',
          email: 'JANE@example.com',
          password: 'Password123!',
          confirmPassword: 'Password123!',
        });

      expect(res.status).toBe(409);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('EMAIL_ALREADY_EXISTS');
    });

    it('should reject registration with weak password (missing number or < 8 chars)', async () => {
      const res = await request(app)
        .post('/api/v1/auth/register')
        .send({
          name: 'Weak Pass',
          email: 'weak@example.com',
          password: 'short',
          confirmPassword: 'short',
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
    });

    // Requirement 5: Enforce max 72 bytes on passwords (bcrypt limit)
    it('should reject password exceeding 72 bytes', async () => {
      const longPassword = 'A1' + 'a'.repeat(71); // 73 bytes
      expect(Buffer.byteLength(longPassword, 'utf8')).toBeGreaterThan(72);

      const res = await request(app)
        .post('/api/v1/auth/register')
        .send({
          name: 'Long Pass User',
          email: 'longpass@example.com',
          password: longPassword,
          confirmPassword: longPassword,
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should ignore client-supplied role and always assign USER role', async () => {
      const res = await request(app)
        .post('/api/v1/auth/register')
        .send({
          name: 'Hacker',
          email: 'hacker@example.com',
          password: 'Password123!',
          confirmPassword: 'Password123!',
          role: 'ADMIN', // Injection attempt
        });

      expect(res.status).toBe(201);
      expect(res.body.data.user.role).toBe('USER');

      // Verify in database
      const dbUser = await mockPrisma.user.findUnique({ where: { email: 'hacker@example.com' } });
      expect(dbUser.role).toBe('USER');
    });
  });

  describe('POST /api/v1/auth/login', () => {
    beforeEach(async () => {
      // Seed active user
      await mockPrisma.user.create({
        data: {
          id: 'user_active',
          name: 'Active User',
          email: 'active@example.com',
          passwordHash: await bcrypt.hash('Password123!', 10),
          role: 'USER',
          isActive: true,
        },
      });

      // Seed deactivated user
      await mockPrisma.user.create({
        data: {
          id: 'user_inactive',
          name: 'Suspended User',
          email: 'suspended@example.com',
          passwordHash: await bcrypt.hash('Password123!', 10),
          role: 'USER',
          isActive: false,
        },
      });
    });

    it('should successfully log in with valid credentials and return HTTP-only cookie', async () => {
      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'active@example.com',
          password: 'Password123!',
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.user.email).toBe('active@example.com');
      expect(res.body.data.user.passwordHash).toBeUndefined();

      const cookies = res.headers['set-cookie'];
      expect(cookies).toBeDefined();
      expect(cookies[0]).toContain(env.COOKIE_NAME);
    });

    it('should reject login with wrong password without revealing email existence', async () => {
      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'active@example.com',
          password: 'WrongPassword999!',
        });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('INVALID_CREDENTIALS');
    });

    it('should reject login for unknown email with generic message', async () => {
      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'Password123!',
        });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('INVALID_CREDENTIALS');
    });

    it('should block login for deactivated/suspended accounts', async () => {
      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'suspended@example.com',
          password: 'Password123!',
        });

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('ACCOUNT_DEACTIVATED');
    });
  });

  describe('GET /api/v1/auth/me and Session Lifecycle', () => {
    let sessionUser;
    let validCookie;

    beforeEach(async () => {
      sessionUser = await mockPrisma.user.create({
        data: {
          id: 'user_session',
          name: 'Session User',
          email: 'session@example.com',
          passwordHash: await bcrypt.hash('Password123!', 10),
          role: 'USER',
          isActive: true,
        },
      });

      const token = generateToken(sessionUser);
      validCookie = `${env.COOKIE_NAME}=${token}`;
    });

    it('should return 401 when accessing /auth/me without a cookie', async () => {
      const res = await request(app).get('/api/v1/auth/me');
      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it('should return user session when valid cookie is presented', async () => {
      const meRes = await request(app)
        .get('/api/v1/auth/me')
        .set('Cookie', validCookie);

      expect(meRes.status).toBe(200);
      expect(meRes.body.success).toBe(true);
      expect(meRes.body.data.user.email).toBe('session@example.com');
    });

    // Requirement 14: Expired JWT test
    it('should reject expired JWT with 401 and SESSION_EXPIRED code', async () => {
      const expiredToken = jwt.sign(
        { userId: sessionUser.id, role: sessionUser.role },
        env.JWT_SECRET,
        { algorithm: 'HS256', expiresIn: '-10s' }
      );

      const res = await request(app)
        .get('/api/v1/auth/me')
        .set('Cookie', `${env.COOKIE_NAME}=${expiredToken}`);

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('SESSION_EXPIRED');
    });

    // Requirement 14: User deactivated mid-session test
    it('should immediately block user who is deactivated mid-session with 403', async () => {
      // First verify session is active
      const res1 = await request(app)
        .get('/api/v1/auth/me')
        .set('Cookie', validCookie);
      expect(res1.status).toBe(200);

      // Deactivate user in DB mid-session
      await mockPrisma.user.update({
        where: { id: sessionUser.id },
        data: { isActive: false },
      });

      // Subsequent request with the same cookie is blocked
      const res2 = await request(app)
        .get('/api/v1/auth/me')
        .set('Cookie', validCookie);

      expect(res2.status).toBe(403);
      expect(res2.body.success).toBe(false);
      expect(res2.body.error.code).toBe('ACCOUNT_DEACTIVATED');
    });

    it('should clear cookie on logout', async () => {
      const logoutRes = await request(app)
        .post('/api/v1/auth/logout')
        .set('Cookie', validCookie);

      expect(logoutRes.status).toBe(200);
      expect(logoutRes.body.success).toBe(true);

      const logoutCookies = logoutRes.headers['set-cookie'];
      expect(logoutCookies[0]).toMatch(/reloop_token=;/);
    });
  });

  describe('Password Management (/forgot-password & /reset-password)', () => {
    beforeEach(async () => {
      await mockPrisma.user.create({
        data: {
          id: 'user_reset',
          name: 'Reset Tester',
          email: 'reset@example.com',
          passwordHash: await bcrypt.hash('OldPassword123!', 10),
          role: 'USER',
          isActive: true,
        },
      });
    });

    it('should return identical success message for existing and unknown emails', async () => {
      const resExisting = await request(app)
        .post('/api/v1/auth/forgot-password')
        .send({ email: 'reset@example.com' });

      const resUnknown = await request(app)
        .post('/api/v1/auth/forgot-password')
        .send({ email: 'unknown@example.com' });

      expect(resExisting.status).toBe(200);
      expect(resUnknown.status).toBe(200);
      expect(resExisting.body.message).toBe(resUnknown.body.message);
    });

    it('should reset password with valid token and allow login with new password', async () => {
      const rawToken = 'known_secret_test_token_12345';
      const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');

      await mockPrisma.passwordResetToken.create({
        data: {
          userId: 'user_reset',
          tokenHash,
          expiresAt: new Date(Date.now() + 3600000), // 1 hour in future
          used: false,
        },
      });

      const resetRes = await request(app)
        .post('/api/v1/auth/reset-password')
        .send({
          token: rawToken,
          password: 'BrandNewPassword123!',
          confirmPassword: 'BrandNewPassword123!',
        });

      expect(resetRes.status).toBe(200);
      expect(resetRes.body.success).toBe(true);

      // Verify user can log in with new password
      const loginRes = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'reset@example.com',
          password: 'BrandNewPassword123!',
        });

      expect(loginRes.status).toBe(200);
    });

    // Requirement 14 & 3: Double-use of a reset token rejected
    it('should reject double-use of a reset token on atomic second consumption attempt', async () => {
      const rawToken = 'single_use_token_999';
      const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');

      await mockPrisma.passwordResetToken.create({
        data: {
          userId: 'user_reset',
          tokenHash,
          expiresAt: new Date(Date.now() + 3600000),
          used: false,
        },
      });

      // First reset: MUST succeed
      const firstRes = await request(app)
        .post('/api/v1/auth/reset-password')
        .send({
          token: rawToken,
          password: 'PasswordFirstUse123!',
          confirmPassword: 'PasswordFirstUse123!',
        });

      expect(firstRes.status).toBe(200);

      // Second reset with the exact same token: MUST be rejected
      const secondRes = await request(app)
        .post('/api/v1/auth/reset-password')
        .send({
          token: rawToken,
          password: 'PasswordSecondUse123!',
          confirmPassword: 'PasswordSecondUse123!',
        });

      expect(secondRes.status).toBe(400);
      expect(secondRes.body.success).toBe(false);
      expect(secondRes.body.error.code).toBe('INVALID_RESET_TOKEN');
    });

    it('should reject reset-password with already used token', async () => {
      const rawToken = 'used_token_123';
      const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');

      await mockPrisma.passwordResetToken.create({
        data: {
          userId: 'user_reset',
          tokenHash,
          expiresAt: new Date(Date.now() + 3600000),
          used: true, // Already used!
        },
      });

      const res = await request(app)
        .post('/api/v1/auth/reset-password')
        .send({
          token: rawToken,
          password: 'AnotherPassword123!',
          confirmPassword: 'AnotherPassword123!',
        });

      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe('INVALID_RESET_TOKEN');
    });

    it('should reject reset-password with expired token', async () => {
      const rawToken = 'expired_token_123';
      const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');

      await mockPrisma.passwordResetToken.create({
        data: {
          userId: 'user_reset',
          tokenHash,
          expiresAt: new Date(Date.now() - 3600000), // Expired 1 hr ago
          used: false,
        },
      });

      const res = await request(app)
        .post('/api/v1/auth/reset-password')
        .send({
          token: rawToken,
          password: 'AnotherPassword123!',
          confirmPassword: 'AnotherPassword123!',
        });

      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe('INVALID_RESET_TOKEN');
    });

    it('should reject reset-password with unknown/invalid token', async () => {
      const res = await request(app)
        .post('/api/v1/auth/reset-password')
        .send({
          token: 'invalid_random_token_99999',
          password: 'AnotherPassword123!',
          confirmPassword: 'AnotherPassword123!',
        });

      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe('INVALID_RESET_TOKEN');
    });

    // Item 2: Real concurrency test — two simultaneous resets with same token
    it('should allow exactly one of two simultaneous reset attempts to succeed', async () => {
      const rawToken = 'concurrency_test_token_xyz';
      const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');

      await mockPrisma.passwordResetToken.create({
        data: {
          userId: 'user_reset',
          tokenHash,
          expiresAt: new Date(Date.now() + 3600000),
          used: false,
        },
      });

      const passwordA = 'ConcurrencyPassA123!';
      const passwordB = 'ConcurrencyPassB123!';

      // Fire two simultaneous requests with the same token but different passwords
      const [resA, resB] = await Promise.all([
        request(app)
          .post('/api/v1/auth/reset-password')
          .send({ token: rawToken, password: passwordA, confirmPassword: passwordA }),
        request(app)
          .post('/api/v1/auth/reset-password')
          .send({ token: rawToken, password: passwordB, confirmPassword: passwordB }),
      ]);

      const statuses = [resA.status, resB.status].sort();
      // Exactly one must be 200, the other 400
      expect(statuses).toEqual([200, 400]);

      // Determine the winning password
      const winnerPassword = resA.status === 200 ? passwordA : passwordB;
      const loserPassword = resA.status === 200 ? passwordB : passwordA;

      // Only the winner's password should work
      const loginWinner = await request(app)
        .post('/api/v1/auth/login')
        .send({ email: 'reset@example.com', password: winnerPassword });
      expect(loginWinner.status).toBe(200);

      const loginLoser = await request(app)
        .post('/api/v1/auth/login')
        .send({ email: 'reset@example.com', password: loserPassword });
      expect(loginLoser.status).toBe(401);
    });
  });
});
