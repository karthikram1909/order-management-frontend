import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(
    process.env.VITE_SUPABASE_URL,
    process.env.VITE_SUPABASE_ANON_KEY
);

async function checkOrder() {
    const orderId = 'd185c208-8701-488d-905d-c3f09a2d7dd5';
    const { data: order } = await supabase
        .from('orders')
        .select('*')
        .eq('id', orderId)
        .single();

    console.log(`Order ${orderId} Status: ${order.order_status}`);
    order.items.forEach(item => {
        console.log(`Item: ${item.itemName} | Saved UnitPrice: ${item.unitPrice}`);
    });
}

checkOrder();
