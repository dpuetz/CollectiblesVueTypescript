import { createRouter, createWebHistory } from 'vue-router';
import { useUserStore } from '@/stores/userStore';
import { routes } from '@/router/routes';
import { useNotificationStore } from '@/stores/notificationStore';

const router = createRouter({
  linkActiveClass: 'active',
  linkExactActiveClass: 'router-link-exact-active',
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  scrollBehavior(to, from, savedPosition) {
    return savedPosition || { top: 0 };
  },
});

router.beforeEach((to) => {
  const userStore = useUserStore();

  // 1. Guest-only check: Prevent logged-in users from accessing the login page
  if (to.meta.guestOnly && userStore.isLoggedIn) {
    return { name: 'home' };
  }

  // 2. Authentication check: Protect login-only routes
  const requiresLogin = to.meta.requiresLogin || to.meta.requiresRole;
  if (requiresLogin && !userStore.isLoggedIn) {
    // notify user
    const notificationStore = useNotificationStore();
    notificationStore.showMessage('Please log in.', false, 'warning');
    return {
      name: 'login',
      query: { redirect: to.name as string },
    };
  }

  // 3. Authorization check: Protect role-restricted routes
  if (to.meta.requiresRole && !userStore.groups.includes(to.meta.requiresRole as string)) {
    return { name: 'unauthorized' };
  }
});

export default router;
