import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fs from 'fs';
dotenv.config();

const supabase = createClient(
    process.env.VITE_SUPABASE_URL,
    process.env.VITE_SUPABASE_ANON_KEY
);

async function globalSearch12() {
    const { data: all } = await supabase
        .from('orders')
        .select('*');

    let out = '--- GLOBAL SEARCH 12 ---\n';
    all?.forEach(o => {
        const json = JSON.stringify(o);
        // Look for 12 as a value (e.g. :12 or :12.0)
        if (json.includes(':12') || json.includes(':"12"')) {
            out += `FOUND in Order ${o.id.slice(-6)}:\n`;
            out += JSON.stringify(o.items, null, 2) + '\n';
            out += `Status: ${o.order_status}\n`;
            out += `Date: ${o.created_at}\n`;
            out += '---\n';
        }
    });
    
    fs.writeFileSync('find_12_utf8.txt', out, 'utf8');
    console.log('Done');
}

globalSearch12();
