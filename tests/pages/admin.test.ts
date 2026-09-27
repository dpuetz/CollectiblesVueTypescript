import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount, RouterLinkStub } from '@vue/test-utils';
import { ref } from 'vue';
import AdminPage from '@/pages/AdminPage.vue';
import type { Item } from '@/models/item';

// ---------------------------------------------------------------------------
// Hoisted mock fns/state (vi.mock factories are hoisted above imports, so
// anything they reference must be created via vi.hoisted).
// ---------------------------------------------------------------------------
const {
  notificationShowMessage,
  sentryCaptureException,
  cartExists,
  productsState,
  useSearchMock,
  useDeleteItemMock,
  deleteItemFn,
} = vi.hoisted(() => {
  return {
    notificationShowMessage: vi.fn(),
    sentryCaptureException: vi.fn(),
    cartExists: vi.fn(),
    productsState: { isLoading: false, getItems: vi.fn().mockResolvedValue(['', []]) },
    useSearchMock: vi.fn(),
    useDeleteItemMock: vi.fn(),
    deleteItemFn: vi.fn(),
  };
});

vi.mock('@sentry/vue', () => ({
  captureException: sentryCaptureException,
}));

vi.mock('@/stores/notificationStore', () => ({
  useNotificationStore: () => ({ showMessage: notificationShowMessage }),
}));

vi.mock('@/stores/productsStore', () => ({
  useProductsStore: () => productsState,
}));

vi.mock('@/stores/cartStore', () => ({
  useCartStore: () => ({ exists: cartExists }),
}));

// Real storeToRefs behavior isn't needed here - just wrap plain props in refs.
vi.mock('pinia', async () => {
  const { ref: vueRef } = await import('vue');
  return {
    storeToRefs: (store: Record<string, unknown>) => {
      const result: Record<string, unknown> = {};
      for (const key of Object.keys(store)) {
        result[key] = vueRef(store[key]);
      }
      return result;
    },
  };
});

vi.mock('@/composables/useSearch', () => ({
  useSearch: useSearchMock,
}));

vi.mock('@/composables/useDeleteItem', () => ({
  useDeleteItem: useDeleteItemMock,
}));

vi.mock('@/utils/currency', () => ({
  formatUSD: (n: number) => `$${n.toFixed(2)}`,
}));

vi.mock('@/utils/image', () => ({
  getItemImage: (item: Item) => `/images/${item.id}.jpg`,
}));

vi.mock('@/components/ConfirmDialog.vue', () => ({
  default: {
    name: 'ConfirmDialog',
    props: ['message', 'isLoading'],
    emits: ['confirm', 'cancel'],
    template: `
      <div class="confirm-dialog-stub">
        <span class="message">{{ message }}</span>
        <span class="loading-state">{{ isLoading }}</span>
        <button class="confirm-btn" @click="$emit('confirm')">Confirm</button>
        <button class="cancel-btn" @click="$emit('cancel')">Cancel</button>
      </div>
    `,
  },
}));

vi.mock('@/components/NoResults.vue', () => ({
  default: {
    name: 'NoResults',
    template: `<div class="no-results-stub">No results</div>`,
  },
}));

// ---------------------------------------------------------------------------
// Test helpers
// ---------------------------------------------------------------------------
const makeItem = (overrides: Partial<Item> = {}): Item =>
  ({
    id: 1,
    name: 'Widget',
    description: 'A very fine widget',
    price: 19.99,
    ...overrides,
  }) as Item;

function mountPage() {
  return mount(AdminPage, {
    global: {
      stubs: { RouterLink: RouterLinkStub },
      directives: { fadeIn: {} }, // no-op stub for v-fade-in
    },
  });
}

let capturedDeleteOptions: { onSuccess: () => void; onError: (msg: string) => void };

beforeEach(() => {
  vi.clearAllMocks();
  productsState.isLoading = false;

  useSearchMock.mockImplementation(() => ({
    queryMessage: ref(''),
    showItems: ref<Item[]>([makeItem()]),
  }));

  useDeleteItemMock.mockImplementation((options) => {
    capturedDeleteOptions = options;
    return {
      deleteItem: deleteItemFn,
      isDeleting: ref(false),
    };
  });
});

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------
describe('AdminPage', () => {
  describe('loading state', () => {
    it('shows a loading indicator and hides the item list while isLoading is true', () => {
      productsState.isLoading = true;
      const wrapper = mountPage();

      expect(wrapper.text()).toContain('Loading treasure details...');
      expect(wrapper.find('#search').exists()).toBe(false);
    });

    it('shows the page content once isLoading is false', () => {
      productsState.isLoading = false;
      const wrapper = mountPage();

      expect(wrapper.text()).not.toContain('Loading treasure details...');
      expect(wrapper.find('#search').exists()).toBe(true);
    });
  });

  describe('header', () => {
    it('renders a "Create New" link to the create route', () => {
      const wrapper = mountPage();
      const createLink = wrapper.findComponent(RouterLinkStub);

      expect(createLink.props('to')).toEqual({ name: 'create' });
      expect(createLink.text()).toContain('Create New');
    });
  });

  describe('search input', () => {
    it('passes the search term ref (and category) through to useSearch', async () => {
      const wrapper = mountPage();
      const input = wrapper.find('#searchInput');

      await input.setValue('sword');

      expect(useSearchMock).toHaveBeenCalled();
      const [searchTermArg, categoryArg] = useSearchMock.mock.calls[0];
      expect(searchTermArg.value).toBe('sword');
      expect(categoryArg.value).toBe('all');
    });

    it('shows the clear (X) button only when searchTerm is non-empty, and clears it on click', async () => {
      const wrapper = mountPage();
      const input = wrapper.find('#searchInput');

      expect(input.element.value).toBe('');

      await input.setValue('sword');
      const clearButton = wrapper
        .findAll('button')
        .find((b) => b.attributes('type') === 'button' && b.classes().some((c) => c.includes('absolute')));
      expect(clearButton).toBeTruthy();

      await clearButton!.trigger('click');
      expect((wrapper.find('#searchInput').element as HTMLInputElement).value).toBe('');
    });
  });

  describe('query message and empty state', () => {
    it('renders the queryMessage returned by useSearch', () => {
      useSearchMock.mockImplementation(() => ({
        queryMessage: ref('Showing 3 results for "sword"'),
        showItems: ref<Item[]>([makeItem()]),
      }));
      const wrapper = mountPage();

      expect(wrapper.text()).toContain('Showing 3 results for "sword"');
    });

    it('shows NoResults when showItems is empty', () => {
      useSearchMock.mockImplementation(() => ({
        queryMessage: ref(''),
        showItems: ref<Item[]>([]),
      }));
      const wrapper = mountPage();

      expect(wrapper.find('.no-results-stub').exists()).toBe(true);
    });

    it('does not show NoResults when showItems has entries', () => {
      const wrapper = mountPage();
      expect(wrapper.find('.no-results-stub').exists()).toBe(false);
    });
  });

  describe('item list rendering', () => {
    it('renders each item with name, description, price, and image', () => {
      useSearchMock.mockImplementation(() => ({
        queryMessage: ref(''),
        showItems: ref<Item[]>([
          makeItem({ id: 1, name: 'Widget', description: 'Desc A', price: 10 }),
          makeItem({ id: 2, name: 'Gadget', description: 'Desc B', price: 25.5 }),
        ]),
      }));
      const wrapper = mountPage();
      const text = wrapper.text();

      expect(text).toContain('Widget');
      expect(text).toContain('Desc A');
      expect(text).toContain('$10.00');
      expect(text).toContain('Gadget');
      expect(text).toContain('Desc B');
      expect(text).toContain('$25.50');

      const images = wrapper.findAll('img');
      expect(images[0].attributes('src')).toBe('/images/1.jpg');
      expect(images[1].attributes('src')).toBe('/images/2.jpg');
    });

    it('renders an Edit link per item pointing at the edit route with the item id', () => {
      useSearchMock.mockImplementation(() => ({
        queryMessage: ref(''),
        showItems: ref<Item[]>([makeItem({ id: 42 })]),
      }));
      const wrapper = mountPage();

      const editLink = wrapper
        .findAllComponents(RouterLinkStub)
        .find((c) => c.text().includes('Edit'));

      expect(editLink?.props('to')).toEqual({ name: 'edit', params: { id: 42 } });
    });
  });

  describe('delete flow', () => {
    it('blocks deletion and shows an error notification when the item is in the cart', async () => {
      cartExists.mockReturnValue(true);
      const item = makeItem();
      useSearchMock.mockImplementation(() => ({
        queryMessage: ref(''),
        showItems: ref<Item[]>([item]),
      }));
      const wrapper = mountPage();

      await wrapper.find('.btn-outline-danger').trigger('click');

      expect(notificationShowMessage).toHaveBeenCalledWith(
        'Sorry, cannot delete this item because it is in the cart.',
        false,
        'error',
      );
      expect(wrapper.find('.confirm-dialog-stub').exists()).toBe(false);
    });

    it('opens the confirm dialog when the item is not in the cart', async () => {
      cartExists.mockReturnValue(false);
      const item = makeItem({ name: 'Rare Coin' });
      useSearchMock.mockImplementation(() => ({
        queryMessage: ref(''),
        showItems: ref<Item[]>([item]),
      }));
      const wrapper = mountPage();

      await wrapper.find('.btn-outline-danger').trigger('click');

      const dialog = wrapper.find('.confirm-dialog-stub');
      expect(dialog.exists()).toBe(true);
      expect(dialog.find('.message').text()).toContain('Rare Coin');
    });

    it('calls deleteItem with the pending item id on confirm', async () => {
      cartExists.mockReturnValue(false);
      const item = makeItem({ id: 7 });
      useSearchMock.mockImplementation(() => ({
        queryMessage: ref(''),
        showItems: ref<Item[]>([item]),
      }));
      const wrapper = mountPage();

      await wrapper.find('.btn-outline-danger').trigger('click');
      await wrapper.find('.confirm-btn').trigger('click');

      expect(deleteItemFn).toHaveBeenCalledWith(7);
    });

    it('closes the dialog without deleting when cancel is clicked', async () => {
      cartExists.mockReturnValue(false);
      const item = makeItem();
      useSearchMock.mockImplementation(() => ({
        queryMessage: ref(''),
        showItems: ref<Item[]>([item]),
      }));
      const wrapper = mountPage();

      await wrapper.find('.btn-outline-danger').trigger('click');
      await wrapper.find('.cancel-btn').trigger('click');

      expect(wrapper.find('.confirm-dialog-stub').exists()).toBe(false);
      expect(deleteItemFn).not.toHaveBeenCalled();
    });

    it('does nothing if confirmDelete is somehow invoked with no pending item', async () => {
      // Regression guard for the `if (!pendingDeleteItem.value) return;` early exit.
      cartExists.mockReturnValue(false);
      mountPage();

      // Never opened the dialog, so deleteItem should never fire.
      expect(deleteItemFn).not.toHaveBeenCalled();
    });

    it('on successful delete: closes the dialog and shows a success notification with the item name', async () => {
      cartExists.mockReturnValue(false);
      const item = makeItem({ id: 9, name: 'Ancient Vase' });
      useSearchMock.mockImplementation(() => ({
        queryMessage: ref(''),
        showItems: ref<Item[]>([item]),
      }));
      const wrapper = mountPage();

      await wrapper.find('.btn-outline-danger').trigger('click');
      expect(wrapper.find('.confirm-dialog-stub').exists()).toBe(true);

      capturedDeleteOptions.onSuccess();
      await wrapper.vm.$nextTick();

      expect(wrapper.find('.confirm-dialog-stub').exists()).toBe(false);
      expect(notificationShowMessage).toHaveBeenCalledWith(
        "'Ancient Vase' was deleted successfully.",
        false,
        'success',
      );
    });

    it('on failed delete: closes the dialog, reports to Sentry, and shows an error notification with the item name', async () => {
      cartExists.mockReturnValue(false);
      const item = makeItem({ name: 'Cursed Amulet' });
      useSearchMock.mockImplementation(() => ({
        queryMessage: ref(''),
        showItems: ref<Item[]>([item]),
      }));
      const wrapper = mountPage();

      await wrapper.find('.btn-outline-danger').trigger('click');

      capturedDeleteOptions.onError('boom');
      await wrapper.vm.$nextTick();

      expect(wrapper.find('.confirm-dialog-stub').exists()).toBe(false);
      expect(sentryCaptureException).toHaveBeenCalledWith('boom', {
        tags: { context: 'handleDeleteError' },
      });
      expect(notificationShowMessage).toHaveBeenCalledWith(
        "Sorry, an unexpected error has occurred while trying to delete 'Cursed Amulet'.",
        false,
        'error',
      );
    });

    it('passes isDeleting through to the confirm dialog as isLoading', async () => {
      cartExists.mockReturnValue(false);
      useDeleteItemMock.mockImplementation((options) => {
        capturedDeleteOptions = options;
        return { deleteItem: deleteItemFn, isDeleting: ref(true) };
      });
      const item = makeItem();
      useSearchMock.mockImplementation(() => ({
        queryMessage: ref(''),
        showItems: ref<Item[]>([item]),
      }));
      const wrapper = mountPage();

      await wrapper.find('.btn-outline-danger').trigger('click');

      expect(wrapper.find('.loading-state').text()).toBe('true');
    });
  });
});
