<script setup lang="ts">
import NavBar from '@/components/NavBar.vue';
import Footer from '@/components/Footer.vue';
import { useRoute } from 'vue-router';
import { Vue3Snackbar } from 'vue3-snackbar';

const route = useRoute();
</script>

<template>
  <div class="flex flex-col min-h-screen">
    <NavBar v-if="!route.meta.hideNavbar" />
    <main class="flex justify-center flex-1">
      <RouterView />
    </main>
    <Footer v-if="!route.meta.hideNavbar" />
    <vue3-snackbar bottom right :duration="4000" />
  </div>
</template>