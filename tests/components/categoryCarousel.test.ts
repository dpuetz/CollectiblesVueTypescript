import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { mount, RouterLinkStub, flushPromises } from '@vue/test-utils';
import { ref, reactive, nextTick } from 'vue';
import type { Item } from '@/models/item';

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------

// Underlying refs we mutate per-test to drive the store's reactive state.
const mockItemsAr = ref<Item[]>([]);
const mockCategoryIconItems = ref<Item[]>([]);

// getItemsRefreshed is called (and awaited) in onMounted. In real usage it
// populates the store as a side effect; in these tests we drive the store
// directly via the refs above, so it's just a resolved no-op we can assert
// was invoked.
const mockGetItemsRefreshed = vi.fn().mockResolvedValue(undefined);

// Wrapped in reactive() so Pinia's ref-auto-unwrap semantics hold: both
// `storeToRefs(productsStore)` (used for itemsAr) and direct
// `productsStore.categoryIconItems` / `productsStore.itemsAr` access (used
// for the categories computed and updateCategoryImage) behave the same way
// they do against a real Pinia store.
const mockStore = reactive({
  itemsAr: mockItemsAr,
  categoryIconItems: mockCategoryIconItems,
  getItemsRefreshed: mockGetItemsRefreshed,
});

vi.mock('@/stores/productsStore', () => ({
  useProductsStore: vi.fn(() => mockStore),
}));

vi.mock('@/utils/image', () => ({
  getItemImage: vi.fn((item: Item | null) => (item ? `mock-image/${item.id}` : '')),
}));

import CategoryCarousel from '@/components/CategoryCarousel.vue';
import { getItemImage } from '@/utils/image';

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

const makeItem = (overrides: Partial<Item>): Item =>
  ({
    id: 1,
    name: 'Item',
    category: 'shoes',
    categoryIcon: false,
    imageUrl: 'img.jpg',
    ...overrides,
  }) as Item;

const shoesA = makeItem({ id: 1, name: 'Shoe A', category: 'shoes', categoryIcon: true, imageUrl: 'a.jpg' });
const shoesB = makeItem({ id: 2, name: 'Shoe B', category: 'shoes', categoryIcon: false, imageUrl: 'b.jpg' });
const hatsA = makeItem({ id: 3, name: 'Hat A', category: 'hats', categoryIcon: true, imageUrl: 'c.jpg' });

const CAROUSEL_INTERVAL = 2500;

// The image is wrapped in a <transition mode="out-in">. Stubbing it out
// means the swap is synchronous in tests instead of depending on jsdom's
// (nonexistent) CSS transition timing, which fake timers don't reliably
// drive.
const mountComponent = () =>
  mount(CategoryCarousel, {
    global: {
      stubs: {
        RouterLink: RouterLinkStub,
        ChevronRightIcon: true,
        Transition: true,
        transition: true,
      },
    },
  });

// Mounts and lets both the initial DOM render (nextTick) and the awaited
// onMounted call to getItemsRefreshed (flushPromises) settle.
const mountAndSettle = async () => {
  const wrapper = mountComponent();
  await nextTick();
  await flushPromises();
  return wrapper;
};

// ---------------------------------------------------------------------------
// Setup / teardown
// ---------------------------------------------------------------------------

beforeEach(() => {
  vi.useFakeTimers();
  mockItemsAr.value = [];
  mockCategoryIconItems.value = [];
});

afterEach(() => {
  vi.clearAllTimers();
  vi.useRealTimers();
  vi.clearAllMocks();
  mockGetItemsRefreshed.mockResolvedValue(undefined);
});

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('CategoryCarousel.vue', () => {
  it('renders nothing while items/categories have not landed', async () => {
    const wrapper = await mountAndSettle();

    expect(wrapper.find('.mt-10').exists()).toBe(false);
    expect(wrapper.findAll('.group').length).toBe(0);
  });

  it('calls getItemsRefreshed on mount to populate the store', async () => {
    await mountAndSettle();

    expect(mockGetItemsRefreshed).toHaveBeenCalledTimes(1);
  });

  it('renders one card per distinct category once data lands', async () => {
    mockItemsAr.value = [shoesA, shoesB, hatsA];
    mockCategoryIconItems.value = [shoesA, hatsA];

    const wrapper = await mountAndSettle();

    const cards = wrapper.findAll('.group');
    expect(cards).toHaveLength(2);
    expect(wrapper.text()).toContain('shoes');
    expect(wrapper.text()).toContain('hats');
  });

  it('links each card to the catalog route filtered by category', async () => {
    mockItemsAr.value = [shoesA, hatsA];
    mockCategoryIconItems.value = [shoesA, hatsA];

    const wrapper = await mountAndSettle();

    const links = wrapper.findAllComponents(RouterLinkStub);
    expect(links).toHaveLength(2);
    expect(links[0].props('to')).toEqual({ name: 'catalog', params: { filter: 'shoes' } });
    expect(links[1].props('to')).toEqual({ name: 'catalog', params: { filter: 'hats' } });
  });

  it('renders the first item of each category as the initial image on start', async () => {
    mockItemsAr.value = [shoesA, shoesB, hatsA];
    mockCategoryIconItems.value = [shoesA, hatsA];

    const wrapper = await mountAndSettle();

    const imgs = wrapper.findAll('img');
    expect(imgs).toHaveLength(2);
    expect(imgs[0].attributes('src')).toBe('mock-image/1'); // shoesA
    expect(imgs[0].attributes('alt')).toBe('Shoe A');
    expect(imgs[1].attributes('src')).toBe('mock-image/3'); // hatsA
    expect(getItemImage).toHaveBeenCalled();
  });

  it('does not render an image for a category with no matching items', async () => {
    // categoryIconItems references a category with zero matching items in itemsAr
    const orphanIcon = makeItem({ id: 9, category: 'orphan', categoryIcon: true });
    mockItemsAr.value = [shoesA];
    mockCategoryIconItems.value = [shoesA, orphanIcon];

    const wrapper = await mountAndSettle();

    // Two category cards render (grid is driven by categoryIconItems)...
    expect(wrapper.findAll('.group')).toHaveLength(2);
    // ...but only one has resolved an image, since updateCategoryImage
    // bails out early when there are no items for that category.
    expect(wrapper.findAll('img')).toHaveLength(1);
  });

  it('cycles through each category on the carousel interval, round-robin', async () => {
    mockItemsAr.value = [shoesA, shoesB, hatsA];
    mockCategoryIconItems.value = [shoesA, hatsA];

    const wrapper = await mountAndSettle();

    // initial: shoes -> shoesA (index 0), hats -> hatsA (only item)
    expect(wrapper.findAll('img')[0].attributes('src')).toBe('mock-image/1');

    await vi.advanceTimersByTimeAsync(CAROUSEL_INTERVAL);
    await nextTick();
    // tick 1 rotates the "shoes" category (currentCategoryIndex 0 -> 1) to shoesB
    expect(wrapper.findAll('img')[0].attributes('src')).toBe('mock-image/2');

    await vi.advanceTimersByTimeAsync(CAROUSEL_INTERVAL);
    await nextTick();
    // tick 2 rotates "hats" (only one item, so it stays on hatsA)
    expect(wrapper.findAll('img')[1].attributes('src')).toBe('mock-image/3');

    await vi.advanceTimersByTimeAsync(CAROUSEL_INTERVAL);
    await nextTick();
    // tick 3 wraps back to "shoes", cycling shoesB -> shoesA
    expect(wrapper.findAll('img')[0].attributes('src')).toBe('mock-image/1');
  });

  it('clears the interval on unmount and stops updating images', async () => {
    mockItemsAr.value = [shoesA, shoesB];
    mockCategoryIconItems.value = [shoesA];

    const wrapper = await mountAndSettle();

    const clearSpy = vi.spyOn(window, 'clearInterval');
    wrapper.unmount();
    expect(clearSpy).toHaveBeenCalledTimes(1);

    // Advancing timers after unmount should not throw or keep firing logic
    // against a torn-down component.
    await expect(vi.advanceTimersByTimeAsync(CAROUSEL_INTERVAL * 3)).resolves.not.toThrow();
  });

  it('only starts the carousel once, even if the watcher fires again with non-empty data', async () => {
    mockItemsAr.value = [shoesA, shoesB];
    mockCategoryIconItems.value = [shoesA];

    const wrapper = await mountAndSettle();

    // Mutate again post-mount; startCarousel() should be a no-op the second
    // time because carouselInterval is already set (isReady also stays true).
    mockItemsAr.value = [...mockItemsAr.value, hatsA];
    mockCategoryIconItems.value = [shoesA, hatsA];
    await nextTick();
    await flushPromises();

    await vi.advanceTimersByTimeAsync(CAROUSEL_INTERVAL);
    await nextTick();

    // Exactly one rotation should have occurred (not two), proving a second
    // interval wasn't stacked on top of the first.
    expect(wrapper.findAll('img')[0].attributes('src')).toBe('mock-image/2');
  });

  it('does not render the carousel again if data later becomes empty (isReady sticky)', async () => {
    mockItemsAr.value = [shoesA];
    mockCategoryIconItems.value = [shoesA];

    const wrapper = await mountAndSettle();
    expect(wrapper.find('.mt-10').exists()).toBe(true);

    mockItemsAr.value = [];
    mockCategoryIconItems.value = [];
    await nextTick();

    // isReady is only ever set true, never reset — component should remain
    // in its "ready" (rendered) state per the watcher's guard.
    expect(wrapper.find('.mt-10').exists()).toBe(true);
  });
});