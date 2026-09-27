<script setup lang="ts">
import { ref } from 'vue';
import { useNotificationStore } from '@/stores/notificationStore';
import ConfirmDialog from '@/components/ConfirmDialog.vue';
import { useProductsStore } from '@/stores/productsStore';
import { RouterLink, useRouter } from 'vue-router';

//initializers
const productsStore = useProductsStore();
const notificationStore = useNotificationStore();
const router = useRouter();

// const { isLoading } = storeToRefs(productsStore);
const showConfirmDialog = ref(false);
const isSaving = ref(false);


const reset = (): void => {
  showConfirmDialog.value = true;
};

const confirmReset = async (): Promise<void> => {

  isSaving.value = true;
  try {
    const error = await productsStore.reset();
    if (error) {
      showConfirmDialog.value = false;
    } else {
      notificationStore.showMessage(
        'Data was reset successfully!',
        false,
        'success',
      );
      showConfirmDialog.value = false;
      setTimeout(() => {
        router.push({ name: 'catalog' });
      }, 800);
    }
  } finally {
    isSaving.value = false;
  }
};

</script>

<template>
  <div v-fade-in class="page-background">
    <div class="page-container-xl max-w-xl">

      <!-- Page Header -->
      <div class="text-center mb-10">
        <h1 class="titleGradient mb-4">
          Reset
        </h1>
        <p class="text-lg sm:text-xl text-gray-600 font-light max-w-xl mx-auto">
          This will revert any changes you've made to this demo and restore the original state of the application.
        </p>
      </div>

      <!-- Call to Action -->
      <div class="mt-8 flex flex-col gap-4">
        <button @click="reset" class="flex-1 
                btn btn-primary btn-md">
          Reset
        </button>
        <router-link :to="{ name: 'catalog' }" class="btn btn-outline-primary btn-md">
          Cancel
        </router-link>
      </div>
    </div>
  </div>
  <ConfirmDialog v-if="showConfirmDialog" title="Revert all changes?"
    message="Confirm that you wish to revert all changes." confirm-label="Reset" loading-label="Restting…"
    :is-loading="isSaving" @confirm="confirmReset" @cancel="showConfirmDialog = false" />
</template>
