import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(
    process.env.VITE_SUPABASE_URL,
    process.env.VITE_SUPABASE_ANON_KEY
);

async function dumpOrder() {
    const { data: orders } = await supabase.from('orders').select('*').limit(1);
    if (orders && orders.length > 0) {
        console.log("FULL ORDER DATA:");
        console.log(JSON.stringify(orders[0], null, 2));
    }
}

dumpOrder();
