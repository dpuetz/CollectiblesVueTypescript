import type { RouteRecordRaw } from 'vue-router';
import HomePage from '@/pages/HomePage.vue';
import CatalogPage from '@/pages/CatalogPage.vue';

export const routes: RouteRecordRaw[] = [
  {
    path: '/',
    redirect: { name: 'home' },
  },
  {
    path: '/home',
    name: 'home',
    component: HomePage,
  },
  {
    path: '/catalog/:filter?',
    name: 'catalog',
    component: CatalogPage,
  },
  {
    path: '/details/:id',
    name: 'details',
    component: () => import('@/pages/DetailsPage.vue'),
  },
  {
    path: '/cart',
    name: 'cart',
    component: () => import('@/pages/CartPage.vue'),
  },
  {
    path: '/about',
    name: 'about',
    component: () => import('@/pages/AboutPage.vue'),
  },
  {
    path: '/login',
    name: 'login',
    component: () => import('@/pages/LoginPage.vue'),
    meta: { guestOnly: true }, // Prevents logged-in users from seeing the login screen again
  },
  {
    path: '/portfolio',
    name: 'portfolio',
    component: () => import('@/pages/PortfolioPage.vue'),
    props: { currentApp: 'collectibles' },
  },

  // Protected Checkout Group (Requires Login)
  {
    path: '/checkout',
    meta: { requiresLogin: true },
    children: [
      {
        path: '/shipping',
        name: 'shipping',
        component: () => import('@/pages/checkout/ShippingPage.vue'),
      },
      {
        path: '/payment',
        name: 'payment',
        component: () => import('@/pages/checkout/PaymentPage.vue'),
      },
      {
        path: '/review',
        name: 'review',
        component: () => import('@/pages/checkout/ReviewPage.vue'),
      },
      {
        path: '/complete',
        name: 'complete',
        component: () => import('@/pages/checkout/CompletePage.vue'),
      },
    ],
  },
  // Protected Management Group (Requires Admin Role)
  {
    path: '/management',
    meta: { requiresRole: 'admin' },
    children: [
      {
        path: '/admin',
        name: 'admin',
        component: () => import('@/pages/AdminPage.vue'),
      },
      {
        path: '/edit/:id',
        name: 'edit',
        component: () => import('@/pages/EditPage.vue'),
      },
      {
        path: '/create',
        name: 'create',
        component: () => import('@/pages/CreateItemPage.vue'),
      },
      {
        path: '/reset',
        name: 'reset',
        component: () => import('@/pages/ResetPage.vue'),
      },
    ],
  },
  // System & Error Pages
  {
    path: '/unauthorized',
    name: 'unauthorized',
    component: () => import('@/pages/UnauthorizedPage.vue'),
    meta: { hideNavbar: true },
  },
  {
    path: '/notfound',
    name: 'notfound',
    component: () => import('@/pages/NotFoundPage.vue'),
    meta: { hideNavbar: true },
  },
  // Catch-all route to handle 404s gracefully
  {
    path: '/:pathMatch(.*)*',
    name: 'catchall',
    redirect: { name: 'notfound' },
  },
];
