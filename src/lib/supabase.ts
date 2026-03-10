import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    console.error(
        'Supabase configuration missing!\n' +
        '- Local: Check .env has VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.\n' +
        '- Deployed: Add these secrets to your project settings on the deployment platform.'
    );
}

export const supabase = createClient(
    supabaseUrl || 'https://placeholder.supabase.co',
    supabaseAnonKey || 'placeholder'
);
