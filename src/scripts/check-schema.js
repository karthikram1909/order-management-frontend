import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(
    process.env.VITE_SUPABASE_URL,
    process.env.VITE_SUPABASE_ANON_KEY
);

async function checkProductSchema() {
    const { data } = await supabase.from('products').select('*').limit(1);
    console.log(JSON.stringify(data?.[0] || {}, null, 2));
}

checkProductSchema();
