import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(
    process.env.VITE_SUPABASE_URL,
    process.env.VITE_SUPABASE_ANON_KEY
);

async function search12() {
    const { data: all } = await supabase
        .from('orders')
        .select('id, items, order_status, created_at, client_id')
        .order('created_at', { ascending: false });

    console.log('--- SEARCHING FOR ANY ITEM WITH PRICE 12 ---');
    let found = false;
    all.forEach(o => {
        const items = o.items || [];
        items.forEach(i => {
            if (i.unitPrice === 12) {
                console.log(`Order: ${o.id} | Status: ${o.order_status} | Client: ${o.client_id} | Item: "${i.itemName}"`);
                found = true;
            }
        });
    });
    if (!found) console.log("No item with price 12 found in any order.");
}

search12();
