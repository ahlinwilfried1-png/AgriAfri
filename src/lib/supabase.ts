import { createClient } from '@supabase/supabase-js';

declare global {
  interface ImportMeta {
    readonly env: Record<string, string>;
  }
}

const supabaseUrl = (import.meta.env.VITE_SUPABASE_URL as string) || '';
const supabaseAnonKey = (import.meta.env.VITE_SUPABASE_ANON_KEY as string) || '';

export const isSupabaseConfigured = !!(supabaseUrl && supabaseAnonKey);

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

/**
 * Universal safe sync function. It attempts to sync a record to Supabase
 * if configured, but always succeeds gracefully.
 */
export async function safeSyncToSupabase(table: string, id: string, data: any) {
  if (!supabase) return;
  try {
    const { error } = await supabase
      .from(table)
      .upsert({ id, ...data });
    if (error) {
      console.warn(`[SupabaseSync] Error upserting into ${table}:`, error.message);
    } else {
      console.log(`[SupabaseSync] Successfully synced record ${id} to ${table}`);
    }
  } catch (err) {
    console.warn(`[SupabaseSync] Connection error syncing to ${table}:`, err);
  }
}

/**
 * Universal delete sync.
 */
export async function safeDeleteFromSupabase(table: string, id: string) {
  if (!supabase) return;
  try {
    const { error } = await supabase
      .from(table)
      .delete()
      .eq('id', id);
    if (error) {
      console.warn(`[SupabaseSync] Error deleting from ${table}:`, error.message);
    }
  } catch (err) {
    console.warn(`[SupabaseSync] Connection error deleting from ${table}:`, err);
  }
}
