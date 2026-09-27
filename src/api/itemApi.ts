import { validateItemsPartial, type Item } from '@/models/item';
import * as Sentry from '@sentry/vue';
import { apiFetch } from '@/api/apiFetch';
import { useNotificationStore } from '@/stores/notificationStore';
const apiBase = import.meta.env.VITE_API_URL;

export const fetchItems = async (): Promise<[string, Item[]]> => {
  const [err, response] = await apiFetch(`${apiBase}/items`);
  if (err) return [err, []];
  try {
    const json = await response?.json();
    const { validItems, invalidDetails, allValid } = validateItemsPartial(json);
    if (!allValid) {
      // notify user
      const notificationStore = useNotificationStore();
      notificationStore.showMessage('Sorry, some items failed validation and were dropped.', false, 'warning');
      Sentry.captureException(invalidDetails, {
        tags: { context: 'fetchItems' },
      });
    }
    return ['', validItems];
  } catch {
    return ['Invalid response format', []];
  }
};

export const updateItemApi = async (id: number, updatedItem: Item): Promise<string> => {
  const [err] = await apiFetch(`${apiBase}/items/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updatedItem),
  });
  return err; //the api does not return an updated item. Return the error, which would be an error, or '';
};

export const createItemApi = async (newItem: Item, file: File): Promise<string> => {
  const formData = new FormData();
  formData.append('item', JSON.stringify(newItem));
  formData.append('file', file);

  const [err] = await apiFetch(`${apiBase}/items`, {
    method: 'POST',
    body: formData,
  });
  return err; //the api does not return the new item. Return the error, which would be an error, or '';
};

export const deleteItemApi = async (id: number): Promise<string> => {
  const [err] = await apiFetch(`${apiBase}/items/${id}`, {
    method: 'DELETE',
  });
  return err; //the api does not return the deleted item. Return the error, which would be an error, or '';
};

export const resetApi = async (): Promise<string> => {
  const [err] = await apiFetch(`${apiBase}/reset`, {
    method: 'POST',
  });
  return err; // err will be an error from apiFetch or '';
};
