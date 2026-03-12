import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(
    process.env.VITE_SUPABASE_URL,
    process.env.VITE_SUPABASE_ANON_KEY
);

async function search12() {
    const { data: orders, error } = await supabase
        .from('orders')
        .select('id, items, order_status, created_at');

    if (error) {
        console.error('Error:', error.message);
        return;
    }

    console.log('--- Orders containing unitPrice 12 ---');
    orders.forEach(order => {
        const items = order.items || [];
        const has12 = items.some(item => item.unitPrice === 12);
        if (has12) {
            console.log(`Order: ${order.id} | Status: ${order.order_status} | Date: ${order.created_at}`);
            items.forEach(item => {
                if (item.unitPrice === 12) {
                    console.log(`  Item: "${item.itemName}" | Price: 12 | ID: ${item.itemId}`);
                }
            });
            console.log('---');
        }
    });
}

search12();
