import bcrypt from 'bcryptjs';
import prisma from '../config/prisma.js';
import { sanitizeUser } from './authService.js';
import { BadRequestError, NotFoundError } from '../utils/errors.js';

export const userService = {
  /**
   * Fetches user profile by ID.
   */
  async getProfile(userId) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundError('User not found.');
    }

    return sanitizeUser(user);
  },

  /**
   * Updates user profile fields (name, phone, location, avatarUrl).
   * Email and role modifications are disallowed through this method.
   */
  async updateProfile(userId, { name, phone, location, avatarUrl }) {
    const dataToUpdate = {};

    if (name !== undefined) dataToUpdate.name = name.trim();
    if (phone !== undefined) dataToUpdate.phone = phone ? phone.trim() : null;
    if (location !== undefined) dataToUpdate.location = location ? location.trim() : null;
    if (avatarUrl !== undefined) dataToUpdate.avatarUrl = avatarUrl ? avatarUrl.trim() : null;

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: dataToUpdate,
    });

    return sanitizeUser(updatedUser);
  },

  /**
   * Changes authenticated user's password.
   * Requirement 2: Sets passwordChangedAt timestamp to invalidate older sessions.
   */
  async changePassword(userId, { currentPassword, newPassword }) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundError('User not found.');
    }

    // Verify current password
    const isCurrentValid = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!isCurrentValid) {
      throw new BadRequestError('Current password is incorrect.', 'INVALID_CURRENT_PASSWORD');
    }

    // Reject if new password equals current password
    if (currentPassword === newPassword) {
      throw new BadRequestError(
        'New password cannot be the same as your current password.',
        'SAME_PASSWORD'
      );
    }

    // Hash new password
    const passwordHash = await bcrypt.hash(newPassword, 12);

    // Requirement 2: Update passwordHash and set passwordChangedAt
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        passwordHash,
        passwordChangedAt: new Date(),
      },
    });

    return {
      message: 'Password changed successfully.',
      user: updatedUser,
    };
  },
};
