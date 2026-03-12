import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(
    process.env.VITE_SUPABASE_URL,
    process.env.VITE_SUPABASE_ANON_KEY
);

async function findPriceSpecific() {
    const { data: all } = await supabase
        .from('orders')
        .select('id, items, order_status, created_at, client_id')
        .order('created_at', { ascending: false });

    console.log('--- ALL BAMBOO ENTRIES ---');
    all?.forEach(o => {
        const items = o.items || [];
        items.forEach(i => {
            const name = (i.itemName || '').toLowerCase();
            if (name.includes('bamboo')) {
                console.log(`Order: ${o.id.slice(-6)} | Status: ${o.order_status} | Price: ${i.unitPrice} | Name: "${i.itemName}" | Client: ${o.client_id.slice(-6)} | Date: ${o.created_at}`);
            }
        });
    });
}

findPriceSpecific();
