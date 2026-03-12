import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fs from 'fs';
dotenv.config();

const supabase = createClient(
    process.env.VITE_SUPABASE_URL,
    process.env.VITE_SUPABASE_ANON_KEY
);

async function searchAny12() {
    const { data: all } = await supabase
        .from('orders')
        .select('id, items, client_id, created_at');

    let out = "--- Searching for price 12 or 100 across ALL items ---\n";
    let found12 = false;
    all?.forEach(o => {
        const items = o.items || [];
        items.forEach(i => {
            if (i.unitPrice === 12) {
                out += `FOUND 12: Order ${o.id.slice(-6)} | Client ${o.client_id.slice(-6)} | Item: "${i.itemName}" | Date: ${o.created_at}\n`;
                found12 = true;
            }
            if (i.unitPrice === 100 && (i.itemName || '').toLowerCase().includes('bamboo')) {
                out += `FOUND 100: Order ${o.id.slice(-6)} | Client ${o.client_id.slice(-6)} | Item: "${i.itemName}" | Date: ${o.created_at}\n`;
            }
        });
    });
    if (!found12) out += "No item with price 12 found in any order.\n";
    
    fs.writeFileSync('search_output_utf8.txt', out);
    console.log("Done");
}

searchAny12();
