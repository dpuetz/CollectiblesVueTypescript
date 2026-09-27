<script setup lang="ts">
import { ref, computed } from 'vue';
import type { Item } from '@/models/item';
import CartEmpty from '@/components/CartEmpty.vue';
import Totals from '@/components/Totals.vue';
import { LockClosedIcon, ArrowLongLeftIcon, ShoppingCartIcon, TrashIcon } from '@heroicons/vue/20/solid';
import { getItemImage } from '@/utils/image';
import { formatUSD } from '@/utils/currency';
import { useCartStore } from '@/stores/cartStore';
import ConfirmDialog from '@/components/ConfirmDialog.vue';
import { useNotificationStore } from '@/stores/notificationStore';

//itializers
const cartStore = useCartStore();
const isRemoving = ref(false);
const notificationStore = useNotificationStore();

//computed
const cartItems = computed(() => cartStore.cart);
const pendingDeleteItem = ref<Item | null>(null);

const cartMessage = computed<string>(() =>
  `${cartStore.cartCount} ${cartStore.cartCount > 1 ? 'items' : 'item'}`);

//actions
function requestRemove(item: Item) {  //was requestDelete
  pendingDeleteItem.value = item;
}

// Called when the user confirms deletion in the dialog.
async function confirmRemove() {
  if (!pendingDeleteItem.value) return;
  isRemoving.value = true;
  const removedItemName = pendingDeleteItem.value.name;
  cartStore.remove(pendingDeleteItem.value);
  pendingDeleteItem.value = null; // close the dialog
  notificationStore.showMessage(
    `'${removedItemName}' was deleted successfully.`,
    false,
    'success',
  );
  isRemoving.value = false;
}

</script>

<template>
  <div v-fade-in class="page-background">
    <div class="page-container-xl">

      <!-- if no items in cart -->
      <div v-if="cartItems.length === 0" class="flex flex-col items-center justify-center min-h-[60vh] px-4">
        <CartEmpty>Shopping Cart</CartEmpty>
      </div>

      <!-- if has items in cart -->
      <div v-if="cartItems.length > 0">

        <!-- Page Header -->
        <div class="headerMargins">
          <div class="flex flex-col sm:flex-row items-center justify-between gap-4">
            <h1>
              <span class="titleGradient">
                Shopping Cart
              </span>
            </h1>

            <!-- Item Count Badge -->
            <div class="inline-flex items-center gap-2
                  bg-white px-6 py-3 rounded-full shadow-md
                  border-2 border-primary/20">
              <ShoppingCartIcon class="w-5 h-5 text-primary" />
              <span class="font-semibold text-gray-900">{{ cartMessage }}</span>
            </div>
          </div>
        </div>

        <!-- Main Content Grid -->
        <div class="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-6 lg:gap-8">
          <!-- Left: Cart Items List -->
          <div id="itemsList" class="space-y-4">
            <div v-for="item in cartItems" :key="item.id" class="group">

              <!-- Cart Item Card -->
              <div class="bg-white rounded-2xl shadow-lg p-4 sm:p-6
                transform transition-all duration-300
                hover:shadow-2xl hover:scale-[1.02]
                border-2 border-transparent hover:border-primary/20">

                <!-- <div class="grid grid-cols-[100px_1fr_auto] sm:grid-cols-[140px_1fr_auto] gap-4 sm:gap-6 items-center"> -->
                <div class="grid grid-cols-[50px_1fr_auto] sm:grid-cols-[140px_1fr_auto] gap-4 sm:gap-6 items-center">
                  <!-- Product Image -->
                  <div class="relative overflow-hidden rounded-xl shadow-md">
                    <img class="w-full h-full object-cover aspect-square
                      transform transition-all duration-500
                      group-hover:scale-110 group-hover:brightness-105" :src="getItemImage(item)" :alt="item.name" />

                    <!-- Subtle gradient overlay -->
                    <div class="absolute inset-0 bg-linear-to-t
                      from-black/10 via-transparent to-transparent
                      opacity-0 group-hover:opacity-100
                      transition-opacity duration-300 rounded-xl">
                    </div>
                  </div>

                  <!-- Product Info -->
                  <div class="flex flex-col justify-center min-w-0">
                    <h3 class="mb-1 md:mb-2 truncate text-base sm:text-lg md:text-xl lg:text-2xl
                     group-hover:text-primary transition-colors duration-300">
                      {{ item.name }}
                    </h3>
                    <p class="hidden sm:block text-sm text-gray-500 capitalize">{{ item.category }}</p>

                    <!-- Mobile price (shown below name on small screens) -->
                    <p class="text-lg font-semibold text-primary sm:hidden">
                      {{ formatUSD(item.price) }}
                    </p>
                  </div>

                  <!-- Price & Actions (desktop) -->
                  <div class="hidden sm:flex flex-col items-end gap-3">
                    <p class="text-xl font-semibold text-primary">
                      {{ formatUSD(item.price) }}
                    </p>

                    <!-- Remove Button -->
                    <button @click="requestRemove(item)" class="
                    btn btn-outline-danger btn-xs">
                      <TrashIcon class="w-4 h-4" />
                      Remove
                    </button>

                  </div>

                  <!-- Mobile Remove Button -->
                  <button @click="requestRemove(item)" class="sm:hidden flex items-center justify-center
                       w-10 h-10 rounded-lg
                       text-red-600 bg-red-50
                       hover:bg-red-100
                       transition-colors duration-200">
                    <TrashIcon class="w-5 h-5" />
                  </button>

                </div>
              </div>

            </div>
          </div>

          <!-- totalsCard -->
          <div class="bg-white rounded-2xl shadow-2xl p-6 sm:p-8
              border-2 border-gray-100">

            <!-- totalsCard Header -->
            <h2 class="headerMargins">
              Order Summary
            </h2>

            <div class="mb-6">
              <Totals size="text-md sm:text-lg xl:text-xl" />
            </div>

            <!-- Action Buttons -->
            <div class="space-y-3 mt-6">
              <!-- Primary: Checkout -->
              <RouterLink :to="{ name: 'shipping' }" class="
             gap-2
                  btn btn-primary btn-md w-full">
                <LockClosedIcon class="w-5 h-5" />
                Proceed to Checkout
              </RouterLink>

              <!-- Secondary: Continue Shopping -->
              <RouterLink :to="{ name: 'catalog' }" class="gap-2 
              btn btn-outline-primary btn-md w-full">
                <ArrowLongLeftIcon class="w-5 h-5" />
                Continue Shopping
              </RouterLink>
            </div>

            <!-- Trust Badge -->
            <div class="mt-6 pt-6 border-t border-gray-200">
              <div class="flex items-center justify-center gap-2 text-sm text-gray-600">
                <LockClosedIcon class="w-4 h-4 text-green-600" />
                <span>Secure Checkout</span>
              </div>
            </div>

          </div>

        </div>
      </div>
    </div>
  </div>
  <ConfirmDialog v-if="pendingDeleteItem" :message="`Remove &quot;${pendingDeleteItem.name}&quot; from your cart?`"
    :is-loading="isRemoving" @confirm="confirmRemove" loading-label="Removing..." @cancel="pendingDeleteItem = null"
    confirm-label="Remove" />
</template>
