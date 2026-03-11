// @ts-nocheck

// تعريف الـ Mock بشكل احترافي عشان يغطي كل ثغرات الـ Web
const mockIPC = {
    getEnv: async () => ({ isDevelopment: false, platform: 'web', version: '1.0.0' }),
    get: async (key) => {
        if (key === 'language') return 'English';
        return null;
    },
    invoke: async (channel, ...args) => {
        console.log(`%c[IPC Invoke] ${channel}`, 'color: #3b82f6; font-weight: bold', args);
        
        // إيهام البرنامج أن إنشاء قاعدة البيانات نجح
        if (channel === 'create-database' || channel === 'setup-instance') {
            return { success: true, path: '/mock/db' };
        }
        return {};
    },
    on: (channel, func) => {
        console.log(`%c[IPC On] ${channel}`, 'color: #10b981');
    },
    send: (channel, ...args) => {
        console.log(`%c[IPC Send] ${channel}`, 'color: #f59e0b', args);
    },
    db: {
        call: async (method, ...args) => {
            console.log(`%c[DB Call] ${method}`, 'color: #8b5cf6', args);
            // السر هنا: إرجاع [] يمنع خطأ "i is not iterable"
            return []; 
        },
        bespoke: async () => ({})
    }
};

// حقن الـ Mock في النافذة
if (typeof window !== 'undefined') {
    window.ipc = mockIPC;
    // بعض أجزاء الكود قد تبحث عن ipcRenderer
    window.ipcRenderer = mockIPC; 
}

export default mockIPC;