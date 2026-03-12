import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(
    process.env.VITE_SUPABASE_URL,
    process.env.VITE_SUPABASE_ANON_KEY
);

async function checkBamboo() {
    const { data: orders, error } = await supabase
        .from('orders')
        .select('id, items, order_status, created_at');

    if (error) {
        console.error('Error:', error.message);
        return;
    }

    console.log('--- All bamboo items found ---');
    orders.forEach(order => {
        const items = order.items || [];
        items.forEach(item => {
            const name = (item.itemName || '').toLowerCase();
            if (name.includes('bamboo')) {
                console.log(`Order: ${order.id.slice(-6)} | Status: ${order.order_status} | Name: "${item.itemName}" | Price: ${item.unitPrice} | Date: ${order.created_at}`);
            }
        });
    });
}

checkBamboo();
