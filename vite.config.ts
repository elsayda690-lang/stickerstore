import vue from '@vitejs/plugin-vue';
import path from 'path';
import { defineConfig } from 'vite';

export default () => {
  return defineConfig({
    base: './', 
    root: path.resolve(__dirname, './src'),
    plugins: [vue()],
    resolve: {
      alias: {
        vue: 'vue/dist/vue.esm-bundler.js',
        // هنا السر: بنخلي Vite يستبدل المكتبات دي بمحتوى ملف الـ Mock بتاعنا
        'electron': path.resolve(__dirname, 'renderer.ts'),
        'fs': path.resolve(__dirname, 'renderer.ts'),
        'fs/promises': path.resolve(__dirname, 'renderer.ts'),
        'path': path.resolve(__dirname, 'renderer.ts'),
        'crypto': path.resolve(__dirname, 'renderer.ts'),
        'os': path.resolve(__dirname, 'renderer.ts'),
        'child_process': path.resolve(__dirname, 'renderer.ts'),
        'main': path.resolve(__dirname, 'renderer.ts'),
        'bree': path.resolve(__dirname, 'renderer.ts'),
        'better-sqlite3': path.resolve(__dirname, 'renderer.ts'),
      },
    },
    build: {
      outDir: 'dist',
      emptyOutDir: true,
      rollupOptions: {
        // ممنوع نحط fs أو أي مكتبة Node هنا في الـ external 
        // عشان Vite يضطر يستخدم الـ Alias اللي فوق
        external: [], 
        output: {
          manualChunks: undefined,
        },
      },
    }
  });
};