import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fs from 'fs';
dotenv.config();

const supabase = createClient(
    process.env.VITE_SUPABASE_URL,
    process.env.VITE_SUPABASE_ANON_KEY
);

async function checkRecentOrders() {
    const { data: orders } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);

    let out = '--- RECENT ORDERS (Last 10) ---\n';
    orders?.forEach(o => {
        out += `Order: ${o.id.slice(-6)} | Client: ${o.client_id.slice(-6)} | Status: ${o.order_status} | Date: ${o.created_at}\n`;
        (o.items || []).forEach(item => {
            out += `  Item: "${item.itemName}" | Price: ${item.unitPrice}\n`;
        });
        out += '---\n';
    });
    
    fs.writeFileSync('recent_check_utf8.txt', out, 'utf8');
    console.log('Done');
}

checkRecentOrders();
