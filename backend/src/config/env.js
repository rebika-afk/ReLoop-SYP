import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from backend/.env if present
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const isTest = (process.env.NODE_ENV || 'development') === 'test';
const isProduction = (process.env.NODE_ENV || 'development') === 'production';

// Strict check: Required variables
const requiredEnvVars = ['DATABASE_URL', 'JWT_SECRET'];
const missing = requiredEnvVars.filter((varName) => !process.env[varName] || process.env[varName].trim() === '');

if (missing.length > 0) {
  const message = `FATAL: Missing required environment variable(s): ${missing.join(', ')}. Server cannot start.`;
  console.error(message);
  throw new Error(message);
}

// Requirement 10: Enforce JWT_SECRET >= 32 chars in all non-test environments
if (!isTest && process.env.JWT_SECRET.length < 32) {
  const message = 'FATAL: JWT_SECRET must be at least 32 characters long in all non-test environments.';
  console.error(message);
  throw new Error(message);
}

// Requirement 10: Validate COOKIE_SAME_SITE ('lax' | 'strict' | 'none'; 'none' requires production/secure)
const rawSameSite = (process.env.COOKIE_SAME_SITE || 'lax').toLowerCase();
if (!['lax', 'strict', 'none'].includes(rawSameSite)) {
  const message = `FATAL: Invalid COOKIE_SAME_SITE '${rawSameSite}'. Must be one of: 'lax', 'strict', or 'none'.`;
  console.error(message);
  throw new Error(message);
}

if (rawSameSite === 'none' && !isProduction) {
  const message = "FATAL: COOKIE_SAME_SITE='none' requires production mode (Secure cookies).";
  console.error(message);
  throw new Error(message);
}

export const env = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: parseInt(process.env.PORT || '5000', 10),
  DATABASE_URL: process.env.DATABASE_URL,
  CLIENT_URL: process.env.CLIENT_URL || 'http://localhost:5173',
  JWT_SECRET: process.env.JWT_SECRET,
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
  COOKIE_NAME: process.env.COOKIE_NAME || 'reloop_token',
  COOKIE_MAX_AGE_DAYS: parseInt(process.env.COOKIE_MAX_AGE_DAYS || '7', 10),
  COOKIE_SAME_SITE: rawSameSite,
  RESET_TOKEN_TTL_MINUTES: parseInt(process.env.RESET_TOKEN_TTL_MINUTES || '60', 10),
  ADMIN_NAME: process.env.ADMIN_NAME || 'Platform Admin',
  ADMIN_EMAIL: (process.env.ADMIN_EMAIL || 'admin@reloop.local').toLowerCase().trim(),
  // Requirement 10: No default ADMIN_PASSWORD
  ADMIN_PASSWORD: process.env.ADMIN_PASSWORD || '',
  // Requirement 6: Configurable trust proxy
  TRUST_PROXY:
    process.env.TRUST_PROXY !== undefined
      ? !isNaN(process.env.TRUST_PROXY)
        ? parseInt(process.env.TRUST_PROXY, 10)
        : process.env.TRUST_PROXY
      : 1,
  isProduction,
  isTest,
};
