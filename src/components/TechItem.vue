<script setup lang="ts">
defineProps<{
  name: string,
  version: string,
  description: string,
}>();
</script>

<template>
  <div class="flex items-start text-sm">
    <div class="flex-1">
      <span class="font-semibold text-gray-900">{{ name }}</span>
      <span class="text-gray-500 ml-2">v{{ version }}</span>
      <p class="text-gray-600 mt-1">{{ description }}</p>
    </div>
  </div>
</template>
