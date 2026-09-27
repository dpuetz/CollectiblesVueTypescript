import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import ConfirmDialog from '@/components/ConfirmDialog.vue';

const mountComponent = (props: Partial<InstanceType<typeof ConfirmDialog>['$props']> = {}) =>
  mount(ConfirmDialog, {
    props: {
      message: 'This action cannot be undone.',
      ...props,
    },
  });

describe('ConfirmDialog.vue', () => {
  describe('rendering / defaults', () => {
    it('renders the given message', () => {
      const wrapper = mountComponent({ message: 'Delete this item?' });
      expect(wrapper.find('p').text()).toBe('Delete this item?');
    });

    it('falls back to the default title when none is provided', () => {
      const wrapper = mountComponent();
      expect(wrapper.find('h3').text()).toBe('Are you sure?');
    });

    it('renders a custom title when provided', () => {
      const wrapper = mountComponent({ title: 'Remove item' });
      expect(wrapper.find('h3').text()).toBe('Remove item');
    });

    it('falls back to the default confirm label when none is provided', () => {
      const wrapper = mountComponent();
      expect(confirmButton(wrapper).text()).toBe('Delete');
    });

    it('renders a custom confirm label when provided', () => {
      const wrapper = mountComponent({ confirmLabel: 'Remove' });
      expect(confirmButton(wrapper).text()).toBe('Remove');
    });

    it('renders a "Cancel" button unconditionally', () => {
      const wrapper = mountComponent();
      expect(cancelButton(wrapper).text()).toBe('Cancel');
    });
  });

  describe('loading state', () => {
    it('shows the confirm label (not the loading label) when isLoading is falsy', () => {
      const wrapper = mountComponent({ isLoading: false, loadingLabel: 'Deleting…' });
      expect(confirmButton(wrapper).text()).toBe('Delete');
    });

    it('swaps to the default loading label when isLoading is true', () => {
      const wrapper = mountComponent({ isLoading: true });
      expect(confirmButton(wrapper).text()).toBe('Deleting…');
    });

    it('swaps to a custom loading label when isLoading is true', () => {
      const wrapper = mountComponent({ isLoading: true, loadingLabel: 'Removing…' });
      expect(confirmButton(wrapper).text()).toBe('Removing…');
    });

    it('disables both buttons when isLoading is true', () => {
      const wrapper = mountComponent({ isLoading: true });
      expect(confirmButton(wrapper).attributes('disabled')).toBeDefined();
      expect(cancelButton(wrapper).attributes('disabled')).toBeDefined();
    });

    it('leaves both buttons enabled when isLoading is false/omitted', () => {
      const wrapper = mountComponent();
      expect(confirmButton(wrapper).attributes('disabled')).toBeUndefined();
      expect(cancelButton(wrapper).attributes('disabled')).toBeUndefined();
    });
  });

  describe('events', () => {
    it('emits "confirm" when the confirm button is clicked', async () => {
      const wrapper = mountComponent();
      await confirmButton(wrapper).trigger('click');

      expect(wrapper.emitted('confirm')).toHaveLength(1);
      expect(wrapper.emitted('cancel')).toBeUndefined();
    });

    it('emits "cancel" when the cancel button is clicked', async () => {
      const wrapper = mountComponent();
      await cancelButton(wrapper).trigger('click');

      expect(wrapper.emitted('cancel')).toHaveLength(1);
      expect(wrapper.emitted('confirm')).toBeUndefined();
    });

    it('does not emit "confirm" or "cancel" when disabled buttons are clicked', async () => {
      const wrapper = mountComponent({ isLoading: true });

      await confirmButton(wrapper).trigger('click');
      await cancelButton(wrapper).trigger('click');

      // Native `disabled` attribute suppresses click handlers in the DOM.
      expect(wrapper.emitted('confirm')).toBeUndefined();
      expect(wrapper.emitted('cancel')).toBeUndefined();
    });

    it('emits "cancel" when the backdrop (self) is clicked', async () => {
      const wrapper = mountComponent();
      await wrapper.find('.fixed').trigger('click');

      expect(wrapper.emitted('cancel')).toHaveLength(1);
    });

    it('does not emit "cancel" when clicking inside the dialog panel', async () => {
      const wrapper = mountComponent();
      // .click.self on the backdrop means clicks on descendant elements
      // (like the panel) must NOT trigger the cancel emit.
      await wrapper.find('.max-w-sm').trigger('click');

      expect(wrapper.emitted('cancel')).toBeUndefined();
    });

    it('does not emit "cancel" from the backdrop when clicking the title/message text', async () => {
      const wrapper = mountComponent();
      await wrapper.find('h3').trigger('click');
      await wrapper.find('p').trigger('click');

      expect(wrapper.emitted('cancel')).toBeUndefined();
    });
  });
});

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function confirmButton(wrapper: ReturnType<typeof mountComponent>) {
  return wrapper.findAll('button')[1];
}

function cancelButton(wrapper: ReturnType<typeof mountComponent>) {
  return wrapper.findAll('button')[0];
}