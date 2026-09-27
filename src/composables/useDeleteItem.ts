import { ref } from 'vue';
import { useProductsStore } from '@/stores/productsStore';

interface UseDeleteItemOptions {
  onSuccess?: (id: number) => void;
  onError?: (errorMessage: string) => void;
}

// Wraps productsStore.deleteItem with loading/error state and success/error callbacks.
export function useDeleteItem(options: UseDeleteItemOptions = {}) {
  const productsStore = useProductsStore();

  const isDeleting = ref(false);
  const error = ref<string>('');

  async function deleteItem(id: number) {
    isDeleting.value = true;
    error.value = '';

    const errorMessage = await productsStore.deleteItem(id);
    const wasSuccessful = errorMessage === '';

    if (wasSuccessful) {
      options.onSuccess?.(id);
    } else {
      error.value = errorMessage;
      options.onError?.(errorMessage);
    }

    isDeleting.value = false;
  }

  return { deleteItem, isDeleting, error };
}
