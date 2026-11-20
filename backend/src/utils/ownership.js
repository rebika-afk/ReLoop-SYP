import { ForbiddenError, UnauthorizedError } from './errors.js';

/**
 * Reusable resource ownership check helper (Spec Section 27).
 *
 * Verifies whether the authenticated user owns a given resource.
 * Requires an explicit ownerField parameter.
 * Returns false / throws when resource is null/undefined even for ADMIN.
 *
 * @param {Object} resource - The database entity/resource to check.
 * @param {Object} user - The authenticated user object (from req.user).
 * @param {Object} options
 * @param {string} options.ownerField - Explicit field name indicating ownership (e.g. 'sellerId', 'userId').
 * @param {boolean} [options.allowAdmin=true] - If true, ADMIN users bypass ownership check if resource exists.
 * @returns {boolean} true if authorized
 * @throws {ForbiddenError} if resource is null/missing or user does not own it
 * @throws {UnauthorizedError} if user is not provided
 */
export const checkOwnership = (resource, user, options = {}) => {
  // Requirement 12: Return false/throw when the resource is null even for ADMIN
  if (!resource) {
    throw new ForbiddenError('Resource does not exist or access is forbidden.');
  }

  if (!user || !user.id) {
    throw new UnauthorizedError('User must be authenticated to verify ownership.');
  }

  // Requirement 12: require explicit ownerField (no guessing)
  const { ownerField, allowAdmin = true } = options;
  if (!ownerField || typeof ownerField !== 'string') {
    throw new Error(
      "checkOwnership requires an explicit 'ownerField' string option (e.g. { ownerField: 'sellerId' })."
    );
  }

  // Requirement 12: keep allowAdmin explicit
  if (allowAdmin && user.role === 'ADMIN') {
    return true;
  }

  const resourceOwnerId = resource[ownerField];

  if (!resourceOwnerId || resourceOwnerId !== user.id) {
    throw new ForbiddenError('You do not have permission to modify or access this resource.');
  }

  return true;
};

/**
 * Non-throwing boolean check for UI/conditional logic.
 */
export const isOwner = (resource, user, options = {}) => {
  try {
    return checkOwnership(resource, user, options);
  } catch {
    return false;
  }
};
