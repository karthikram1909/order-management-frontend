import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(
    process.env.VITE_SUPABASE_URL,
    process.env.VITE_SUPABASE_ANON_KEY
);

async function listTables() {
    const { data, error } = await supabase.rpc('get_tables'); // Long shot
    if (error) {
        // Fallback to searching orders table structure
        console.log("No get_tables RPC. Looking at one order...");
        const { data: order } = await supabase.from('orders').select('*').limit(1);
        console.log("Order keys:", Object.keys(order[0]));
        
        // Let's try to query a common name 'payments'
        const { error: pError } = await supabase.from('payments').select('*').limit(1);
        if (pError) console.log("No 'payments' table: ", pError.message);
        else console.log("'payments' table exists!");
    } else {
        console.log("Tables:", data);
    }
}

listTables();
