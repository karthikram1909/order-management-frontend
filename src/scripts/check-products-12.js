import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(
    process.env.VITE_SUPABASE_URL,
    process.env.VITE_SUPABASE_ANON_KEY
);

async function checkProducts() {
    const { data: products, error } = await supabase.from('products').select('*');
    if (error) {
        console.error(error);
        return;
    }

    console.log('--- PRODUCTS WITH PRICE 12 ---');
    products.forEach(p => {
        // Log all columns to see if there is any price column
        const has12 = Object.values(p).some(v => v === 12 || v === "12");
        if (has12) {
            console.log(JSON.stringify(p, null, 2));
        }
    });
}

checkProducts();
