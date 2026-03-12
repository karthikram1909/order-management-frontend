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
        .select('id, item_name');

    if (error) {
        console.error('Error:', error.message);
        return;
    }

    console.log('--- Current Product Data ---');
    data.forEach(p => {
        console.log(`ID: ${p.id} | Name: ${p.item_name}`);
    });
}

checkProducts();
