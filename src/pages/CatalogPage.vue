<script setup lang="ts">
import { onMounted, ref, computed } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { storeToRefs } from 'pinia';
import type { Item } from '@/models/item';
import { useSearch } from '@/composables/useSearch';
import { formatUSD } from '@/utils/currency';
import { useCartStore } from '@/stores/cartStore';
import { useProductsStore } from '@/stores/productsStore';
import { XMarkIcon, MagnifyingGlassIcon, ArrowPathIcon } from '@heroicons/vue/24/outline';
import { getItemImage } from '@/utils/image';
import NoResults from '@/components/NoResults.vue';

//initializers
const router = useRouter();
const route = useRoute();
const productsStore = useProductsStore();
const cartStore = useCartStore();

//state
const searchTerm = ref<string>('');
const selectedCategory = ref<string>('all');
const { isLoading } = storeToRefs(productsStore);

//searching
const { queryMessage, showItems } = useSearch(searchTerm, selectedCategory);

//computed
const categoryNames = computed<Item[]>(() => {
  if (!productsStore.categoryIconItems) return [];

  return [
    ...productsStore.categoryIconItems,
    {
      id: 0,
      category: 'all',
      name: 'all categories',
      imageUrl: 'homesquare.jpg',
      description: '',
      price: 0,
      categoryIcon: true,
      circa: 0,
    },
  ];
});

//actions
onMounted(async () => {
  // Just 'fire and forget' here. If there were errors during fetch, user and Sentry have already
  // been notified.
  // Categories are populated as a side effect on the store, no need to capture a return value here.
  await productsStore.getItems();

  // Set default filter safely from active incoming url params
  if (route.params.filter) {
    selectedCategory.value = route.params.filter as string;
  }
});

const isInCart = (item: Item): boolean => cartStore.exists(item);

//Navigate to show details
const showDetails = (item: Item): void => {
  router.push({ name: 'details', params: { id: item.id } });
};
</script>

<template>
  <div v-fade-in id="parent" class="page-background">
    <div class="page-container-xl">
      <div v-if="isLoading" class="flex flex-col items-center justify-center min-h-screen">
        <ArrowPathIcon class="h-12 w-12 animate-spin text-primary mb-4" />
        <p class="text-lg text-gray-600 font-light">Loading treasures...</p>
      </div>

      <div v-else v-fade-in>
        <h1 class="headerMargins">
          <span class="titleGradient">
            Catalog
          </span>
        </h1>

        <div id="top" class="grid grid-cols-1 sm:grid-cols-[1fr_auto] gap-4 sm:gap-8 items-start">
          <div id="categories" class="grid grid-cols-5 gap-2 sm:gap-4 md:gap-6 pb-2 justify-center">
            <div class="catImages cursor-pointer group" v-for="item of categoryNames" :key="item.id"
              @click="selectedCategory = item.category">
              <div
                class="imageContainer relative w-full aspect-square overflow-hidden rounded-lg md:rounded-lg lg:rounded-2xl transition-all duration-500"
                :class="selectedCategory === item.category
                  ? 'ring-2 lg:ring-4 ring-red-500 shadow-lg scale-105'
                  : 'ring-4 ring-transparent'
                  ">
                <img :class="[
                  'w-full h-full object-cover',
                  'transform transition-all duration-500',
                  'group-hover:scale-110 group-hover:brightness-105',
                ]" :src="getItemImage(item)" :alt="item.name" />
              </div>

              <!-- Category label -->
              <div class="text-center mt-2 sm:mt-3 lg:mt-4 text-[13px] sm:text-base lg:text-lg capitalize" :class="selectedCategory === item.category
                ? 'text-primary font-semibold'
                : 'text-gray-700 group-hover:text-primary'
                ">
                {{ item.category }}
              </div>
            </div>
          </div>
          <div id="search" class="flex items-start justify-center sm:justify-end w-full">
            <div class="relative w-full max-w-100">
              <input id="searchInput" type="text" placeholder="Search collectibles..."
                class="form-input mb-0 pr-12 rounded-full shadow-md focus:shadow-lg focus:ring-2 focus:ring-primary/50"
                v-model="searchTerm" />

              <button v-if="searchTerm" type="button"
                class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-primary transition-colors duration-200"
                @click="searchTerm = ''">
                <XMarkIcon class="w-5 h-5" />
              </button>

              <MagnifyingGlassIcon v-else class="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            </div>
          </div>
        </div>
        <div id="messages" class="mt-6 mb-4">
          <!-- Query message -->
          <div v-if="queryMessage" class="text-sm text-gray-600 text-center sm:text-left mb-2 font-light">
            {{ queryMessage }}
          </div>
          <!-- No results -->
          <NoResults v-if="showItems.length === 0" />
        </div>

        <div id="items"
          class="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-6 lg:gap-8 pb-12">
          <div v-for="item in showItems" :key="item.id" class="group cursor-pointer" @click="showDetails(item)">
            <div
              class="relative overflow-hidden rounded-md md:rounded-xl lg:rounded-2xl bg-white shadow-lg transform transition-all duration-500 group-hover:scale-105 group-hover:shadow-2xl">
              <!-- Image with overlay -->
              <div class="relative aspect-square overflow-hidden bg-gray-100">
                <img v-fade-in
                  class="w-full h-full object-cover transform transition-all duration-700 group-hover:scale-110 group-hover:brightness-105"
                  :src="getItemImage(item)" :alt="item.name" />

                <!-- Gradient overlay on hover -->
                <div
                  class="absolute inset-0 bg-linear-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                </div>

                <!-- In cart badge -->
                <div v-if="isInCart(item)"
                  class="absolute top-3 right-3 bg-primary text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg animate-pulse">
                  In Cart
                </div>

                <!-- Hover "View Details" overlay -->
                <div
                  class="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div
                    class="bg-white/90 backdrop-blur-sm rounded-full px-6 py-3 transform scale-75 group-hover:scale-100 transition-transform duration-300 shadow-xl">
                    <span class="text-sm font-semibold text-primary">View Details →</span>
                  </div>
                </div>
              </div>

              <!-- Product Info -->
              <div class="p-4 bg-linear-to-t from-white to-gray-50">
                <h3 class="text-sm sm:text-base md:text-lg font-semibold 
                        text-center mb-1 line-clamp-2 
                        group-hover:text-primary transition-colors duration-300">
                  {{ item.name }}
                </h3>
                <p class="text-base sm:text-lg font-semibold text-primary text-center">
                  {{ formatUSD(item.price) }}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.scrollbar-hide {
  -ms-overflow-style: none;
  scrollbar-width: none;
}

.scrollbar-hide::-webkit-scrollbar {
  display: none;
}

.line-clamp-2 {
  overflow: hidden;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  line-clamp: 2;
  -webkit-line-clamp: 2;
}
</style>
