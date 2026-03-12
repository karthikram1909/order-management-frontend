import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(
    process.env.VITE_SUPABASE_URL,
    process.env.VITE_SUPABASE_ANON_KEY
);

async function search12() {
    const { data: orders } = await supabase
        .from('orders')
        .select('id, items, order_status, created_at, client_id');

    console.log('--- SEARCHING FOR PRICE 12 ---');
    orders.forEach(o => {
        const items = o.items || [];
        items.forEach(item => {
            if (item.unitPrice === 12) {
                console.log(`ORDER ${o.id.slice(-6)} | STATUS: ${o.order_status} | DATE: ${o.created_at} | CLIENT: ${o.client_id}`);
                console.log(`  ITEM: "${item.itemName}" | PRICE: 12`);
            }
        });
    });
}

search12();
