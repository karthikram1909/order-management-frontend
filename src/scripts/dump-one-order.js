import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fs from 'fs';
dotenv.config();

const supabase = createClient(
    process.env.VITE_SUPABASE_URL,
    process.env.VITE_SUPABASE_ANON_KEY
);

async function dumpOneOrder() {
    const { data: orders } = await supabase.from('orders').select('*').limit(1);
    if (orders && orders.length > 0) {
        fs.writeFileSync('one_order_dump.json', JSON.stringify(orders[0], null, 2), 'utf8');
        console.log('Saved to one_order_dump.json');
    }
}

dumpOneOrder();
