<script setup lang="ts">
import { computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { storeToRefs } from 'pinia';
import ProgressBar from '@/components/ProgressBar.vue';
import Totals from '@/components/Totals.vue';
import CartEmpty from '@/components/CartEmpty.vue';
import { HomeIcon, CreditCardIcon } from '@heroicons/vue/24/outline';
import { getItemImage } from '@/utils/image';
import { useCheckoutStore } from '@/stores/checkoutStore';
import { useCartStore } from '@/stores/cartStore';
import { useProgressStore } from '@/stores/progressStore';
import { formatUSD } from '@/utils/currency';

//initializers
const checkoutStore = useCheckoutStore();
const { shipping, billing } = storeToRefs(checkoutStore);
const cartStore = useCartStore();
const progressStore = useProgressStore();
const router = useRouter();

//computed
const hasCartItems = computed(() =>
  cartStore.cart.length > 0
);
const cartMessage = computed(() =>
  `${cartStore.cartCount} ${cartStore.cartCount > 1 ? 'items' : 'item'}`
);

//actions
onMounted(() =>
  progressStore.setStepById(3)
);

async function onSubmit() {
  router.push({ name: 'complete' });
}
</script>

<template>
  <div v-fade-in class="page-background">
    <div class="page-container-xl">
      <div v-if="!hasCartItems" class="flex flex-col 
              items-center justify-center min-h-[60vh] px-4">
        <CartEmpty>Order Review</CartEmpty>
      </div>
      <div v-else>
        <form novalidate @submit.prevent="onSubmit">
          <div class="mb-6">
            <ProgressBar />
          </div>
          <div class="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-6 lg:gap-8 mt-6">
            <div id="colLeft">
              <div class="card-modern">
                <h2 class="headerMargins">
                  <span class="titleGradient">
                    Order Review
                  </span>
                </h2>

                <div class="mt-4 mb-6 p-4 bg-blue-50 
                border border-blue-200 rounded-lg">
                  <p class="text-sm text-gray-700 leading-relaxed">
                    Review the details below, and if everything looks right, click the
                    <span class="font-semibold text-primary">"Submit Order"</span>
                    button.
                  </p>
                </div>
                <div class="rounded-xl border-2 border-gray-200                   
                            mt-6 p-5 bg-linear-to-br from-gray-50 
                          to-white hover:border-primary/30 hover:shadow-md transition-all duration-300">
                  <div class="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2 tracking-wide">
                    <HomeIcon class="w-5 h-5 text-primary" />
                    Shipping Address
                  </div>
                  <div class="text-sm text-gray-700 space-y-1 leading-relaxed">
                    <div class="font-medium">{{ shipping.fullName }}</div>
                    <div v-if="shipping.company" class="text-gray-600">
                      {{ shipping.company }}
                    </div>
                    <div>{{ shipping.address.address1 }}</div>
                    <div v-if="shipping.address.address2">
                      {{ shipping.address.address2 }}
                    </div>
                    <div>
                      {{ shipping.address.cityTown }},
                      {{ shipping.address.stateProvince }}
                      {{ shipping.address.postalCode }}
                    </div>
                  </div>
                </div>

                <div
                  class="rounded-xl border-2 border-gray-200 mt-6 p-5 bg-linear-to-br from-gray-50 to-white hover:border-primary/30 hover:shadow-md transition-all duration-300">
                  <div class="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2 tracking-wide">
                    <CreditCardIcon class="w-5 h-5 text-primary" />
                    Billing Address
                  </div>
                  <div class="text-sm text-gray-700 space-y-1 leading-relaxed">
                    <div class="font-medium">{{ billing.fullName }}</div>
                    <div v-if="billing.company" class="text-gray-600">
                      {{ billing.company }}
                    </div>
                    <div>{{ billing.address.address1 }}</div>
                    <div v-if="billing.address.address2">
                      {{ billing.address.address2 }}
                    </div>
                    <div>
                      {{ billing.address.cityTown }},
                      {{ billing.address.stateProvince }}
                      {{ billing.address.postalCode }}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div id="colRight" class="sticky top-4 self-start space-y-6">
              <div class="card-modern">
                <!-- Header -->
                <div class="flex items-center justify-between mb-4 pb-3 border-b-2 border-gray-100">
                  <h2 class="text-lg sm:text-xl md:text-2xl">Order Summary</h2>
                  <div class="text-sm text-gray-600 mt-1">
                    <span class="inline-block font-medium text-primary">{{ cartMessage }}</span>
                    <span class="ml-2 font-semibold">{{ formatUSD(cartStore.cartTotal) }}</span>
                  </div>
                </div>

                <!-- Cart Items -->
                <div class="space-y-3 mb-4">
                  <div v-for="item in cartStore.cart" :key="item.id"
                    class="flex items-start gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors duration-200">
                    <div class="shrink-0">
                      <img class="rounded-lg w-12 h-12 object-cover shadow-sm" :src="getItemImage(item)"
                        :alt="item.name" />
                    </div>
                    <div class="flex-1 min-w-0">
                      <div class="text-sm font-medium text-gray-900 line-clamp-2">
                        {{ item.name }}
                      </div>
                    </div>
                    <div class="shrink-0 text-sm font-semibold text-gray-900">
                      {{ formatUSD(item.price) }}
                    </div>
                  </div>
                </div>
              </div>
              <div class="card-modern mb-6">
                <Totals />
              </div>
              <button type="submit" class="btn btn-primary btn-md w-full">Submit Order</button>
            </div>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>
