<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { useRouter, RouterLink } from 'vue-router';
import { LockClosedIcon, ShoppingCartIcon, HomeIcon, InformationCircleIcon, ShieldCheckIcon } from '@heroicons/vue/24/outline';
import { LockClosedIcon as LockClosedIconSolid } from '@heroicons/vue/24/solid';

//initializers
const router = useRouter();

//set up intervals
const countdown = ref(15);
const cancelled = ref(false);
let intervalId = null;
let timeoutId = null;

//start interval
onMounted(() => {
  // Countdown timer
  intervalId = setInterval(() => {
    if (countdown.value > 0 && !cancelled.value) {
      countdown.value--;
    }
  }, 1000);

  // Redirect after 15 seconds
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

//actions
const cancelRedirect = () => {
  cancelled.value = true;
  if (intervalId) clearInterval(intervalId);
  if (timeoutId) clearTimeout(timeoutId);
};

</script>


<template>
  <div v-fade-in class="page-background flex items-center justify-center">
    <div class="page-container-lg">

      <!-- Main Card -->
      <div class="card-modern text-center">

        <!-- 403 Number with Vintage Style -->
        <div class="headerMargins">
          <h1 class="text-6xl sm:text-9xl mb-2 ">
            <span class="titleGradientRed">
              403
            </span>
          </h1>
          <div class="flex justify-center gap-2">
            <div class="w-8 sm:w-16 h-1 bg-red-500 rounded-full"></div>
            <div class="w-4 sm:w-8 h-1 bg-red-400 rounded-full"></div>
            <div class="w-2 sm:w-4 h-1 bg-red-300 rounded-full"></div>
          </div>
        </div>

        <!-- Icon/Illustration -->
        <div class="flex justify-center headerMargins">
          <div class="relative">
            <!-- Locked treasure chest icon   -->
            <div class="w-20 h-20 sm:w-32 sm:h-32 rounded-full bg-linear-to-br from-red-500/10 to-red-500/5
                          flex items-center justify-center shadow-lg
                          animate-pulse">
              <LockClosedIconSolid class="w-10 h-10 sm:w-20 sm:h-20 text-red-500" />
            </div>
            <!-- Padlock icon -->
            <div class="absolute -bottom-1 -right-1 bg-white rounded-full p-2 shadow-lg">

              <LockClosedIcon class="w-4 h-4 sm:w-6 sm:h-6 text-red-500" />
            </div>
          </div>
        </div>

        <!-- Message -->
        <h2 class="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
          Access Restricted
        </h2>

        <p class="text-lg sm:text-xl text-gray-600 mb-2 max-w-2xl mx-auto leading-relaxed px-10">
          This section of our vault is reserved for authorized personnel only.
        </p>

        <p class="text-base text-gray-500 mb-8">
          You don't have permission to access this page.
        </p>

        <!-- Info Box -->
        <div class="mb-8 p-6 bg-linear-to-r from-amber-50 to-amber-100/50
                      border-2 border-amber-200 rounded-xl max-w-md mx-auto">
          <div class="flex items-start gap-3">
            <InformationCircleIcon class="w-6 h-6 text-amber-600 shrink-0 mt-0.5" />
            <div class="text-left">
              <p class="text-sm font-semibold text-amber-900 mb-1">
                Need access?
              </p>
              <p class="text-sm text-amber-800">
                Contact the administrator if you believe you should have access to this area.
              </p>
            </div>
          </div>
        </div>

        <!-- Countdown Timer -->
        <div class="text-center mb-8 p-4 
        bg-linear-to-r from-primary/5 to-primary/10 rounded-xl         
        max-w-md mx-auto">
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
            <ShoppingCartIcon class="w-5 h-5" />
            Browse Catalog
          </RouterLink>
          <router-link :to="{ name: 'home' }" class="btn btn-outline-primary btn-md gap-2">
            <HomeIcon class="w-5 h-5" />
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

      <!-- Security Notice -->
      <div class="mt-8 p-4 bg-white/50 backdrop-blur-sm rounded-xl border border-gray-200">
        <div class="flex items-start gap-3 text-left max-w-2xl mx-auto">
          <ShieldCheckIcon class="w-5 h-5 text-gray-400 shrink-0 mt-0.5" />
          <div>
            <p class="text-sm font-semibold text-gray-700 mb-1">
              Security Notice
            </p>
            <p class="text-sm text-gray-600">
              All access attempts are logged. If you're experiencing technical difficulties, please contact support.
            </p>
          </div>
        </div>
      </div>

    </div>
  </div>
</template>


<style scoped>
@keyframes pulse {

  0%,
  100% {
    opacity: 1;
  }

  50% {
    opacity: 0.7;
  }
}

.animate-pulse {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}
</style>
