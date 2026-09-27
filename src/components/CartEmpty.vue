<script setup lang="ts">
import { ArrowLongLeftIcon, ShoppingCartIcon } from '@heroicons/vue/20/solid';
</script>

<template>
  <!-- Page Title -->
  <h1 class="mb-12">
    <span class="titleGradient">
      <slot></slot>
    </span>
  </h1>

  <!-- Empty Cart Icon -->
  <div class="bg-gray-100 rounded-full p-6 mb-4 sm:p-8 sm:mb-6">
    <ShoppingCartIcon class="w-10 h-10 sm:w-20 sm:h-20 text-gray-400" />
  </div>

  <!-- Empty Message -->
  <h2 class="mb-2">Your Cart is Empty</h2>
  <p class="text-gray-600 mb-8 text-center max-w-md">
    Start adding some treasures to your collection!
  </p>

  <!-- CTA Button -->
  <router-link :to="{ name: 'catalog' }" class="gap-2 btn btn-primary btn-md">
    <ArrowLongLeftIcon class="w-5 h-5" />
    Browse Catalog
  </router-link>
</template>
