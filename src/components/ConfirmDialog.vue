<script setup lang="ts">
defineProps<{
  title?: string;
  message: string;
  confirmLabel?: string;
  loadingLabel?: string;
  isLoading?: boolean;
}>();

const emit = defineEmits<{
  confirm: [];
  cancel: [];
}>();
</script>

<template>
  <div class="fixed inset-0 z-50 flex items-center justify-center 
  bg-black/50 p-4" @click.self="emit('cancel')">
    <div class="w-full max-w-sm rounded-lg p-6 shadow-xl bg-linear-to-br from-gray-100 via-white to-gray-100">
      <h3 class="text-lg">
        {{ title ?? "Are you sure?" }}
      </h3>
      <p class="mt-2 text-sm text-gray-600">
        {{ message }}
      </p>

      <div class="mt-6 flex justify-end gap-3">

        <button type="button" class="btn btn-xs hover:bg-gray-100" :disabled="isLoading" @click="emit('cancel')">
          Cancel
        </button>

        <button type="button" class="btn btn-outline-danger btn-xs" :disabled="isLoading" @click="emit('confirm')">
          {{ isLoading ? (loadingLabel ?? 'Deleting…') : (confirmLabel ?? 'Delete') }}
        </button>
      </div>
    </div>
  </div>
</template>
