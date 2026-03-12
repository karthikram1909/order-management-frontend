import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fs from 'fs';
dotenv.config();

const supabase = createClient(
    process.env.VITE_SUPABASE_URL,
    process.env.VITE_SUPABASE_ANON_KEY
);

async function checkProducts() {
    const { data: products, error } = await supabase.from('products').select('*');
    if (error || !products) {
        console.error(error);
        return;
    }

    let out = '--- ALL PRODUCTS WITH THEIR DATA ---\n';
    products.forEach(p => {
        out += `Product: "${p.item_name}" | ID: ${p.id}\n`;
        out += JSON.stringify(p, null, 2) + '\n';
        out += '---\n';
    });
    
    fs.writeFileSync('products_full_utf8.txt', out, 'utf8');
    console.log('Saved to products_full_utf8.txt');
}

checkProducts();
