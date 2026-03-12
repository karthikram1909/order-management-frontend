import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fs from 'fs';
dotenv.config();

const supabase = createClient(
    process.env.VITE_SUPABASE_URL,
    process.env.VITE_SUPABASE_ANON_KEY
);

async function findClientHistory() {
    let out = "";
    const log = (msg) => { console.log(msg); out += msg + "\n"; };

    const orderId = 'd185c208-8701-488d-905d-c3f09a2d7dd5';
    const { data: order } = await supabase
        .from('orders')
        .select('client_id, items')
        .eq('id', orderId)
        .single();

    if (!order) {
        log("Current order not found");
        return;
    }

    const clientId = order.client_id;
    log(`Current Client ID: ${clientId}`);

    const { data: orders } = await supabase
        .from('orders')
        .select('id, items, order_status, created_at')
        .eq('client_id', clientId)
        .order('created_at', { ascending: false });

    log(`--- History for Client ${clientId} ---`);
    orders.forEach(o => {
        const items = o.items || [];
        const isCurrent = o.id === orderId;
        const bamboo = items.filter(i => (i.itemName || '').toLowerCase().includes('bamboo'));
        
        if (bamboo.length > 0) {
            log(`${isCurrent ? '>>' : '  '} Order: ${o.id.slice(-6)} | Status: ${o.order_status} | Date: ${o.created_at}`);
            bamboo.forEach(b => {
                log(`     Item: "${b.itemName}" | Price: ${b.unitPrice}`);
            });
        }
    });

    log('\n--- Global Bamboo Price Check (All Clients) ---');
    const { data: all } = await supabase
        .from('orders')
        .select('id, items, order_status, created_at, client_id')
        .order('created_at', { ascending: false });

    all.forEach(o => {
        const items = o.items || [];
        items.forEach(i => {
            const name = (i.itemName || '').toLowerCase();
            if (name.includes('bamboo')) {
                log(`Order: ${o.id.slice(-6)} | Status: ${o.order_status} | Price: ${i.unitPrice} | Client: ${o.client_id.slice(-6)} | Date: ${o.created_at} | Name: "${i.itemName}"`);
            }
        });
    });

    fs.writeFileSync('debug_output_utf8.txt', out);
}

findClientHistory();
