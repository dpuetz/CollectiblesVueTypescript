<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { storeToRefs } from 'pinia';
import type { Item } from '@/models/item';
import { formatUSD } from '@/utils/currency';
import { useNotificationStore } from '@/stores/notificationStore';
import { ArrowLongLeftIcon, ShoppingCartIcon } from '@heroicons/vue/20/solid';
import { ArrowPathIcon, ExclamationTriangleIcon } from '@heroicons/vue/24/outline';
import { getItemImage } from '@/utils/image';
import { useProductsStore } from '@/stores/productsStore';
import { useCartStore } from '@/stores/cartStore';

//initializers
const router = useRouter();
const route = useRoute();
const notificationStore = useNotificationStore();
const productsStore = useProductsStore();
const cartStore = useCartStore();

//state management
const itemId = ref<string>(route.params.id as string);
const { isLoading } = storeToRefs(productsStore);

//computed
const item = computed<Item | null>(() => {
  return productsStore.getItem(Number(itemId.value));
});
const error = computed<boolean>(() => item.value === null);

//actions
const addToCart = (): void => {
  if (item.value) {
    const isAlreadyInCart: boolean = cartStore.exists(item.value);
    if (isAlreadyInCart) {
      notificationStore.showMessage(
        'This item is already in your cart!',
        false,
        'warning',
      );
    } else {
      cartStore.add(item.value);
    }
    router.push({ name: 'cart' });
  }
};
</script>

<template>
  <div v-fade-in id="parent" class="page-background">
    <div class="page-container-xl">
      <!-- show if loading is slow -->
      <div v-if="isLoading" class="flex flex-col items-center justify-center min-h-[60vh]">
        <ArrowPathIcon class="h-12 w-12 animate-spin text-primary mb-4" />
        <p class="text-lg text-gray-600 font-light">
          Loading treasure details...
        </p>
      </div>

      <div v-else-if="error" class="flex flex-col items-center 
                  justify-center min-h-[60vh] px-4">
        <!-- Error Icon -->
        <div class="bg-red-100 rounded-full p-4 sm:p-6 mb-6">
          <ExclamationTriangleIcon class="w-10 h-10 sm:w-20 sm:h-20 text-red-500" />
        </div>
        <!-- Error Message -->
        <h2 class="headerMargins">Item Not Found</h2>
        <p class="text-gray-600 mb-8 text-center max-w-md">
          Sorry, we couldn't load this item. It may have been removed or the
          link is incorrect.
        </p>

        <!-- Back Button -->
        <RouterLink :to="{ name: 'catalog' }" class="btn btn-primary btn-md">
          Browse Catalog
        </RouterLink>
      </div>

      <div v-if="!isLoading && !error">
        <!-- show 1 col on phones, and 2 cols on wider screens -->
        <div v-fade-in id="top" class="grid grid-cols-1 sm:grid-cols-[40%_60%] sm:gap-2 w-full">
          <div id="left">
            <!-- heading is above image on phones -->
            <h1 class="block sm:hidden text-center text-primary mb-4">
              {{ item?.name }}
            </h1>

            <!-- Image container -->
            <div
              class="relative group overflow-hidden rounded-2xl shadow-2xl mt-2 sm:mt-0 w-full sm:w-[90%] sm:ml-auto">
              <!-- Main image -->
              <img
                class="w-full aspect-square object-cover transform transition-all duration-700 group-hover:scale-105 group-hover:brightness-105"
                :src="getItemImage(item)" :alt="item?.name" />

              <!-- Gradient overlay on hover -->
              <div
                class="absolute inset-0 bg-linear-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500">
              </div>

              <!-- Category badge  -->
              <div
                class="absolute top-4 right-4 bg-white/95 backdrop-blur-md px-4 py-2 rounded-full shadow-lg transform transition-all duration-500 group-hover:scale-110">
                <span class="text-sm font-bold text-primary">Circa {{ item?.circa }}</span>
              </div>
            </div>
          </div>

          <div id="right"
            class="mt-6 sm:mt-0 w-full sm:w-[90%] mx-auto self-center rounded-2xl overflow-hidden shadow-2xl bg-white p-6 sm:p-8 transform transition-all duration-500">
            <!-- Desktop item name  inside card -->
            <h1 class="hidden sm:block text-center mb-6">
              <span class="titleGradient">
                {{ item?.name }}
              </span>
            </h1>

            <!-- Description -->
            <div class="bg-linear-to-br from-gray-50 to-white rounded-xl p-2 sm:p-6">
              <p class="text-base sm:text-lg text-gray-700 leading-relaxed">
                {{ item?.description }}
              </p>
            </div>

            <!-- Price -->
            <div class="flex items-center justify-center gap-4 mt-2">
              <span class="text-sm text-gray-500 uppercase tracking-wider">Price:</span>
              <span class="text-lg lg:text-xl xl:text-2xl font-semibold text-primary">
                {{ formatUSD(item?.price ?? 0) }}
              </span>
            </div>

            <!-- buttons -->

            <div class="flex flex-col gap-4 mt-8 sm:mt-8 lg:mt-10">
              <!-- Primary Action -->
              <button @click="addToCart" class="flex-1 
              
              btn btn-primary btn-md">
                <ShoppingCartIcon class="w-5 h-5 mr-2" />
                Add to Cart
              </button>

              <!-- Secondary Action -->
              <router-link :to="{ name: 'catalog' }" class="
              
              btn btn-outline-primary btn-md gap-2">
                <ArrowLongLeftIcon class="w-5 h-5" />
                Shop More
              </router-link>
            </div>

            <!-- Product Details Grid -->
            <div class="grid grid-cols-2 gap-4 mb-6 mt-6 lg:mt-12">
              <div class="bg-gray-50 rounded-xl p-4 text-center">
                <div class="text-sm text-gray-500 uppercase tracking-wider mb-1">
                  Category
                </div>
                <div class="text-lg font-semibold capitalize">
                  {{ item?.category }}
                </div>
              </div>

              <div class="bg-gray-50 rounded-xl p-4 text-center">
                <div class="text-sm text-gray-500 uppercase tracking-wider mb-1">
                  Condition
                </div>
                <div class="text-lg font-semibold">Excellent</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
