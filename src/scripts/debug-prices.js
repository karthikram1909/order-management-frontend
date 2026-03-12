import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(
    process.env.VITE_SUPABASE_URL,
    process.env.VITE_SUPABASE_ANON_KEY
);

async function findPrice12() {
    console.log('Searching for items with unitPrice around 12 or 100...');
    const { data: orders, error } = await supabase
        .from('orders')
        .select('id, items, order_status, created_at')
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error:', error.message);
        return;
    }

    orders.forEach(order => {
        const items = order.items || [];
        items.forEach(item => {
            if (item.unitPrice === 12 || item.unitPrice === 100 || item.itemName?.includes('bamboo')) {
                console.log(`Order: ${order.id} | Status: ${order.order_status} | Created: ${order.created_at}`);
                console.log(`Item: ${item.itemName} | Price: ${item.unitPrice} | ID: ${item.itemId}`);
                console.log('---');
            }
        });
    });
}

findPrice12();
