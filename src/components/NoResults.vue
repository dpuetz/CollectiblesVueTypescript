<script setup>
import { MagnifyingGlassIcon } from '@heroicons/vue/24/outline';

defineProps({
  icon: {
    type: [Object, Function],
    default: () => MagnifyingGlassIcon
  },
  title: {
    type: String,
    default: 'No items found'
  },
  message: {
    type: String,
    default: 'Try adjusting your search'
  }
});
</script>

<template>
  <div class="flex flex-col items-center justify-center py-4 sm:py-12 px-4">
    <div class="bg-linear-to-br from-gray-100 to-gray-50 rounded-full 
                p-4 mb-3 lg:p-8 lg:mb-6 shadow-inner">
      <component :is="icon" class="w-8 h-8 lg:w-16 lg:h-16 text-gray-400" />
    </div>
    <h3 class="mb-2">
      {{ title }}
    </h3>
    <p class="text-base text-gray-600">
      {{ message }}
    </p>
  </div>
</template>