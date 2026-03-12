import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(
    process.env.VITE_SUPABASE_URL,
    process.env.VITE_SUPABASE_ANON_KEY
);

async function findClient() {
    const orderId = 'd185c208-8701-488d-905d-c3f09a2d7dd5';
    const { data: order } = await supabase
        .from('orders')
        .select('client_id')
        .eq('id', orderId)
        .single();

    console.log(`Current Client ID: ${order.client_id}`);

    const { data: allOrders } = await supabase
        .from('orders')
        .select('id, items, order_status, created_at, client_id')
        .order('created_at', { ascending: false });

    console.log('--- BAMBOO PRICE HISTORY ---');
    allOrders.forEach(o => {
        const items = o.items || [];
        items.forEach(item => {
            const name = (item.itemName || '').toLowerCase();
            if (name.includes('bamboo')) {
                const isCurrentClient = o.client_id === order.client_id;
                console.log(`${o.created_at} | ClientMatch: ${isCurrentClient} | Status: ${o.order_status} | Price: ${item.unitPrice} | Name: "${item.itemName}"`);
            }
        });
    });
}

findClient();
