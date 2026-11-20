import crypto from 'crypto';

class MockPrisma {
  constructor() {
    this.users = new Map();
    this.passwordResetTokens = new Map();
    this._txLock = null; // Simple mutex for transaction serialization
  }

  reset() {
    this.users.clear();
    this.passwordResetTokens.clear();
    this._txLock = null;
  }

  user = {
    findUnique: async ({ where }) => {
      if (where.id) {
        return this.users.get(where.id) || null;
      }
      if (where.email) {
        for (const user of this.users.values()) {
          if (user.email.toLowerCase() === where.email.toLowerCase()) {
            return { ...user };
          }
        }
      }
      return null;
    },

    create: async ({ data }) => {
      const id = data.id || `user_${crypto.randomUUID()}`;
      const now = new Date();
      const user = {
        id,
        name: data.name,
        email: data.email,
        passwordHash: data.passwordHash,
        role: data.role || 'USER',
        avatarUrl: data.avatarUrl || null,
        phone: data.phone || null,
        location: data.location || null,
        isActive: data.isActive !== undefined ? data.isActive : true,
        passwordChangedAt: data.passwordChangedAt || null,
        createdAt: now,
        updatedAt: now,
      };
      this.users.set(id, user);
      return { ...user };
    },

    update: async ({ where, data }) => {
      let targetUser = null;
      if (where.id) {
        targetUser = this.users.get(where.id);
      }
      if (!targetUser) {
        throw new Error(`Record to update not found: ${JSON.stringify(where)}`);
      }

      const updated = {
        ...targetUser,
        ...data,
        updatedAt: new Date(),
      };
      this.users.set(targetUser.id, updated);
      return { ...updated };
    },
  };

  passwordResetToken = {
    findFirst: async ({ where }) => {
      for (const token of this.passwordResetTokens.values()) {
        let match = true;
        if (where.tokenHash && token.tokenHash !== where.tokenHash) match = false;
        if (where.used !== undefined && token.used !== where.used) match = false;
        if (where.expiresAt?.gt && !(token.expiresAt > where.expiresAt.gt)) match = false;

        if (match) {
          const user = this.users.get(token.userId);
          return {
            ...token,
            user: user ? { ...user } : null,
          };
        }
      }
      return null;
    },

    create: async ({ data }) => {
      const id = `token_${crypto.randomUUID()}`;
      const token = {
        id,
        userId: data.userId,
        tokenHash: data.tokenHash,
        expiresAt: data.expiresAt,
        used: data.used || false,
        createdAt: new Date(),
      };
      this.passwordResetTokens.set(id, token);
      return { ...token };
    },

    update: async ({ where, data }) => {
      const token = this.passwordResetTokens.get(where.id);
      if (!token) throw new Error('Token not found');
      const updated = { ...token, ...data };
      this.passwordResetTokens.set(where.id, updated);
      return { ...updated };
    },

    updateMany: async ({ where, data }) => {
      let count = 0;
      for (const [id, token] of this.passwordResetTokens.entries()) {
        let match = true;
        if (where.id && token.id !== where.id) match = false;
        if (where.userId && token.userId !== where.userId) match = false;
        if (where.used !== undefined && token.used !== where.used) match = false;

        if (match) {
          this.passwordResetTokens.set(id, { ...token, ...data });
          count++;
        }
      }
      return { count };
    },

    deleteMany: async ({ where }) => {
      let count = 0;
      for (const [id, token] of this.passwordResetTokens.entries()) {
        let match = true;
        if (where.expiresAt?.lt && !(token.expiresAt < where.expiresAt.lt)) match = false;
        if (where.userId && token.userId !== where.userId) match = false;

        if (match) {
          this.passwordResetTokens.delete(id);
          count++;
        }
      }
      return { count };
    },
  };

  $transaction = async (actionOrCallback) => {
    // Array form: resolve sequentially
    if (Array.isArray(actionOrCallback)) {
      const results = [];
      for (const action of actionOrCallback) {
        results.push(await action);
      }
      return results;
    }

    // Callback (interactive) form: serialize with a lock, snapshot state, rollback on error
    if (typeof actionOrCallback === 'function') {
      // Acquire lock (simple queue) to simulate Postgres serializable isolation
      while (this._txLock) {
        await this._txLock;
      }
      let releaseLock;
      this._txLock = new Promise((resolve) => { releaseLock = resolve; });

      // Snapshot current state
      const usersSnapshot = new Map(
        [...this.users.entries()].map(([k, v]) => [k, { ...v }])
      );
      const tokensSnapshot = new Map(
        [...this.passwordResetTokens.entries()].map(([k, v]) => [k, { ...v }])
      );

      try {
        const result = await actionOrCallback(this);
        return result;
      } catch (err) {
        // Rollback: restore snapshots
        this.users = usersSnapshot;
        this.passwordResetTokens = tokensSnapshot;
        throw err;
      } finally {
        this._txLock = null;
        releaseLock();
      }
    }

    throw new Error('$transaction expects an array or a callback function');
  };

  $connect = async () => {};
  $disconnect = async () => {};
}

export const mockPrisma = new MockPrisma();
export default mockPrisma;
