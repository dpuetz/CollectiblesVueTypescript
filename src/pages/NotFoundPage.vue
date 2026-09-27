<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { useRouter, RouterLink } from 'vue-router';
import { MagnifyingGlassIcon, HomeIcon } from '@heroicons/vue/24/outline';

//Initializers
const router = useRouter();

//state management
const cancelled = ref(false);

//actions
let intervalId = null;
let timeoutId = null;
const cancelRedirect = () => {
  cancelled.value = true;
  if (intervalId) clearInterval(intervalId);
  if (timeoutId) clearTimeout(timeoutId);
};

//page load - start interval
const countdown = ref(15);
onMounted(() => {
  // Countdown timer
  intervalId = setInterval(() => {
    if (countdown.value > 0 && !cancelled.value) {
      countdown.value--;
    }
  }, 1000);

  // Redirect 
  timeoutId = setTimeout(() => {
    if (!cancelled.value) {
      router.push('/catalog');
    }
  }, 15000);
});

//stop interval
onUnmounted(() => {
  if (intervalId) clearInterval(intervalId);
  if (timeoutId) clearTimeout(timeoutId);
});
</script>

<template>
  <div v-fade-in class="page-background flex items-center justify-center">
    <div class="page-container-lg">

      <!-- Main Card -->
      <div class="card-modern text-center">

        <!-- 404 Number with Vintage Style -->
        <div class="mb-6 sm:mb-8">
          <h1 class="text-6xl sm:text-9xl mb-2 mt-4">
            <span class="titleGradient">
              404
            </span>
          </h1>
          <div class="flex justify-center gap-2">
            <div class="w-8 sm:w-16 h-1 bg-primary rounded-full"></div>
            <div class="w-4 sm:w-8 h-1 bg-primary/80 rounded-full"></div>
            <div class="w-2 sm:w-4 h-1 bg-primary/33 rounded-full"></div>
          </div>
        </div>

        <!-- Icon/Illustration -->
        <div class="flex justify-center mb-6 sm:mb-8">
          <div class="relative">
            <!-- Treasure chest or magnifying glass icon -->
            <div class="w-10 h-10  sm:w-32 sm:h-32 rounded-full bg-linear-to-br from-primary/10 to-primary/5
                          flex items-center justify-center shadow-lg
                          animate-pulse">

              <MagnifyingGlassIcon class="w-6 h-6 sm:w-20 sm:h-20  text-primary" />

            </div>
            <!-- Question marks floating around -->
            <span class="absolute -top-2 -right-2 text-4xl text-primary/30 animate-bounce">?</span>
            <span
              class="absolute -bottom-2 -left-2 text-3xl text-primary/20 animate-bounce animation-delay-300">?</span>
          </div>
        </div>

        <!-- Message -->
        <h2 class="headerMargins">
          Treasure Not Found
        </h2>

        <p class="text-lg sm:text-xl text-gray-600 mb-2 max-w-2xl mx-auto leading-relaxed">
          This rare artifact seems to have vanished from our collection!
        </p>

        <p class="text-base text-gray-500 mb-8">
          The page you're looking for doesn't exist or has been moved.
        </p>

        <!-- Countdown Timer -->
        <div class="mb-8 p-4 bg-linear-to-r from-primary/5 to-primary/10 rounded-xl inline-block">
          <p class="text-sm text-gray-600 mb-2">
            Redirecting to catalog in
          </p>
          <div class="text-4xl font-bold text-primary font-mono">
            {{ countdown }}
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="flex flex-col sm:flex-row gap-4 justify-center">
          <RouterLink :to="{ name: 'catalog' }" class="btn btn-primary btn-md gap-2">
            <HomeIcon class="w-5 h-5 text-white" />
            Browse Catalog
          </RouterLink>
          <router-link :to="{ name: 'home' }" class="btn btn-outline-primary btn-md gap-2">
            <HomeIcon class="w-5 h-5 text-primary" />
            Go Home
          </router-link>
        </div>

        <!-- Cancel Auto-redirect -->
        <button v-if="!cancelled" @click="cancelRedirect" class="mt-6 text-sm text-gray-500 hover:text-primary
                         transition-colors duration-200 underline">
          Cancel auto-redirect
        </button>
        <div v-else class="mt-6 text-sm text-gray-600">
          Auto-redirect cancelled
        </div>
      </div>

      <!-- Helpful Links Section -->
      <div class="mt-8 text-center">
        <p class="text-sm text-gray-600 mb-4">Looking for something specific?</p>
        <div class="flex flex-wrap justify-center gap-3">
          <RouterLink :to="{ name: 'catalog' }" class="px-4 py-2 text-sm font-medium text-primary
                               hover:text-primary/80 transition-colors duration-200">
            Catalog
          </RouterLink>
          <span class="text-gray-300">•</span>
          <RouterLink :to="{ name: 'cart' }" class="px-4 py-2 text-sm font-medium text-primary
                               hover:text-primary/80 transition-colors duration-200">
            Cart
          </RouterLink>
          <span class="text-gray-300">•</span>
          <RouterLink :to="{ name: 'about' }" class="px-4 py-2 text-sm font-medium text-primary
                               hover:text-primary/80 transition-colors duration-200">
            About
          </RouterLink>
        </div>
      </div>

    </div>
  </div>
</template>


<style scoped>
@keyframes bounce {

  0%,
  100% {
    transform: translateY(0);
  }

  50% {
    transform: translateY(-10px);
  }
}

.animate-bounce {
  animation: bounce 2s ease-in-out infinite;
}

.animation-delay-300 {
  animation-delay: 0.3s;
}
</style>
