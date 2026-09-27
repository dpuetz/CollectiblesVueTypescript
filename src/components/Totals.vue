<script setup lang="ts">
import { formatUSD } from '@/utils/currency';
import { useCartStore } from '@/stores/cartStore';
const cartStore = useCartStore();
</script>

<template>
  <div class="space-y-2 sm:space-y-3 p-4 
      rounded-xl bg-linear-to-br from-gray-50 to-white border 
      border-gray-100">
    <!-- Subtotal -->
    <div class="flex justify-between text-gray-700">
      <span class="font-medium">Subtotal</span>
      <span data-test="subtotal" class="font-semibold text-gray-600">{{ formatUSD(cartStore.cartSubTotal) }}</span>
    </div>

    <!-- Shipping -->
    <div class="flex justify-between text-gray-700">
      <span class="font-medium">Shipping</span>
      <span data-test="shipping" class="font-semibold text-gray-600">{{ formatUSD(cartStore.cartShipping) }}</span>
    </div>

    <!-- Tax -->
    <div class="flex justify-between text-gray-700">
      <span class="font-medium">Tax</span>
      <span data-test="tax" class="font-semibold text-gray-600">{{
        formatUSD(cartStore.cartTax)
      }}</span>
    </div>

    <!-- Divider -->
    <div class="border-t-2 border-gray-200 pt-3 mt-3">
      <div class="flex justify-between items-center">
        <span class="font-semibold text-gray-900">Total</span>
        <span data-test="total" class="font-semibold text-primary">
          {{ formatUSD(cartStore.cartTotal) }}
        </span>
      </div>
    </div>
  </div>
</template>
