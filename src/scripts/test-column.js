import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(
    process.env.VITE_SUPABASE_URL,
    process.env.VITE_SUPABASE_ANON_KEY
);

async function testUpdate() {
    const orderId = 'df4ef10c-a6cb-478c-ba7e-38a10f75a6b4';
    const { data, error } = await supabase
        .from('orders')
        .update({ payment_history: [{ amount: 100, date: new Date().toISOString() }] })
        .eq('id', orderId);
    
    if (error) {
        console.log("FAILED to update payment_history: " + error.message);
    } else {
        console.log("SUCCESS! payment_history exists.");
    }
}

testUpdate();
