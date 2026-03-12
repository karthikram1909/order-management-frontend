import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fs from 'fs';
dotenv.config();

const supabase = createClient(
    process.env.VITE_SUPABASE_URL,
    process.env.VITE_SUPABASE_ANON_KEY
);

async function checkBamboo() {
    const { data: orders, error } = await supabase
        .from('orders')
        .select('id, items, order_status, created_at');

    if (error) {
        console.error('Error:', error.message);
        return;
    }

    let report = '--- All bamboo items found ---\n';
    orders.forEach(order => {
        const items = order.items || [];
        items.forEach(item => {
            const name = (item.itemName || '').toLowerCase();
            if (name.includes('bamboo')) {
                report += `Order: ${order.id} | Status: ${order.order_status} | Name: "${item.itemName}" | Price: ${item.unitPrice} | Date: ${order.created_at}\n`;
            }
        });
    });
    
    fs.writeFileSync('bamboo_report.txt', report);
    console.log('Saved to bamboo_report.txt');
}

checkBamboo();
