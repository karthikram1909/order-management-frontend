import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(
    process.env.VITE_SUPABASE_URL,
    process.env.VITE_SUPABASE_ANON_KEY
);

async function findPrice12() {
    const { data: orders, error } = await supabase
        .from('orders')
        .select('id, items, order_status, created_at')
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error:', error.message);
        return;
    }

    console.log('--- Orders with 12 or 100 for bamboo ---');
    orders.forEach(order => {
        const items = order.items || [];
        items.forEach(item => {
            const name = (item.itemName || '').toLowerCase();
            if (name.includes('bamboo')) {
                console.log(`Order: ${order.id.slice(-6)} | Status: ${order.order_status} | Price: ${item.unitPrice} | Name: "${item.itemName}" | Date: ${order.created_at}`);
            }
        });
    });
}

findPrice12();
