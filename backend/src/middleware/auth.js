import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import prisma from '../config/prisma.js';
import { UnauthorizedError, ForbiddenError } from '../utils/errors.js';

/**
 * Authentication middleware.
 * Verifies the JWT from HTTP-only cookie or Authorization header,
 * loads the active user from the database, and checks session validity against password changes.
 */
export const authenticate = async (req, res, next) => {
  try {
    let token = null;

    // 1. Look for token in HTTP-only cookie
    if (req.cookies && req.cookies[env.COOKIE_NAME]) {
      token = req.cookies[env.COOKIE_NAME];
    }
    // 2. Fallback to Authorization: Bearer <token> header
    else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      throw new UnauthorizedError('Authentication required. Please log in.');
    }

    // Requirement 9: Verify with algorithm HS256
    let decoded;
    try {
      decoded = jwt.verify(token, env.JWT_SECRET, { algorithms: ['HS256'] });
    } catch (err) {
      if (err.name === 'TokenExpiredError') {
        throw new UnauthorizedError('Session expired. Please log in again.', 'SESSION_EXPIRED');
      }
      throw new UnauthorizedError('Invalid authentication token.', 'INVALID_TOKEN');
    }

    const userId = decoded.userId || decoded.id;
    if (!userId) {
      throw new UnauthorizedError('Malformed token payload.', 'INVALID_TOKEN');
    }

    // Load user from database (safe fields only + passwordChangedAt)
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        avatarUrl: true,
        phone: true,
        location: true,
        isActive: true,
        passwordChangedAt: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      throw new UnauthorizedError('User account not found or has been deleted.', 'USER_NOT_FOUND');
    }

    if (!user.isActive) {
      throw new ForbiddenError('Account is deactivated or suspended. Please contact support.', 'ACCOUNT_DEACTIVATED');
    }

    // Requirement 2: Reject tokens whose iat is earlier than passwordChangedAt
    if (decoded.iat && user.passwordChangedAt) {
      const passwordChangedSeconds = Math.floor(user.passwordChangedAt.getTime() / 1000);
      if (decoded.iat < passwordChangedSeconds) {
        throw new UnauthorizedError(
          'Session expired due to password change. Please log in again.',
          'SESSION_EXPIRED'
        );
      }
    }

    req.user = user;
    next();
  } catch (err) {
    next(err);
  }
};

/**
 * Role-based authorization middleware.
 * Ensures the authenticated user has one of the allowed roles.
 *
 * @param {...string} allowedRoles - e.g. 'ADMIN', 'USER'
 */
export const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new UnauthorizedError('Authentication required.'));
    }

    if (!allowedRoles.includes(req.user.role)) {
      return next(
        new ForbiddenError(
          `Access forbidden: requires one of the following roles: [${allowedRoles.join(', ')}]`,
          'INSUFFICIENT_PERMISSIONS'
        )
      );
    }

    next();
  };
};
