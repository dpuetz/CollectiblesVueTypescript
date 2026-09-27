import { defineStore } from 'pinia';
import { ref, computed, readonly } from 'vue';
import type { Item } from '@/models/item';

export const useCartStore = defineStore('cart', () => {
  // state
  const cartAr = ref<Item[]>([]);

  const exists = (item: Item): boolean => cartAr.value.some((i) => i.id === item.id);

  // actions
  const add = (item: Item): void => {
    if (!exists(item)) {
      cartAr.value = [...cartAr.value, { ...item }];
    }
  };

  const remove = (item: Item): void => {
    cartAr.value = cartAr.value.filter((i) => i.id !== item.id);
  };

  const checkout = (): void => {
    cartAr.value = [];
  };

  // getters
  const cartSubTotal = computed<number>(() => cartAr.value.reduce((acc, item) => acc + item.price, 0));
  const cartTax = computed<number>(() => cartSubTotal.value * 0.05);
  const cartCount = computed<number>(() => cartAr.value.length);
  const cartShipping = computed<number>(() => cartCount.value * 5);
  const cartTotal = computed<number>(() => cartSubTotal.value + cartTax.value + cartShipping.value);

  const cart = computed(() => readonly(cartAr.value));

  return {
    add,
    exists,
    remove,
    checkout,
    cartSubTotal,
    cartTax,
    cartCount,
    cartShipping,
    cartTotal,
    cart,
  };
});
