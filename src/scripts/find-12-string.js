import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(
    process.env.VITE_SUPABASE_URL,
    process.env.VITE_SUPABASE_ANON_KEY
);

async function searchAny12() {
    const { data: all } = await supabase
        .from('orders')
        .select('id, items, client_id, created_at');

    console.log('--- Searching for price 12 (numeric or string) ---');
    all?.forEach(o => {
        const items = o.items || [];
        items.forEach(i => {
            if (i.unitPrice == 12 || i.unitPrice == "12") {
                console.log(`FOUND 12: Order ${o.id.slice(-6)} | Client ${o.client_id.slice(-6)} | Item: "${i.itemName}" | Price Type: ${typeof i.unitPrice}`);
            }
        });
    });
}

searchAny12();
