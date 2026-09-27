import { defineStore } from 'pinia';
import { ref, computed, readonly } from 'vue';
import type { Item } from '@/models/item';
import { fetchItems, updateItemApi, createItemApi, deleteItemApi, resetApi } from '@/api/itemApi';

export const useProductsStore = defineStore('products', () => {
  // state
  const items = ref<Item[] | null>(null);
  const loading = ref<boolean>(true);
  const haveItems = (): boolean => Array.isArray(items.value) && items.value.length > 0;

  //getters
  const isLoading = computed<boolean>(() => loading.value);
  const itemsAr = computed(() => readonly(items.value ?? []));

  const categoryIconItems = computed<Item[]>(() => {
    if (!haveItems()) return [];
    const arr = items.value as Item[];
    const categories = arr.map((item) => item.category);
    const distinctCategories = [...new Set(categories)];
    return arr.filter((i) => i.categoryIcon && distinctCategories.includes(i.category));
  });

  // actions
  const getItems = async (forceRefresh: boolean = false): Promise<[string, Item[]]> => {
    if (haveItems() && !forceRefresh) {
      loading.value = false;
      return ['', items.value as Item[]];
    }

    loading.value = true;
    try {
      const [error, fetched] = await fetchItems();
      if (error) {
        return [error, []];
      } else {
        items.value = fetched;
        return ['', fetched];
      }
    } finally {
      loading.value = false;
    }
  };

  const getItemsRefreshed = async (): Promise<[string, Item[]]> => {
    return getItems(true);
  };

  const getItem = (id: number): Item | null => {
    if (!haveItems()) return null;
    const found = (items.value as Item[]).find((item) => item.id === id);
    return found ? { ...found } : null;
  };

  const clearItems = (): void => {
    items.value = null;
  };

  const updateItem = async (currentItem: Item): Promise<string> => {
    if (!haveItems()) return 'Don\'t have any items.';
    const exists = (items.value as Item[]).some((i) => i.id === currentItem.id);
    if (!exists) return 'Don\'t have this item.';
    if (isNameTaken(currentItem.name, currentItem.id)) return 'An item with this name already exists.';
    const apiError = await updateItemApi(currentItem.id, currentItem);
    if (apiError) return apiError;
    const [refreshError] = await getItemsRefreshed(); // keep list in sync after any change
    return refreshError;
  };

  const createItem = async (newItem: Item, file: File): Promise<string> => {
    if (newItem.id !== 0) return 'Item.Id must be 0';
    if (isNameTaken(newItem.name)) return 'An item with this name already exists.';
    const apiError = await createItemApi(newItem, file);
    if (apiError) return apiError;
    const [refreshError] = await getItemsRefreshed(); // keep list in sync after any change
    return refreshError;
  };

  const deleteItem = async (id: number): Promise<string> => {
    const apiError = await deleteItemApi(id); // "" if no error, else a description
    if (apiError) return apiError;
    const [refreshError] = await getItemsRefreshed(); // keep list in sync after any change
    return refreshError;
  };

  const isNameTaken = (name: string, excludeId?: number): boolean => {
    if (!haveItems()) return false;
    const normalized = name.trim().toLowerCase();
    return (items.value as Item[]).some((i) => i.id !== excludeId && i.name.trim().toLowerCase() === normalized);
  };

  const reset = async (): Promise<string> => {
    const apiError = await resetApi();
    if (apiError) return apiError;
    const [refreshError] = await getItemsRefreshed();
    return refreshError;
  };

  return {
    getItemsRefreshed, // force a fresh fetch
    itemsAr,
    getItems,
    getItem,
    updateItem,
    createItem,
    deleteItem,
    categoryIconItems,
    clearItems,
    isLoading,
    isNameTaken,
    reset,
  };
});
