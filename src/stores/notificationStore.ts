import { defineStore } from 'pinia';
import { useSnackbar } from 'vue3-snackbar';

export type NotificationStatus = 'success' | 'error' | 'warning' | 'info';

export const useNotificationStore = defineStore('notification', () => {
  const snackbar = useSnackbar();

  // actions
  const showMessage = (
    msg: string,
    shouldPersist: boolean = false,
    statusLevel: NotificationStatus = 'success',
  ): void => {
    snackbar.add({
      type: statusLevel,
      text: msg,
      duration: shouldPersist ? 0 : undefined,
    });
  };

  return {
    showMessage,
  };
});