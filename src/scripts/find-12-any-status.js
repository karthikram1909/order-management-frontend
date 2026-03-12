import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(
    process.env.VITE_SUPABASE_URL,
    process.env.VITE_SUPABASE_ANON_KEY
);

async function find12Anywhere() {
    const { data: all } = await supabase
        .from('orders')
        .select('*');

    console.log('--- SEARCHING FOR 12 IN ANY STATUS ---');
    all?.forEach(o => {
        (o.items || []).forEach(i => {
            if (i.unitPrice == 12) {
                console.log(`FOUND in Order ${o.id.slice(-6)}: Status ${o.order_status}, Item "${i.itemName}"`);
            }
        });
    });
}

find12Anywhere();
