<script setup lang="ts">
defineProps<{
  model: any
}>();
</script>

<template>
  <div v-if="model.$invalid" class="text-red-600 -mt-1 mb-4">
    <ul>
      <li v-for="e in model.$errors" :key="e.$uid">
        {{ e.$property }} - {{ e.$message }}
      </li>
    </ul>
  </div>
</template>
