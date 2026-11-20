import { vi, beforeEach } from 'vitest';
import { mockPrisma } from './mockPrisma.js';

process.env.NODE_ENV = 'test';
process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/reloop_test';
process.env.JWT_SECRET = 'test-secret-key-that-is-at-least-32-chars-long-for-testing';
process.env.ADMIN_EMAIL = 'admin@reloop.local';
process.env.ADMIN_PASSWORD = 'TestAdminPassword123!';

vi.mock('../src/config/prisma.js', () => ({
  default: mockPrisma,
}));

beforeEach(() => {
  mockPrisma.reset();
});
