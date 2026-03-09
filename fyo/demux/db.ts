import { DatabaseError, NotImplemented } from 'fyo/utils/errors';
import { SchemaMap } from 'schemas/types';
import { DatabaseDemuxBase, DatabaseMethod } from 'utils/db/types';
import { BackendResponse } from 'utils/ipc/types';

// جلب بيانات الربط من البيئة
const supabaseUrl = (import.meta as any).env.VITE_SUPABASE_URL;
const supabaseKey = (import.meta as any).env.VITE_SUPABASE_ANON_KEY;

export class DatabaseDemux extends DatabaseDemuxBase {
  #isElectron = false;

  constructor(isElectron: boolean) {
    super();
    this.#isElectron = isElectron;
  }

  async #handleDBCall(func: () => Promise<BackendResponse>): Promise<unknown> {
    const response = await func();
    if (response.error?.name) {
      const { name, message, stack } = response.error;
      const dberror = new DatabaseError(`${name}\n${message}`);
      dberror.stack = stack;
      throw dberror;
    }
    return response.data;
  }

  async getSchemaMap(): Promise<SchemaMap> {
    if (!this.#isElectron) {
      return {} as SchemaMap;
    }
    return (await this.#handleDBCall(async () => {
      // @ts-ignore
      return await ipc.db.getSchema();
    })) as SchemaMap;
  }

  async createNewDatabase(dbPath: string, countryCode?: string): Promise<string> {
    if (!this.#isElectron) {
      await fetch(`${supabaseUrl}/rest/v1/companies`, {
        method: 'POST',
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ name: dbPath, country: countryCode })
      });
      return "cloud-db-active";
    }
    return (await this.#handleDBCall(async () => {
      // @ts-ignore
      return ipc.db.create(dbPath, countryCode);
    })) as string;
  }

  async connectToDatabase(dbPath: string, countryCode?: string): Promise<string> {
    if (!this.#isElectron) return "connected-to-cloud";
    return (await this.#handleDBCall(async () => {
      // @ts-ignore
      return ipc.db.connect(dbPath, countryCode);
    })) as string;
  }

  // الدالة اللي كانت عاملة المشكلة - اتأكد إنها جوه الـ Class
  async call(method: DatabaseMethod, ...args: unknown[]): Promise<unknown> {
    if (!this.#isElectron) {
      const schemaName = args[0] as string;
      const data = args[1];
      const url = supabaseUrl;

      // 1. عملية الإضافة (Insert)
      if (method === 'insert') {
        const res = await fetch(`${url}/rest/v1/${schemaName}`, {
          method: 'POST',
          headers: {
            'apikey': supabaseKey,
            'Authorization': `Bearer ${supabaseKey}`,
            'Content-Type': 'application/json',
            'Prefer': 'return=representation'
          },
          body: JSON.stringify(data)
        });
        const result = await res.json();
        return Array.isArray(result) ? result[0] : result;
      }

      // 2. عملية جلب القيم (مهمة جداً لفك الـ Loading)
      if (method === 'getSingleValues') {
        const res = await fetch(`${url}/rest/v1/SingleValue?select=*`, {
          headers: {
            'apikey': supabaseKey,
            'Authorization': `Bearer ${supabaseKey}`
          }
        });
        const result = await res.json();
        return Array.isArray(result) ? result : [];
      }

      // 3. أي عملية تانية رجع مصفوفة فاضية عشان البرنامج ميكرشش
      return [];
    }

    return await this.#handleDBCall(async () => {
      // @ts-ignore
      return await ipc.db.call(method, ...args);
    });
  }

  async callBespoke(method: string, ...args: unknown[]): Promise<unknown> {
    if (!this.#isElectron) return null;
    return await this.#handleDBCall(async () => {
      // @ts-ignore
      return await ipc.db.bespoke(method, ...args);
    });
  }
}