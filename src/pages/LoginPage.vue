<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import type { DefaultUser } from '@/models/userDefault';
import type { LoginRequest } from '@/models/loginRequest';
import { ShieldCheckIcon, UserCircleIcon, ArrowRightIcon, UserIcon, LockClosedIcon, InformationCircleIcon } from '@heroicons/vue/24/outline';
import { ArrowLongLeftIcon } from '@heroicons/vue/20/solid';
import { useUserStore } from '@/stores/userStore';

//initializers
const router = useRouter();
const userStore = useUserStore();

//state management
const defaultUsers: DefaultUser[] = userStore.defaultUsers;
const isLoggingIn = ref<boolean>(false);
const currentUser = ref<LoginRequest>({
  email: '',
  password: '',
});

//actions
//for demo purposes, add selected user, wait, then navigate away.
const login = (role: string) => {
  const selected = defaultUsers.find(u => u.role === role) || null;
  if (!selected) return;
  currentUser.value.email = selected.email;
  currentUser.value.password = selected.password;
  isLoggingIn.value = true;
  setTimeout(async () => {
    if (currentUser.value) {
      const error = await userStore.login(currentUser.value);
      if (error) {
        isLoggingIn.value = false;
        return;
      }
    }
    const redirectName = router.currentRoute.value.query.redirect as string;
    router.push(redirectName ? { name: redirectName } : { name: 'catalog' });

    isLoggingIn.value = false;
  }, 1500);

};

</script>

<template>
  <div v-fade-in class="page-background">
    <div class="page-container-md">
      <h1 class="text-center headerMargins">
        <span class="titleGradient">
          Welcome Back
        </span>
      </h1>

      <!-- Login Options Section -->
      <div class="bg-white rounded-2xl shadow-2xl p-8 border-2 border-gray-100 mb-8">

        <!-- Section Header -->
        <div class="text-center mb-6">
          <h3 class="headerMargins">Choose Account Type</h3>
          <p class="text-sm text-gray-600">Select a demo account to continue</p>
        </div>

        <!-- Login Options Grid -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">

          <!-- Admin Login Card -->
          <button @click="login('admin')" class="group relative overflow-hidden
                     bg-linear-to-br from-primary to-primary/80
                     text-white rounded-xl p-6
                     transform transition-all duration-300
                     hover:scale-105 hover:shadow-2xl
                     border-2 border-transparent">

            <!-- Icon -->
            <div class="flex justify-center mb-3">
              <div class="bg-white/20 backdrop-blur-sm rounded-full p-3">
                <ShieldCheckIcon class="w-8 h-8" />
              </div>
            </div>

            <!-- Title -->
            <h3 class="font-bold text-lg mb-1">Admin Account</h3>
            <p class="text-sm text-white/80">Full access to all features</p>

            <!-- Hover Arrow -->
            <div class="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100
                    transform translate-x-2 group-hover:translate-x-0
                    transition-all duration-300">
              <ArrowRightIcon class="w-5 h-5" />
            </div>
          </button>

          <!-- Guest Login Card -->
          <button @click="login('guest')" class="group relative overflow-hidden
                     bg-white text-gray-900 rounded-xl p-6
                     transform transition-all duration-300
                     hover:scale-105 hover:shadow-2xl
                     border-2 border-primary/20 hover:border-primary">

            <!-- Icon -->
            <div class="flex justify-center mb-3">
              <div class="bg-gray-100 rounded-full p-3
                      group-hover:bg-primary/10 transition-colors duration-300">
                <UserCircleIcon class="w-8 h-8 text-primary" />
              </div>
            </div>

            <!-- Title -->
            <h3 class="font-bold text-lg mb-1 group-hover:text-primary transition-colors duration-300">
              Guest Account
            </h3>
            <p class="text-sm text-gray-600">Browse and shop items</p>

            <!-- Hover Arrow -->
            <div class="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100
                    transform translate-x-2 group-hover:translate-x-0
                    transition-all duration-300">
              <ArrowRightIcon class="w-5 h-5 text-primary" />
            </div>
          </button>

        </div>
      </div>

      <!-- Account Preview Card -->
      <div class="bg-white rounded-2xl shadow-2xl p-8 border-2 border-gray-100">

        <!-- Card Header -->
        <div class="flex items-center gap-3 headerMargins border-b-2 border-gray-100 p-2">
          <div class="bg-primary/10 rounded-full p-2">
            <UserIcon class="w-6 h-6 text-primary" />
          </div>
          <h3>Account Preview</h3>
        </div>

        <form novalidate class="space-y-4">
          <div class="bg-blue-50 border-2 border-blue-200 rounded-xl p-4 mt-6">
            <div class="flex gap-3">
              <InformationCircleIcon class="w-6 h-6 text-blue-600 shrink-0" />
              <div>
                <h4 class="font-semibold text-blue-900 mb-1">Demo Mode</h4>
                <p class="text-sm text-blue-800">
                  This is a demonstration login. Select an account type above to populate these fields automatically.
                </p>
              </div>
            </div>
          </div>

          <!-- Email -->
          <div>
            <label for="email" class="block text-sm font-semibold text-gray-700 mb-2">
              Email Address
            </label>
            <div class="relative">
              <input disabled v-model="currentUser.email" type="email" class="form-input bg-gray-50 cursor-not-allowed"
                id="email" placeholder="Email" />
              <LockClosedIcon class="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            </div>
          </div>

          <!-- Password -->
          <div>
            <label for="password" class="block text-sm font-semibold text-gray-700 mb-2">
              Password
            </label>
            <div class="relative">
              <input disabled v-model="currentUser.password" type="password"
                class="form-input bg-gray-50 cursor-not-allowed" id="password" placeholder="••••••••" />
              <LockClosedIcon class="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            </div>
          </div>

          <!-- Info Banner -->


          <!-- Cancel Button -->
          <div class="pt-4">
            <router-link :to="{ name: 'catalog' }" class="gap-2 btn btn-outline-primary btn-md w-full">
              <ArrowLongLeftIcon class="w-5 h-5" />
              Back to Catalog
            </router-link>
          </div>

        </form>
        <!-- Loading Overlay (shown during login) -->
        <transition enter-active-class="transit ion-opacity duration-300" enter-from-class="opacity-0"
          enter-to-class="opacity-100" leave-active-class="transition-opacity duration-200"
          leave-from-class="opacity-100" leave-to-class="opacity-0">
          <div v-if="isLoggingIn" class="fixed inset-0 bg-black/50 backdrop-blur-sm
                flex items-center justify-center z-50">
            <div class="bg-white rounded-2xl p-8 shadow-2xl text-center">
              <div class="flex justify-center mb-4">
                <div class="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent">
                </div>
              </div>
              <p class="text-lg font-semibold text-gray-900 mb-1">Logging you in...</p>
              <p class="text-sm text-gray-600">Just a moment</p>
            </div>
          </div>
        </transition>

      </div>

    </div>
  </div>
</template>
