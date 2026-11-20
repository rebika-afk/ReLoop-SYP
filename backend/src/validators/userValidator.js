import { z } from 'zod';
import { passwordSchema } from './authValidator.js';

export const changePasswordSchema = z
  .object({
    currentPassword: z.string({ required_error: 'Current password is required' }).min(1, 'Current password is required'),
    newPassword: passwordSchema,
    confirmPassword: z.string({ required_error: 'Password confirmation is required' }),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'New passwords do not match',
    path: ['confirmPassword'],
  })
  .refine((data) => data.newPassword !== data.currentPassword, {
    message: 'New password cannot be the same as your current password',
    path: ['newPassword'],
  });

export const updateProfileSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, 'Name must be at least 2 characters long')
    .max(100, 'Name cannot exceed 100 characters')
    .optional(),
  phone: z
    .string()
    .trim()
    .max(30, 'Phone number cannot exceed 30 characters')
    .nullable()
    .optional(),
  location: z
    .string()
    .trim()
    .max(100, 'Location cannot exceed 100 characters')
    .nullable()
    .optional(),
  // Requirement 11: avatarUrl must be a valid https URL when not null
  avatarUrl: z
    .string()
    .trim()
    .url('Avatar URL must be a valid URL')
    .max(500, 'Avatar URL cannot exceed 500 characters')
    .refine((url) => url.startsWith('https://'), {
      message: 'Avatar URL must use HTTPS',
    })
    .nullable()
    .optional(),
});
