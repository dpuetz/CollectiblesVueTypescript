<script setup lang="ts">
import { ref, computed, onUnmounted, onMounted, watch } from 'vue';
import { ChevronRightIcon } from '@heroicons/vue/24/outline';
import { getItemImage } from '@/utils/image';
import { useProductsStore } from '@/stores/productsStore';
import type { Item } from '@/models/item';
import { storeToRefs } from 'pinia';

//initializers
const productsStore = useProductsStore();
const { itemsAr } = storeToRefs(productsStore);
const isReady = ref<boolean>(false);

// computeds
const categories = computed<Item[]>(() => productsStore.categoryIconItems);

// types
type CategoryKey = string;

onMounted(async () => {
  // categories are populated as a side effect on the store
  await productsStore.getItemsRefreshed();
});


//state
const currentImages = ref<Record<CategoryKey, Item>>({});
const categoryIndices = ref<Record<CategoryKey, number>>({});
let carouselInterval: number | null = null;
const CAROUSEL_INTERVAL = 1000;

// --- UPDATE CATEGORY IMAGE ---
const updateCategoryImage = (category: string): void => {
  const filtered = productsStore.itemsAr.filter((item) => item.category === category);
  if (filtered.length === 0) return;

  if (categoryIndices.value[category] === undefined) {
    categoryIndices.value[category] = 0;
  }

  const index = categoryIndices.value[category];
  currentImages.value[category] = filtered[index];
  categoryIndices.value[category] = (index + 1) % filtered.length;
};

// --- START CAROUSEL ---
const startCarousel = (): void => {
  if (carouselInterval) return;

  categories.value.forEach((cat) => updateCategoryImage(cat.category));

  let currentCategoryIndex = 0;

  carouselInterval = window.setInterval(() => {
    const category = categories.value[currentCategoryIndex].category;
    updateCategoryImage(category);
    currentCategoryIndex = (currentCategoryIndex + 1) % categories.value.length;
  }, CAROUSEL_INTERVAL);
};

// --- STOP CAROUSEL ---
const stopCarousel = (): void => {
  if (carouselInterval !== null) {
    clearInterval(carouselInterval);
    carouselInterval = null;
  }
};

onUnmounted(() => {
  stopCarousel();
});

// wait for data to actually land before rendering/starting the carousel
watch(
  [itemsAr, categories],
  ([itemsVal, categoriesVal]) => {
    if (itemsVal.length > 0 && categoriesVal.length > 0 && !isReady.value) {
      isReady.value = true;
      startCarousel();
    }
  },
  { immediate: true },
);
</script>

<template>
  <div class="mt-10" v-if="isReady">
    <div class="text-center">
      <h2>Shop by Category</h2>
    </div>
    <div class="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 lg:gap-8 mt-10">
      <div v-for="category of categories" :key="category.id" class="group cursor-pointer">
        <RouterLink :to="{ name: 'catalog', params: { filter: category.category } }" class="block">
          <div class="relative overflow-hidden rounded-2xl shadow-lg 
            bg-white
            transform transition-all duration-500
            group-hover:scale-105 group-hover:shadow-2xl">

            <!-- Image Container with animation -->
            <div class="aspect-square overflow-hidden relative bg-gray-100">
              <transition name="category-fade" mode="out-in">
                <img v-if="currentImages[category.category]" :key="currentImages[category.category].id" class="w-full h-full object-cover 
                    transform transition-transform duration-700
                    group-hover:scale-110" :src="getItemImage(currentImages[category.category])"
                  :alt="currentImages[category.category].name" />
              </transition>

              <!-- Gradient Overlay -->
              <div class="absolute inset-0 bg-linear-to-t 
                from-black/70 via-black/30 to-transparent
                opacity-60 group-hover:opacity-80
                transition-opacity duration-500">
              </div>

              <!-- Hover Arrow -->
              <div class="absolute inset-0 flex items-center justify-center
                opacity-0 group-hover:opacity-100
                transition-opacity duration-300">
                <div class="bg-white/20 backdrop-blur-sm rounded-full p-3
                    transform scale-75 group-hover:scale-100
                    transition-transform duration-300">
                  <ChevronRightIcon class="h-6 w-6 text-gray-200" />
                </div>
              </div>
            </div>

            <!-- Category Info -->
            <div class="p-4 bg-linear-to-t from-white to-gray-50">
              <h4 class="font-bold text-base sm:text-lg text-gray-900 text-center
                group-hover:text-primary transition-colors duration-300 capitalize">
                {{ category.category }}
              </h4>
            </div>
          </div>
        </RouterLink>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Smooth fade transition for category images */
.category-fade-enter-active,
.category-fade-leave-active {
  transition: opacity 0.3s ease-in-out, transform 0.3s ease-in-out;
}

.category-fade-enter-from {
  opacity: 0;
  transform: scale(1.05);
}

.category-fade-leave-to {
  opacity: 0;
  transform: scale(0.95);
}
</style>
