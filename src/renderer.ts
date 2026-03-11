// @ts-nocheck
import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import { fyo } from './initFyo';
import FeatherIcon from './components/FeatherIcon.vue';
import Badge from './components/Badge.vue';
import { outsideClickDirective } from './renderer/helpers';

// 1. التأكد من وجود الـ Mock قبل البدء (صمام أمان إضافي)
if (typeof window !== 'undefined' && !window.ipc) {
    console.warn("IPC Mock not found in HTML, injecting fallback...");
    window.ipc = {
        getEnv: async () => ({ isDevelopment: false, platform: 'web', version: '1.0.0' }),
        invoke: async () => ({}),
        on: () => {},
        send: () => {},
        db: { call: async () => [], bespoke: async () => ({}) }
    };
}

(async () => {
    // 2. محاكاة إعدادات اللغة (عشان ما يضربش وهو بيقرأ Config)
    try {
        const language = (await window.ipc.get('language')) || 'English';
        fyo.store.language = language;
    } catch (e) {
        fyo.store.language = 'English';
    }

    // 3. جلب بيانات البيئة من الـ Mock
    const { isDevelopment, platform, version } = await window.ipc.getEnv();
    fyo.store.isDevelopment = isDevelopment;
    fyo.store.appVersion = version;
    fyo.store.platform = platform;

    // 4. بناء تطبيق Vue
    const app = createApp(App);

    app.use(router);
    app.component('FeatherIcon', FeatherIcon);
    app.component('Badge', Badge);
    app.directive('on-outside-click', outsideClickDirective);

    // 5. حقن الـ Global Properties (عشان الـ HTML يعرف يوصل لـ fyo)
    app.config.globalProperties.fyo = fyo;
    app.config.globalProperties.t = fyo.t;
    app.config.globalProperties.T = fyo.T;

    // 6. التشغيل النهائي
    const root = document.getElementById('app');
    if (root) {
        app.mount(root);
        console.log("🚀 Frappe Books Web Version Mounted!");
    }
})();