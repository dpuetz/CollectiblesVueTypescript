<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from 'vue';
import { RouterLink, useRouter } from 'vue-router';
import type { Item } from '@/models/item';
import { PhotoIcon } from '@heroicons/vue/24/outline';
import { useProductsStore } from '@/stores/productsStore';
import { useNotificationStore } from '@/stores/notificationStore';

//initializers
const router = useRouter();
const productsStore = useProductsStore();

//constants
const categories = ['Bowls', 'Canisters', 'Plates', 'Shakers'];
const currentYear = new Date().getFullYear();
const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/bmp', 'image/x-ms-bmp'];
const maxFileSizeBytes = 300 * 1024; // 300 KB
const notificationStore = useNotificationStore();

//state
const item = ref<Item>({
  id: 0,
  name: '',
  description: '',
  price: 0,
  category: '',
  categoryIcon: false,
  imageUrl: '',
  circa: currentYear,
});
const selectedFile = ref<File | null>(null);
const imagePreviewUrl = ref<string>('');
const showConfirmDialog = ref(false);
const isSaving = ref(false);

//actions
const onFileChange = (e: Event): void => {
  const target = e.target as HTMLInputElement;
  const file = target.files?.[0] ?? null;

  selectedFile.value = file;

  if (imagePreviewUrl.value) {
    URL.revokeObjectURL(imagePreviewUrl.value);
    imagePreviewUrl.value = '';
  }

  if (file) {
    item.value.imageUrl = file.name;
    imagePreviewUrl.value = URL.createObjectURL(file);
  } else {
    item.value.imageUrl = '';
  }

  fileV$.value.file.$touch();
};

onMounted(async () => {
  // Just 'fire and forget' here. If there were errors during fetch, user and Sentry have already
  // been notified.
  // Categories are populated as a side effect on the store, no need to capture a return value here.
  await productsStore.getItems();
});

onBeforeUnmount(() => {
  if (imagePreviewUrl.value) {
    URL.revokeObjectURL(imagePreviewUrl.value);
  }
});

//round price to 2 decimals once the user finishes typing
const roundPrice = (): void => {
  const value = item.value.price;
  if (value !== null && value !== undefined && !isNaN(value)) {
    item.value.price = Math.round(value * 100) / 100;
  }
};

//validate the form, then open the confirm dialog
const save = (): void => {
  v$.value.$touch();
  fileV$.value.$touch();
  if (!isValid.value) {
    return;
  }
  showConfirmDialog.value = true;
};

//called when the user confirms in the dialog
const confirmSave = async (): Promise<void> => {
  isSaving.value = true;
  item.value.imageUrl = selectedFile.value!.name;
  const error = await productsStore.createItem(item.value, selectedFile.value!);
  isSaving.value = false;

  if (error) {
    showConfirmDialog.value = false;
    return;
  }

  showConfirmDialog.value = false;
  notificationStore.showMessage(
    'Item added successfully!',
    false,
    'success',
  );
  v$.value.$reset();
  fileV$.value.$reset();
  setTimeout(() => {
    router.push({ name: 'admin' });
  }, 1000);
};

//validation
import { useVuelidate } from '@vuelidate/core';
import { required, minLength, maxLength, minValue, maxValue, integer, helpers, numeric } from '@vuelidate/validators';
import ValidationMessage from '@/components/ValidationMessage.vue';
import ConfirmDialog from '@/components/ConfirmDialog.vue';

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
  description: { required, minLength: minLength(5), maxLength: maxLength(500) },
  price: { required, numeric, positive, maxValue: maxValue(1000000) },
  category: { required },
  circa: {
    required,
    integer,
    minValue: minValue(1700),
    maxValue: maxValue(currentYear),
  },
};

const form = computed(() => item.value);
const v$ = useVuelidate(rules, form);

//file validation kept separate since File isn't part of the Item model
const validFileType = helpers.withMessage(
  'File must be a JPG, JPEG, BMP or PNG image.',
  (value: File | null) => !value || allowedMimeTypes.includes(value.type)
);

const validFileSize = helpers.withMessage(
  'File must be less than 300KB.',
  (value: File | null) => !value || value.size <= maxFileSizeBytes
);

const requiredFile = helpers.withMessage('Please upload an image.', required);

const fileRules = {
  file: { required: requiredFile, validFileType, validFileSize },
};

const fileForm = computed(() => ({ file: selectedFile.value }));
const fileV$ = useVuelidate(fileRules, fileForm);

const isValid = computed(() => !v$.value.$invalid && !fileV$.value.$invalid);

</script>


<template>
  <div v-fade-in class="page-background">
    <div class="page-container-xl">

      <h1 class="headerMargins">
        <span class="titleGradient">
          Add Item
        </span>
      </h1>

      <div v-fade-in class="grid grid-cols-1 lg:grid-cols-[400px_1fr] gap-6 lg:gap-8">

        <!-- Image Card (Left Column) -->
        <div class="card-modern h-fit lg:sticky lg:top-4">
          <div class="relative group mb-4">
            <img v-if="imagePreviewUrl" class="rounded-xl mx-auto object-cover shadow-lg group-hover:shadow-2xl
             transition-shadow duration-300
             w-32 h-32 sm:w-40 sm:h-40 lg:w-full lg:h-auto lg:aspect-square" :src="imagePreviewUrl" :alt="item.name" />
            <div v-else class="rounded-xl mx-auto bg-gray-100 flex flex-col items-center justify-center gap-2 text-gray-400
             border-2 border-dashed border-gray-300
             w-32 h-32 sm:w-40 sm:h-40 lg:w-full lg:h-auto lg:aspect-square">
              <PhotoIcon class="h-8 w-8 lg:h-12 lg:w-12" />
              <span class="text-xs lg:text-sm">No image selected</span>
            </div>
          </div>
          <input type="file" id="image" accept="image/jpeg,image/png,image/bmp,image/x-ms-bmp" class="form-input"
            @change="onFileChange" />
          <p class="text-xs text-gray-500 mt-1 mb-1">JPG, JPEG, BMP or PNG. Max 300KB.</p>
          <validationMessage :model="fileV$.file" />
        </div>

        <!-- Form Card (Right Column) -->
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
                id="price" placeholder="0.00" @blur="roundPrice" />
            </div>
            <validationMessage :model="v$.price" />

            <label for="category" class="form-label">Category</label>
            <select v-model="v$.category.$model" class="form-input" id="category">
              <option value="" disabled>Select a category</option>
              <option v-for="c in categories" :key="c" :value="c">{{ c }}</option>
            </select>
            <validationMessage :model="v$.category" />

            <div class="flex items-start gap-2 mb-3 mt-1">
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

            <label for="circa" class="form-label">Circa (Year)</label>
            <input v-model.number="v$.circa.$model" type="number" class="form-input" id="circa" min="1700"
              :max="currentYear" maxlength="4" placeholder="e.g. 1920" />
            <validationMessage :model="v$.circa" />

            <!-- Action Buttons -->
            <div class="mt-8 flex flex-col xlg:flex-row gap-4">
              <button type="submit" :disabled="!isValid" class="flex-1 btn btn-primary btn-md">
                Add Item
              </button>

              <router-link :to="{ name: 'admin' }" class="btn btn-outline-primary btn-md">
                Cancel
              </router-link>

            </div>
          </form>

        </div>
      </div>
    </div>

    <ConfirmDialog v-if="showConfirmDialog" title="Add this item?" message="Confirm that you wish to add this new item."
      confirm-label="Add Item" loading-label="Adding…" :is-loading="isSaving" @confirm="confirmSave"
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