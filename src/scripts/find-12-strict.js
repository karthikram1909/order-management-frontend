import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(
    process.env.VITE_SUPABASE_URL,
    process.env.VITE_SUPABASE_ANON_KEY
);

async function find12Everywhere() {
    const { data: all } = await supabase
        .from('orders')
        .select('id, items, order_status, created_at, client_id');

    console.log('--- SEARCHING FOR PRICE 12 ANYWHERE ---');
    let found = false;
    all?.forEach(o => {
        (o.items || []).forEach(i => {
            if (i.unitPrice === 12 || i.unitPrice === "12") {
                console.log(`ORDER ${o.id.slice(-6)} | STATUS ${o.order_status} | CLIENT ${o.client_id.slice(-6)}`);
                console.log(`  ITEM: "${i.itemName}" | PRICE: 12`);
                found = true;
            }
        });
    });
    if (!found) console.log("No unitPrice 12 found in any order.");
}

find12Everywhere();
