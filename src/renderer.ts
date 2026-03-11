// @ts-nocheck
const mockIPC = {
    getEnv: async () => ({ isDevelopment: false, platform: 'web', version: '1.0.0' }),
    get: async (key) => {
        if (key === 'language') return 'English';
        return null;
    },
    invoke: async (channel, ...args) => {
        if (channel === 'create-database' || channel === 'setup-instance') {
            return { success: true, path: '/mock/db' };
        }
        return {};
    },
    on: () => {},
    send: () => {},
    db: {
        call: async () => [], 
        bespoke: async () => ({})
    }
};

// حقن في كل مكان ممكن البرنامج يدور فيه
if (typeof window !== 'undefined') {
    window.ipc = mockIPC;
    window.ipcRenderer = mockIPC;
    // إضافة صمام أمان للـ global
    window.process = { env: { NODE_ENV: 'production' } };
}

export default mockIPC;