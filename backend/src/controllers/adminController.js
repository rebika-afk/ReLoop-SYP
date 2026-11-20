import { sendSuccess } from '../utils/response.js';

export const adminController = {
  /**
   * GET /api/v1/admin/ping
   * Admin-only health check to demonstrate role-based authorization enforcement.
   */
  async ping(req, res, next) {
    try {
      return sendSuccess(
        res,
        {
          message: 'Admin access confirmed.',
          admin: {
            id: req.user.id,
            email: req.user.email,
            role: req.user.role,
          },
          timestamp: new Date().toISOString(),
        },
        200,
        'Pong! Admin authorization verified.'
      );
    } catch (err) {
      next(err);
    }
  },
};

