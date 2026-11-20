import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import app from '../src/app.js';
import { mockPrisma } from './mockPrisma.js';
import { generateToken } from '../src/services/authService.js';
import { env } from '../src/config/env.js';
import { runSeed } from '../prisma/seed.js';

describe('Admin Module (/api/v1/admin)', () => {
  let regularUser;
  let adminUser;
  let userCookie;
  let adminCookie;

  beforeEach(async () => {
    mockPrisma.reset();

    regularUser = await mockPrisma.user.create({
      data: {
        id: 'user_regular',
        name: 'Regular Buyer',
        email: 'buyer@example.com',
        passwordHash: await bcrypt.hash('Password123!', 10),
        role: 'USER',
        isActive: true,
      },
    });

    adminUser = await mockPrisma.user.create({
      data: {
        id: 'user_admin',
        name: 'Platform Administrator',
        email: 'admin@reloop.local',
        passwordHash: await bcrypt.hash('AdminSecret123!', 10),
        role: 'ADMIN',
        isActive: true,
      },
    });

    userCookie = `${env.COOKIE_NAME}=${generateToken(regularUser)}`;
    adminCookie = `${env.COOKIE_NAME}=${generateToken(adminUser)}`;
  });

  describe('GET /api/v1/admin/ping', () => {
    it('should return 401 unauthenticated when no token is provided', async () => {
      const res = await request(app).get('/api/v1/admin/ping');

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('UNAUTHORIZED');
    });

    it('should return 403 forbidden when authenticated user has role USER', async () => {
      const res = await request(app)
        .get('/api/v1/admin/ping')
        .set('Cookie', userCookie);

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('INSUFFICIENT_PERMISSIONS');
    });

    it('should return 200 OK when authenticated user has role ADMIN', async () => {
      const res = await request(app)
        .get('/api/v1/admin/ping')
        .set('Cookie', adminCookie);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.admin.role).toBe('ADMIN');
      expect(res.body.data.admin.email).toBe('admin@reloop.local');
    });

    // Requirement 14: forged-role JWT ignored
    it('should ignore forged role in JWT payload and enforce true DB role (returning 403)', async () => {
      // Craft a forged token claiming role: 'ADMIN' for a regular user
      const forgedToken = jwt.sign(
        {
          userId: regularUser.id,
          role: 'ADMIN', // Forgery attempt
        },
        env.JWT_SECRET,
        {
          algorithm: 'HS256',
          expiresIn: '1h',
        }
      );

      const res = await request(app)
        .get('/api/v1/admin/ping')
        .set('Cookie', `${env.COOKIE_NAME}=${forgedToken}`);

      // authenticate middleware queries DB, finds user.role === 'USER', so authorizeRoles rejects with 403
      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('INSUFFICIENT_PERMISSIONS');
    });
  });

  // Requirement 14 & 1: Seed refuses to promote a normal user
  describe('Admin Seed Script Security', () => {
    it('should refuse to promote an existing non-admin user to ADMIN', async () => {
      // Downgrade the user with ADMIN_EMAIL to role 'USER'
      await mockPrisma.user.update({
        where: { id: adminUser.id },
        data: { role: 'USER' },
      });

      // runSeed should refuse to promote
      await expect(runSeed()).rejects.toThrow(/Refusing to promote existing non-admin user to ADMIN/);
    });
  });
});
