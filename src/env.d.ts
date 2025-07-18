/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_OPENAI_API_KEY: string;
  readonly VITE_SUPABASE_URL: string;
  readonly VITE_SUPABASE_ANON_KEY: string;
  readonly VITE_RAZORPAY_MONTHLY_BUTTON_ID?: string;
  readonly VITE_RAZORPAY_YEARLY_BUTTON_ID?: string;
  readonly VITE_CONTACT_EMAIL?: string;
  readonly VITE_SCHEDULE_URL?: string;
  readonly MODE: string;
  readonly VITE_DODO_PAYMENTS_API_KEY: string;
  // Add other environment variables as needed
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
