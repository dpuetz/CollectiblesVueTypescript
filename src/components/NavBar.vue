<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { useCartStore } from '@/stores/cartStore';
import { useUserStore } from '@/stores/userStore';
import { Bars3Icon, ShoppingCartIcon, UserIcon, ChevronDownIcon } from '@heroicons/vue/24/outline';
import ConfirmDialog from '@/components/ConfirmDialog.vue';

//initializers
const cartStore = useCartStore();
const userStore = useUserStore();
const router = useRouter();

//state
const isOpen = ref(false);
const showSignOutConfirm = ref(false);
const isSigningOut = ref(false);
const isAdminMenuOpen = ref(false);
const isAdminMobileOpen = ref(false);
const adminMenuRef = ref<HTMLElement | null>(null);

//computed
const cartCount = computed(() => cartStore.cartCount);
const userName = computed(() => userStore.currentUser?.firstName || '');
const isAdmin = computed(() => userStore.currentUser?.groups?.includes('admin'));

//actions

const handleUserIconClick = () => {
  if (userStore.isLoggedIn) {
    showSignOutConfirm.value = true;
  } else {
    router.push({ name: 'login' });
  }
};

const confirmSignOut = () => {
  isSigningOut.value = true;
  cartStore.checkout();
  userStore.logout();
  showSignOutConfirm.value = false;
  isSigningOut.value = false;
  router.push({ name: 'home' });
};

const cancelSignOut = () => {
  showSignOutConfirm.value = false;
};

const toggleAdminMenu = () => {
  isAdminMenuOpen.value = !isAdminMenuOpen.value;
};

const closeAdminMenu = () => {
  isAdminMenuOpen.value = false;
};

const toggleAdminMobile = () => {
  isAdminMobileOpen.value = !isAdminMobileOpen.value;
};

const handleClickOutsideAdminMenu = (event: MouseEvent) => {
  if (adminMenuRef.value && !adminMenuRef.value.contains(event.target as Node)) {
    isAdminMenuOpen.value = false;
  }
};

onMounted(() => {
  document.addEventListener('click', handleClickOutsideAdminMenu);
});

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutsideAdminMenu);
});

</script>
<template>
  <nav class="navbar">

    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

      <div class="flex items-center justify-between h-16 sm:h-20">

        <!-- Left Section: Hamburger (mobile) + Logo -->
        <div class="flex items-center space-x-4">

          <!-- Hamburger - phones only -->
          <button @click="isOpen = !isOpen" data-test="hamburger" class="navbar-hamburger" aria-label="Toggle menu">
            <Bars3Icon class="w-6 h-6 mr-3" />
          </button>

          <!-- Logo -->
          <RouterLink :to="{ name: 'home' }" class="navbar-logo group">
            <span class="relative">
              Collectibles!
              <span class="absolute bottom-0 left-0 w-0 h-0.5 bg-white 
                           transition-all duration-300 group-hover:w-full"></span>
            </span>
          </RouterLink>
        </div>

        <!-- Center Section: Navigation links - desktop only -->
        <div class="hidden md:flex items-center justify-center space-x-1 lg:space-x-2">
          <RouterLink :to="{ name: 'home' }" class="navbar-link"><span>Home</span></RouterLink>
          <RouterLink :to="{ name: 'catalog' }" class="navbar-link"><span>Catalog</span></RouterLink>
          <div v-if="isAdmin" ref="adminMenuRef" class="relative">
            <button @click="toggleAdminMenu" data-test="admin-menu-btn" class="navbar-link flex items-center gap-1">
              <span>Admin</span>
              <ChevronDownIcon class="w-4 h-4 transition-transform duration-200 lg:hidden"
                :class="{ 'rotate-180': isAdminMenuOpen }" />
            </button>

            <transition enter-active-class="transition-all duration-150" enter-from-class="opacity-0 -translate-y-1"
              enter-to-class="opacity-100 translate-y-0" leave-active-class="transition-all duration-100"
              leave-from-class="opacity-100 translate-y-0" leave-to-class="opacity-0 -translate-y-1">
              <div v-if="isAdminMenuOpen" data-test="admin-menu"
                class="absolute left-0 top-full mt-1 min-w-40 bg-primary border border-white/10 rounded-lg shadow-lg overflow-hidden z-50">
                <RouterLink :to="{ name: 'admin' }" class="navbar-dropdown-item" @click="closeAdminMenu">
                  Edit Items
                </RouterLink>
                <RouterLink :to="{ name: 'reset' }" class="navbar-dropdown-item" @click="closeAdminMenu">
                  Reset
                </RouterLink>
              </div>
            </transition>
          </div>
          <RouterLink :to="{ name: 'about' }" class="navbar-link"><span>About</span></RouterLink>

        </div>

        <!-- Right Section: User + Cart -->
        <div class="flex items-center space-x-3 md:space-x-4 lg:space-x-6 ">

          <!-- User greeting - desktop only -->
          <div v-if="userName" class="hidden sm:block" data-test="greeting">
            <span class="text-sm tracking-widest font-medium">
              Hi, <span>{{ userName }}</span>!
            </span>
          </div>

          <!-- Sign In / Sign Out -->
          <button @click="handleUserIconClick" class="navbar-action-btn group" data-test="signout-btn">
            <UserIcon class="user-icon" />
            <span class="hidden sm:inline text-sm font-medium">
              {{ userStore.isLoggedIn ? 'Sign Out' : 'Sign In' }}
            </span>
          </button>

          <!-- Cart -->
          <RouterLink :to="{ name: 'cart' }" class="navbar-action-btn group relative">
            <div class="relative">
              <ShoppingCartIcon class="user-icon sm:w-6 sm:h-6 " />

              <!-- Animated Badge -->
              <transition enter-active-class="transition-all duration-300" enter-from-class="scale-0 opacity-0"
                enter-to-class="scale-100 opacity-100" leave-active-class="transition-all duration-200"
                leave-from-class="scale-100 opacity-100" leave-to-class="scale-0 opacity-0">
                <span v-if="cartCount > 0" data-test="cart-badge" class="absolute -top-2 -right-2 
                         min-w-5 h-5 
                         flex items-center justify-center
                         bg-linear-to-r from-red-500 to-red-600 
                         text-xs font-bold 
                         rounded-full px-1.5 
                         shadow-lg
                         animate-pulse">
                  {{ cartCount > 99 ? '99+' : cartCount }}
                </span>
              </transition>
            </div>
            <span class="hidden lg:inline text-sm font-medium">Cart</span>
          </RouterLink>

        </div>
      </div>
    </div>

    <!-- Mobile Menu Backdrop -->
    <transition enter-active-class="transition-opacity duration-300" enter-from-class="opacity-0"
      enter-to-class="opacity-100" leave-active-class="transition-opacity duration-200" leave-from-class="opacity-100"
      leave-to-class="opacity-0">
      <div v-if="isOpen" @click="isOpen = false; isAdminMobileOpen = false" data-test="mobile-backdrop"
        class="fixed inset-0 bg-primary/15 md:hidden z-40"></div>
    </transition>

    <!-- Mobile Menu Drawer -->
    <transition enter-active-class="transition transform ease-out duration-300"
      enter-from-class="opacity-0 -translate-y-4" enter-to-class="opacity-100 translate-y-0"
      leave-active-class="transition transform ease-in duration-200" leave-from-class="opacity-100 translate-y-0"
      leave-to-class="opacity-0 -translate-y-4">

      <!-- phones only - drop down menu -->
      <div v-if="isOpen" class="absolute left-0 top-full w-full 
          bg-primary/95 
          border-t border-white/10
          flex flex-col items-start p-4 space-y-1 shadow-lg
          max-h-[calc(100dvh-4rem)] sm:max-h-[calc(100dvh-5rem)] overflow-y-auto overscroll-contain
          md:hidden
          z-50">
        <RouterLink :to="{ name: 'home' }" class="navbar-link-sm tracking-tight" @click="isOpen = false">
          <span>Home</span>
        </RouterLink>
        <RouterLink :to="{ name: 'catalog' }" class="navbar-link-sm" @click="isOpen = false"><span>Catalog</span>
        </RouterLink>
        <div v-if="isAdmin" class="w-full">
          <button @click="toggleAdminMobile" data-test="admin-menu-btn-mobile"
            class="navbar-link-sm !flex items-center gap-1 text-left">
            <span>Admin</span>
            <ChevronDownIcon class="w-4 h-4 shrink-0 transition-transform duration-200"
              :class="{ 'rotate-180': isAdminMobileOpen }" />
          </button>

          <div v-if="isAdminMobileOpen" class="flex flex-col items-start pl-4 space-y-1">
            <RouterLink :to="{ name: 'admin' }" class="navbar-link-sm"
              @click="isOpen = false; isAdminMobileOpen = false">
              <span>Edit Items</span>
            </RouterLink>
            <RouterLink :to="{ name: 'reset' }" class="navbar-link-sm"
              @click="isOpen = false; isAdminMobileOpen = false">
              <span>Reset</span>
            </RouterLink>
          </div>
        </div>
        <RouterLink :to="{ name: 'about' }" class="navbar-link-sm" @click="isOpen = false"><span>About</span>
        </RouterLink>
      </div>
    </transition>

    <!-- Sign Out Confirmation -->
    <Teleport to="body">
      <ConfirmDialog v-if="showSignOutConfirm" title="Sign Out" message="Are you sure you want to sign out?"
        confirm-label="Sign Out" loading-label="Signing Out…" :is-loading="isSigningOut" @confirm="confirmSignOut"
        @cancel="cancelSignOut" />
    </Teleport>
  </nav>

</template>


<style scoped>
@reference "@/assets/main.css";

.navbar {
  @apply bg-primary/90 text-lg text-white border-b border-gray-500 backdrop-blur-md shadow-md sticky top-0 z-50
}

.navbar-logo {
  @apply font-vibes text-white sm:block cursor-pointer sm:mt-2 text-2xl sm:text-3xl lg:text-4xl;
}

.navbar-hamburger {
  @apply block md:hidden text-white focus:outline-none ml-0 mr-auto;
}

.navbar-link {
  @apply relative px-3 lg:px-4 py-2 text-sm lg:text-base font-medium rounded-lg hover:bg-primary/5 transition-all duration-300 text-white cursor-pointer;
}

.navbar-link span {
  @apply relative;
}

.navbar-link span::after {
  content: '';
  @apply absolute bottom-0 left-0 w-0 h-0.5 bg-white transition-all duration-300;
}

.navbar-link:hover span::after {
  @apply w-full;
}

.navbar-link-sm {
  @apply relative text-base font-medium tracking-tight text-white py-2 px-3 rounded-lg hover:bg-white/10 transition-all duration-300 inline-block w-full;
}

.navbar-link-sm span {
  @apply relative;
}

.navbar-link-sm span::after {
  content: '';
  @apply absolute bottom-0 left-0 w-0 h-0.5 bg-white transition-all duration-300;
}

.navbar-link-sm:hover span::after {
  @apply w-full;
}

.router-link-exact-active.navbar-link-sm {
  @apply font-semibold;
}

.router-link-exact-active.navbar-link-sm span::after {
  @apply w-full;
}

.navbar-dropdown-item {
  @apply block px-4 py-2 text-sm font-medium text-white hover:bg-white/10 transition-all duration-200 whitespace-nowrap;
}

.navbar-action-btn {
  @apply flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-300 hover:bg-white/10;
}

.user-icon {
  @apply w-5 h-5 transition-transform duration-300 group-hover:scale-110
}
</style>