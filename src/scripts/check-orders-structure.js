import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(
    process.env.VITE_SUPABASE_URL,
    process.env.VITE_SUPABASE_ANON_KEY
);

async function checkOrders() {
    console.log('Fetching last 5 orders...');
    const { data, error } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5);

    if (error) {
        console.error('Error:', error.message);
        return;
    }

    data.forEach(order => {
        console.log(`Order ID: ${order.id}`);
        console.log(`Status: ${order.order_status}`);
        console.log(`Items:`, JSON.stringify(order.items, null, 2));
        console.log('---');
    });
}

checkOrders();
