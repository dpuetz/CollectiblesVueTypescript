<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { storeToRefs } from 'pinia';
import { useProductsStore } from '@/stores/productsStore';
import { useCartStore } from '@/stores/cartStore';
import { useNotificationStore } from '@/stores/notificationStore';
import { useSearch } from '@/composables/useSearch';
import { useDeleteItem } from '@/composables/useDeleteItem';
import { formatUSD } from '@/utils/currency';
import type { Item } from '@/models/item';
import ConfirmDialog from '@/components/ConfirmDialog.vue';
import NoResults from '@/components/NoResults.vue';
import * as Sentry from '@sentry/vue';
import {
  ArrowPathIcon,
  MagnifyingGlassIcon,
  XMarkIcon,
  ChevronRightIcon,
  PlusIcon,
} from '@heroicons/vue/24/outline';
import { getItemImage } from '@/utils/image';

//initializers
const productsStore = useProductsStore();
const cartStore = useCartStore();
const { isLoading } = storeToRefs(productsStore);
const notificationStore = useNotificationStore();

// Search
const searchTerm = ref<string>('');
const selectedCategory = ref<string>('all');
const { queryMessage, showItems } = useSearch(searchTerm, selectedCategory);

// Delete
// The item currently shown in the "are you sure?" confirmation dialog.
// null means the dialog is closed.
const pendingDeleteItem = ref<Item | null>(null);

const { deleteItem, isDeleting } = useDeleteItem({
  onSuccess: handleDeleteSuccess,
  onError: handleDeleteError,
});

function handleDeleteSuccess() {
  // The store already refreshed the list itself, so there's nothing to reload here.
  notificationStore.showMessage(
    `'${pendingDeleteItem.value?.name}' was deleted successfully.`,
    false,
    'success',
  );
  pendingDeleteItem.value = null; // close the dialog
}

function handleDeleteError(errorMessage: string) {
  Sentry.captureException(errorMessage, {
    tags: { context: 'handleDeleteError' },
  });
  notificationStore.showMessage(
    `Sorry, an unexpected error has occurred while trying to delete '${pendingDeleteItem.value?.name}'.`,
    false,
    'error',
  );
  pendingDeleteItem.value = null; // close the dialog even on failure
}

// Called when the user clicks "delete" on an item — opens the confirm dialog,
// unless the item is in the cart, in which case deletion is blocked.
function requestDelete(item: Item) {
  const isInCart = cartStore.exists(item);
  if (isInCart) {
    notificationStore.showMessage(
      'Sorry, cannot delete this item because it is in the cart.',
      false,
      'error',
    );
    return;
  }
  pendingDeleteItem.value = item;
}

// Called when the user confirms deletion in the dialog.
function confirmDelete() {
  if (!pendingDeleteItem.value) return;
  deleteItem(pendingDeleteItem.value.id);
}

onMounted(async () => {
  // Just 'fire and forget' here. If there were errors during fetch, user and Sentry have already
  // been notified.
  // Categories are populated as a side effect on the store, no need to capture a return value here.
  await productsStore.getItems();
});

</script>

<template>
  <div v-fade-in class="page-background">
    <div class="page-container-lg">
      <div v-if="isLoading" class="flex flex-col items-center justify-center min-h-[60vh]">
        <ArrowPathIcon class="h-12 w-12 animate-spin text-primary mb-4" />
        <p class="text-lg text-gray-600 font-light">
          Loading treasure details...
        </p>
      </div>
      <div v-else>
        <div class="flex items-center justify-between headerMargins">
          <h1 class="mb-0">
            <span class="bg-linear-to-r from-primary via-primary/80 to-primary bg-clip-text text-transparent">
              Edit Items
            </span>
          </h1>
          <router-link :to="{ name: 'create' }" class="flex items-center gap-1 whitespace-nowrap
            btn btn-outline-primary btn-sm">
            <PlusIcon class="h-5 w-5" />
            Create New
          </router-link>

        </div>
        <div>
          <div id="search" class="flex items-start justify-center w-full">
            <div class="relative w-full max-w-full mb-3">

              <input id="searchInput" type="text" placeholder="Search collectibles..."
                class="form-input !mb-0 pr-12 rounded-full shadow-md focus:shadow-xl focus:ring-2 focus:ring-primary/50 transition-shadow duration-300"
                v-model="searchTerm" />

              <button v-if="searchTerm" type="button"
                class="absolute right-3 top-3 text-gray-400 hover:text-primary transition-colors duration-200"
                @click="searchTerm = ''">
                <XMarkIcon class="w-5 h-5" />
              </button>

              <!-- This will now center perfectly on the input box alone -->
              <div v-else class="absolute right-3 inset-y-0 flex items-center pointer-events-none">
                <MagnifyingGlassIcon class="w-5 h-5 text-gray-400" />
              </div>

            </div>
          </div>

          <div id="messages" class="mt-4 mb-4">
            <div v-if="queryMessage"
              class="text-sm sm:text-base text-gray-700 text-center sm:text-left mb-2 font-medium px-2">
              {{ queryMessage }}
            </div>

            <!-- No results -->
            <NoResults v-if="showItems.length === 0" />
          </div>

          <div v-if="showItems.length > 0" class="space-y-4 sm:space-y-5">
            <div v-for="item in showItems" :key="item.id" class="card-modern p-5 sm:p-6 backdrop-blur-sm bg-white/95 hover:shadow-2xl 
                hover:scale-[1.01] transition-all duration-300 cursor-pointer group">
              <div class="flex gap-4">
                <div class="shrink-0">
                  <img class="rounded-lg w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 lg:w-32 lg:h-32 
                    object-cover shadow-md group-hover:shadow-xl transition-shadow duration-300"
                    :src="getItemImage(item)" :alt="item.name" />
                </div>

                <!-- Content area -->
                <div class="flex-1 min-w-0">
                  <div
                    class="font-semibold text-xs sm:text-xl lg:text-lg text-gray-900 leading-tight mb-2 group-hover:text-primary transition-colors duration-300 line-clamp-3 lg:line-clamp-none">
                    {{ item.name }}
                  </div>
                  <div class="hidden sm:block text-xs md:text-sm text-gray-600 leading-relaxed line-clamp-2 pr-2">
                    {{ item.description }}
                  </div>
                </div>

                <!-- Price and action -->
                <div class="shrink-0">
                  <div class="flex flex-col items-center h-full gap-2 sm:gap-4">
                    <div class="text-base md:text-md lg:text-lg font-bold text-primary">
                      {{ formatUSD(item.price) }}
                    </div>
                    <RouterLink class="gap-1 
                    btn btn-primary btn-xxs-size sm:btn-xs" :to="{ name: 'edit', params: { id: item.id } }">
                      Edit
                      <ChevronRightIcon class="h-3 w-3 lg:h-4 lg:w-4" />
                    </RouterLink>
                    <button type="button" class="btn btn-outline-danger btn-xxs-size sm:btn-xs"
                      @click="requestDelete(item)">
                      Delete
                    </button>

                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
  <ConfirmDialog v-if="pendingDeleteItem"
    :message="`Delete &quot;${pendingDeleteItem.name}&quot;? This can't be undone.`" :is-loading="isDeleting"
    @confirm="confirmDelete" @cancel="pendingDeleteItem = null" />
</template>
