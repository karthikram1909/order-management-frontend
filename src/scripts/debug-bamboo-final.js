import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fs from 'fs';
dotenv.config();

const supabase = createClient(
    process.env.VITE_SUPABASE_URL,
    process.env.VITE_SUPABASE_ANON_KEY
);

async function findBamboo() {
    const { data: all } = await supabase
        .from('orders')
        .select('id, items, order_status, created_at, client_id')
        .order('created_at', { ascending: false });

    let out = '--- ALL BAMBOO ENTRIES ---\n';
    all?.forEach(o => {
        (o.items || []).forEach(i => {
            if ((i.itemName || '').toLowerCase().includes('bamboo')) {
                out += `Order: ${o.id.slice(-6)} | Client: ${o.client_id.slice(-6)} | Status: ${o.order_status} | Price: ${i.unitPrice} | Date: ${o.created_at} | Name: "${i.itemName}"\n`;
            }
        });
    });
    
    fs.writeFileSync('bamboo_final_utf8.txt', out, 'utf8');
    console.log('Done');
}

findBamboo();
