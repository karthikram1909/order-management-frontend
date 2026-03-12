import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(
    process.env.VITE_SUPABASE_URL,
    process.env.VITE_SUPABASE_ANON_KEY
);

async function checkHistory() {
    const { data, error } = await supabase.from('order_history').select('*').limit(10);
    console.log(JSON.stringify(data || error, null, 2));
}

checkHistory();
