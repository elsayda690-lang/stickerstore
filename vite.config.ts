import vue from '@vitejs/plugin-vue';
import path from 'path';
import { defineConfig } from 'vite';

export default () => {
  return defineConfig({
    base: './', 
    root: path.resolve(__dirname, './src'), // الـ Root بتاعك هو src
    plugins: [vue()],
    resolve: {
      alias: {
        vue: 'vue/dist/vue.esm-bundler.js',
        // هنا بنقول لـ Vite يروح فين بالظبط لما يشوف كلمة backend أو غيرها
        'backend': path.resolve(__dirname, './backend'),
        'main': path.resolve(__dirname, './src/renderer.ts'), 
        'electron': path.resolve(__dirname, './src/renderer.ts'),
        // إضافة alias لكل المسارات اللي بره src ومحتاجها في الـ build
        'schemas': path.resolve(__dirname, './schemas'),
        'models': path.resolve(__dirname, './models'),
      },
    },
    build: {
      outDir: '../dist', // عشان يرمي الـ build بره الـ src
      emptyOutDir: true,
      rollupOptions: {
        // أي حاجة تانية تطلع Error ضيفها هنا في الـ external مؤقتاً
        external: ['electron', 'better-sqlite3', 'bree'],
      },
    }
  });
};