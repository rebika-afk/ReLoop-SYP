import { describe, it, expect } from 'vitest';
import { checkOwnership, isOwner } from '../src/utils/ownership.js';
import { ForbiddenError, UnauthorizedError } from '../src/utils/errors.js';

describe('Resource Ownership Helper (Spec Section 27 & Hardening Req 12)', () => {
  const sellerUser = { id: 'seller_123', role: 'USER' };
  const otherUser = { id: 'buyer_456', role: 'USER' };
  const adminUser = { id: 'admin_789', role: 'ADMIN' };

  const listingResource = {
    id: 'listing_001',
    sellerId: 'seller_123',
    title: 'Vintage Leather Jacket',
  };

  const genericResource = {
    id: 'item_002',
    ownerId: 'seller_123',
  };

  it('should authorize the actual owner of a listing when explicit ownerField is provided', () => {
    expect(() => checkOwnership(listingResource, sellerUser, { ownerField: 'sellerId' })).not.toThrow();
    expect(isOwner(listingResource, sellerUser, { ownerField: 'sellerId' })).toBe(true);
  });

  it('should authorize the actual owner using explicit ownerId field', () => {
    expect(() => checkOwnership(genericResource, sellerUser, { ownerField: 'ownerId' })).not.toThrow();
    expect(isOwner(genericResource, sellerUser, { ownerField: 'ownerId' })).toBe(true);
  });

  it('should reject a different user attempting to modify the resource', () => {
    expect(() => checkOwnership(listingResource, otherUser, { ownerField: 'sellerId' })).toThrow(ForbiddenError);
    expect(isOwner(listingResource, otherUser, { ownerField: 'sellerId' })).toBe(false);
  });

  it('should permit an ADMIN user to override ownership when resource exists', () => {
    expect(() => checkOwnership(listingResource, adminUser, { ownerField: 'sellerId' })).not.toThrow();
    expect(isOwner(listingResource, adminUser, { ownerField: 'sellerId' })).toBe(true);
  });

  it('should reject an ADMIN when allowAdmin is explicitly set to false', () => {
    expect(() =>
      checkOwnership(listingResource, adminUser, { ownerField: 'sellerId', allowAdmin: false })
    ).toThrow(ForbiddenError);
    expect(isOwner(listingResource, adminUser, { ownerField: 'sellerId', allowAdmin: false })).toBe(false);
  });

  it('should throw Error when ownerField option is omitted (no guessing)', () => {
    expect(() => checkOwnership(listingResource, sellerUser)).toThrow(/ownerField/);
    expect(() => checkOwnership(listingResource, sellerUser, {})).toThrow(/ownerField/);
  });

  it('should reject and return false/throw when resource is null, EVEN FOR ADMIN', () => {
    expect(() => checkOwnership(null, adminUser, { ownerField: 'sellerId' })).toThrow(ForbiddenError);
    expect(isOwner(null, adminUser, { ownerField: 'sellerId' })).toBe(false);

    expect(() => checkOwnership(null, sellerUser, { ownerField: 'sellerId' })).toThrow(ForbiddenError);
    expect(isOwner(null, sellerUser, { ownerField: 'sellerId' })).toBe(false);
  });

  it('should throw UnauthorizedError when user is null or undefined', () => {
    expect(() => checkOwnership(listingResource, null, { ownerField: 'sellerId' })).toThrow(UnauthorizedError);
    expect(isOwner(listingResource, null, { ownerField: 'sellerId' })).toBe(false);
  });
});
