import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

const isConfigured = supabaseUrl && supabaseAnonKey && supabaseUrl !== 'undefined' && supabaseAnonKey !== 'undefined';

let client;
if (isConfigured) {
  try {
    client = createClient(supabaseUrl, supabaseAnonKey);
  } catch (err) {
    console.error("Failed to initialize Supabase client:", err);
  }
}

if (!client) {
  console.warn("Supabase credentials missing or invalid. Spymals is running in local fallback / offline mode.");
  
  // A mock client that won't throw when methods are chained
  const mockHandler = {
    get(target, prop) {
      // For database tables: supabase.from('table').select()...
      const dbChain = () => {
        const dummyPromise = Promise.resolve({ data: [], error: new Error("Supabase non configuré.") });
        const proxy = new Proxy(dummyPromise, {
          get(chainTarget, chainProp) {
            if (chainProp === 'then') {
              return chainTarget.then.bind(chainTarget);
            }
            if (chainProp === 'catch') {
              return chainTarget.catch.bind(chainTarget);
            }
            // Return chain itself for query builders (select, insert, eq, etc.)
            return () => proxy;
          }
        });
        return proxy;
      };
      
      if (prop === 'from') {
        return dbChain;
      }
      
      return () => {};
    }
  };
  
  client = new Proxy({}, mockHandler);
}

export const supabase = client;
