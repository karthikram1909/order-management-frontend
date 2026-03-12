import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fs from 'fs';
dotenv.config();

const supabase = createClient(
    process.env.VITE_SUPABASE_URL,
    process.env.VITE_SUPABASE_ANON_KEY
);

async function checkClientAll() {
    const clientId = '4b74ba79-6075-46b4-bee6-4b830b2da66c';
    const { data: orders } = await supabase
        .from('orders')
        .select('*')
        .eq('client_id', clientId)
        .order('created_at', { ascending: false });

    let out = `--- ALL ORDERS FOR CLIENT ${clientId} ---\n`;
    orders?.forEach(o => {
        out += `Order: ${o.id.slice(-6)} | Status: ${o.order_status} | Date: ${o.created_at}\n`;
        (o.items || []).forEach(item => {
            out += `  Item: "${item.itemName}" | Price: ${item.unitPrice}\n`;
        });
        out += '---\n';
    });
    
    fs.writeFileSync('client_exhaustive_utf8.txt', out, 'utf8');
    console.log('Done');
}

checkClientAll();
