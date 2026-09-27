import { computed } from 'vue';
import type { Ref } from 'vue';
import { useProductsStore } from '@/stores/productsStore';
import type { Item } from '@/models/item';

export function useSearch(searchTerm: Ref<string>, selectedCategory: Ref<string>) {
  const productsStore = useProductsStore();

  const queryMessage = computed<string>((): string => {
    const searchText = searchTerm.value.trim();
    const cat = selectedCategory.value === 'all' ? 'items' : selectedCategory.value;

    if (!searchText) {
      return `Showing all ${cat}`;
    }
    return `Search for '${searchText}' in all ${cat}`;
  });

  const showItems = computed<Item[]>((): Item[] => {
    const rawItems = productsStore.itemsAr;
    if (!rawItems || rawItems.length === 0) return [];
    const query = searchTerm.value.trim().toLowerCase();
    const activeCat = selectedCategory.value;

    return rawItems.filter((item: Item) => {
      const categoryMatch = activeCat === 'all' || item.category === activeCat;
      if (!categoryMatch) return false;
      if (!query) return true;
      return (
        item.name?.toLowerCase().includes(query) ||
        item.category?.toLowerCase().includes(query) ||
        item.description?.toLowerCase().includes(query)
      );
    });
  });

  return {
    queryMessage,
    showItems,
  };
}
