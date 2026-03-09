import { DatabaseError, NotImplemented } from 'fyo/utils/errors';
import { SchemaMap } from 'schemas/types';
import { DatabaseDemuxBase, DatabaseMethod } from 'utils/db/types';
import { BackendResponse } from 'utils/ipc/types';

// جلب بيانات الربط بالسحاب من البيئة
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

  // تعديل: منع الـ Crash في الويب وإرجاع سكيما فاضية مبدئياً
  async getSchemaMap(): Promise<SchemaMap> {
    if (!this.#isElectron) {
      console.log("[Cloud] Skipping Schema Check for Web...");
      return {} as SchemaMap; 
    }
    return (await this.#handleDBCall(async () => {
      // @ts-ignore
      return await ipc.db.getSchema();
    })) as SchemaMap;
  }

  // تعديل: إرسال بيانات الشركة الجديدة لـ Supabase بدلاً من الانتحار
  async createNewDatabase(
    dbPath: string,
    countryCode?: string
  ): Promise<string> {
    if (!this.#isElectron) {
      console.log("[Cloud] Creating Company in Supabase:", dbPath);
      
      const response = await fetch(`${supabaseUrl}/rest/v1/companies`, {
        method: 'POST',
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=minimal' 
        },
        body: JSON.stringify({ 
          company_name: dbPath, 
          country: countryCode || 'Unknown',
          created_at: new Date().toISOString()
        })
      });

      if (!response.ok) {
        console.error("[Cloud] Error:", await response.text());
        return "error-in-cloud";
      }

      return "cloud-db-active"; 
    }

    return (await this.#handleDBCall(async () => {
      // @ts-ignore
      return ipc.db.create(dbPath, countryCode);
    })) as string;
  }

  // تعديل: السماح بالاتصال في الويب
  async connectToDatabase(
    dbPath: string,
    countryCode?: string
  ): Promise<string> {
    if (!this.#isElectron) {
      return "connected-to-cloud";
    }
    return (await this.#handleDBCall(async () => {
      // @ts-ignore
      return ipc.db.connect(dbPath, countryCode);
    })) as string;
  }

  // تعديل: منع الـ NotImplemented في باقي العمليات
  async call(method: DatabaseMethod, ...args: unknown[]): Promise<unknown> {
    if (!this.#isElectron) {
      console.warn(`[Cloud] Method ${method} is not yet bridged to Supabase API.`);
      return null;
    }
    return await this.#handleDBCall(async () => {
      // @ts-ignore
      return await ipc.db.call(method, ...args);
    });
  }

  async callBespoke(method: string, ...args: unknown[]): Promise<unknown> {
    if (!this.#isElectron) {
      return null;
    }
    return await this.#handleDBCall(async () => {
      // @ts-ignore
      return await ipc.db.bespoke(method, ...args);
    });
  }
}