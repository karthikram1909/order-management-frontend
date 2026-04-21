import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fs from 'fs';
dotenv.config();

const supabase = createClient(
    process.env.VITE_SUPABASE_URL,
    process.env.VITE_SUPABASE_ANON_KEY
);

async function checkTables() {
    const names = ['payments', 'payment_history', 'transactions', 'order_payments', 'billing', 'receipts'];
    let out = '';
    for (const name of names) {
        const { error } = await supabase.from(name).select('*').limit(1);
        if (!error) {
            out += `Table '${name}' EXISTS!\n`;
        } else {
            out += `Table '${name}' does NOT exist: ${error.message}\n`;
        }
    }
    fs.writeFileSync('payment_tables_result.txt', out, 'utf8');
    console.log('Done');
}

checkTables();
