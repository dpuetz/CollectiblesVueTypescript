import type { Directive } from 'vue';

const fadeIn: Directive = {
  mounted(el: HTMLElement) {
    // Start hidden
    el.style.opacity = '0';
    el.style.transition = 'opacity 0.5s ease-in-out';

    // If it's an image, wait for load
    if (el.tagName.toLowerCase() === 'img') {
      el.addEventListener('load', () => {
        el.style.opacity = '1';
      });
    } else {
      // For non-images, fade in immediately
      requestAnimationFrame(() => {
        el.style.opacity = '1';
      });
    }
  },
};
export default fadeIn;
