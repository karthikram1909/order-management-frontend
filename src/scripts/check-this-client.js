import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fs from 'fs';
dotenv.config();

const supabase = createClient(
    process.env.VITE_SUPABASE_URL,
    process.env.VITE_SUPABASE_ANON_KEY
);

async function checkClient() {
    const clientId = '4b74ba79-6075-46b4-bee6-4b830b2da66c';
    const { data: client, error } = await supabase
        .from('clients')
        .select('*')
        .eq('id', clientId)
        .single();

    if (error) {
        console.error(error);
        return;
    }

    fs.writeFileSync('client_check_utf8.txt', JSON.stringify(client, null, 2), 'utf8');
    console.log('Done');
}

checkClient();
