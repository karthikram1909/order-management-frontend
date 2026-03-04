import { createClient } from '@supabase/supabase-js';
import 'dotenv/config';

const supabase = createClient(
    process.env.VITE_SUPABASE_URL,
    process.env.VITE_SUPABASE_ANON_KEY
);

async function checkProducts() {
    const { data, error } = await supabase
        .from('products')
        .select('item_name, image_url');

    if (error) {
        console.error('Error fetching products:', error.message);
        return;
    }

    console.log('--- Current Product Data ---');
    data.forEach(p => {
        console.log(`Product: ${p.item_name}`);
        console.log(`Image URL: ${p.image_url}`);
        console.log('---');
    });
}

checkProducts();
