import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { mount, RouterLinkStub, enableAutoUnmount } from '@vue/test-utils';
import { ref, reactive, nextTick } from 'vue';
import ConfirmDialog from '@/components/ConfirmDialog.vue';

// ConfirmDialog renders through a <Teleport to="body">, which inserts real
// DOM nodes outside the wrapper's own root. If a wrapper is never unmounted,
// its component instance stays alive and reactive to our shared mock refs;
// a later test mutating those refs can then make Vue try to re-patch a
// stale instance's teleported content. enableAutoUnmount unmounts every
// wrapper (and tears down its teleported nodes properly) after each test.
enableAutoUnmount(afterEach);

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------

interface MockUser {
  firstName: string;
  groups: string[];
}

const mockCurrentUser = ref<MockUser | null>(null);
const mockIsLoggedIn = ref(false);
const mockCartCount = ref(0);

const checkout = vi.fn();
const logout = vi.fn();
const push = vi.fn();

const mockCartStore = reactive({
  cartCount: mockCartCount,
  checkout,
});

const mockUserStore = reactive({
  currentUser: mockCurrentUser,
  isLoggedIn: mockIsLoggedIn,
  logout,
});

vi.mock('@/stores/cartStore', () => ({
  useCartStore: vi.fn(() => mockCartStore),
}));

vi.mock('@/stores/userStore', () => ({
  useUserStore: vi.fn(() => mockUserStore),
}));

vi.mock('vue-router', () => ({
  useRouter: vi.fn(() => ({ push })),
}));

import NavBar from '@/components/NavBar.vue';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

// ConfirmDialog is teleported to <body>. It's stubbed rather than rendered
// for real (we don't have its implementation here, and don't need it) --
// findComponent still locates it by its original definition regardless of
// where Teleport physically moves the DOM node, and .vm.$emit lets us
// simulate the user confirming/cancelling from inside it.
const mountComponent = (options: { attachToBody?: boolean } = {}) =>
  mount(NavBar, {
    attachTo: options.attachToBody ? document.body : undefined,
    global: {
      stubs: {
        RouterLink: RouterLinkStub,
        Bars3Icon: true,
        ShoppingCartIcon: true,
        UserIcon: true,
        ChevronDownIcon: true,
        ConfirmDialog: true,
      },
    },
  });

const linkTo = (wrapper: ReturnType<typeof mountComponent>, name: string) =>
  wrapper.findAllComponents(RouterLinkStub).find((l) => (l.props('to') as { name?: string })?.name === name);

// ---------------------------------------------------------------------------
// Setup / teardown
// ---------------------------------------------------------------------------

beforeEach(() => {
  mockCurrentUser.value = null;
  mockIsLoggedIn.value = false;
  mockCartCount.value = 0;
});

afterEach(() => {
  vi.clearAllMocks();
});

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('NavBar.vue', () => {
  describe('static links', () => {
    it('renders Home, Catalog, and About links pointing at the right route names', () => {
      const wrapper = mountComponent();

      expect(linkTo(wrapper, 'home')).toBeTruthy();
      expect(linkTo(wrapper, 'catalog')).toBeTruthy();
      expect(linkTo(wrapper, 'about')).toBeTruthy();
    });
  });

  describe('desktop admin menu', () => {
    it('does not render an Admin menu button when there is no user', () => {
      const wrapper = mountComponent();
      expect(wrapper.find('[data-test="admin-menu-btn"]').exists()).toBe(false);
    });

    it('does not render an Admin menu button for a non-admin user', () => {
      mockCurrentUser.value = { firstName: 'Sam', groups: ['customer'] };
      const wrapper = mountComponent();
      expect(wrapper.find('[data-test="admin-menu-btn"]').exists()).toBe(false);
    });

    it('renders an Admin menu button for an admin user, with the dropdown closed initially', () => {
      mockCurrentUser.value = { firstName: 'Sam', groups: ['customer', 'admin'] };
      const wrapper = mountComponent();

      expect(wrapper.find('[data-test="admin-menu-btn"]').exists()).toBe(true);
      expect(wrapper.find('[data-test="admin-menu"]').exists()).toBe(false);
      expect(linkTo(wrapper, 'admin')).toBeFalsy();
    });

    it('opens the dropdown, revealing Edit Items and Reset links, when the Admin button is clicked', async () => {
      mockCurrentUser.value = { firstName: 'Sam', groups: ['admin'] };
      const wrapper = mountComponent();

      await wrapper.find('[data-test="admin-menu-btn"]').trigger('click');

      expect(wrapper.find('[data-test="admin-menu"]').exists()).toBe(true);
      expect(linkTo(wrapper, 'admin')).toBeTruthy();
      expect(linkTo(wrapper, 'reset')).toBeTruthy();
    });

    it('toggles the dropdown closed again on a second click', async () => {
      mockCurrentUser.value = { firstName: 'Sam', groups: ['admin'] };
      const wrapper = mountComponent();
      const btn = wrapper.find('[data-test="admin-menu-btn"]');

      await btn.trigger('click');
      expect(wrapper.find('[data-test="admin-menu"]').exists()).toBe(true);

      await btn.trigger('click');
      expect(wrapper.find('[data-test="admin-menu"]').exists()).toBe(false);
    });

    it('closes the dropdown after selecting a link inside it', async () => {
      mockCurrentUser.value = { firstName: 'Sam', groups: ['admin'] };
      const wrapper = mountComponent();

      await wrapper.find('[data-test="admin-menu-btn"]').trigger('click');
      await linkTo(wrapper, 'admin')!.trigger('click');

      expect(wrapper.find('[data-test="admin-menu"]').exists()).toBe(false);
    });

    it('closes the dropdown when clicking outside of it', async () => {
      mockCurrentUser.value = { firstName: 'Sam', groups: ['admin'] };
      const wrapper = mountComponent({ attachToBody: true });

      await wrapper.find('[data-test="admin-menu-btn"]').trigger('click');
      expect(wrapper.find('[data-test="admin-menu"]').exists()).toBe(true);

      document.body.dispatchEvent(new MouseEvent('click', { bubbles: true }));
      await nextTick();

      expect(wrapper.find('[data-test="admin-menu"]').exists()).toBe(false);
    });
  });

  describe('user greeting', () => {
    it('shows no greeting when there is no current user', () => {
      const wrapper = mountComponent();
      expect(wrapper.find('[data-test="greeting"]').exists()).toBe(false);
    });

    it('greets the user by first name when logged in', () => {
      mockCurrentUser.value = { firstName: 'Sam', groups: [] };
      const wrapper = mountComponent();
      const greeting = wrapper.find('[data-test="greeting"]');

      expect(greeting.exists()).toBe(true);
      expect(greeting.text()).toContain('Sam');
    });
  });

  describe('sign in / sign out', () => {
    it('shows "Sign In" and pushes straight to the login route when clicked while logged out', async () => {
      mockIsLoggedIn.value = false;
      const wrapper = mountComponent();
      const btn = wrapper.find('[data-test="signout-btn"]');

      expect(btn.text()).toContain('Sign In');

      await btn.trigger('click');

      expect(push).toHaveBeenCalledWith({ name: 'login' });
      expect(wrapper.findComponent(ConfirmDialog).exists()).toBe(false);
    });

    it('shows "Sign Out" and opens a confirmation dialog (without logging out yet) when clicked while logged in', async () => {
      mockIsLoggedIn.value = true;
      const wrapper = mountComponent();
      const btn = wrapper.find('[data-test="signout-btn"]');

      expect(btn.text()).toContain('Sign Out');

      await btn.trigger('click');

      expect(wrapper.findComponent(ConfirmDialog).exists()).toBe(true);
      expect(logout).not.toHaveBeenCalled();
      expect(push).not.toHaveBeenCalled();
    });

    it('checks out the cart, logs out, and navigates home once sign-out is confirmed', async () => {
      mockIsLoggedIn.value = true;
      const wrapper = mountComponent();

      await wrapper.find('[data-test="signout-btn"]').trigger('click');
      await wrapper.findComponent(ConfirmDialog).vm.$emit('confirm');
      await nextTick();

      expect(checkout).toHaveBeenCalledTimes(1);
      expect(logout).toHaveBeenCalledTimes(1);
      expect(push).toHaveBeenCalledWith({ name: 'home' });
      expect(wrapper.findComponent(ConfirmDialog).exists()).toBe(false);
    });

    it('closes the dialog without logging out or checking out when sign-out is cancelled', async () => {
      mockIsLoggedIn.value = true;
      const wrapper = mountComponent();

      await wrapper.find('[data-test="signout-btn"]').trigger('click');
      await wrapper.findComponent(ConfirmDialog).vm.$emit('cancel');
      await nextTick();

      expect(logout).not.toHaveBeenCalled();
      expect(checkout).not.toHaveBeenCalled();
      expect(push).not.toHaveBeenCalled();
      expect(wrapper.findComponent(ConfirmDialog).exists()).toBe(false);
    });
  });

  describe('cart badge', () => {
    it('hides the badge when the cart is empty', () => {
      mockCartCount.value = 0;
      const wrapper = mountComponent();
      expect(wrapper.find('[data-test="cart-badge"]').exists()).toBe(false);
    });

    it('shows the exact count when between 1 and 99', () => {
      mockCartCount.value = 5;
      const wrapper = mountComponent();
      expect(wrapper.find('[data-test="cart-badge"]').text()).toBe('5');
    });

    it('caps the displayed count at "99+" beyond 99', () => {
      mockCartCount.value = 150;
      const wrapper = mountComponent();
      expect(wrapper.find('[data-test="cart-badge"]').text()).toBe('99+');
    });

    it('always renders a Cart link pointing at the cart route', () => {
      const wrapper = mountComponent();
      expect(linkTo(wrapper, 'cart')).toBeTruthy();
    });
  });

  describe('mobile menu', () => {
    it('is closed by default', () => {
      const wrapper = mountComponent();
      expect(wrapper.find('[data-test="mobile-backdrop"]').exists()).toBe(false);
    });

    it('opens the backdrop and drawer when the hamburger is clicked', async () => {
      const wrapper = mountComponent();
      await wrapper.find('[data-test="hamburger"]').trigger('click');

      expect(wrapper.find('[data-test="mobile-backdrop"]').exists()).toBe(true);
    });

    it('toggles closed again on a second hamburger click', async () => {
      const wrapper = mountComponent();
      const hamburger = wrapper.find('[data-test="hamburger"]');

      await hamburger.trigger('click');
      expect(wrapper.find('[data-test="mobile-backdrop"]').exists()).toBe(true);

      await hamburger.trigger('click');
      expect(wrapper.find('[data-test="mobile-backdrop"]').exists()).toBe(false);
    });

    it('closes when the backdrop is clicked', async () => {
      const wrapper = mountComponent();
      await wrapper.find('[data-test="hamburger"]').trigger('click');

      await wrapper.find('[data-test="mobile-backdrop"]').trigger('click');
      await nextTick();

      expect(wrapper.find('[data-test="mobile-backdrop"]').exists()).toBe(false);
    });

    it('closes after clicking a plain link (e.g. Home) inside it', async () => {
      mockCurrentUser.value = { firstName: 'Sam', groups: [] };
      const wrapper = mountComponent();
      await wrapper.find('[data-test="hamburger"]').trigger('click');

      // Second "home" link on the page is the one inside the mobile drawer.
      const homeLinks = wrapper
        .findAllComponents(RouterLinkStub)
        .filter((l) => (l.props('to') as { name?: string })?.name === 'home');
      expect(homeLinks.length).toBeGreaterThanOrEqual(2);

      await homeLinks[homeLinks.length - 1].trigger('click');
      await nextTick();

      expect(wrapper.find('[data-test="mobile-backdrop"]').exists()).toBe(false);
    });

    describe('mobile admin submenu', () => {
      it('does not render an admin toggle for non-admin users', async () => {
        const wrapper = mountComponent();
        await wrapper.find('[data-test="hamburger"]').trigger('click');

        expect(wrapper.find('[data-test="admin-menu-btn-mobile"]').exists()).toBe(false);
      });

      it('reveals Edit Items and Reset links only after toggling the admin submenu', async () => {
        mockCurrentUser.value = { firstName: 'Sam', groups: ['admin'] };
        const wrapper = mountComponent();
        await wrapper.find('[data-test="hamburger"]').trigger('click');

        expect(linkTo(wrapper, 'admin')).toBeFalsy();

        await wrapper.find('[data-test="admin-menu-btn-mobile"]').trigger('click');

        expect(linkTo(wrapper, 'admin')).toBeTruthy();
        expect(linkTo(wrapper, 'reset')).toBeTruthy();
      });

      it('closes the whole drawer after picking a link from the admin submenu', async () => {
        mockCurrentUser.value = { firstName: 'Sam', groups: ['admin'] };
        const wrapper = mountComponent();
        await wrapper.find('[data-test="hamburger"]').trigger('click');
        await wrapper.find('[data-test="admin-menu-btn-mobile"]').trigger('click');

        await linkTo(wrapper, 'admin')!.trigger('click');
        await nextTick();

        expect(wrapper.find('[data-test="mobile-backdrop"]').exists()).toBe(false);
      });
    });
  });
});
