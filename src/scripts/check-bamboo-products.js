import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(
    process.env.VITE_SUPABASE_URL,
    process.env.VITE_SUPABASE_ANON_KEY
);

async function checkProducts() {
    const { data: products } = await supabase
        .from('products')
        .select('*');

    console.log('--- PRODUCTS CHECK ---');
    products.forEach(p => {
        if (p.item_name.toLowerCase().includes('bamboo')) {
            console.log(`PRODUCT: "${p.item_name}" | ID: ${p.id}`);
            console.log(JSON.stringify(p, null, 2));
        }
    });
}

checkProducts();
