import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fs from 'fs';
dotenv.config();

const supabase = createClient(
    process.env.VITE_SUPABASE_URL,
    process.env.VITE_SUPABASE_ANON_KEY
);

async function findUniquePrices() {
    const { data: all } = await supabase
        .from('orders')
        .select('items');

    const prices = new Set();
    all?.forEach(o => {
        (o.items || []).forEach(i => {
            if ((i.itemName || '').toLowerCase().includes('bamboo')) {
                if (i.unitPrice !== undefined && i.unitPrice !== null) prices.add(i.unitPrice);
            }
        });
    });

    const out = '--- UNIQUE BAMBOO PRICES IN DB ---\n' + JSON.stringify(Array.from(prices).sort((a,b) => a-b), null, 2);
    fs.writeFileSync('unique_prices_utf8.txt', out, 'utf8');
    console.log('Done');
}

findUniquePrices();
