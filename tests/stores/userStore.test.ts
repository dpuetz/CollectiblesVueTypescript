import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import type { LoginRequest } from '@/models/loginRequest';

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------

const loginUserApi = vi.fn();

vi.mock('@/api/userApi', () => ({
  loginUserApi: (...args: unknown[]) => loginUserApi(...args),
}));

import { useUserStore } from '@/stores/userStore';

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

const storedUser = {
  id: 1,
  firstName: 'Sam',
  lastName: 'Rivera',
  email: 'sam@example.com',
  groups: ['customer'],
};

const loginRequest: LoginRequest = { email: 'sam@example.com', password: 'hunter2' };

const loginApiSuccess = {
  id: 1,
  firstName: 'Sam',
  lastName: 'Rivera',
  email: 'sam@example.com',
  groups: ['customer'],
  token: 'abc123',
};

// ---------------------------------------------------------------------------
// Setup / teardown
// ---------------------------------------------------------------------------

beforeEach(() => {
  localStorage.clear();
  loginUserApi.mockReset();
});

afterEach(() => {
  vi.clearAllMocks();
  localStorage.clear();
});

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('userStore', () => {
  describe('initialization (initUser)', () => {
    it('starts logged out when localStorage has nothing stored', () => {
      setActivePinia(createPinia());
      const store = useUserStore();

      expect(store.currentUser).toBeNull();
      expect(store.token).toBeNull();
      expect(store.isLoggedIn).toBe(false);
      expect(store.groups).toEqual([]);
    });

    it('hydrates currentUser and token from localStorage when both are present', () => {
      localStorage.setItem('currentUser', JSON.stringify(storedUser));
      localStorage.setItem('token', 'stored-token');

      setActivePinia(createPinia());
      const store = useUserStore();

      expect(store.currentUser).toEqual(storedUser);
      expect(store.token).toBe('stored-token');
      expect(store.isLoggedIn).toBe(true);
      expect(store.groups).toEqual(['customer']);
    });

    it('clears both localStorage keys when the stored user JSON is malformed', () => {
      localStorage.setItem('currentUser', '{not valid json');
      localStorage.setItem('token', 'stored-token');

      setActivePinia(createPinia());
      const store = useUserStore();

      expect(store.currentUser).toBeNull();
      expect(localStorage.getItem('currentUser')).toBeNull();
      expect(localStorage.getItem('token')).toBeNull();
    });

    it('leaves token null if a token is stored without a corresponding user', () => {
      // initUser only reads/sets token inside the `if (storedUser)` branch,
      // so a stray token with no user should not populate store.token.
      localStorage.setItem('token', 'orphan-token');

      setActivePinia(createPinia());
      const store = useUserStore();

      expect(store.currentUser).toBeNull();
      expect(store.token).toBeNull();
    });
  });

  describe('defaultUsers', () => {
    it('exposes the two built-in seed accounts', () => {
      setActivePinia(createPinia());
      const store = useUserStore();

      expect(store.defaultUsers).toHaveLength(2);
      expect(store.defaultUsers.map((u) => u.role)).toEqual(['admin', 'guest']);
      expect(store.defaultUsers.map((u) => u.email)).toEqual(['Pat@pats.com', 'Jam@Jamalot.com']);
    });
  });

  describe('login', () => {
    beforeEach(() => {
      setActivePinia(createPinia());
    });

    it('sets currentUser and token, and persists both to localStorage on success', async () => {
      loginUserApi.mockResolvedValueOnce(['', loginApiSuccess]);
      const store = useUserStore();

      const error = await store.login(loginRequest);

      expect(error).toBe('');
      expect(loginUserApi).toHaveBeenCalledWith(loginRequest);
      expect(store.currentUser).toEqual({
        id: 1,
        firstName: 'Sam',
        lastName: 'Rivera',
        email: 'sam@example.com',
        groups: ['customer'],
      });
      expect(store.token).toBe('abc123');
      expect(store.isLoggedIn).toBe(true);
      expect(JSON.parse(localStorage.getItem('currentUser') ?? 'null')).toEqual(store.currentUser);
      expect(localStorage.getItem('token')).toBe('abc123');
    });

    it('does not leak the raw API token field into currentUser', async () => {
      loginUserApi.mockResolvedValueOnce(['', loginApiSuccess]);
      const store = useUserStore();

      await store.login(loginRequest);

      expect(store.currentUser).not.toHaveProperty('token');
    });

    it('returns the API error and leaves auth state untouched when the API errors', async () => {
      loginUserApi.mockResolvedValueOnce(['Invalid credentials', null]);
      const store = useUserStore();

      const error = await store.login(loginRequest);

      expect(error).toBe('Invalid credentials');
      expect(store.currentUser).toBeNull();
      expect(store.token).toBeNull();
      expect(localStorage.getItem('currentUser')).toBeNull();
      expect(localStorage.getItem('token')).toBeNull();
    });

    it('returns a fallback error when there is no error but also no data', async () => {
      loginUserApi.mockResolvedValueOnce(['', null]);
      const store = useUserStore();

      const error = await store.login(loginRequest);

      expect(error).toBe('Login failed');
      expect(store.currentUser).toBeNull();
    });

    it('prefers the API error message over the fallback when both are absent-ish', async () => {
      loginUserApi.mockResolvedValueOnce(['Account locked', null]);
      const store = useUserStore();

      const error = await store.login(loginRequest);

      expect(error).toBe('Account locked');
    });

    it('overwrites a previously logged-in user on a fresh successful login', async () => {
      localStorage.setItem('currentUser', JSON.stringify(storedUser));
      localStorage.setItem('token', 'old-token');
      setActivePinia(createPinia()); // re-init so the store picks up the seeded state
      const store = useUserStore();
      expect(store.isLoggedIn).toBe(true);

      const otherUser = { ...loginApiSuccess, id: 2, firstName: 'Alex', token: 'new-token' };
      loginUserApi.mockResolvedValueOnce(['', otherUser]);

      await store.login({ email: 'alex@example.com', password: 'pw' });

      expect(store.currentUser?.id).toBe(2);
      expect(store.currentUser?.firstName).toBe('Alex');
      expect(store.token).toBe('new-token');
    });
  });

  describe('logout', () => {
    it('clears currentUser, token, and both localStorage keys', async () => {
      loginUserApi.mockResolvedValueOnce(['', loginApiSuccess]);
      setActivePinia(createPinia());
      const store = useUserStore();
      await store.login(loginRequest);
      expect(store.isLoggedIn).toBe(true);

      store.logout();

      expect(store.currentUser).toBeNull();
      expect(store.token).toBeNull();
      expect(store.isLoggedIn).toBe(false);
      expect(store.groups).toEqual([]);
      expect(localStorage.getItem('currentUser')).toBeNull();
      expect(localStorage.getItem('token')).toBeNull();
    });

    it('is a safe no-op when called while already logged out', () => {
      setActivePinia(createPinia());
      const store = useUserStore();

      expect(() => store.logout()).not.toThrow();
      expect(store.currentUser).toBeNull();
      expect(store.token).toBeNull();
    });
  });

  describe('groups', () => {
    it('reflects the current user\'s groups', async () => {
      loginUserApi.mockResolvedValueOnce(['', { ...loginApiSuccess, groups: ['admin', 'beta'] }]);
      setActivePinia(createPinia());
      const store = useUserStore();

      await store.login(loginRequest);

      expect(store.groups).toEqual(['admin', 'beta']);
    });

    it('returns an empty array when the current user has no groups defined', async () => {
      const { groups: _omit, ...userWithoutGroups } = loginApiSuccess;
      loginUserApi.mockResolvedValueOnce(['', userWithoutGroups]);
      setActivePinia(createPinia());
      const store = useUserStore();

      await store.login(loginRequest);

      expect(store.groups).toEqual([]);
    });
  });
});