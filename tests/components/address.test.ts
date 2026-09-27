import { beforeEach, describe, expect, it, vi } from 'vitest';
import { flushPromises, mount } from '@vue/test-utils';
import Address from '@/components/Address.vue';
import { ShippingModel } from '@/models/checkout';

// Mock the states data and formatting util so option text/count is deterministic.
vi.mock('@/constants/states', () => ({
  default: [
    { abbreviation: 'CA', name: 'California' },
    { abbreviation: 'NY', name: 'New York' },
  ],
}));

vi.mock('@/utils/stateName', () => ({
  formatState: vi.fn((state: { abbreviation: string; name: string }) => `${state.name} (${state.abbreviation})`),
}));

// Mock the child validation component so this is a unit test of Address.vue's
// own wiring, not ValidationMessage's rendering. The stub exposes $invalid via
// a data attribute so tests can still assert validation state is wired up.
vi.mock('@/components/ValidationMessage.vue', () => ({
  default: {
    name: 'ValidationMessage',
    props: ['model'],
    template: '<div class="validation-message-stub" :data-invalid="model?.$invalid ?? false" />',
  },
}));

function mountAddress(options: { model?: ShippingModel; isDisabled?: boolean } = {}) {
  const model = options.model ?? new ShippingModel();
  return mount(Address, {
    props: {
      model,
      isDisabled: options.isDisabled,
    },
    slots: {
      default: '<div class="slot-content">Slot Content</div>',
    },
  });
}

describe('Address.vue', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the default slot', () => {
    const wrapper = mountAddress();

    expect(wrapper.find('.slot-content').text()).toBe('Slot Content');
  });

  it('renders an input for every field with the correct label', () => {
    const wrapper = mountAddress();

    const expectedFields: Array<[string, string]> = [
      ['fullName', 'Full Name'],
      ['company', 'Company'],
      ['address1', 'Street Address'],
      ['cityTown', 'City'],
      ['stateProvince', 'State/Province'],
      ['postalCode', 'Postal Code'],
    ];

    for (const [id, labelText] of expectedFields) {
      expect(wrapper.find(`label[for="${id}"]`).text()).toBe(labelText);
      expect(wrapper.find(`#${id}`).exists()).toBe(true);
    }
    // address2 has no label but does have an input
    expect(wrapper.find('#address2').exists()).toBe(true);
  });

  it('reflects the initial model values in each input', () => {
    const model = new ShippingModel();
    model.fullName = 'Jane Doe';
    model.company = 'Acme Co';
    model.address.address1 = '123 Main Street';
    model.address.address2 = 'Suite 400';
    model.address.cityTown = 'Springfield';
    model.address.stateProvince = 'NY';
    model.address.postalCode = '12345';

    const wrapper = mountAddress({ model });

    expect((wrapper.find('#fullName').element as HTMLInputElement).value).toBe('Jane Doe');
    expect((wrapper.find('#company').element as HTMLInputElement).value).toBe('Acme Co');
    expect((wrapper.find('#address1').element as HTMLInputElement).value).toBe('123 Main Street');
    expect((wrapper.find('#address2').element as HTMLInputElement).value).toBe('Suite 400');
    expect((wrapper.find('#cityTown').element as HTMLInputElement).value).toBe('Springfield');
    expect((wrapper.find('#stateProvince').element as HTMLSelectElement).value).toBe('NY');
    expect((wrapper.find('#postalCode').element as HTMLInputElement).value).toBe('12345');
  });

  it('updates the underlying model when an input changes (two-way binding)', async () => {
    const model = new ShippingModel();
    const wrapper = mountAddress({ model });

    await wrapper.find('#fullName').setValue('John Smith');
    await wrapper.find('#company').setValue('Initech');
    await wrapper.find('#address1').setValue('456 Oak Avenue');
    await wrapper.find('#address2').setValue('Apt 2');
    await wrapper.find('#cityTown').setValue('Shelbyville');
    await wrapper.find('#stateProvince').setValue('CA');
    await wrapper.find('#postalCode').setValue('90210');

    expect(model.fullName).toBe('John Smith');
    expect(model.company).toBe('Initech');
    expect(model.address.address1).toBe('456 Oak Avenue');
    expect(model.address.address2).toBe('Apt 2');
    expect(model.address.cityTown).toBe('Shelbyville');
    expect(model.address.stateProvince).toBe('CA');
    expect(model.address.postalCode).toBe('90210');
  });

  it('does not disable inputs by default', () => {
    const wrapper = mountAddress();

    expect(wrapper.find('#fullName').attributes('disabled')).toBeUndefined();
    expect(wrapper.find('#stateProvince').attributes('disabled')).toBeUndefined();
  });

  it('disables every input when isDisabled is true', () => {
    const wrapper = mountAddress({ isDisabled: true });

    const ids = ['fullName', 'company', 'address1', 'address2', 'cityTown', 'stateProvince', 'postalCode'];
    for (const id of ids) {
      expect(wrapper.find(`#${id}`).attributes('disabled')).toBeDefined();
    }
  });

  it('renders one option per state, formatted via formatState', () => {
    const wrapper = mountAddress();

    const options = wrapper.findAll('#stateProvince option');
    expect(options).toHaveLength(2);
    expect(options[0].attributes('value')).toBe('CA');
    expect(options[0].text()).toBe('California (CA)');
    expect(options[1].attributes('value')).toBe('NY');
    expect(options[1].text()).toBe('New York (NY)');
  });

  it('renders a ValidationMessage for every validated field', () => {
    const wrapper = mountAddress();

    // fullName, company, address1, address2, cityTown, stateProvince, postalCode
    expect(wrapper.findAllComponents({ name: 'ValidationMessage' })).toHaveLength(7);
  });

  it('marks fullName invalid when empty or below the minimum length, and valid once it meets the rules', async () => {
    const model = new ShippingModel();
    const wrapper = mountAddress({ model });
    await flushPromises();

    const fullNameMessage = () => wrapper.findAllComponents({ name: 'ValidationMessage' })[0];

    expect(fullNameMessage().attributes('data-invalid')).toBe('true'); // required fails on ''

    await wrapper.find('#fullName').setValue('Jo'); // below minLength(5)
    await flushPromises();
    expect(fullNameMessage().attributes('data-invalid')).toBe('true');

    await wrapper.find('#fullName').setValue('Jonathan');
    await flushPromises();
    expect(fullNameMessage().attributes('data-invalid')).toBe('false');
  });

  it('does not require company or address2, since they have no "required" rule', async () => {
    const model = new ShippingModel(); // company and address2 left blank
    const wrapper = mountAddress({ model });
    await flushPromises();

    const companyMessage = wrapper.findAllComponents({ name: 'ValidationMessage' })[1];
    const address2Message = wrapper.findAllComponents({ name: 'ValidationMessage' })[3];

    expect(companyMessage.attributes('data-invalid')).toBe('false');
    expect(address2Message.attributes('data-invalid')).toBe('false');
  });
});