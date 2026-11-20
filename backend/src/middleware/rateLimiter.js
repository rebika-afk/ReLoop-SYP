import rateLimit from 'express-rate-limit';
import { env } from '../config/env.js';

const isTest = env.isTest;

/**
 * Creates a rate limiter instance with consistent JSON response format.
 */
const createLimiter = (options) => {
  if (isTest) {
    // In test environment, skip throttling so test suites run smoothly
    return (req, res, next) => next();
  }

  return rateLimit({
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
      res.status(429).json({
        success: false,
        error: {
          code: 'RATE_LIMIT_EXCEEDED',
          message: options.message || 'Too many requests, please try again later.',
        },
      });
    },
    ...options,
  });
};

// Requirement 7: 15-minute window, max 10 failed login attempts, keyed by IP + email, skipSuccessfulRequests: true
export const loginLimiter = createLimiter({
  windowMs: 15 * 60 * 1000,
  max: 10,
  skipSuccessfulRequests: true,
  keyGenerator: (req) => {
    const email = (req.body?.email || '').toLowerCase().trim();
    const ip = req.ip || req.socket?.remoteAddress || 'unknown';
    return `${ip}_${email}`;
  },
  message: 'Too many login attempts. Please try again after 15 minutes.',
});

// Requirement 4: IP-only login limiter — 30 failed attempts / 15 min, skipSuccessfulRequests: true
export const loginIpLimiter = createLimiter({
  windowMs: 15 * 60 * 1000,
  max: 30,
  skipSuccessfulRequests: true,
  message: 'Too many login attempts from this IP. Please try again after 15 minutes.',
});

// Requirement 7: 1-hour window, max 5 registration requests per IP (comment and value matching at 5)
export const registerLimiter = createLimiter({
  windowMs: 60 * 60 * 1000,
  max: 5,
  message: 'Too many accounts created from this IP. Please try again after an hour.',
});

// 15-minute window, max 5 password reset requests per IP
export const forgotPasswordLimiter = createLimiter({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: 'Too many password reset requests. Please try again after 15 minutes.',
});

// Requirement 7: 15-minute window, max 5 reset-password submissions per IP
export const resetPasswordLimiter = createLimiter({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: 'Too many password reset attempts. Please try again after 15 minutes.',
});

// Requirement 7: 15-minute window, max 5 change-password submissions per IP
export const changePasswordLimiter = createLimiter({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: 'Too many password change attempts. Please try again after 15 minutes.',
});
