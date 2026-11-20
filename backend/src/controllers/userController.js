import { userService } from '../services/userService.js';
import { generateToken, getCookieOptions } from '../services/authService.js';
import { env } from '../config/env.js';
import { sendSuccess } from '../utils/response.js';

export const userController = {
  /**
   * GET /api/v1/users/me
   */
  async getMe(req, res, next) {
    try {
      const user = await userService.getProfile(req.user.id);
      return sendSuccess(res, { user });
    } catch (err) {
      next(err);
    }
  },

  /**
   * PATCH /api/v1/users/me
   */
  async updateMe(req, res, next) {
    try {
      const { name, phone, location, avatarUrl } = req.body;
      const updatedUser = await userService.updateProfile(req.user.id, {
        name,
        phone,
        location,
        avatarUrl,
      });

      return sendSuccess(res, { user: updatedUser }, 200, 'Profile updated successfully.');
    } catch (err) {
      next(err);
    }
  },

  /**
   * PATCH /api/v1/users/me/password
   * Issues a fresh JWT cookie after success so the current session stays valid.
   */
  async changePassword(req, res, next) {
    try {
      const { currentPassword, newPassword } = req.body;
      const result = await userService.changePassword(req.user.id, {
        currentPassword,
        newPassword,
      });

      // Issue fresh JWT so the current session survives while older tokens are rejected
      const token = generateToken(result.user);
      res.cookie(env.COOKIE_NAME, token, getCookieOptions());

      return sendSuccess(res, null, 200, result.message);
    } catch (err) {
      next(err);
    }
  },
};

