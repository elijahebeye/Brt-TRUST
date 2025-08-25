import { createClient } from '@supabase/supabase-js';

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);


    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error('Supabase environment variables are missing')
    }

    supabase = createClient(supabaseUrl, supabaseAnonKey)
  }
  return supabase
}
