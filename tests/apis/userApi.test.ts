import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import type { LoginRequest } from '@/models/loginRequest';
import type { LoginResponse } from '@/models/loginResponse';

// `apiFetch` returns a [err, response] tuple — mock it so these tests exercise
// userApi's request-building/response-handling logic in isolation.
vi.mock('@/api/apiFetch', () => ({
  apiFetch: vi.fn(),
}));

// `validateLoginResponse` is mocked too, so success/failure branches can be
// driven directly without depending on the real schema.
vi.mock('@/models/loginResponse', () => ({
  validateLoginResponse: vi.fn(),
}));

vi.mock('@/stores/notificationStore', () => ({
  useNotificationStore: vi.fn(),
}));

vi.mock('@sentry/vue', () => ({
  captureException: vi.fn(),
}));

// `apiBase` in userApi.ts is read from import.meta.env.VITE_API_URL at module
// load time, so the env var must be stubbed *before* the module is imported.
const API_BASE = 'https://api.test.local';

let loginUserApi: typeof import('@/api/userApi').loginUserApi;
let apiFetchMock: ReturnType<typeof vi.fn>;
let validateLoginResponseMock: ReturnType<typeof vi.fn>;
let useNotificationStoreMock: ReturnType<typeof vi.fn>;
let sentryCaptureExceptionMock: ReturnType<typeof vi.fn>;

beforeAll(async () => {
  vi.stubEnv('VITE_API_URL', API_BASE);
  ({ loginUserApi } = await import('@/api/userApi'));

  apiFetchMock = (await import('@/api/apiFetch')).apiFetch as ReturnType<typeof vi.fn>;
  validateLoginResponseMock = (await import('@/models/loginResponse'))
    .validateLoginResponse as ReturnType<typeof vi.fn>;
  useNotificationStoreMock = (await import('@/stores/notificationStore'))
    .useNotificationStore as ReturnType<typeof vi.fn>;
  sentryCaptureExceptionMock = (await import('@sentry/vue'))
    .captureException as ReturnType<typeof vi.fn>;
});

// --- Helpers -----------------------------------------------------------------

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), { status });
}

// Minimal request/response shapes for test data — adjust field names if your
// LoginRequest/LoginResponse models differ.
function sampleCredentials(overrides: Partial<LoginRequest> = {}): LoginRequest {
  return { username: 'jdoe', password: 'hunter2' as unknown, ...overrides } as LoginRequest;
}

function sampleLoginResponse(overrides: Partial<LoginResponse> = {}): LoginResponse {
  return { token: 'abc123' as unknown, ...overrides } as LoginResponse;
}

let showMessage: ReturnType<typeof vi.fn>;

beforeEach(() => {
  apiFetchMock.mockReset();
  validateLoginResponseMock.mockReset();
  sentryCaptureExceptionMock.mockClear();

  showMessage = vi.fn();
  useNotificationStoreMock.mockReturnValue({ showMessage });
});

// --- loginUserApi ---------------------------------------------------------------

describe('loginUserApi', () => {
  it('sends a POST request to the login endpoint with the credentials as a JSON body', async () => {
    const loginResponse = sampleLoginResponse();
    apiFetchMock.mockResolvedValue(['', jsonResponse(loginResponse)]);
    validateLoginResponseMock.mockReturnValue({ success: true, data: loginResponse });
    const credentials = sampleCredentials();

    await loginUserApi(credentials);

    expect(apiFetchMock).toHaveBeenCalledWith(`${API_BASE}/Auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials),
    });
  });

  it('returns an empty error string and the parsed login response on success', async () => {
    const loginResponse = sampleLoginResponse();
    apiFetchMock.mockResolvedValue(['', jsonResponse(loginResponse)]);
    validateLoginResponseMock.mockReturnValue({ success: true, data: loginResponse });

    const [error, result] = await loginUserApi(sampleCredentials());

    expect(error).toBe('');
    expect(result).toEqual(loginResponse);
  });

  it('returns the apiFetch error and null without attempting to parse or validate a body', async () => {
    apiFetchMock.mockResolvedValue(['HTTP error! status: 401', null]);

    const [error, result] = await loginUserApi(sampleCredentials());

    expect(error).toBe('HTTP error! status: 401');
    expect(result).toBeNull();
    expect(validateLoginResponseMock).not.toHaveBeenCalled();
  });

  it('returns an "Invalid response format" error when the body is not valid JSON', async () => {
    apiFetchMock.mockResolvedValue(['', new Response('not json', { status: 200 })]);

    const [error, result] = await loginUserApi(sampleCredentials());

    expect(error).toBe('Invalid response format');
    expect(result).toBeNull();
  });

  it('notifies the user and reports to Sentry when the response fails validation', async () => {
    const validationError = new Error('schema mismatch');
    apiFetchMock.mockResolvedValue(['', jsonResponse({ unexpected: true })]);
    validateLoginResponseMock.mockReturnValue({ success: false, error: validationError });

    const [error, result] = await loginUserApi(sampleCredentials());

    expect(error).toBe('Invalid login request');
    expect(result).toBeNull();
    expect(showMessage).toHaveBeenCalledWith(
      'Sorry, your login was not successful. Please contact your administrator.',
      true,
      'error',
    );
    expect(sentryCaptureExceptionMock).toHaveBeenCalledWith(validationError, {
      tags: { context: 'loginUserApi' },
    });
  });
});