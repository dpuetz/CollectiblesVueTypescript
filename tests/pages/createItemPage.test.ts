import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount, flushPromises, type VueWrapper } from '@vue/test-utils';

// ---------------------------------------------------------------------------
// Adjust this import to match where CreateItemPage.vue actually lives
// relative to this spec file (e.g. '../views/CreateItemPage.vue').
// ---------------------------------------------------------------------------
import CreateItemPage from '@/pages/CreateItemPage.vue';

// ---------------------------------------------------------------------------
// Hoisted mocks (vi.mock factories are hoisted above imports, so anything
// they reference must be created via vi.hoisted).
// ---------------------------------------------------------------------------
const { pushMock, showMessageMock, createItemMock, isNameTakenMock, getItemsMock } = vi.hoisted(() => ({
  pushMock: vi.fn(),
  showMessageMock: vi.fn(),
  createItemMock: vi.fn(),
  isNameTakenMock: vi.fn(),
  getItemsMock: vi.fn(),
}));

vi.mock('vue-router', () => ({
  useRouter: () => ({ push: pushMock }),
  RouterLink: {
    name: 'RouterLink',
    props: ['to'],
    template: '<a><slot /></a>',
  },
}));

vi.mock('@/stores/notificationStore', () => ({
  useNotificationStore: () => ({ showMessage: showMessageMock }),
}));

vi.mock('@/stores/productsStore', () => ({
  useProductsStore: () => ({
    createItem: createItemMock,
    isNameTaken: isNameTakenMock,
    getItems: getItemsMock,
  }),
}));

vi.mock('@heroicons/vue/24/outline', () => ({
  PhotoIcon: { name: 'PhotoIcon', template: '<svg data-testid="photo-icon" />' },
}));

// Simple stub for ConfirmDialog that exposes buttons to fire @confirm / @cancel
// and renders the isLoading prop so we can assert on it.
const ConfirmDialogStub = {
  name: 'ConfirmDialog',
  props: ['title', 'message', 'confirmLabel', 'loadingLabel', 'isLoading'],
  emits: ['confirm', 'cancel'],
  template: `
    <div class="confirm-dialog-stub" :data-loading="isLoading">
      <button class="confirm-btn" @click="$emit('confirm')">confirm</button>
      <button class="cancel-btn" @click="$emit('cancel')">cancel</button>
    </div>
  `,
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function createFile(name: string, type: string, sizeBytes: number): File {
  return new File(['a'.repeat(sizeBytes)], name, { type });
}

function setInputFiles(input: HTMLInputElement, files: File[]) {
  Object.defineProperty(input, 'files', { value: files, configurable: true });
}

function mountPage() {
  return mount(CreateItemPage, {
    global: {
      directives: { 'fade-in': {} }, // no-op stub for v-fade-in
      stubs: {
        ValidationMessage: true,
        ConfirmDialog: ConfirmDialogStub,
      },
    },
  });
}

async function fillValidForm(wrapper: VueWrapper) {
  await wrapper.find('#name').setValue('Vintage Ceramic Bowl');
  await wrapper.find('#description').setValue('A lovely vintage ceramic bowl from the 1950s.');
  await wrapper.find('#price').setValue('25.5');
  await wrapper.find('#category').setValue('Bowls');
  await wrapper.find('#circa').setValue('1950');

  const file = createFile('bowl.png', 'image/png', 1024);
  const input = wrapper.find('input[type="file"]').element as HTMLInputElement;
  setInputFiles(input, [file]);
  await wrapper.find('input[type="file"]').trigger('change');

  return file;
}

let urlCounter = 0;

beforeEach(() => {
  vi.clearAllMocks();
  isNameTakenMock.mockReturnValue(false);
  createItemMock.mockResolvedValue(null); // no error by default
  getItemsMock.mockResolvedValue(undefined); // fire-and-forget in onMounted
  urlCounter = 0;
  global.URL.createObjectURL = vi.fn(() => `blob:mock-${urlCounter++}`);
  global.URL.revokeObjectURL = vi.fn();
});

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------
describe('CreateItemPage.vue', () => {
  describe('initial render', () => {
    it('renders empty inputs and a disabled submit button', () => {
      const wrapper = mountPage();

      expect((wrapper.find('#name').element as HTMLInputElement).value).toBe('');
      expect((wrapper.find('#description').element as HTMLTextAreaElement).value).toBe('');
      expect((wrapper.find('#category').element as HTMLSelectElement).value).toBe('');
      expect(wrapper.find('button[type="submit"]').attributes('disabled')).toBeDefined();
    });

    it('fetches items on mount', () => {
      mountPage();

      expect(getItemsMock).toHaveBeenCalledTimes(1);
    });

    it('shows the "no image selected" placeholder when no file is chosen', () => {
      const wrapper = mountPage();

      expect(wrapper.text()).toContain('No image selected');
      expect(wrapper.find('img').exists()).toBe(false);
    });

    it('lists all four categories as options', () => {
      const wrapper = mountPage();
      const options = wrapper.findAll('#category option').map((o) => o.text());

      expect(options).toEqual(['Select a category', 'Bowls', 'Canisters', 'Plates', 'Shakers']);
    });

    it('reflects the selected category in the "use as icon" label', async () => {
      const wrapper = mountPage();
      await wrapper.find('#category').setValue('Plates');

      expect(wrapper.text()).toContain('representative icon for the');
      expect(wrapper.text()).toContain('Plates');
    });
  });

  describe('file selection', () => {
    it('shows an image preview and sets imageUrl when a valid file is chosen', async () => {
      const wrapper = mountPage();
      const file = createFile('bowl.png', 'image/png', 1024);
      const input = wrapper.find('input[type="file"]').element as HTMLInputElement;
      setInputFiles(input, [file]);
      await wrapper.find('input[type="file"]').trigger('change');

      expect(global.URL.createObjectURL).toHaveBeenCalledWith(file);
      expect(wrapper.find('img').exists()).toBe(true);
      expect(wrapper.find('img').attributes('src')).toBe('blob:mock-0');
    });

    it('revokes the previous preview URL when a new file replaces it', async () => {
      const wrapper = mountPage();
      const input = wrapper.find('input[type="file"]').element as HTMLInputElement;

      setInputFiles(input, [createFile('a.png', 'image/png', 1024)]);
      await wrapper.find('input[type="file"]').trigger('change');

      setInputFiles(input, [createFile('b.png', 'image/png', 1024)]);
      await wrapper.find('input[type="file"]').trigger('change');

      expect(global.URL.revokeObjectURL).toHaveBeenCalledWith('blob:mock-0');
      expect(wrapper.find('img').attributes('src')).toBe('blob:mock-1');
    });

    it('clears the preview and disables submit when the file selection is removed', async () => {
      const wrapper = mountPage();
      await fillValidForm(wrapper);
      expect(wrapper.find('button[type="submit"]').attributes('disabled')).toBeUndefined();

      const input = wrapper.find('input[type="file"]').element as HTMLInputElement;
      setInputFiles(input, []);
      await wrapper.find('input[type="file"]').trigger('change');

      expect(wrapper.find('img').exists()).toBe(false);
      expect(global.URL.revokeObjectURL).toHaveBeenCalled();
      expect(wrapper.find('button[type="submit"]').attributes('disabled')).toBeDefined();
    });
  });

  describe('price rounding', () => {
    it('rounds the price to two decimals on blur', async () => {
      const wrapper = mountPage();
      const price = wrapper.find('#price');
      await price.setValue('10.1267');
      await price.trigger('blur');

      expect((price.element as HTMLInputElement).value).toBe('10.13');
    });

    it('coerces an empty price to 0 on blur (isNaN("") is false, so the guard does not skip it)', async () => {
      const wrapper = mountPage();
      const price = wrapper.find('#price');
      await price.setValue('');
      await price.trigger('blur');

      expect((price.element as HTMLInputElement).value).toBe('0');
    });
  });

  describe('validation / submit enablement', () => {
    it('enables submit once every field and a valid file are supplied', async () => {
      const wrapper = mountPage();
      await fillValidForm(wrapper);

      expect(wrapper.find('button[type="submit"]').attributes('disabled')).toBeUndefined();
    });

    it('keeps submit disabled when the name is already taken', async () => {
      isNameTakenMock.mockReturnValue(true);
      const wrapper = mountPage();
      await fillValidForm(wrapper);

      expect(wrapper.find('button[type="submit"]').attributes('disabled')).toBeDefined();
      expect(isNameTakenMock).toHaveBeenCalledWith('Vintage Ceramic Bowl', 0);
    });

    it('keeps submit disabled for a file with a disallowed type', async () => {
      const wrapper = mountPage();
      await fillValidForm(wrapper);

      const input = wrapper.find('input[type="file"]').element as HTMLInputElement;
      setInputFiles(input, [createFile('bowl.gif', 'image/gif', 1024)]);
      await wrapper.find('input[type="file"]').trigger('change');

      expect(wrapper.find('button[type="submit"]').attributes('disabled')).toBeDefined();
    });

    it('keeps submit disabled for a file larger than 300KB', async () => {
      const wrapper = mountPage();
      await fillValidForm(wrapper);

      const input = wrapper.find('input[type="file"]').element as HTMLInputElement;
      setInputFiles(input, [createFile('bowl.png', 'image/png', 400 * 1024)]);
      await wrapper.find('input[type="file"]').trigger('change');

      expect(wrapper.find('button[type="submit"]').attributes('disabled')).toBeDefined();
    });

    it('keeps submit disabled for a circa year beyond the current year', async () => {
      const wrapper = mountPage();
      await fillValidForm(wrapper);
      await wrapper.find('#circa').setValue(String(new Date().getFullYear() + 1));

      expect(wrapper.find('button[type="submit"]').attributes('disabled')).toBeDefined();
    });
  });

  describe('confirm dialog', () => {
    it('does not open the confirm dialog when the form is submitted invalid', async () => {
      const wrapper = mountPage();
      await wrapper.find('form').trigger('submit.prevent');

      expect(wrapper.findComponent(ConfirmDialogStub).exists()).toBe(false);
    });

    it('opens the confirm dialog when the form is submitted valid', async () => {
      const wrapper = mountPage();
      await fillValidForm(wrapper);
      await wrapper.find('form').trigger('submit.prevent');

      expect(wrapper.findComponent(ConfirmDialogStub).exists()).toBe(true);
    });

    it('closes the confirm dialog on cancel without saving', async () => {
      const wrapper = mountPage();
      await fillValidForm(wrapper);
      await wrapper.find('form').trigger('submit.prevent');

      await wrapper.findComponent(ConfirmDialogStub).find('.cancel-btn').trigger('click');

      expect(wrapper.findComponent(ConfirmDialogStub).exists()).toBe(false);
      expect(createItemMock).not.toHaveBeenCalled();
    });
  });

  describe('confirmSave', () => {
    it('saves successfully: calls the store, shows a success notification, resets, and navigates after a delay', async () => {
      vi.useFakeTimers();
      const wrapper = mountPage();
      const file = await fillValidForm(wrapper);
      await wrapper.find('form').trigger('submit.prevent');

      await wrapper.findComponent(ConfirmDialogStub).find('.confirm-btn').trigger('click');
      await flushPromises();

      expect(createItemMock).toHaveBeenCalledTimes(1);
      const [savedItem, savedFile] = createItemMock.mock.calls[0];
      expect(savedItem).toMatchObject({
        name: 'Vintage Ceramic Bowl',
        description: 'A lovely vintage ceramic bowl from the 1950s.',
        price: 25.5,
        category: 'Bowls',
        circa: 1950,
        imageUrl: 'bowl.png',
      });
      expect(savedFile).toBe(file);

      expect(showMessageMock).toHaveBeenCalledWith('Item added successfully!', false, 'success');
      expect(wrapper.findComponent(ConfirmDialogStub).exists()).toBe(false);
      expect(pushMock).not.toHaveBeenCalled();

      vi.advanceTimersByTime(1000);
      expect(pushMock).toHaveBeenCalledWith({ name: 'admin' });

      vi.useRealTimers();
    });

    it('sets isLoading on the dialog while the save is in flight', async () => {
      let resolveCreate: (value: string | null) => void = () => {};
      createItemMock.mockImplementation(
        () => new Promise((resolve) => { resolveCreate = resolve; })
      );

      const wrapper = mountPage();
      await fillValidForm(wrapper);
      await wrapper.find('form').trigger('submit.prevent');
      await wrapper.findComponent(ConfirmDialogStub).find('.confirm-btn').trigger('click');
      await wrapper.vm.$nextTick();

      expect(wrapper.findComponent(ConfirmDialogStub).props('isLoading')).toBe(true);

      resolveCreate(null);
      await flushPromises();

      expect(wrapper.findComponent(ConfirmDialogStub).exists()).toBe(false);
    });

    it('closes the dialog without notifying or navigating when the store returns an error', async () => {
      createItemMock.mockResolvedValue('Something went wrong');

      const wrapper = mountPage();
      await fillValidForm(wrapper);
      await wrapper.find('form').trigger('submit.prevent');
      await wrapper.findComponent(ConfirmDialogStub).find('.confirm-btn').trigger('click');
      await flushPromises();

      expect(createItemMock).toHaveBeenCalledTimes(1);
      expect(wrapper.findComponent(ConfirmDialogStub).exists()).toBe(false);
      expect(showMessageMock).not.toHaveBeenCalled();
      expect(pushMock).not.toHaveBeenCalled();
    });
  });

  describe('lifecycle', () => {
    it('revokes the preview object URL on unmount', async () => {
      const wrapper = mountPage();
      const input = wrapper.find('input[type="file"]').element as HTMLInputElement;
      setInputFiles(input, [createFile('bowl.png', 'image/png', 1024)]);
      await wrapper.find('input[type="file"]').trigger('change');

      wrapper.unmount();

      expect(global.URL.revokeObjectURL).toHaveBeenCalledWith('blob:mock-0');
    });
  });
});