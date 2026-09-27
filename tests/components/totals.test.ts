import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { mount } from '@vue/test-utils';
import { ref, reactive, nextTick } from 'vue';
import { formatUSD } from '@/utils/currency';

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------
// Only the store is mocked. formatUSD is left un-mocked and imported for
// real, so assertions compare against its actual Intl.NumberFormat output
// rather than a stand-in — this also exercises rounding/formatting for free.

const mockSubTotal = ref(0);
const mockShipping = ref(0);
const mockTax = ref(0);
const mockTotal = ref(0);

const mockCartStore = reactive({
  cartSubTotal: mockSubTotal,
  cartShipping: mockShipping,
  cartTax: mockTax,
  cartTotal: mockTotal,
});

vi.mock('@/stores/cartStore', () => ({
  useCartStore: vi.fn(() => mockCartStore),
}));

import Totals from '@/components/Totals.vue';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const mountComponent = () => mount(Totals);

const subtotalText = (wrapper: ReturnType<typeof mountComponent>) => wrapper.find('[data-test="subtotal"]').text();
const shippingText = (wrapper: ReturnType<typeof mountComponent>) => wrapper.find('[data-test="shipping"]').text();
const taxText = (wrapper: ReturnType<typeof mountComponent>) => wrapper.find('[data-test="tax"]').text();
const totalText = (wrapper: ReturnType<typeof mountComponent>) => wrapper.find('[data-test="total"]').text();

// ---------------------------------------------------------------------------
// Setup / teardown
// ---------------------------------------------------------------------------

beforeEach(() => {
  mockSubTotal.value = 0;
  mockShipping.value = 0;
  mockTax.value = 0;
  mockTotal.value = 0;
});

afterEach(() => {
  vi.clearAllMocks();
});

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('Totals.vue', () => {
  it('renders the formatted subtotal, shipping, tax, and total from the store', () => {
    mockSubTotal.value = 49.99;
    mockShipping.value = 5.5;
    mockTax.value = 4.13;
    mockTotal.value = 59.62;

    const wrapper = mountComponent();

    expect(subtotalText(wrapper)).toBe(formatUSD(49.99));
    expect(shippingText(wrapper)).toBe(formatUSD(5.5));
    expect(taxText(wrapper)).toBe(formatUSD(4.13));
    expect(totalText(wrapper)).toBe(formatUSD(59.62));
  });

  it('renders zeroed-out values for an empty cart', () => {
    const wrapper = mountComponent();

    expect(subtotalText(wrapper)).toBe('$0.00');
    expect(shippingText(wrapper)).toBe('$0.00');
    expect(taxText(wrapper)).toBe('$0.00');
    expect(totalText(wrapper)).toBe('$0.00');
  });

  it('renders whole-dollar amounts with two decimal places', () => {
    mockTotal.value = 20;
    const wrapper = mountComponent();

    expect(totalText(wrapper)).toBe('$20.00');
  });

  it('rounds fractional cents the same way Intl.NumberFormat does', () => {
    // Rounding at the third decimal is engine-dependent for NumberFormat,
    // so assert against the real formatter's own output rather than a
    // hardcoded string, to avoid a brittle, engine-specific test.
    mockSubTotal.value = 19.005;
    const wrapper = mountComponent();

    expect(subtotalText(wrapper)).toBe(formatUSD(19.005));
  });

  it('formats negative values (e.g. a discount driving a total negative)', () => {
    mockTotal.value = -5.25;
    const wrapper = mountComponent();

    expect(totalText(wrapper)).toBe(formatUSD(-5.25));
    expect(totalText(wrapper)).toContain('-');
  });

  it('updates reactively when the store values change', async () => {
    const wrapper = mountComponent();
    expect(totalText(wrapper)).toBe('$0.00');

    mockSubTotal.value = 20;
    mockTotal.value = 20;
    await nextTick();

    expect(subtotalText(wrapper)).toBe(formatUSD(20));
    expect(totalText(wrapper)).toBe(formatUSD(20));
  });

  it('renders the section labels', () => {
    const wrapper = mountComponent();
    const text = wrapper.text();

    expect(text).toContain('Subtotal');
    expect(text).toContain('Shipping');
    expect(text).toContain('Tax');
    expect(text).toContain('Total');
  });
});