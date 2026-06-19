import { createBrowserClient } from '@supabase/ssr'
import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Cliente Supabase que lê/escreve cookies no navegador (SSR Support)
export const supabase = createBrowserClient(supabaseUrl, supabaseKey)

export const getSupabaseUserClient = (token: string) => {
  return createClient(supabaseUrl, supabaseKey, {
    global: {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  });
};
