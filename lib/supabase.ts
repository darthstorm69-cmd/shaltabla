import { createClient } from '@supabase/supabase-js';
import { PointSnapshot } from './types';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  if (process.env.NODE_ENV !== 'production') {
    console.warn('Missing Supabase environment variables. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY');
  }
}

// Create client with empty strings if env vars are missing (will fail gracefully on API calls)
export const supabase = createClient(supabaseUrl || 'https://placeholder.supabase.co', supabaseAnonKey || 'placeholder-key');

export interface DatabaseFriend {
  id: string;
  name: string;
  points: number;
  point_history?: PointSnapshot[] | null;
  created_at: string;
  updated_at?: string;
}

