import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import type { Item } from '@/models/item';

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------

const fetchItems = vi.fn();
const updateItemApi = vi.fn();
const createItemApi = vi.fn();
const deleteItemApi = vi.fn();

vi.mock('@/api/itemApi', () => ({
  fetchItems: (...args: unknown[]) => fetchItems(...args),
  updateItemApi: (...args: unknown[]) => updateItemApi(...args),
  createItemApi: (...args: unknown[]) => createItemApi(...args),
  deleteItemApi: (...args: unknown[]) => deleteItemApi(...args),
}));

import { useProductsStore } from '@/stores/productsStore';

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

const makeItem = (overrides: Partial<Item>): Item =>
  ({
    id: 1,
    name: 'Item',
    category: 'shoes',
    categoryIcon: false,
    imageUrl: 'img.jpg',
    ...overrides,
  }) as Item;

const shoesA = makeItem({ id: 1, name: 'Shoe A', category: 'shoes', categoryIcon: true });
const shoesB = makeItem({ id: 2, name: 'Shoe B', category: 'shoes', categoryIcon: false });
const hatsA = makeItem({ id: 3, name: 'Hat A', category: 'hats', categoryIcon: true });

const makeFile = () => new File(['data'], 'photo.jpg', { type: 'image/jpeg' });

// ---------------------------------------------------------------------------
// Setup / teardown
// ---------------------------------------------------------------------------

beforeEach(() => {
  setActivePinia(createPinia());
  fetchItems.mockReset().mockResolvedValue(['', [shoesA, shoesB, hatsA]]);
  updateItemApi.mockReset().mockResolvedValue('');
  createItemApi.mockReset().mockResolvedValue('');
  deleteItemApi.mockReset().mockResolvedValue('');
});

afterEach(() => {
  vi.clearAllMocks();
});

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('productsStore', () => {
  describe('initial state', () => {
    it('starts in a loading state with an empty item list', () => {
      const store = useProductsStore();

      expect(store.isLoading).toBe(true);
      expect(store.itemsAr).toEqual([]);
      expect(store.categoryIconItems).toEqual([]);
    });
  });

  describe('getItems', () => {
    it('fetches items and populates the store on first call', async () => {
      const store = useProductsStore();

      const [error, items] = await store.getItems();

      expect(fetchItems).toHaveBeenCalledTimes(1);
      expect(error).toBe('');
      expect(items).toEqual([shoesA, shoesB, hatsA]);
      expect(store.itemsAr).toEqual([shoesA, shoesB, hatsA]);
      expect(store.isLoading).toBe(false);
    });

    it('sets isLoading true while the fetch is in flight, then false', async () => {
      let resolveFetch: (value: [string, Item[]]) => void;
      fetchItems.mockReturnValueOnce(
        new Promise<[string, Item[]]>((resolve) => {
          resolveFetch = resolve;
        }),
      );

      const store = useProductsStore();
      const pending = store.getItems();

      expect(store.isLoading).toBe(true);
      resolveFetch!(['', [shoesA]]);
      await pending;

      expect(store.isLoading).toBe(false);
    });

    it('returns the cached items without re-fetching on a subsequent call', async () => {
      const store = useProductsStore();
      await store.getItems();
      fetchItems.mockClear();

      const [error, items] = await store.getItems();

      expect(fetchItems).not.toHaveBeenCalled();
      expect(error).toBe('');
      expect(items).toEqual([shoesA, shoesB, hatsA]);
      expect(store.isLoading).toBe(false);
    });

    it('re-fetches when forceRefresh is true even if items are already cached', async () => {
      const store = useProductsStore();
      await store.getItems();
      fetchItems.mockClear();
      fetchItems.mockResolvedValueOnce(['', [hatsA]]);

      const [error, items] = await store.getItems(true);

      expect(fetchItems).toHaveBeenCalledTimes(1);
      expect(error).toBe('');
      expect(items).toEqual([hatsA]);
      expect(store.itemsAr).toEqual([hatsA]);
    });

    it('propagates a fetch error and leaves the item list empty', async () => {
      fetchItems.mockResolvedValueOnce(['Network error', []]);
      const store = useProductsStore();

      const [error, items] = await store.getItems();

      expect(error).toBe('Network error');
      expect(items).toEqual([]);
      expect(store.itemsAr).toEqual([]);
      expect(store.isLoading).toBe(false);
    });

    it('sets isLoading false even when the fetch rejects the loading flag path via an error result', async () => {
      fetchItems.mockResolvedValueOnce(['boom', []]);
      const store = useProductsStore();

      await store.getItems();

      expect(store.isLoading).toBe(false);
    });
  });

  describe('getItemsRefreshed', () => {
    it('always calls fetchItems regardless of cached state', async () => {
      const store = useProductsStore();
      await store.getItems();
      fetchItems.mockClear();

      await store.getItemsRefreshed();

      expect(fetchItems).toHaveBeenCalledTimes(1);
    });
  });

  describe('getItem', () => {
    it('returns null when no items have been loaded', () => {
      const store = useProductsStore();
      expect(store.getItem(1)).toBeNull();
    });

    it('returns null when the id does not exist', async () => {
      const store = useProductsStore();
      await store.getItems();

      expect(store.getItem(999)).toBeNull();
    });

    it('returns a copy of the matching item', async () => {
      const store = useProductsStore();
      await store.getItems();

      const found = store.getItem(1);
      expect(found).toEqual(shoesA);
      expect(found).not.toBe(shoesA); // copy, not the same reference
    });
  });

  describe('clearItems', () => {
    it('resets the item list to empty and does not affect isLoading directly', async () => {
      const store = useProductsStore();
      await store.getItems();
      expect(store.itemsAr.length).toBeGreaterThan(0);

      store.clearItems();

      expect(store.itemsAr).toEqual([]);
      expect(store.getItem(1)).toBeNull();
    });
  });

  describe('isNameTaken', () => {
    it('returns false when there are no items loaded', () => {
      const store = useProductsStore();
      expect(store.isNameTaken('Shoe A')).toBe(false);
    });

    it('returns true for a case-insensitive, whitespace-trimmed match', async () => {
      const store = useProductsStore();
      await store.getItems();

      expect(store.isNameTaken('  shoe a  ')).toBe(true);
    });

    it('returns false when the only match is excluded by id', async () => {
      const store = useProductsStore();
      await store.getItems();

      expect(store.isNameTaken('Shoe A', 1)).toBe(false);
    });

    it('returns true when a different item has the same name as the excluded id', async () => {
      const store = useProductsStore();
      await store.getItems();

      // shoesA (id 1) name collides with a hypothetical rename target that
      // is NOT id 1 -- excluding id 2 shouldn't hide the collision on id 1.
      expect(store.isNameTaken('Shoe A', 2)).toBe(true);
    });
  });

  describe('updateItem', () => {
    it('rejects when there are no items loaded', async () => {
      const store = useProductsStore();
      const error = await store.updateItem(shoesA);

      expect(error).toBe('Don\'t have any items.');
      expect(updateItemApi).not.toHaveBeenCalled();
    });

    it('rejects when the item id does not exist in the store', async () => {
      const store = useProductsStore();
      await store.getItems();

      const error = await store.updateItem(makeItem({ id: 999, name: 'Ghost' }));

      expect(error).toBe('Don\'t have this item.');
      expect(updateItemApi).not.toHaveBeenCalled();
    });

    it('rejects when renaming to a name already used by another item', async () => {
      const store = useProductsStore();
      await store.getItems();

      const error = await store.updateItem({ ...shoesB, name: 'Shoe A' });

      expect(error).toBe('An item with this name already exists.');
      expect(updateItemApi).not.toHaveBeenCalled();
    });

    it('allows updating an item to keep its own existing name', async () => {
      const store = useProductsStore();
      await store.getItems();
      fetchItems.mockClear();

      const error = await store.updateItem({ ...shoesA, name: 'Shoe A' });

      expect(error).toBe('');
      expect(updateItemApi).toHaveBeenCalledWith(1, { ...shoesA, name: 'Shoe A' });
    });

    it('calls the API, refreshes the list, and returns "" on success', async () => {
      const store = useProductsStore();
      await store.getItems();
      fetchItems.mockClear();
      fetchItems.mockResolvedValueOnce(['', [shoesA, shoesB, hatsA]]);

      const error = await store.updateItem({ ...shoesB, name: 'Renamed Shoe' });

      expect(updateItemApi).toHaveBeenCalledWith(2, { ...shoesB, name: 'Renamed Shoe' });
      expect(fetchItems).toHaveBeenCalledTimes(1); // refreshed after success
      expect(error).toBe('');
    });

    it('returns the API error and does not refresh when the update call fails', async () => {
      updateItemApi.mockResolvedValueOnce('Update failed');
      const store = useProductsStore();
      await store.getItems();
      fetchItems.mockClear();

      const error = await store.updateItem(shoesA);

      expect(error).toBe('Update failed');
      expect(fetchItems).not.toHaveBeenCalled();
    });
  });

  describe('createItem', () => {
    it('rejects when the new item does not have id 0', async () => {
      const store = useProductsStore();
      const error = await store.createItem(makeItem({ id: 5, name: 'New' }), makeFile());

      expect(error).toBe('Item.Id must be 0');
      expect(createItemApi).not.toHaveBeenCalled();
    });

    it('rejects when the name is already taken', async () => {
      const store = useProductsStore();
      await store.getItems();

      const error = await store.createItem(makeItem({ id: 0, name: 'shoe a' }), makeFile());

      expect(error).toBe('An item with this name already exists.');
      expect(createItemApi).not.toHaveBeenCalled();
    });

    it('calls the API with the item and file, refreshes, and returns "" on success', async () => {
      const store = useProductsStore();
      await store.getItems();
      fetchItems.mockClear();
      const newItem = makeItem({ id: 0, name: 'Brand New' });
      const file = makeFile();

      const error = await store.createItem(newItem, file);

      expect(createItemApi).toHaveBeenCalledWith(newItem, file);
      expect(fetchItems).toHaveBeenCalledTimes(1);
      expect(error).toBe('');
    });

    it('returns the API error and does not refresh when creation fails', async () => {
      createItemApi.mockResolvedValueOnce('Create failed');
      const store = useProductsStore();

      const error = await store.createItem(makeItem({ id: 0, name: 'X' }), makeFile());

      expect(error).toBe('Create failed');
      expect(fetchItems).not.toHaveBeenCalled();
    });
  });

  describe('deleteItem', () => {
    it('calls the API, refreshes, and returns "" on success', async () => {
      const store = useProductsStore();
      await store.getItems();
      fetchItems.mockClear();

      const error = await store.deleteItem(1);

      expect(deleteItemApi).toHaveBeenCalledWith(1);
      expect(fetchItems).toHaveBeenCalledTimes(1);
      expect(error).toBe('');
    });

    it('returns the API error and does not refresh when deletion fails', async () => {
      deleteItemApi.mockResolvedValueOnce('Delete failed');
      const store = useProductsStore();

      const error = await store.deleteItem(1);

      expect(error).toBe('Delete failed');
      expect(fetchItems).not.toHaveBeenCalled();
    });
  });

  describe('categoryIconItems', () => {
    it('returns an empty array when no items are loaded', () => {
      const store = useProductsStore();
      expect(store.categoryIconItems).toEqual([]);
    });

    it('includes only items flagged as categoryIcon', async () => {
      const store = useProductsStore();
      await store.getItems();

      expect(store.categoryIconItems).toEqual([shoesA, hatsA]);
    });

    it('excludes categories entirely when none of their items are flagged', async () => {
      fetchItems.mockResolvedValueOnce(['', [shoesB]]); // categoryIcon: false
      const store = useProductsStore();
      await store.getItems();

      expect(store.categoryIconItems).toEqual([]);
    });
  });
});