import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(
    process.env.VITE_SUPABASE_URL,
    process.env.VITE_SUPABASE_ANON_KEY
);

async function checkProducts() {
    const { data, error } = await supabase
        .from('products')
        .select('*');

    if (error) {
        console.error('Error:', error.message);
        return;
    }

    console.log('--- Products All Columns ---');
    data.forEach(p => {
        console.log(JSON.stringify(p, null, 2));
    });
}

checkProducts();
