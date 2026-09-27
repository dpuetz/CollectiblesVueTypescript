<script setup lang="ts">

import { onMounted, computed } from 'vue';
import ProgressBar from '@/components/ProgressBar.vue';
import { ArrowLongLeftIcon } from '@heroicons/vue/20/solid';
import { CheckIcon } from '@heroicons/vue/24/outline';
import { useCartStore } from '@/stores/cartStore';
import { useProgressStore } from '@/stores/progressStore';

//initializers
const cartStore = useCartStore();
const progressStore = useProgressStore();

//computed
const orderNumber = computed(() => {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 1000);
  return `${timestamp}${random}`.slice(-8);
});

onMounted(() => {
  progressStore.setStepById(4);
  cartStore.checkout();
});
</script>


<template>
  <div v-fade-in class="page-background">
    <div class="page-container-lg">
      <div class="mb-8">
        <ProgressBar />
      </div>

      <div class="mt-10 mb-8 p-8
              bg-linear-to-br from-green-100/10 via-white to-green-100/10
              border border-green-200 rounded-2xl
              shadow-lg hover:shadow-xl transition-all duration-300
              text-center">
        <!-- Success Icon -->
        <div class="flex justify-center mb-6">
          <div class="w-12 h-12  sm:w-20 sm:h-20  rounded-full bg-green-100 flex items-center justify-center
                  shadow-lg animate-pulse">
            <CheckIcon class="w-8 h-8  sm:w-12 sm:h-12 text-green-600" />
          </div>
        </div>

        <div class="space-y-8">
          <!-- Success Message -->
          <h2 class="headerMargins">
            <span class="titleGradientGreen">
              Order Complete!
            </span>
          </h2>

          <p class="text-lg text-gray-700 leading-relaxed mb-2">
            Thank you for your order!
          </p>
          <p class="text-base text-gray-600">
            It's on its way!
          </p>
        </div>
        <div>
        </div>

        <!-- Order Details -->
        <div class="mb-8 p-6 mt-6
              rounded-xl border-2 border-gray-200
              bg-linear-to-br from-gray-50 to-white
              shadow-sm">
          <div class="text-center">
            <div class="text-sm text-gray-600 mb-2">Order Number</div>
            <div class="text-2xl font-bold text-gray-900 font-mono">
              #{{ orderNumber }}
            </div>
          </div>

          <div class="mt-6 pt-6 border-t border-gray-200">
            <h3 class="text-lg lg:text-2xl font-semibold text-gray-900 mb-3">What happens next?</h3>
            <div class="space-y-2 text-sm text-gray-600 text-left">
              <div class="flex items-start gap-2 ">
                <span class="text-primary font-bold">•</span>
                <span>You'll receive a confirmation email shortly</span>
              </div>
              <div class="flex items-start gap-2">
                <span class="text-primary font-bold">•</span>
                <span>Track your order status via email updates</span>
              </div>
              <div class="flex items-start gap-2">
                <span class="text-primary font-bold">•</span>
                <span>Delivery typically takes 3-5 business days</span>
              </div>
            </div>
          </div>
        </div>
        <RouterLink :to="{ name: 'catalog' }" class="gap-2 
              btn btn-outline-primary btn-md">
          <ArrowLongLeftIcon class="w-5 h-5 sm:w-6 sm:h-6" />
          Continue Shopping
        </RouterLink>
      </div>

    </div>
  </div>
</template>
