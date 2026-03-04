// @ts-nocheck
// --- بداية "خدعة" الويب الاحترافية لـ GitHub Pages ---
if (typeof window !== 'undefined' && !window.ipc) {
  const webMock = {
    getEnv: async () => ({
      isDevelopment: false,
      platform: 'linux', 
      version: '1.0.0-web-prototype'
    }),
    checkDbAccess: async () => true,
    getDbDefaultPath: async () => ':memory:',
    getDbList: async () => [], // أضفنا دي احتياطي
    checkForUpdates: async () => {},
    initScheduler: async () => {},
    // إضافة الـ config هنا لضمان عدم حدوث Error عند التحميل
    get: (key) => {
      const defaults = { 'language': 'en', 'theme': 'light' };
      return defaults[key] || {};
    },
    invoke: async () => ({}),
    send: () => {},
    on: () => {}
  };

  window.ipc = webMock;
  window.config = webMock; // حقن مباشر للـ config
  window.electron = { ipcRenderer: webMock };
}
// --- نهاية "الخدعة" ---

import { CUSTOM_EVENTS } from 'utils/messages';
import { UnexpectedLogObject } from 'utils/types';
import { App as VueApp, createApp } from 'vue';
import App from './App.vue';
import Badge from './components/Badge.vue';
import FeatherIcon from './components/FeatherIcon.vue';
import { handleError, sendError } from './errorHandling';
import { fyo } from './initFyo'; // الـ fyo اللي جواه isElectron: false
import { outsideClickDirective } from './renderer/helpers';
import registerIpcRendererListeners from './renderer/registerIpcRendererListeners';
import router from './router';
import { stringifyCircular } from './utils';
import { setLanguageMap } from './utils/language';

// eslint-disable-next-line @typescript-eslint/no-floating-promises
(async () => {
  // هنا بنستخدم الـ fyo اللي تم تحصينه في initFyo.ts
  const language = fyo.config.get('language') as string;
  if (language) {
    await setLanguageMap(language);
  }
  fyo.store.language = language || 'English';

  // بنشغل الـ Listeners فقط لو الـ ipc الحقيقي موجود (بنعرفها من الـ prototype اللي حددناه فوق)
  if (window.ipc && window.ipc.getEnv && !window.ipc.getEnv.toString().includes('web-prototype')) {
    registerIpcRendererListeners();
  }

  // @ts-ignore
  const { isDevelopment, platform, version } = await window.ipc.getEnv();

  fyo.store.isDevelopment = isDevelopment;
  fyo.store.appVersion = version;
  fyo.store.platform = platform;
  const platformName = getPlatformName(platform);

  setOnWindow(isDevelopment);

  const app = createApp({
    template: '<App/>',
  });
  
  // تأكد أن هذه الخاصية لا تسبب مشاكل في النسخ الحديثة من Vue
  app.config.unwrapInjectedRef = true;
  setErrorHandlers(app);

  app.use(router);
  app.component('App', App);
  app.component('FeatherIcon', FeatherIcon);
  app.component('Badge', Badge);
  app.directive('on-outside-click', outsideClickDirective);
  
  app.mixin({
    computed: {
      fyo() { return fyo; },
      platform() { return platformName; },
    },
    methods: {
      t: fyo.t,
      T: fyo.T,
    },
  });

  await fyo.telemetry.logOpened();
  
  // تغيير mount ليكون على #app بدلاً من body لضمان استقرار Vue
  app.mount('#app'); 
})();

// ... (باقي الدوال setErrorHandlers و setOnWindow و getPlatformName كما هي)