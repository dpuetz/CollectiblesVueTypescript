import { describe, it, expect, vi, beforeEach } from 'vitest';
import { reactive, ref } from 'vue';
import { mount, type VueWrapper } from '@vue/test-utils';
import type { Item } from '@/models/item';
import { formatUSD } from '@/utils/currency';

// ---------------------------------------------------------------------------
// Adjust this import to match where CatalogPage.vue actually lives relative
// to this spec file (e.g. '../pages/CatalogPage.vue').
// ---------------------------------------------------------------------------
import CatalogPage from '@/pages/CatalogPage.vue';

// ---------------------------------------------------------------------------
// Hoisted mock state.
//
// NOT mocked, run for real: '@/composables/useSearch' and '@/utils/currency'
// -- both simple, given implementations, so search/formatting get real
// coverage rather than a fabricated stand-in.
//
// IMPORTANT: vi.hoisted() callbacks run before this file's own
// `import { reactive, ref } from 'vue'` binding is initialized (unlike
// vi.mock factories, which run lazily later, after imports are resolved).
// So vi.hoisted can only hold plain, import-free values here -- the actual
// reactive()/ref() instances for productsStore are created lazily inside
// its vi.mock factory below and memoized into `containers`.
// ---------------------------------------------------------------------------
const { pushMock, existsMock, getItemsMock, getItemImageMock, containers } = vi.hoisted(() => ({
  pushMock: vi.fn(),
  existsMock: vi.fn(),
  getItemsMock: vi.fn(),
  getItemImageMock: vi.fn((item: { imageUrl: string }) => `mock-image/${item.imageUrl}`),
  containers: {
    productsStore: undefined as
      | undefined
      | {
          isLoading: boolean;
          itemsAr: Item[];
          categoryIconItems: Item[];
          getItems: () => Promise<void>;
        },
    // Plain object -- route.params is only ever read once, synchronously,
    // inside onMounted, so it doesn't need to be reactive.
    route: { params: {} as Record<string, string> },
  },
}));

vi.mock('vue-router', () => ({
  useRouter: () => ({ push: pushMock }),
  useRoute: () => containers.route,
}));

vi.mock('@/stores/productsStore', () => {
  containers.productsStore ??= reactive({
    isLoading: ref(false),
    itemsAr: ref([] as Item[]),
    categoryIconItems: ref([] as Item[]),
    getItems: getItemsMock,
  });
  return { useProductsStore: () => containers.productsStore };
});

vi.mock('@/stores/cartStore', () => ({
  useCartStore: () => ({ exists: existsMock }),
}));

vi.mock('@/utils/image', () => ({
  getItemImage: getItemImageMock,
}));

vi.mock('@heroicons/vue/24/outline', () => ({
  XMarkIcon: { name: 'XMarkIcon', template: '<svg data-testid="icon-clear" />' },
  MagnifyingGlassIcon: { name: 'MagnifyingGlassIcon', template: '<svg data-testid="icon-search" />' },
  ArrowPathIcon: { name: 'ArrowPathIcon', template: '<svg data-testid="icon-loading" />' },
}));

// NoResults is a real child component (@/components/NoResults.vue). Its own
// markup/logic isn't under test here, so it's stubbed with a simple template
// that preserves the "No items found" text the specs assert on.
vi.mock('@/components/NoResults.vue', () => ({
  default: {
    name: 'NoResults',
    template: '<div data-testid="no-results">No items found</div>',
  },
}));

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function buildItem(overrides: Partial<Item> = {}): Item {
  return {
    id: 1,
    name: 'Ancient Ceramic Bowl',
    description: 'A weathered bowl from a bygone era.',
    price: 25.5,
    category: 'Bowls',
    categoryIcon: false,
    imageUrl: 'bowl.png',
    circa: 1950,
    ...overrides,
  };
}

function mountPage(): VueWrapper {
  return mount(CatalogPage, {
    global: {
      directives: { 'fade-in': {} },
    },
  });
}

beforeEach(() => {
  vi.clearAllMocks();
  containers.productsStore!.isLoading = false;
  containers.productsStore!.itemsAr = [];
  containers.productsStore!.categoryIconItems = [];
  containers.route.params = {};
  existsMock.mockReturnValue(false);
  getItemsMock.mockResolvedValue(undefined);
});

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------
describe('CatalogPage.vue', () => {
  describe('initialization', () => {
    it('fetches items on mount', () => {
      mountPage();

      expect(getItemsMock).toHaveBeenCalledTimes(1);
    });

    it('seeds the selected category from the route filter param', async () => {
      containers.route.params = { filter: 'Bowls' };
      containers.productsStore!.categoryIconItems = [buildItem({ id: 10, category: 'Bowls', categoryIcon: true })];
      containers.productsStore!.itemsAr = [
        buildItem({ id: 1, name: 'Ancient Ceramic Bowl', category: 'Bowls' }),
        buildItem({ id: 2, name: 'Porcelain Plate', category: 'Plates' }),
      ];
      const wrapper = mountPage();
      // getItems() is awaited before the route filter is applied.
      await getItemsMock.mock.results[0]?.value;
      await wrapper.vm.$nextTick();

      expect(wrapper.text()).toContain('Ancient Ceramic Bowl');
      expect(wrapper.text()).not.toContain('Porcelain Plate');
    });
  });

  describe('loading state', () => {
    it('shows a loading indicator and hides categories/search while isLoading is true', () => {
      containers.productsStore!.isLoading = true;
      const wrapper = mountPage();

      expect(wrapper.text()).toContain('Loading treasures...');
      expect(wrapper.find('#categories').exists()).toBe(false);
      expect(wrapper.find('#searchInput').exists()).toBe(false);
    });
  });

  describe('category tiles', () => {
    it('filters items to the clicked category', async () => {
      containers.productsStore!.categoryIconItems = [buildItem({ id: 10, category: 'Bowls', categoryIcon: true })];
      containers.productsStore!.itemsAr = [
        buildItem({ id: 1, name: 'Ancient Ceramic Bowl', category: 'Bowls' }),
        buildItem({ id: 2, name: 'Porcelain Plate', category: 'Plates' }),
      ];
      const wrapper = mountPage();

      const bowlsTile = wrapper.findAll('.catImages').find((t) => t.text().includes('Bowls'));
      await bowlsTile!.trigger('click');

      expect(wrapper.text()).toContain('Showing all Bowls');
      expect(wrapper.text()).toContain('Ancient Ceramic Bowl');
      expect(wrapper.text()).not.toContain('Porcelain Plate');
    });
  });

  describe('search', () => {
    it('clears the search term via the clear button', async () => {
      containers.productsStore!.itemsAr = [buildItem({ id: 1, name: 'Ancient Ceramic Bowl' })];
      const wrapper = mountPage();

      await wrapper.find('#searchInput').setValue('bowl');
      const clearButton = wrapper.findAll('button').find((b) => b.find('[data-testid="icon-clear"]').exists());
      await clearButton!.trigger('click');

      expect((wrapper.find('#searchInput').element as HTMLInputElement).value).toBe('');
      expect(wrapper.find('[data-testid="icon-search"]').exists()).toBe(true);
    });

    it('shows "No items found" when the filtered list is empty', async () => {
      containers.productsStore!.itemsAr = [buildItem({ id: 1, name: 'Ancient Ceramic Bowl' })];
      const wrapper = mountPage();

      await wrapper.find('#searchInput').setValue('nonexistent');

      expect(wrapper.text()).toContain('No items found');
    });
  });

  describe('item grid', () => {
    it('renders each item with its name, formatted price, and image', () => {
      containers.productsStore!.itemsAr = [
        buildItem({ id: 1, name: 'Ancient Ceramic Bowl', price: 25.5 }),
        buildItem({ id: 2, name: 'Brass Candlestick', price: 100, imageUrl: 'candlestick.png' }),
      ];
      const wrapper = mountPage();

      expect(wrapper.text()).toContain('Ancient Ceramic Bowl');
      expect(wrapper.text()).toContain(formatUSD(25.5));
      expect(wrapper.text()).toContain('Brass Candlestick');
      expect(wrapper.text()).toContain(formatUSD(100));

      const images = wrapper.findAll('#items img');
      expect(images).toHaveLength(2);
      expect(images[0].attributes('src')).toBe('mock-image/bowl.png');
      expect(images[0].attributes('alt')).toBe('Ancient Ceramic Bowl');
    });

    it('shows an "In Cart" badge only for items already in the cart', () => {
      containers.productsStore!.itemsAr = [
        buildItem({ id: 1, name: 'Ancient Ceramic Bowl' }),
        buildItem({ id: 2, name: 'Brass Candlestick' }),
      ];
      existsMock.mockImplementation((item: Item) => item.id === 1);
      const wrapper = mountPage();

      const cards = wrapper.findAll('#items > div');
      expect(cards[0].text()).toContain('In Cart');
      expect(cards[1].text()).not.toContain('In Cart');
    });

    it('navigates to item details when a card is clicked', async () => {
      containers.productsStore!.itemsAr = [buildItem({ id: 42, name: 'Ancient Ceramic Bowl' })];
      const wrapper = mountPage();

      await wrapper.find('#items > div').trigger('click');

      expect(pushMock).toHaveBeenCalledWith({ name: 'details', params: { id: 42 } });
    });
  });
});