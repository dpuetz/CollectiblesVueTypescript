import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import type { Item } from '@/models/item';

// `apiFetch` returns a [error, response] tuple (error is '' on success, or an
// 'HTTP error! status: N' style message on failure) — mock it at that boundary
// so these tests exercise itemApi's request-building/response-handling logic
// in isolation. `validateItemsPartial` is mocked too so `fetchItems` tests can
// control whether validation succeeds without depending on the real model
// implementation. Sentry and the notification store are mocked to assert the
// side effects fetchItems triggers when validation partially fails.
vi.mock('@/api/apiFetch', () => ({
  apiFetch: vi.fn(),
}));

vi.mock('@/models/item', () => ({
  validateItemsPartial: vi.fn(),
}));

vi.mock('@sentry/vue', () => ({
  captureException: vi.fn(),
}));

const showMessageMock = vi.fn();
vi.mock('@/stores/notificationStore', () => ({
  useNotificationStore: () => ({ showMessage: showMessageMock }),
}));

// `apiBase` in itemApi.ts is read from import.meta.env.VITE_API_URL at module
// load time, so the env var must be stubbed *before* the module is imported.
const API_BASE = 'https://api.test.local';

let fetchItems: typeof import('@/api/itemApi').fetchItems;
let updateItemApi: typeof import('@/api/itemApi').updateItemApi;
let createItemApi: typeof import('@/api/itemApi').createItemApi;
let deleteItemApi: typeof import('@/api/itemApi').deleteItemApi;
let resetApi: typeof import('@/api/itemApi').resetApi;
let apiFetchMock: ReturnType<typeof vi.fn>;
let validateItemsPartialMock: ReturnType<typeof vi.fn>;
let sentryCaptureExceptionMock: ReturnType<typeof vi.fn>;

beforeAll(async () => {
  vi.stubEnv('VITE_API_URL', API_BASE);
  ({ fetchItems, updateItemApi, createItemApi, deleteItemApi, resetApi } = await import(
    '@/api/itemApi'
  ));
  const apiFetchModule = await import('@/api/apiFetch');
  apiFetchMock = apiFetchModule.apiFetch as ReturnType<typeof vi.fn>;
  const itemModel = await import('@/models/item');
  validateItemsPartialMock = itemModel.validateItemsPartial as ReturnType<typeof vi.fn>;
  const sentry = await import('@sentry/vue');
  sentryCaptureExceptionMock = sentry.captureException as ReturnType<typeof vi.fn>;
});

beforeEach(() => {
  apiFetchMock.mockReset();
  validateItemsPartialMock.mockReset();
  sentryCaptureExceptionMock.mockReset();
  showMessageMock.mockReset();
});

// --- Helpers -----------------------------------------------------------------

// Success tuple: apiFetch resolves ['', Response] so `response?.json()` works.
function okJsonResult(body: unknown, status = 200): [string, Response] {
  return ['', new Response(JSON.stringify(body), { status })];
}

// Success tuple with a body that fails json() parsing.
function okMalformedResult(): [string, Response] {
  return ['', new Response('not json', { status: 200 })];
}

// Failure tuple: apiFetch has already turned the non-ok response into an
// error message and returns no usable response.
function errorResult(status: number): [string, undefined] {
  return [`HTTP error! status: ${status}`, undefined];
}

// Minimal Item shape for test data — adjust field names if your Item model differs.
function sampleItem(overrides: Partial<Item> = {}): Item {
  return { id: 1, name: 'Widget' as unknown, ...overrides } as Item;
}

// --- fetchItems ----------------------------------------------------------------

describe('fetchItems', () => {
  it('calls apiFetch with the items endpoint', async () => {
    apiFetchMock.mockResolvedValue(okJsonResult([]));
    validateItemsPartialMock.mockReturnValue({ validItems: [], invalidDetails: [], allValid: true });

    await fetchItems();

    expect(apiFetchMock).toHaveBeenCalledWith(`${API_BASE}/items`);
  });

  it('returns an empty error string and the parsed items on success', async () => {
    const items = [sampleItem({ id: 1 }), sampleItem({ id: 2 })];
    apiFetchMock.mockResolvedValue(okJsonResult(items));
    validateItemsPartialMock.mockReturnValue({ validItems: items, invalidDetails: [], allValid: true });

    const [error, result] = await fetchItems();

    expect(error).toBe('');
    expect(result).toEqual(items);
    expect(showMessageMock).not.toHaveBeenCalled();
    expect(sentryCaptureExceptionMock).not.toHaveBeenCalled();
  });

  it('propagates the apiFetch error and returns an empty array when the request fails', async () => {
    apiFetchMock.mockResolvedValue(errorResult(404));

    const [error, result] = await fetchItems();

    expect(error).toBe('HTTP error! status: 404');
    expect(result).toEqual([]);
    expect(validateItemsPartialMock).not.toHaveBeenCalled();
  });

  it('returns an "Invalid response format" error when the body is not valid JSON', async () => {
    apiFetchMock.mockResolvedValue(okMalformedResult());

    const [error, result] = await fetchItems();

    expect(error).toBe('Invalid response format');
    expect(result).toEqual([]);
  });

  it('drops invalid items, notifies the user, and reports to Sentry when validation partially fails', async () => {
    const rawItems = [sampleItem({ id: 1 }), { id: 'bad' }];
    const validItems = [sampleItem({ id: 1 })];
    const invalidDetails = [{ id: 'bad' }];
    apiFetchMock.mockResolvedValue(okJsonResult(rawItems));
    validateItemsPartialMock.mockReturnValue({ validItems, invalidDetails, allValid: false });

    const [error, result] = await fetchItems();

    expect(error).toBe('');
    expect(result).toEqual(validItems);
    expect(showMessageMock).toHaveBeenCalledWith(
      'Sorry, some items failed validation and were dropped.',
      false,
      'warning',
    );
    expect(sentryCaptureExceptionMock).toHaveBeenCalledWith(invalidDetails, {
      tags: { context: 'fetchItems' },
    });
  });
});

// --- updateItemApi ---------------------------------------------------------------

describe('updateItemApi', () => {
  it('sends a PUT request with the item as a JSON body', async () => {
    apiFetchMock.mockResolvedValue(okJsonResult(null));
    const item = sampleItem({ id: 7, name: 'Updated Widget' as unknown });

    await updateItemApi(7, item);

    expect(apiFetchMock).toHaveBeenCalledWith(`${API_BASE}/items/7`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(item),
    });
  });

  it('returns an empty string on success', async () => {
    apiFetchMock.mockResolvedValue(okJsonResult(null));

    const result = await updateItemApi(7, sampleItem());

    expect(result).toBe('');
  });

  it('returns an HTTP error message when the response is not ok', async () => {
    apiFetchMock.mockResolvedValue(errorResult(500));

    const result = await updateItemApi(7, sampleItem());

    expect(result).toBe('HTTP error! status: 500');
  });
});

// --- createItemApi ---------------------------------------------------------------

describe('createItemApi', () => {
  it('sends a POST request with a multipart FormData body', async () => {
    apiFetchMock.mockResolvedValue(okJsonResult(null));
    const item = sampleItem({ id: 0 });
    const file = new File(['hello'], 'photo.png', { type: 'image/png' });

    await createItemApi(item, file);

    expect(apiFetchMock).toHaveBeenCalledTimes(1);
    const [url, init] = apiFetchMock.mock.calls[0];
    expect(url).toBe(`${API_BASE}/items`);
    expect(init.method).toBe('POST');
    expect(init.body).toBeInstanceOf(FormData);

    const formData = init.body as FormData;
    expect(formData.get('item')).toBe(JSON.stringify(item));
    const sentFile = formData.get('file') as File;
    expect(sentFile.name).toBe('photo.png');
    expect(sentFile.type).toBe('image/png');
  });

  it('returns an empty string on success', async () => {
    apiFetchMock.mockResolvedValue(okJsonResult(null));
    const file = new File(['hello'], 'photo.png', { type: 'image/png' });

    const result = await createItemApi(sampleItem(), file);

    expect(result).toBe('');
  });

  it('returns an HTTP error message when the response is not ok', async () => {
    apiFetchMock.mockResolvedValue(errorResult(400));
    const file = new File(['hello'], 'photo.png', { type: 'image/png' });

    const result = await createItemApi(sampleItem(), file);

    expect(result).toBe('HTTP error! status: 400');
  });
});

// --- deleteItemApi ---------------------------------------------------------------

describe('deleteItemApi', () => {
  it('sends a DELETE request to the item endpoint', async () => {
    apiFetchMock.mockResolvedValue(okJsonResult(null));

    await deleteItemApi(42);

    expect(apiFetchMock).toHaveBeenCalledWith(`${API_BASE}/items/42`, {
      method: 'DELETE',
    });
  });

  it('returns an empty string on success', async () => {
    apiFetchMock.mockResolvedValue(okJsonResult(null));

    const result = await deleteItemApi(42);

    expect(result).toBe('');
  });

  it('returns an HTTP error message when the response is not ok', async () => {
    apiFetchMock.mockResolvedValue(errorResult(403));

    const result = await deleteItemApi(42);

    expect(result).toBe('HTTP error! status: 403');
  });
});

// --- resetApi ---------------------------------------------------------------

describe('resetApi', () => {
  it('sends a POST request to the reset endpoint', async () => {
    apiFetchMock.mockResolvedValue(okJsonResult(null));

    await resetApi();

    expect(apiFetchMock).toHaveBeenCalledWith(`${API_BASE}/reset`, {
      method: 'POST',
    });
  });

  it('returns an empty string on success', async () => {
    apiFetchMock.mockResolvedValue(okJsonResult(null));

    const result = await resetApi();

    expect(result).toBe('');
  });

  it('returns an HTTP error message when the response is not ok', async () => {
    apiFetchMock.mockResolvedValue(errorResult(500));

    const result = await resetApi();

    expect(result).toBe('HTTP error! status: 500');
  });
});