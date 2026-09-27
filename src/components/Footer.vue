<script setup lang="ts">
import { RouterLink } from 'vue-router';
const currentYear: number = new Date().getFullYear();
</script>
<template>
  <footer class="bg-linear-to-br from-gray-100 to-gray-50 border-t border-gray-200">
    <div class="page-container-xl py-8">

      <!-- Main Footer Content -->
      <div class="flex flex-col md:flex-row items-center justify-between gap-6">

        <!-- Left Side - Brand Info -->
        <div class="text-center md:text-left">

          <h3 class="text-lg sm:text-xl font-bold text-gradient mb-2">
            Collectibles Antique Mall
          </h3>

          <p class="text-sm text-gray-600">
            Curated treasures from bygone eras
          </p>
        </div>

        <!-- Center - SSL Badge -->
        <div class="flex items-center justify-center">
          <a href="https://www.positivessl.com" target="_blank" rel="noopener noreferrer"
            class="transform transition-all duration-300 hover:scale-105" title="SSL Certificate">
            <img src="https://www.positivessl.com/images/seals/positivessl_trust_seal_lg_222x54.png"
              alt="SSL Certificate" class="h-8 sm:h-10 w-auto" />
          </a>
        </div>

        <!-- Right Side - Links -->
        <div class="text-center md:text-right">
          <div class="flex flex-col sm:flex-row gap-4 text-sm">
            <RouterLink :to="{ name: 'about' }"
              class="text-gray-600 hover:text-primary transition-colors duration-300 font-medium">
              About
            </RouterLink>
            <RouterLink :to="{ name: 'catalog' }"
              class="text-gray-600 hover:text-primary transition-colors duration-300 font-medium">
              Catalog
            </RouterLink>
            <RouterLink :to="{ name: 'cart' }"
              class="text-gray-600 hover:text-primary transition-colors duration-300 font-medium">
              Cart
            </RouterLink>
          </div>
        </div>
      </div>

      <!-- Bottom Bar -->
      <div class="mt-6 pt-6 border-t border-gray-200 text-center">
        <p class="text-xs sm:text-sm text-gray-500">
          &copy; {{ currentYear }} Collectibles Antique Mall. All rights reserved.
        </p>
      </div>
    </div>
  </footer>
</template>
