import { defineConfig } from 'vitest/config';
import vue from '@vitejs/plugin-vue';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';

export default defineConfig({
  base: '/collectibles/',
  plugins: [tailwindcss(), vue()],
  test: {
    include: ['**/*.spec.js'],
    environment: 'jsdom',
    coverage: {
      provider: 'v8',
    },
  },
  define: {
    'import.meta.env.DEV': false,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 8080,
    proxy: {
      '/api': {
        target: 'https://localhost:44331',
        changeOrigin: true,
        secure: false,
      },
      '/images': {
        target: 'https://localhost:44331',
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
