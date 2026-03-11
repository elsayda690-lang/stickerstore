import vue from '@vitejs/plugin-vue';
import path from 'path';
import { defineConfig } from 'vite';

export default () => {
  let port = 6969;
  let host = '0.0.0.0';
  
  if (process.env.VITE_PORT && process.env.VITE_HOST) {
    port = Number(process.env.VITE_PORT);
    host = process.env.VITE_HOST;
  }

  return defineConfig({
    base: './', 
    server: { host, port, strictPort: true },
    root: path.resolve(__dirname, './src'),
    plugins: [vue()],
    resolve: {
      alias: {
        vue: 'vue/dist/vue.esm-bundler.js',
        // --- حجر الزاوية: خداع الكود الذي يحتاج ديسكتوب ---
        'electron': path.resolve(__dirname, './src/renderer.ts'),
        'fs': path.resolve(__dirname, './src/renderer.ts'),
        'path': path.resolve(__dirname, './src/renderer.ts'),
        'crypto': path.resolve(__dirname, './src/renderer.ts'),
        'os': path.resolve(__dirname, './src/renderer.ts'),
        'main': path.resolve(__dirname, './src/renderer.ts'), // حل مشكلة initSheduler
        'bree': path.resolve(__dirname, './src/renderer.ts'),
        './main/initSheduler': path.resolve(__dirname, './src/renderer.ts'),
        // --- باقي الـ Aliases الخاصة بك ---
        fyo: path.resolve(__dirname, './fyo'),
        src: path.resolve(__dirname, './src'),
        schemas: path.resolve(__dirname, './schemas'),
        backend: path.resolve(__dirname, './backend'),
        models: path.resolve(__dirname, './models'),
        utils: path.resolve(__dirname, './utils'),
        regional: path.resolve(__dirname, './regional'),
        reports: path.resolve(__dirname, './reports'),
        dummy: path.resolve(__dirname, './dummy'),
        fixtures: path.resolve(__dirname, './fixtures'),
      },
    },
    build: {
      outDir: 'dist',
      emptyOutDir: true,
      rollupOptions: {
        // منع Rollup من محاولة البحث عن مكتبات النظام
        external: [
          'electron', 'fs', 'path', 'crypto', 'os','main', 'bree', 
          'child_process', 'http', 'url', 'zlib', 'events'
        ],
        output: {
          manualChunks: undefined,
          globals: {
            main: 'window', // بنقوله اعتبر main هي الـ window بتاع المتصفح (عشان ميعملش crash)
            bree: 'Object'
          },
        },
      },
    }
  });
};