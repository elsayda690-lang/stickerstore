// @ts-nocheck
import { Fyo } from 'fyo';

/**
 * Global fyo: this is meant to be used only by the app. 
 * Modified for Web/GitHub Pages support.
 */

// 1. حقن الخديعة قبل إنشاء الكائن
if (typeof window !== 'undefined') {
    const webMock = {
        get: (key) => {
            const defaults = { 'language': 'en', 'theme': 'light', 'env': { platform: 'web' } };
            return defaults[key] || {};
        },
        set: (key, val) => console.log(`[Config Set] ${key}:`, val),
        has: () => true,
        invoke: async () => ({}),
        on: () => {},
        send: () => {}
    };

    window.config = webMock;
    window.ipc = window.ipc || webMock;
    window.electron = { ipcRenderer: webMock };
}

// 2. إجبار البرنامج على وضع الـ Web عن طريق تغيير isElectron لـ false
export const fyo = new Fyo({ 
    isTest: false, 
    isElectron: false // غيرناها لـ false عشان يشتغل في المتصفح بسلام
});