import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import { ref, reactive, nextTick } from 'vue';
import type { Item } from '@/models/item';

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------

const push = vi.fn();
const mockRoute = { params: { id: '5' } };

vi.mock('vue-router', () => ({
  useRoute: vi.fn(() => mockRoute),
  useRouter: vi.fn(() => ({ push })),
  RouterLink: { name: 'RouterLink', props: ['to'], template: '<a><slot /></a>' },
}));

const showMessage = vi.fn();
vi.mock('@/stores/notificationStore', () => ({
  useNotificationStore: vi.fn(() => ({ showMessage })),
}));

const getItems = vi.fn();
const getItem = vi.fn();
const updateItem = vi.fn();
const isNameTaken = vi.fn();
const mockIsLoading = ref(false);

const mockProductsStore = reactive({
  isLoading: mockIsLoading,
  getItems,
  getItem,
  updateItem,
  isNameTaken,
});

vi.mock('@/stores/productsStore', () => ({
  useProductsStore: vi.fn(() => mockProductsStore),
}));

const getItemImage = vi.fn((item: Item | null) => (item ? `mock-image/${item.id}` : ''));
vi.mock('@/utils/image', () => ({ getItemImage: (...args: [Item | null]) => getItemImage(...args) }));

import EditPage from '@/pages/EditPage.vue';

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

const buildItem = (overrides: Partial<Item> = {}): Item => ({
  id: 5,
  name: 'Vintage Vase',
  description: 'A lovely vintage ceramic vase from the 1920s.',
  price: 49.99,
  category: 'ceramics',
  categoryIcon: false,
  imageUrl: 'vase.jpg',
  circa: 1920,
  ...overrides,
});

const mountComponent = () =>
  mount(EditPage, {
    global: {
      directives: {
        'fade-in': {},
      },
      stubs: {
        ArrowPathIcon: true,
        ValidationMessage: true,
      },
    },
  });

// ---------------------------------------------------------------------------
// Setup / teardown
// ---------------------------------------------------------------------------

beforeEach(() => {
  mockIsLoading.value = false;
  mockRoute.params.id = '5';
  getItems.mockReset().mockResolvedValue(undefined);
  getItem.mockReset().mockReturnValue(buildItem());
  updateItem.mockReset().mockResolvedValue('');
  isNameTaken.mockReset().mockReturnValue(false);
  push.mockReset();
  showMessage.mockReset();
  vi.spyOn(console, 'error').mockImplementation(() => {});
});

afterEach(() => {
  vi.restoreAllMocks();
  vi.useRealTimers();
});

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('EditPage.vue', () => {
  describe('loading state', () => {
    it('shows a loading spinner and hides the form while the store is loading', async () => {
      mockIsLoading.value = true;
      const wrapper = mountComponent();
      await flushPromises();

      expect(wrapper.text()).toContain('Loading treasure details...');
      expect(wrapper.find('form').exists()).toBe(false);
    });

    it('hides the spinner and shows the form once loading completes', async () => {
      mockIsLoading.value = false;
      const wrapper = mountComponent();
      await flushPromises();

      expect(wrapper.text()).not.toContain('Loading treasure details...');
      expect(wrapper.find('form').exists()).toBe(true);
    });
  });

  describe('loading the item on mount', () => {
    it('looks up the item using the numeric route id', async () => {
      mockRoute.params.id = '5';
      mountComponent();
      await flushPromises();

      expect(getItem).toHaveBeenCalledWith(5);
    });

    it('pre-fills the form fields from the found item', async () => {
      getItem.mockReturnValue(buildItem({ name: 'Antique Clock', description: 'A fine antique clock.', price: 120 }));
      const wrapper = mountComponent();
      await flushPromises();

      expect((wrapper.find('#name').element as HTMLInputElement).value).toBe('Antique Clock');
      expect((wrapper.find('#description').element as HTMLTextAreaElement).value).toBe('A fine antique clock.');
      expect((wrapper.find('#price').element as HTMLInputElement).value).toBe('120');
    });

    it('renders the item image using getItemImage and the item name as alt text', async () => {
      const item = buildItem({ id: 5, name: 'Vintage Vase' });
      getItem.mockReturnValue(item);
      const wrapper = mountComponent();
      await flushPromises();

      const img = wrapper.find('img');
      expect(img.attributes('src')).toBe('mock-image/5');
      expect(img.attributes('alt')).toBe('Vintage Vase');
    });

    it('shows the categoryIcon checkbox, naming the item\'s category, when an item is found', async () => {
      getItem.mockReturnValue(buildItem({ category: 'ceramics' }));
      const wrapper = mountComponent();
      await flushPromises();

      expect(wrapper.find('#categoryIcon').exists()).toBe(true);
      expect(wrapper.text()).toContain('ceramics');
    });

    it('clones the found item so edits do not mutate the store\'s copy', async () => {
      const original = buildItem({ name: 'Original Name' });
      getItem.mockReturnValue(original);
      const wrapper = mountComponent();
      await flushPromises();

      await wrapper.find('#name').setValue('Edited Name');

      expect(original.name).toBe('Original Name');
    });
  });

  describe('validation-gated submit button', () => {
    it('is enabled when the loaded item already satisfies all rules', async () => {
      getItem.mockReturnValue(buildItem());
      const wrapper = mountComponent();
      await flushPromises();

      expect(wrapper.find('button[type="submit"]').attributes('disabled')).toBeUndefined();
    });

    it('becomes disabled when the name is edited below the minimum length', async () => {
      const wrapper = mountComponent();
      await flushPromises();

      await wrapper.find('#name').setValue('Hi');
      await nextTick();

      expect(wrapper.find('button[type="submit"]').attributes('disabled')).toBeDefined();
    });

    it('becomes disabled when the price is set to zero or below', async () => {
      const wrapper = mountComponent();
      await flushPromises();

      await wrapper.find('#price').setValue('0');
      await nextTick();

      expect(wrapper.find('button[type="submit"]').attributes('disabled')).toBeDefined();
    });

    it('becomes disabled when isNameTaken reports a collision with another item', async () => {
      isNameTaken.mockReturnValue(true);
      const wrapper = mountComponent();
      await flushPromises();

      await wrapper.find('#name').setValue('Duplicate Name');
      await nextTick();

      expect(isNameTaken).toHaveBeenCalledWith('Duplicate Name', 5);
      expect(wrapper.find('button[type="submit"]').attributes('disabled')).toBeDefined();
    });

    it('excludes the item\'s own id when checking for name collisions', async () => {
      const wrapper = mountComponent();
      await flushPromises();

      await wrapper.find('#name').setValue('Vintage Vase');
      await nextTick();

      expect(isNameTaken).toHaveBeenCalledWith('Vintage Vase', 5);
    });
  });

  describe('save / confirm dialog', () => {
    it('opens the confirm dialog on submit when an item is loaded', async () => {
      const wrapper = mountComponent();
      await flushPromises();

      await wrapper.find('form').trigger('submit.prevent');
      await nextTick();

      expect(wrapper.findComponent({ name: 'ConfirmDialog' }).exists()).toBe(true);
    });

    it('closes the dialog without saving when the dialog is cancelled', async () => {
      const wrapper = mountComponent();
      await flushPromises();
      await wrapper.find('form').trigger('submit.prevent');
      await nextTick();

      await wrapper.findComponent({ name: 'ConfirmDialog' }).vm.$emit('cancel');
      await nextTick();

      expect(updateItem).not.toHaveBeenCalled();
      expect(wrapper.findComponent({ name: 'ConfirmDialog' }).exists()).toBe(false);
    });

    it('saves, shows a success toast, and navigates to admin after the delay on confirm', async () => {
      vi.useFakeTimers();
      const wrapper = mountComponent();
      await flushPromises();
      await wrapper.find('form').trigger('submit.prevent');
      await nextTick();

      await wrapper.findComponent({ name: 'ConfirmDialog' }).vm.$emit('confirm');
      await flushPromises();

      expect(updateItem).toHaveBeenCalledWith(expect.objectContaining({ id: 5, name: 'Vintage Vase' }));
      expect(showMessage).toHaveBeenCalledWith('Changes saved successfully!', false, 'success');
      expect(wrapper.findComponent({ name: 'ConfirmDialog' }).exists()).toBe(false);
      expect(push).not.toHaveBeenCalled();

      await vi.advanceTimersByTimeAsync(800);

      expect(push).toHaveBeenCalledWith({ name: 'admin' });
    });

    it('shows the dialog as loading while the save is in flight', async () => {
      let resolveUpdate: (value: string) => void;
      updateItem.mockReturnValueOnce(
        new Promise<string>((resolve) => {
          resolveUpdate = resolve;
        }),
      );
      const wrapper = mountComponent();
      await flushPromises();
      await wrapper.find('form').trigger('submit.prevent');
      await nextTick();

      const dialogPromise = wrapper.findComponent({ name: 'ConfirmDialog' }).vm.$emit('confirm');
      await nextTick();

      expect(wrapper.findComponent({ name: 'ConfirmDialog' }).props('isLoading')).toBe(true);

      resolveUpdate!('');
      await dialogPromise;
      await flushPromises();

      expect(wrapper.findComponent({ name: 'ConfirmDialog' })).toBeTruthy();
    });

    it('closes the dialog without a success toast or navigation when saving fails', async () => {
      vi.useFakeTimers();
      updateItem.mockResolvedValueOnce('Save failed on the server');
      const wrapper = mountComponent();
      await flushPromises();
      await wrapper.find('form').trigger('submit.prevent');
      await nextTick();

      await wrapper.findComponent({ name: 'ConfirmDialog' }).vm.$emit('confirm');
      await flushPromises();

      expect(wrapper.findComponent({ name: 'ConfirmDialog' }).exists()).toBe(false);
      expect(showMessage).not.toHaveBeenCalled();

      await vi.advanceTimersByTimeAsync(1000);
      expect(push).not.toHaveBeenCalled();
    });

    it('submitting the form directly (bypassing the disabled button) still opens the dialog for an invalid item', async () => {
      // save() only checks `item.value` truthiness, not v$.$invalid -- the
      // disabled button is the UI's only real validity gate. Programmatically
      // triggering the form's submit event bypasses that gate entirely.
      const wrapper = mountComponent();
      await flushPromises();
      await wrapper.find('#name').setValue('Hi'); // now invalid (too short)
      await nextTick();
      expect(wrapper.find('button[type="submit"]').attributes('disabled')).toBeDefined();

      await wrapper.find('form').trigger('submit.prevent');
      await nextTick();

      expect(wrapper.findComponent({ name: 'ConfirmDialog' }).exists()).toBe(true);
    });
  });
});