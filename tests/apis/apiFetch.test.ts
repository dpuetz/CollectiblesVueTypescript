import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

// --- Mocks -----------------------------------------------------------------
// Adjust these import paths if your alias config differs from the source file.
vi.mock('@/stores/userStore', () => ({
  useUserStore: vi.fn(),
}));

vi.mock('@/stores/notificationStore', () => ({
  useNotificationStore: vi.fn(),
}));

vi.mock('@/router/router', () => ({
  default: { replace: vi.fn() },
}));

vi.mock('@sentry/vue', () => ({
  captureException: vi.fn(),
}));

describe('apiFetch', () => {
  let fetchMock: ReturnType<typeof vi.fn>;
  let userStoreMock: { token: string | null; logout: ReturnType<typeof vi.fn> };
  let notificationStoreMock: { showMessage: ReturnType<typeof vi.fn> };
  let routerMock: { replace: ReturnType<typeof vi.fn> };
  let sentryMock: { captureException: ReturnType<typeof vi.fn> };
  let apiFetch: typeof import('@/api/apiFetch').apiFetch;

  beforeEach(async () => {
    // Fresh module registry each test so the module-level `isLoggingOut`
    // flag doesn't leak state between tests.
    vi.resetModules();

    fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);

    userStoreMock = {
      token: null,
      logout: vi.fn(),
    };
    const { useUserStore } = await import('@/stores/userStore');
    (useUserStore as ReturnType<typeof vi.fn>).mockReturnValue(userStoreMock);

    notificationStoreMock = {
      showMessage: vi.fn(),
    };
    const { useNotificationStore } = await import('@/stores/notificationStore');
    (useNotificationStore as ReturnType<typeof vi.fn>).mockReturnValue(notificationStoreMock);

    const routerModule = await import('@/router/router');
    routerMock = routerModule.default as unknown as { replace: ReturnType<typeof vi.fn> };
    routerMock.replace.mockReset();
    routerMock.replace.mockResolvedValue(undefined);

    sentryMock = (await import('@sentry/vue')) as unknown as { captureException: ReturnType<typeof vi.fn> };
    sentryMock.captureException.mockReset();

    ({ apiFetch } = await import('@/api/apiFetch'));
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('adds an Authorization header when a token is present', async () => {
    userStoreMock.token = 'abc123';
    fetchMock.mockResolvedValue(new Response(null, { status: 200 }));

    await apiFetch('/api/things');

    const [, init] = fetchMock.mock.calls[0];
    const headers = init.headers as Headers;
    expect(headers.get('Authorization')).toBe('Bearer abc123');
  });

  it('does not add an Authorization header when there is no token', async () => {
    userStoreMock.token = null;
    fetchMock.mockResolvedValue(new Response(null, { status: 200 }));

    await apiFetch('/api/things');

    const [, init] = fetchMock.mock.calls[0];
    const headers = init.headers as Headers;
    expect(headers.has('Authorization')).toBe(false);
  });

  it('preserves caller-supplied headers and init options', async () => {
    userStoreMock.token = 'abc123';
    fetchMock.mockResolvedValue(new Response(null, { status: 200 }));

    await apiFetch('/api/things', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ hello: 'world' }),
    });

    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe('/api/things');
    expect(init.method).toBe('POST');
    expect(init.body).toBe(JSON.stringify({ hello: 'world' }));
    const headers = init.headers as Headers;
    expect(headers.get('Content-Type')).toBe('application/json');
    expect(headers.get('Authorization')).toBe('Bearer abc123');
  });

  it('returns an empty error and the raw Response unmodified on a normal successful call', async () => {
    const okResponse = new Response(JSON.stringify({ ok: true }), { status: 200 });
    fetchMock.mockResolvedValue(okResponse);

    const [error, response] = await apiFetch('/api/things');

    expect(error).toBe('');
    expect(response).toBe(okResponse);
    expect(userStoreMock.logout).not.toHaveBeenCalled();
    expect(routerMock.replace).not.toHaveBeenCalled();
    expect(notificationStoreMock.showMessage).not.toHaveBeenCalled();
  });

  it('on a network failure (fetch throwing an Error): reports to Sentry, notifies the user, and returns [message, null]', async () => {
    fetchMock.mockRejectedValue(new Error('Failed to fetch'));

    const [error, response] = await apiFetch('/api/things');

    expect(error).toBe('Failed to fetch');
    expect(response).toBeNull();
    expect(sentryMock.captureException).toHaveBeenCalledWith(expect.objectContaining({ message: 'Failed to fetch' }), {
      tags: { context: 'apiFetch' },
    });
    expect(notificationStoreMock.showMessage).toHaveBeenCalledWith(
      'Sorry, there was a problem. The website will not work as expected. Please try again later.',
      true,
      'error',
    );
  });

  it('wraps a thrown string rejection in an Error using the string itself as the message', async () => {
    fetchMock.mockRejectedValue('some string rejection');

    const [error, response] = await apiFetch('/api/things');

    expect(error).toBe('some string rejection');
    expect(response).toBeNull();
    expect(sentryMock.captureException).toHaveBeenCalledWith(
      expect.objectContaining({ message: 'some string rejection' }),
      expect.anything(),
    );
  });

  it('falls back to a generic "Network failure" message for a thrown non-Error, non-string value', async () => {
    fetchMock.mockRejectedValue({ weird: 'object' });

    const [error, response] = await apiFetch('/api/things');

    expect(error).toBe('Network failure');
    expect(response).toBeNull();
  });

  it('on 401: logs out, redirects to login, shows the session-expired message, and returns an auth error', async () => {
    fetchMock.mockResolvedValue(new Response(null, { status: 401 }));

    const [error, response] = await apiFetch('/api/things');

    expect(userStoreMock.logout).toHaveBeenCalledTimes(1);
    expect(routerMock.replace).toHaveBeenCalledWith({ name: 'login' });
    expect(notificationStoreMock.showMessage).toHaveBeenCalledWith(
      'Your session expired, please log in again.',
      true,
      'error',
    );
    expect(error).toBe('Authentication error (401)');
    expect(response).toBeNull();
  });

  it('on 403: also logs out and redirects to login, but with a not-authorized message', async () => {
    // 403 shares the exact same logout-and-redirect path as 401 — only the
    // notification text differs. This is a real behavior change from the
    // previous version, which routed 403s to an "unauthorized" page without
    // logging the user out.
    fetchMock.mockResolvedValue(new Response(null, { status: 403 }));

    const [error, response] = await apiFetch('/api/things');

    expect(userStoreMock.logout).toHaveBeenCalledTimes(1);
    expect(routerMock.replace).toHaveBeenCalledWith({ name: 'login' });
    expect(notificationStoreMock.showMessage).toHaveBeenCalledWith(
      'You are not authorized for that action. Please notify your administrator.',
      true,
      'error',
    );
    expect(error).toBe('Authentication error (403)');
    expect(response).toBeNull();
  });

  it('propagates a rejected router.replace after a 401, having already logged out and notified', async () => {
    fetchMock.mockResolvedValue(new Response(null, { status: 401 }));
    routerMock.replace.mockRejectedValueOnce(new Error('nav aborted'));

    await expect(apiFetch('/api/things')).rejects.toThrow('nav aborted');

    // logout and the notification (both in the `finally`) still ran before
    // the navigation failure propagated out of apiFetch.
    expect(userStoreMock.logout).toHaveBeenCalledTimes(1);
    expect(notificationStoreMock.showMessage).toHaveBeenCalledWith(
      'Your session expired, please log in again.',
      true,
      'error',
    );
  });

  it('reports non-ok, non-auth statuses (e.g. 500) to Sentry and returns an unexpected-error message', async () => {
    fetchMock.mockResolvedValue(new Response(null, { status: 500 }));

    const [error, response] = await apiFetch('/api/things');

    expect(error).toBe('Unexpected error (500)');
    expect(response).toBeNull();
    expect(userStoreMock.logout).not.toHaveBeenCalled();
    expect(routerMock.replace).not.toHaveBeenCalled();
    expect(notificationStoreMock.showMessage).toHaveBeenCalledWith(
      'Sorry, there was an unexpected error. Please try again later.',
      true,
      'error',
    );
    expect(sentryMock.captureException).toHaveBeenCalledWith(
      expect.objectContaining({ message: 'Unexpected error (500) during apiFetch' }),
      { extra: { apiInput: '/api/things' } },
    );
  });

  it('does not re-enter logout logic for concurrent 401/403 responses (isLoggingOut guard)', async () => {
    fetchMock.mockResolvedValue(new Response(null, { status: 401 }));

    // `isLoggingOut` is set synchronously and only cleared once the
    // awaited router.replace() settles, so stall that call to simulate
    // two auth-error responses racing while the flag is still true.
    let releaseNavigation: () => void = () => {};
    routerMock.replace.mockImplementation(
      () =>
        new Promise<void>((resolve) => {
          releaseNavigation = resolve;
        }),
    );

    const first = apiFetch('/api/things');
    // Let the first call run synchronously up through setting isLoggingOut = true.
    await Promise.resolve();

    const second = apiFetch('/api/other');

    releaseNavigation();
    await Promise.all([first, second]);

    expect(userStoreMock.logout).toHaveBeenCalledTimes(1);
    expect(routerMock.replace).toHaveBeenCalledTimes(1);
  });
});