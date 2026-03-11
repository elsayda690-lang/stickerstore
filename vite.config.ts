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
    // السطر ده هو السر! بيخلي المسارات نسبية عشان تشتغل على GitHub Pages
    base: './', 
    server: { host, port, strictPort: true },
    root: path.resolve(__dirname, './src'),
    plugins: [vue()],
    resolve: {
      alias: {
        vue: 'vue/dist/vue.esm-bundler.js',
        // تم تعديل المسارات لتكون صحيحة بالنسبة لـ root (src)
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
      // الـ Build هيطلع في src/dist عشان يطابق الـ workflow بتاعنا
      outDir: 'dist',
      emptyOutDir: true,
      rollupOptions: {
        // تأمين عدم خروج أخطاء في الـ chunks الكبيرة
        output: {
          manualChunks: undefined,
        },
      },
    }
  });
};