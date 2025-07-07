import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder-key';

console.log('Supabase configuration:', {
  url: supabaseUrl,
  hasKey: !!supabaseAnonKey,
  isPlaceholder: supabaseUrl === 'https://placeholder.supabase.co'
});

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    storage: typeof window !== 'undefined' ? window.localStorage : undefined,
    storageKey: 'majorbeam-auth',
    debug: import.meta.env.DEV,
    flowType: 'implicit'
  },
  global: {
    headers: {
      'X-Client-Info': 'majorbeam-web'
    }
  }
});

export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          plan: string;
          campaign_count: number;
          created_at: string | null;
        };
        Insert: {
          id?: string;
          email: string;
          plan?: string;
          campaign_count?: number;
          created_at?: string | null;
        };
        Update: {
          id?: string;
          email?: string;
          plan?: string;
          campaign_count?: number;
          created_at?: string | null;
        };
      };
      campaigns: {
        Row: {
          id: string;
          user_id: string | null;
          demo_session_id: string | null;
          name: string;
          customer_profile: string;
          problem_statement: string;
          desired_outcome: string;
          landing_page_slug: string;
          lead_count: number;
          lead_magnet_title: string | null;
          lead_magnet_content: string | null;
          landing_page_copy: any | null;
          social_posts: string[] | null;
          created_at: string | null;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          demo_session_id?: string | null;
          name: string;
          customer_profile: string;
          problem_statement: string;
          desired_outcome: string;
          landing_page_slug: string;
          lead_count?: number;
          lead_magnet_title?: string | null;
          lead_magnet_content?: string | null;
          landing_page_copy?: any | null;
          social_posts?: string[] | null;
          created_at?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string | null;
          demo_session_id?: string | null;
          name?: string;
          customer_profile?: string;
          problem_statement?: string;
          desired_outcome?: string;
          landing_page_slug?: string;
          lead_count?: number;
          lead_magnet_title?: string | null;
          lead_magnet_content?: string | null;
          landing_page_copy?: any | null;
          social_posts?: string[] | null;
          created_at?: string | null;
        };
      };
      leads: {
        Row: {
          id: string;
          campaign_id: string;
          email: string;
          captured_at: string | null;
        };
        Insert: {
          id?: string;
          campaign_id: string;
          email: string;
          captured_at?: string | null;
        };
        Update: {
          id?: string;
          campaign_id?: string;
          email?: string;
          captured_at?: string | null;
        };
      };
      emails: {
        Row: {
          id: string;
          email: string;
          campaign_id: string | null;
          pdf_downloaded: boolean;
          email_sent: boolean;
          created_at: string | null;
        };
        Insert: {
          id?: string;
          email: string;
          campaign_id?: string | null;
          pdf_downloaded?: boolean;
          email_sent?: boolean;
          created_at?: string | null;
        };
        Update: {
          id?: string;
          email?: string;
          campaign_id?: string | null;
          pdf_downloaded?: boolean;
          email_sent?: boolean;
          created_at?: string | null;
        };
      };
    };
    Functions: {
      generate_unique_slug: {
        Args: Record<string, never>;
        Returns: string;
      };
    };
  };
};