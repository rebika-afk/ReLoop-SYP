import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import prisma from '../config/prisma.js';
import { mailerService } from './mailerService.js';
import { ConflictError, UnauthorizedError, ForbiddenError, BadRequestError } from '../utils/errors.js';

// Pre-computed cost 12 bcrypt hash used to eliminate timing differences for non-existent users
const DUMMY_BCRYPT_HASH = '$2a$12$K.0HwpsoPDGaB/k1upkWyeP6v48JzY.p4.p3vE2iVqY9h1r7j8fK.';

/**
 * Returns safe user fields, excluding sensitive data like passwordHash.
 */
export const sanitizeUser = (user) => {
  if (!user) return null;
  const { passwordHash, ...safeUser } = user;
  return safeUser;
};

/**
 * Generates signed JWT authentication token.
 * Requirement 9: Uses HS256 algorithm and omits email from payload.
 */
export const generateToken = (user) => {
  return jwt.sign(
    {
      userId: user.id,
      role: user.role,
    },
    env.JWT_SECRET,
    {
      algorithm: 'HS256',
      expiresIn: env.JWT_EXPIRES_IN,
    }
  );
};

/**
 * Returns HTTP cookie options configured from environment.
 */
export const getCookieOptions = () => {
  return {
    httpOnly: true,
    secure: env.isProduction,
    sameSite: env.COOKIE_SAME_SITE,
    maxAge: env.COOKIE_MAX_AGE_DAYS * 24 * 60 * 60 * 1000,
    path: '/',
  };
};

export const authService = {
  /**
   * Register a new user with default role 'USER'.
   * Never accepts or assigns 'ADMIN' role from client input.
   * Blocks public registration of ADMIN_EMAIL (returns same error as duplicate email).
   */
  async register({ name, email, password }) {
    const normalizedEmail = email.trim().toLowerCase();

    // Block ADMIN_EMAIL registration with the same error as a taken email (no information leakage)
    if (env.ADMIN_EMAIL && normalizedEmail === env.ADMIN_EMAIL.toLowerCase().trim()) {
      throw new ConflictError('An account with this email address already exists.', 'EMAIL_ALREADY_EXISTS');
    }

    // Check if email already registered
    const existing = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (existing) {
      throw new ConflictError('An account with this email address already exists.', 'EMAIL_ALREADY_EXISTS');
    }

    // Hash password (cost factor 12)
    const passwordHash = await bcrypt.hash(password, 12);

    // Create user with explicit USER role
    const newUser = await prisma.user.create({
      data: {
        name: name.trim(),
        email: normalizedEmail,
        passwordHash,
        role: 'USER',
        isActive: true,
      },
    });

    const token = generateToken(newUser);
    return {
      user: sanitizeUser(newUser),
      token,
    };
  },

  /**
   * Login user with email & password.
   * Uses generic error to prevent account enumeration.
   * Requirement 8: Mitigates timing attacks by comparing against dummy hash if user is not found.
   */
  async login({ email, password }) {
    const normalizedEmail = email.trim().toLowerCase();

    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    // Requirement 8: Compare with dummy hash to prevent timing enumeration
    if (!user) {
      await bcrypt.compare(password, DUMMY_BCRYPT_HASH);
      throw new UnauthorizedError('Invalid email or password.', 'INVALID_CREDENTIALS');
    }

    // Compare password
    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      throw new UnauthorizedError('Invalid email or password.', 'INVALID_CREDENTIALS');
    }

    // Check if account is active/suspended
    if (!user.isActive) {
      throw new ForbiddenError(
        'Account is deactivated or suspended. Please contact support.',
        'ACCOUNT_DEACTIVATED'
      );
    }

    const token = generateToken(user);
    return {
      user: sanitizeUser(user),
      token,
    };
  },

  /**
   * Generates password reset token, hashes it, stores in database, and notifies mailer.
   * Always returns uniform success response to prevent account enumeration.
   * Requirement 3: Deletes expired tokens when a new one is created.
   * Requirement 8: Mitigates timing attacks with dummy compare for unknown emails.
   */
  async forgotPassword({ email }) {
    const normalizedEmail = email.trim().toLowerCase();
    const genericMessage = 'If an account with that email exists, a password reset link has been sent.';

    // Requirement 3: Delete expired tokens when a new one is requested
    await prisma.passwordResetToken.deleteMany({
      where: {
        expiresAt: {
          lt: new Date(),
        },
      },
    });

    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    // Requirement 8: Run dummy bcrypt compare to equalize timing for non-existent users
    if (!user || !user.isActive) {
      await bcrypt.compare('dummy-timing-mitigation', DUMMY_BCRYPT_HASH);
      return { message: genericMessage };
    }

    // Invalidate existing unused tokens for this user
    await prisma.passwordResetToken.updateMany({
      where: {
        userId: user.id,
        used: false,
      },
      data: {
        used: true,
      },
    });

    // Generate cryptographically random token
    const rawToken = crypto.randomBytes(32).toString('hex');

    // Hash the token with SHA-256 for secure storage
    const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');

    // Token expires in configured minutes (e.g. 60 min)
    const expiresAt = new Date(Date.now() + env.RESET_TOKEN_TTL_MINUTES * 60 * 1000);

    // Save hashed token
    await prisma.passwordResetToken.create({
      data: {
        userId: user.id,
        tokenHash,
        expiresAt,
        used: false,
      },
    });

    // Send email via mailer abstraction
    await mailerService.sendPasswordResetEmail(user.email, rawToken, user.name);

    return { message: genericMessage };
  },

  /**
   * Resets password using valid, unexpired, single-use token.
   * Requirement 2: Sets passwordChangedAt timestamp.
   * Requirement 1: Interactive transaction — updateMany FIRST, throw if count !== 1,
   *   then update user. User update never executes if token was already consumed.
   */
  async resetPassword({ token, password }) {
    if (!token) {
      throw new BadRequestError('Password reset token is required.', 'INVALID_RESET_TOKEN');
    }

    // Hash incoming plaintext token to match stored hash
    const tokenHash = crypto.createHash('sha256').update(token.trim()).digest('hex');

    const resetRecord = await prisma.passwordResetToken.findFirst({
      where: {
        tokenHash,
        used: false,
        expiresAt: {
          gt: new Date(),
        },
      },
      include: {
        user: true,
      },
    });

    if (!resetRecord || !resetRecord.user || !resetRecord.user.isActive) {
      throw new BadRequestError('Invalid or expired password reset token.', 'INVALID_RESET_TOKEN');
    }

    // Hash new password
    const passwordHash = await bcrypt.hash(password, 12);

    // Interactive transaction: consume token FIRST, then update user.
    // If the token was already consumed (count !== 1), throw before user update runs.
    await prisma.$transaction(async (tx) => {
      const tokenUpdate = await tx.passwordResetToken.updateMany({
        where: {
          id: resetRecord.id,
          used: false,
        },
        data: {
          used: true,
        },
      });

      if (tokenUpdate.count !== 1) {
        throw new BadRequestError('Invalid or expired password reset token.', 'INVALID_RESET_TOKEN');
      }

      await tx.user.update({
        where: { id: resetRecord.userId },
        data: {
          passwordHash,
          passwordChangedAt: new Date(),
        },
      });
    });

    return {
      message: 'Password has been reset successfully. You can now log in with your new password.',
    };
  },
};
