import { authService, getCookieOptions } from '../services/authService.js';
import { env } from '../config/env.js';
import { sendSuccess } from '../utils/response.js';

export const authController = {
  /**
   * POST /api/v1/auth/register
   */
  async register(req, res, next) {
    try {
      const { name, email, password } = req.body;
      const { user, token } = await authService.register({ name, email, password });

      // Set HTTP-only cookie
      res.cookie(env.COOKIE_NAME, token, getCookieOptions());

      return sendSuccess(res, { user }, 201, 'Account registered successfully.');
    } catch (err) {
      next(err);
    }
  },

  /**
   * POST /api/v1/auth/login
   */
  async login(req, res, next) {
    try {
      const { email, password } = req.body;
      const { user, token } = await authService.login({ email, password });

      // Set HTTP-only cookie
      res.cookie(env.COOKIE_NAME, token, getCookieOptions());

      return sendSuccess(res, { user }, 200, 'Logged in successfully.');
    } catch (err) {
      next(err);
    }
  },

  /**
   * POST /api/v1/auth/logout
   */
  async logout(req, res, next) {
    try {
      res.clearCookie(env.COOKIE_NAME, {
        ...getCookieOptions(),
        maxAge: 0,
      });

      return sendSuccess(res, null, 200, 'Logged out successfully.');
    } catch (err) {
      next(err);
    }
  },

  /**
   * GET /api/v1/auth/me
   */
  async getMe(req, res, next) {
    try {
      return sendSuccess(res, { user: req.user });
    } catch (err) {
      next(err);
    }
  },

  /**
   * POST /api/v1/auth/forgot-password
   */
  async forgotPassword(req, res, next) {
    try {
      const { email } = req.body;
      const result = await authService.forgotPassword({ email });

      return sendSuccess(res, null, 200, result.message);
    } catch (err) {
      next(err);
    }
  },

  /**
   * POST /api/v1/auth/reset-password
   */
  async resetPassword(req, res, next) {
    try {
      const { token, password } = req.body;
      const result = await authService.resetPassword({ token, password });

      return sendSuccess(res, null, 200, result.message);
    } catch (err) {
      next(err);
    }
  },
};

