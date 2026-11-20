import { env } from '../config/env.js';

/**
 * Mailer service abstraction.
 * Currently prints password reset links and email payloads to server console in development.
 * // TODO: replace with email service (e.g. Resend, SendGrid, AWS SES, or Nodemailer)
 */
export const mailerService = {
  /**
   * Sends password reset email with secure one-time token link.
   *
   * @param {string} email - Destination email
   * @param {string} rawToken - Plaintext reset token
   * @param {string} name - User's name
   */
  async sendPasswordResetEmail(email, rawToken, name = 'User') {
    const resetUrl = `${env.CLIENT_URL}/reset-password?token=${encodeURIComponent(rawToken)}`;

    // Requirement 4: log reset links ONLY when NODE_ENV === 'development'
    if (env.NODE_ENV === 'development') {
      console.log('====================================================');
      console.log(`[MAILER] Password Reset Request for: ${email} (${name})`);
      console.log(`[MAILER] Reset Token: ${rawToken}`);
      console.log(`[MAILER] Reset URL: ${resetUrl}`);
      console.log(`[MAILER] Token expires in: ${env.RESET_TOKEN_TTL_MINUTES} minutes`);
      console.log('====================================================');
    }

    return {
      success: true,
      email,
      resetUrl,
    };
  },
};
