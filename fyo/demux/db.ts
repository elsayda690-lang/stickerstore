async call(method: DatabaseMethod, ...args: unknown[]): Promise<unknown> {
    if (!this.#isElectron) {
      const [schemaName, data] = args as [string, any];
      const supabaseUrl = (import.meta as any).env.VITE_SUPABASE_URL;
      const supabaseKey = (import.meta as any).env.VITE_SUPABASE_ANON_KEY;

      console.log(`[Cloud] Calling ${method} on ${schemaName}`);

      // تحويل أوامر الأبلكيشن لأوامر سوبابيز
      if (method === 'insert') {
        const response = await fetch(`${supabaseUrl}/rest/v1/${schemaName}`, {
          method: 'POST',
          headers: {
            'apikey': supabaseKey,
            'Authorization': `Bearer ${supabaseKey}`,
            'Content-Type': 'application/json',
            'Prefer': 'return=representation'
          },
          body: JSON.stringify(data)
        });
        const result = await response.json();
        return result[0];
      }

      if (method === 'get') {
        const name = args[1];
        const response = await fetch(`${supabaseUrl}/rest/v1/${schemaName}?name=eq.${name}`, {
          headers: {
            'apikey': supabaseKey,
            'Authorization': `Bearer ${supabaseKey}`
          }
        });
        const result = await response.json();
        return result[0];
      }

      // لو أي عملية تانية لسه مبرمجناهاش، هنرجع null عشان البرنامج ميكرشش
      return null;
    }

    // كود الإليكترون القديم
    return await this.#handleDBCall(async () => {
      // @ts-ignore
      return await ipc.db.call(method, ...args);
    });
  }