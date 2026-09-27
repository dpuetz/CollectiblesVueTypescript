import { useUserStore } from '@/stores/userStore';
import router from '@/router/router';
import * as Sentry from '@sentry/vue';
import { useNotificationStore } from '@/stores/notificationStore';

let isLoggingOut = false;

export async function apiFetch(input: RequestInfo | URL, init: RequestInit = {}): Promise<[string, Response | null]> {
  const userStore = useUserStore();
  const notificationStore = useNotificationStore();
  const headers = new Headers(init.headers);

  //add the bearer token
  if (userStore.token) {
    headers.set('Authorization', `Bearer ${userStore.token}`);
  }

  let response: Response;

  try {
    response = await fetch(input, { ...init, headers });
  } catch (e) {
    // network failure

    // notify sentry
    const errorToReport = e instanceof Error ? e : new Error(typeof e === 'string' ? e : 'Network failure');
    Sentry.captureException(errorToReport, {
      tags: { context: 'apiFetch' },
    });

    // notify user
    notificationStore.showMessage(
      'Sorry, there was a problem. The website will not work as expected. Please try again later.',
      true,
      'error',
    );

    // notify calling function
    return [errorToReport.message, null];
  }

  if (response.status === 401 || response.status === 403) {
    if (!isLoggingOut) {
      // log the user out and send them to login page.
      isLoggingOut = true;
      try {
        userStore.logout();
        await router.replace({ name: 'login' });
      } finally {
        isLoggingOut = false;
        // notify user
        if (response.status === 401)
          notificationStore.showMessage('Your session expired, please log in again.', true, 'error');
        else if (response.status === 403)
          notificationStore.showMessage(
            'You are not authorized for that action. Please notify your administrator.',
            true,
            'error',
          );
      }
    }
    return [`Authentication error (${response.status})`, null];
  }

  if (!response.ok) {
    notificationStore.showMessage('Sorry, there was an unexpected error. Please try again later.', true, 'error');
    Sentry.captureException(new Error(`Unexpected error (${response.status}) during apiFetch`), {
      extra: { apiInput: input },
    });
    return [`Unexpected error (${response.status})`, null];
  }

  return ['', response];
}
