// @ts-nocheck
import { handleError } from 'src/errorHandling';
import { fyo } from 'src/initFyo';
import { syncDocumentsToERPNext } from 'src/utils/erpnextSync';

// --- صمام أمان للمتصفح (Mock IPC) ---
if (typeof window !== 'undefined' && !window.ipc) {
  window.ipc = {
    registerMainProcessErrorListener: () => console.log('[Mock] Error Listener Registered'),
    registerTriggerFrontendActionListener: () => console.log('[Mock] Frontend Action Listener Registered'),
    registerConsoleLogListener: () => console.log('[Mock] Console Log Listener Registered'),
    on: () => {},
    send: () => {},
    invoke: async () => ({})
  };
}
// -----------------------------------

export default function registerIpcRendererListeners() {
  // التأكد من وجود ipc قبل المناداة لتجنب الانهيار
  const _ipc = window.ipc || ipc; 

  _ipc.registerMainProcessErrorListener(
    (_, error: unknown, more?: Record<string, unknown>) => {
      if (!(error instanceof Error)) {
        throw error;
      }

      if (!more) {
        more = {};
      }

      if (typeof more !== 'object') {
        more = { more };
      }

      more.isMainProcess = true;
      more.notifyUser ??= true;

      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      handleError(true, error, more, !!more.notifyUser);
    }
  );

  // eslint-disable-next-line @typescript-eslint/no-misused-promises
  _ipc.registerTriggerFrontendActionListener(async () => {
    await syncDocumentsToERPNext(fyo);
  });

  _ipc.registerConsoleLogListener((_, ...stuff: unknown[]) => {
    if (!fyo.store.isDevelopment) {
      return;
    }

    if (fyo.store.isDevelopment) {
      // eslint-disable-next-line no-console
      console.log(...stuff);
    }
  });

  document.addEventListener('visibilitychange', () => {
    const { visibilityState } = document;
    if (visibilityState === 'visible' && !fyo.telemetry.started) {
      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      fyo.telemetry.start();
    }

    if (visibilityState !== 'hidden') {
      return;
    }

    fyo.telemetry.stop();
  });
}
