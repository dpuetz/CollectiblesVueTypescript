import type { LoginRequest } from '@/models/loginRequest';
import { validateLoginResponse, type LoginResponse } from '@/models/loginResponse';
import { apiFetch } from '@/api/apiFetch';
import * as Sentry from '@sentry/vue';
import { useNotificationStore } from '@/stores/notificationStore';

const apiBase = import.meta.env.VITE_API_URL;

export const loginUserApi = async (user: LoginRequest): Promise<[string, LoginResponse | null]> => {
  const [err, response] = await apiFetch(`${apiBase}/Auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(user),
  });
  if (err) return [err, null];
  try {
    const json = await response?.json();
    const result = validateLoginResponse(json);
    if (!result.success) {
      const notificationStore = useNotificationStore();
      notificationStore.showMessage(
        'Sorry, your login was not successful. Please contact your administrator.',
        true,
        'error',
      );

      Sentry.captureException(result.error, {
        tags: { context: 'loginUserApi' },
      });
      return ['Invalid login request', null];
    }
    return ['', result.data];
  } catch {
    return ['Invalid response format', null];
  }
};
