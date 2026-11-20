import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import app from '../src/app.js';
import { mockPrisma } from './mockPrisma.js';
import { generateToken } from '../src/services/authService.js';
import { env } from '../src/config/env.js';

describe('User Module (/api/v1/users)', () => {
  let user;
  let authCookie;

  beforeEach(async () => {
    mockPrisma.reset();

    user = await mockPrisma.user.create({
      data: {
        id: 'user_profile_test',
        name: 'Alice Cooper',
        email: 'alice@example.com',
        passwordHash: await bcrypt.hash('CurrentPass123!', 10),
        role: 'USER',
        phone: '1234567890',
        location: 'Kathmandu',
        isActive: true,
      },
    });

    const token = generateToken(user);
    authCookie = `${env.COOKIE_NAME}=${token}`;
  });

  describe('GET /api/v1/users/me', () => {
    it('should return user profile for authenticated user', async () => {
      const res = await request(app)
        .get('/api/v1/users/me')
        .set('Cookie', authCookie);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.user.name).toBe('Alice Cooper');
      expect(res.body.data.user.email).toBe('alice@example.com');
      expect(res.body.data.user.passwordHash).toBeUndefined();
    });

    it('should reject unauthenticated request', async () => {
      const res = await request(app).get('/api/v1/users/me');
      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });
  });

  describe('PATCH /api/v1/users/me', () => {
    it('should update name, phone, and location', async () => {
      const res = await request(app)
        .patch('/api/v1/users/me')
        .set('Cookie', authCookie)
        .send({
          name: 'Alice In Wonderland',
          phone: '+977-9800000000',
          location: 'Pokhara',
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.user.name).toBe('Alice In Wonderland');
      expect(res.body.data.user.phone).toBe('+977-9800000000');
      expect(res.body.data.user.location).toBe('Pokhara');
    });

    // Requirement 11: avatarUrl must be HTTPS
    it('should reject non-HTTPS avatarUrl and accept valid HTTPS avatarUrl', async () => {
      // Insecure HTTP URL
      const resHttp = await request(app)
        .patch('/api/v1/users/me')
        .set('Cookie', authCookie)
        .send({
          avatarUrl: 'http://example.com/avatar.jpg',
        });

      expect(resHttp.status).toBe(400);
      expect(resHttp.body.success).toBe(false);
      expect(resHttp.body.error.code).toBe('VALIDATION_ERROR');

      // Secure HTTPS URL
      const resHttps = await request(app)
        .patch('/api/v1/users/me')
        .set('Cookie', authCookie)
        .send({
          avatarUrl: 'https://example.com/avatar.jpg',
        });

      expect(resHttps.status).toBe(200);
      expect(resHttps.body.data.user.avatarUrl).toBe('https://example.com/avatar.jpg');
    });
  });

  describe('PATCH /api/v1/users/me/password', () => {
    it('should change password when current password is valid', async () => {
      const res = await request(app)
        .patch('/api/v1/users/me/password')
        .set('Cookie', authCookie)
        .send({
          currentPassword: 'CurrentPass123!',
          newPassword: 'BrandNewPassword123!',
          confirmPassword: 'BrandNewPassword123!',
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);

      // Verify that login with new password works
      const loginRes = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'alice@example.com',
          password: 'BrandNewPassword123!',
        });

      expect(loginRes.status).toBe(200);
    });

    // Requirement 2 & 14: Token invalid after password change
    it('should invalidate existing sessions/tokens after password is changed', async () => {
      // Create a token issued 10 seconds ago
      const pastIat = Math.floor(Date.now() / 1000) - 10;
      const priorToken = jwt.sign(
        {
          userId: user.id,
          role: user.role,
          iat: pastIat,
        },
        env.JWT_SECRET,
        {
          algorithm: 'HS256',
          expiresIn: '7d',
        }
      );

      // Change password (which sets passwordChangedAt = now)
      const changeRes = await request(app)
        .patch('/api/v1/users/me/password')
        .set('Cookie', `${env.COOKIE_NAME}=${priorToken}`)
        .send({
          currentPassword: 'CurrentPass123!',
          newPassword: 'BrandNewPassword123!',
          confirmPassword: 'BrandNewPassword123!',
        });

      expect(changeRes.status).toBe(200);

      // Try using the priorToken again after password change
      const meRes = await request(app)
        .get('/api/v1/users/me')
        .set('Cookie', `${env.COOKIE_NAME}=${priorToken}`);

      expect(meRes.status).toBe(401);
      expect(meRes.body.success).toBe(false);
      expect(meRes.body.error.code).toBe('SESSION_EXPIRED');
    });

    // Item 3: changePassword issues a fresh cookie; new cookie works, old one gets 401
    it('should issue a fresh JWT cookie after password change that works for subsequent requests', async () => {
      // Create a token with iat 10 seconds in the past so passwordChangedAt will be strictly later
      const pastIat = Math.floor(Date.now() / 1000) - 10;
      const oldToken = jwt.sign(
        { userId: user.id, role: user.role, iat: pastIat },
        env.JWT_SECRET,
        { algorithm: 'HS256', expiresIn: '7d' }
      );
      const oldCookie = `${env.COOKIE_NAME}=${oldToken}`;

      const changeRes = await request(app)
        .patch('/api/v1/users/me/password')
        .set('Cookie', oldCookie)
        .send({
          currentPassword: 'CurrentPass123!',
          newPassword: 'FreshCookiePass123!',
          confirmPassword: 'FreshCookiePass123!',
        });

      expect(changeRes.status).toBe(200);

      // Response should include a set-cookie header with a new JWT
      const cookies = changeRes.headers['set-cookie'];
      expect(cookies).toBeDefined();
      expect(cookies[0]).toContain(env.COOKIE_NAME);

      // Extract the new cookie value
      const newCookieRaw = cookies[0];
      const newCookieForHeader = newCookieRaw.split(';')[0]; // e.g. "reloop_token=<jwt>"

      // New cookie should work on /users/me
      const meNewRes = await request(app)
        .get('/api/v1/users/me')
        .set('Cookie', newCookieForHeader);

      expect(meNewRes.status).toBe(200);
      expect(meNewRes.body.success).toBe(true);
      expect(meNewRes.body.data.user.email).toBe('alice@example.com');

      // Old cookie should be rejected with SESSION_EXPIRED
      const meOldRes = await request(app)
        .get('/api/v1/users/me')
        .set('Cookie', oldCookie);

      expect(meOldRes.status).toBe(401);
      expect(meOldRes.body.error.code).toBe('SESSION_EXPIRED');
    });

    it('should reject when current password is wrong', async () => {
      const res = await request(app)
        .patch('/api/v1/users/me/password')
        .set('Cookie', authCookie)
        .send({
          currentPassword: 'WrongCurrentPass999!',
          newPassword: 'BrandNewPassword123!',
          confirmPassword: 'BrandNewPassword123!',
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('INVALID_CURRENT_PASSWORD');
    });

    it('should reject when new password is identical to current password', async () => {
      const res = await request(app)
        .patch('/api/v1/users/me/password')
        .set('Cookie', authCookie)
        .send({
          currentPassword: 'CurrentPass123!',
          newPassword: 'CurrentPass123!',
          confirmPassword: 'CurrentPass123!',
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should reject when confirmPassword does not match newPassword', async () => {
      const res = await request(app)
        .patch('/api/v1/users/me/password')
        .set('Cookie', authCookie)
        .send({
          currentPassword: 'CurrentPass123!',
          newPassword: 'BrandNewPassword123!',
          confirmPassword: 'MismatchPassword123!',
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
    });
  });
});
