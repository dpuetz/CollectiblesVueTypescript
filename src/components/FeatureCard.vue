<script setup lang="ts">
import { computed } from 'vue';
import {
  ShoppingBagIcon,
  ShoppingCartIcon,
  UserCircleIcon,
  CreditCardIcon,
  PencilSquareIcon,
  DevicePhoneMobileIcon,
} from '@heroicons/vue/24/outline';

// props
const props = defineProps<{
  icon: keyof typeof iconMap;
  title: string;
  description: string;
}>();

// Map icon names to actual components
const iconMap = {
  ShoppingBagIcon,
  ShoppingCartIcon,
  UserCircleIcon,
  CreditCardIcon,
  PencilSquareIcon,
  DevicePhoneMobileIcon,
} as const;

const iconComponent = computed<any>(() => iconMap[props.icon]);
</script>

<template>
  <div class="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
    <div class="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
      <component :is="iconComponent" class="w-6 h-6 text-primary" />
    </div>
    <h3 class="text-lg font-semibold text-gray-900 mb-2">{{ title }}</h3>
    <p class="text-gray-600 text-sm leading-relaxed">{{ description }}</p>
  </div>
</template>
