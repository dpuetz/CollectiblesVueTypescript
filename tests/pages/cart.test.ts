import { mount } from '@vue/test-utils';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import CartPage from '@/pages/CartPage.vue'; // adjust path
import { useCartStore } from '@/stores/cartStore';
import { useNotificationStore } from '@/stores/notificationStore';
import fadeInDirective from '@/directives/fadeIn';

// ---- Mocks ----
vi.mock('@/stores/cartStore', () => {
  return {
    useCartStore: vi.fn(),
  };
});

vi.mock('@/stores/notificationStore', () => {
  return {
    useNotificationStore: vi.fn(),
  };
});

vi.mock('@/components/ConfirmDialog.vue', () => ({
  default: {
    name: 'ConfirmDialog',
    props: ['message', 'isLoading', 'loadingLabel', 'confirmLabel'],
    emits: ['confirm', 'cancel'],
    template: '<div class="confirm-dialog"><slot /></div>',
  },
}));

vi.mock('@/components/Totals.vue', () => ({
  default: {
    name: 'Totals',
    template: '<div class="totals-component">Totals</div>',
  },
}));

vi.mock('@/components/CartEmpty.vue', () => ({
  default: {
    name: 'CartEmpty',
    template: '<div class="cart-empty">Empty</div>',
  },
}));

vi.mock('@/utils/image', () => ({
  getItemImage: () => '/test-image.png',
}));

vi.mock('@/utils/currency', () => ({
  formatUSD: (v: number) => `$${v.toFixed(2)}`,
}));

// ---- Test Data ----
const mockItems = [
  { id: 1, name: 'Test Product', price: 10, category: 'tools' },
  { id: 2, name: 'Another Product', price: 20, category: 'books' },
];

let removeMock: any;
let cartStoreMock: any;
let showMessageMock: any;
let notificationStoreMock: any;

function mountPage() {
  return mount(CartPage, {
    global: {
      directives: {
        'fade-in': fadeInDirective,
      },
      stubs: {
        RouterLink: {
          template: '<a><slot /></a>',
        },
      },
    },
  });
}

beforeEach(() => {
  removeMock = vi.fn();

  cartStoreMock = {
    cart: [],
    cartCount: 0,
    remove: removeMock,
  };

  showMessageMock = vi.fn();

  notificationStoreMock = {
    showMessage: showMessageMock,
  };

  (useCartStore as any).mockReturnValue(cartStoreMock);
  (useNotificationStore as any).mockReturnValue(notificationStoreMock);
});

// ------------------------------------------------------------
// TESTS
// ------------------------------------------------------------

describe('CartPage.vue', () => {
  it('renders empty cart state', () => {
    const wrapper = mountPage();
    expect(wrapper.find('.cart-empty').exists()).toBe(true);
  });

  it('renders cart items when present', () => {
    cartStoreMock.cart = mockItems;
    cartStoreMock.cartCount = mockItems.length;

    const wrapper = mountPage();

    const cards = wrapper.findAll('.group');
    expect(cards.length).toBe(2);

    expect(wrapper.text()).toContain('Test Product');
    expect(wrapper.text()).toContain('Another Product');
  });

  it('opens confirm dialog when clicking remove', async () => {
    cartStoreMock.cart = mockItems;
    cartStoreMock.cartCount = mockItems.length;

    const wrapper = mountPage();

    const removeBtn = wrapper.find('button.btn-outline-danger');
    await removeBtn.trigger('click');

    const dialog = wrapper.find('.confirm-dialog');
    expect(dialog.exists()).toBe(true);
    expect(wrapper.findComponent({ name: 'ConfirmDialog' }).props('message')).toContain(
      'Test Product',
    );
  });

  it('removes item when confirmRemove is triggered', async () => {
    cartStoreMock.cart = mockItems;
    cartStoreMock.cartCount = mockItems.length;

    const wrapper = mountPage();

    // click remove
    const removeBtn = wrapper.find('button.btn-outline-danger');
    await removeBtn.trigger('click');

    // simulate confirm event (custom component event, not a DOM event)
    await wrapper.findComponent({ name: 'ConfirmDialog' }).vm.$emit('confirm');

    expect(removeMock).toHaveBeenCalledWith(mockItems[0]);
    expect(showMessageMock).toHaveBeenCalledWith(
      "'Test Product' was deleted successfully.",
      false,
      'success',
    );

    // dialog should close after confirming
    expect(wrapper.find('.confirm-dialog').exists()).toBe(false);
  });

  it('closes confirm dialog on cancel without removing', async () => {
    cartStoreMock.cart = mockItems;
    cartStoreMock.cartCount = mockItems.length;

    const wrapper = mountPage();

    const removeBtn = wrapper.find('button.btn-outline-danger');
    await removeBtn.trigger('click');

    await wrapper.findComponent({ name: 'ConfirmDialog' }).vm.$emit('cancel');

    expect(removeMock).not.toHaveBeenCalled();
    expect(wrapper.find('.confirm-dialog').exists()).toBe(false);
  });

  it('renders totals card', () => {
    cartStoreMock.cart = mockItems;
    cartStoreMock.cartCount = mockItems.length;

    const wrapper = mountPage();

    expect(wrapper.find('.totals-component').exists()).toBe(true);
  });

  it('renders checkout and continue shopping links', () => {
    cartStoreMock.cart = mockItems;
    cartStoreMock.cartCount = mockItems.length;

    const wrapper = mountPage();

    const links = wrapper.findAll('a');
    expect(links.length).toBeGreaterThan(0);

    expect(wrapper.text()).toContain('Proceed to Checkout');
    expect(wrapper.text()).toContain('Continue Shopping');
  });
});
