<script setup lang="ts">
import CategoryCarousel from '@/components/CategoryCarousel.vue';
import { CodeBracketIcon } from '@heroicons/vue/24/outline';
import { ArrowLongRightIcon } from '@heroicons/vue/20/solid';
</script>

<template>
  <div v-fade-in class="page-background">

    <!-- Hero Section -->
    <div class="page-container-xl pt-10">

      <!-- Main Heading -->
      <div class="text-center">
        <h1 class="text-2xl sm:text-4xl lg:text-5xl">
          <RouterLink class="titleGradient normal-link" :to="{ name: 'catalog' }">
            Collectibles Antique Mall
          </RouterLink>
        </h1>
        <p class="text-base sm:text-xl text-gray-600 font-light max-w-2xl mx-auto mt-4">
          Curated treasures from bygone eras
        </p>
        <div class="flex justify-center mt-4">
          <RouterLink :to="{ name: 'portfolio' }" class="btn btn-outline-primary btn-md">
            <CodeBracketIcon class="w-6 h-6 mr-2" />
            View Portfolio
          </RouterLink>
        </div>
      </div>

      <!-- Main Content Grid -->
      <div v-fade-in id="colContainer" class="mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 mt-8">

        <!-- Left Column - Featured Image -->
        <div id="leftCol" class="relative group">
          <RouterLink class="block relative overflow-hidden rounded-2xl" :to="{ name: 'catalog' }">
            <img class="w-full h-auto object-cover 
                     transform transition-all duration-700 ease-out
                     group-hover:scale-105 group-hover:brightness-105
                     shadow-2xl" src="@/assets/home.jpg" alt="Collectibles Store" />

            <div class="absolute inset-0 bg-linear-to-t from-black/40 via-transparent to-transparent 
                        opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

            <div class="absolute top-6 right-6 bg-white/95 backdrop-blur-md 
                        px-5 py-3 rounded-full shadow-lg
                        transform transition-all duration-500
                        group-hover:scale-110 group-hover:shadow-xl">
              <span class="text-sm font-bold text-primary">New Arrivals Weekly</span>
            </div>

            <div class="absolute bottom-6 left-6 right-6 
                        transform translate-y-4 opacity-0 
                        group-hover:translate-y-0 group-hover:opacity-100
                        transition-all duration-500">
              <div class="bg-white/95 backdrop-blur-md rounded-xl px-6 py-4 shadow-xl">
                <span class="text-lg font-semibold text-gray-900">Explore Our Collection →</span>
              </div>
            </div>
          </RouterLink>
        </div>

        <!-- Right Column - Content -->
        <div id="rightCol" class="flex flex-col justify-center px-4 lg:px-0">

          <div id="rightColTop" class="mb-10">
            <h2 class="headerMargins">
              Discover Timeless <span class="text-primary">Treasures</span>
            </h2>

            <p class="text-lg sm:text-xl text-gray-700 leading-relaxed mb-4">
              Our eclectic collection invites you to explore unique finds and timeless pieces.
            </p>

            <p class="text-base sm:text-lg text-gray-600 leading-relaxed">
              Each item tells a story. Discover the perfect piece to spark joy and enrich your collection.
            </p>

            <div class="flex flex-col sm:flex-row gap-4 mt-8 justify-center">
              <RouterLink :to="{ name: 'catalog' }" class="btn btn-primary btn-md">
                Browse Catalog
              </RouterLink>

              <router-link :to="{ name: 'about' }" class="btn btn-outline-primary btn-md gap-2">
                Learn More
                <ArrowLongRightIcon class="w-5 h-5" />
              </router-link>
            </div>
          </div>

        </div>
      </div>

      <!-- Animated Category Grid Section -->
      <CategoryCarousel />
    </div>
  </div>
</template>