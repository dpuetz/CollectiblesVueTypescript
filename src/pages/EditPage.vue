<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { RouterLink, useRoute, useRouter } from 'vue-router';
import { storeToRefs } from 'pinia';
import { useNotificationStore } from '@/stores/notificationStore';
import ConfirmDialog from '@/components/ConfirmDialog.vue';
import type { Item } from '@/models/item';
import { useProductsStore } from '@/stores/productsStore';
import { ArrowPathIcon, ExclamationTriangleIcon } from '@heroicons/vue/24/outline';
import { getItemImage } from '@/utils/image';

//initializers
const router = useRouter();
const route = useRoute();
const productsStore = useProductsStore();
const notificationStore = useNotificationStore();

//state management
const itemId = ref<string>(route.params.id as string);
const { isLoading } = storeToRefs(productsStore);
const showConfirmDialog = ref(false);
const isSaving = ref(false);
const item = ref<Item | null>(null);
const notFound = computed(() => !isLoading.value && !item.value);

//actions
onMounted(async () => {
  await productsStore.getItems();
  const found: Item | null = productsStore.getItem(Number(itemId.value));
  item.value = found ? structuredClone(found) : null;
});

const save = (): void => {
  if (item.value) {
    showConfirmDialog.value = true;
  }
};

const confirmSave = async (): Promise<void> => {
  if (!item.value) return;

  isSaving.value = true;
  try {
    const error = await productsStore.updateItem(item.value);
    if (error) {
      showConfirmDialog.value = false;
    } else {
      notificationStore.showMessage(
        'Changes saved successfully!',
        false,
        'success',
      );
      showConfirmDialog.value = false;

      setTimeout(() => {
        router.push({ name: 'admin' });
      }, 800);
    }
  } finally {
    isSaving.value = false;
  }
};

//validation
import { useVuelidate } from '@vuelidate/core';
import { required, minLength, maxLength, numeric, helpers, maxValue } from '@vuelidate/validators';
import ValidationMessage from '@/components/ValidationMessage.vue';

const positive = helpers.withMessage(
  'Price must be greater than 0.',
  (value: number) => Number(value) > 0
);

const uniqueName = helpers.withMessage(
  'An item with this name already exists.',
  (value: string) => !value || !productsStore.isNameTaken(value, item.value?.id)
);

const rules = {
  name: { required, minLength: minLength(5), maxLength: maxLength(100), uniqueName },
  description: { required, minLength: minLength(10), maxLength: maxLength(500) },
  price: { required, numeric, positive, maxValue: maxValue(1000000) },
};

const form = computed(() => item.value ?? { name: '', description: '', price: 0 });
const v$ = useVuelidate(rules, form);
const isValid = computed(() => !v$.value.$invalid);

</script>

<template>
  <div v-fade-in class="page-background">

    <div class="page-container-xl">

      <div v-if="isLoading" class="flex flex-col items-center justify-center min-h-[60vh]">
        <ArrowPathIcon class="h-12 w-12 animate-spin text-primary mb-4" />
        <p class="text-lg text-gray-600 font-light">Loading treasure details...</p>
      </div>
      <div v-else-if="notFound" class="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <ExclamationTriangleIcon class="h-12 w-12 text-gray-400 mb-4" />
        <h2 class="text-xl font-medium text-gray-700 mb-2">Item not found</h2>
        <p class="text-gray-500 mb-6">We couldn't find an item with this ID. It may have been removed.</p>
        <router-link :to="{ name: 'admin' }" class="btn btn-primary btn-md">
          Back to Admin
        </router-link>
      </div>
      <div v-else>

        <h1 class="headerMargins">
          <span class="titleGradient">
            Edit Item
          </span>
        </h1>

        <div v-fade-in class="grid grid-cols-1 lg:grid-cols-[400px_1fr] gap-6 lg:gap-8">

          <!-- Image Card (Left Column) -->
          <div class="card-modern h-fit">
            <div class="relative group">
              <img class="rounded-xl w-full aspect-square object-cover
                    shadow-lg group-hover:shadow-2xl
                    transition-shadow duration-300" :src="getItemImage(item)" :alt="item?.name" />
              <div class="absolute inset-0 bg-linear-to-t from-black/20 to-transparent
                    opacity-0 group-hover:opacity-100 rounded-xl
                    transition-opacity duration-300">
              </div>
            </div>
          </div>

          <!-- Form Card (Right Column) -->

          <!-- Form Card -->
          <div class="card-modern">
            <h3 class="mb-6">Product Details</h3>
            <form novalidate @submit.prevent="save">
              <label for="name" class="form-label">Item Name</label>
              <input v-model="v$.name.$model" type="text" class="form-input" id="name" />
              <validationMessage :model="v$.name" />

              <label for="description" class="form-label">Item Description</label>
              <textarea v-model="v$.description.$model" class="form-textarea resize-none" id="description"
                rows="4"></textarea>
              <validationMessage :model="v$.description" />

              <label for="price" class="form-label">Item Price</label>
              <div class="flex items-center border-2 border-gray-200 rounded-lg
              px-4 py-3 mb-3
              focus-within:ring-2 focus-within:ring-primary focus-within:border-primary
              hover:border-gray-300
              transition-all duration-200">
                <span class="text-gray-500 font-medium mr-2">$</span>
                <input v-model="v$.price.$model" type="number" step="0.01" class="flex-1 outline-none bg-transparent"
                  id="price" placeholder="0.00" />
              </div>
              <validationMessage :model="v$.price" />

              <!-- categoryIcon -->
              <div class="flex items-start gap-2 mb-3 mt-1" v-if="item">
                <input v-model="item.categoryIcon" type="checkbox" id="categoryIcon"
                  class="mt-1 h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary" />
                <label for="categoryIcon" class="text-sm text-gray-700">
                  Use this image as the representative icon for the
                  <span class="font-medium">{{ item.category || 'selected' }}</span> category.
                  <span class="block text-xs text-gray-500">
                    Only one item per category can be the icon — choosing this will replace the current one.
                  </span>
                </label>
              </div>

              <!-- Action Buttons -->
              <div class="mt-8 flex flex-col xlg:flex-row gap-4">
                <button type="submit" :disabled="!isValid" class="flex-1 
                btn btn-primary btn-md">
                  Save Changes
                </button>
                <router-link :to="{ name: 'admin' }" class="btn btn-outline-primary btn-md">
                  Cancel
                </router-link>
              </div>
            </form>

          </div>
        </div>
      </div>
    </div>
    <ConfirmDialog v-if="showConfirmDialog" title="Save changes?" message="Confirm that you wish to save these changes."
      confirm-label="Save Changes" loading-label="Saving…" :is-loading="isSaving" @confirm="confirmSave"
      @cancel="showConfirmDialog = false" />
  </div>

</template>

<style scoped>
.slide-down-enter-active,
.slide-down-leave-active {
  transition: all 0.3s ease;
}

.slide-down-enter-from {
  opacity: 0;
  transform: translateY(-10px);
}

.slide-down-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
</style>