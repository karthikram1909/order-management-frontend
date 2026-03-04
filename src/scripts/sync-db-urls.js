import { createClient } from '@supabase/supabase-js';
import 'dotenv/config';

const supabase = createClient(
    process.env.VITE_SUPABASE_URL,
    process.env.VITE_SUPABASE_ANON_KEY
);

const files = [
    "104.jpg", "134.jpg", "144.jpg", "159.jpg", "207.jpg",
    "236.jpg", "244.jpg", "257.jpg", "268.jpg", "279.jpg",
    "527.jpg", "5350.jpg", "5969.jpg", "6001.jpg", "64.jpg", "9984.jpg"
];

async function updateDb() {
    console.log('🔄 Starting Database URL update...');

    for (const file of files) {
        const { data: { publicUrl } } = supabase.storage
            .from('product-images')
            .getPublicUrl(file);

        console.log(`🔗 New URL for ${file}: ${publicUrl}`);

        // We update ANY product where the image_url contains the filename
        const { data, error, count } = await supabase
            .from('products')
            .update({ image_url: publicUrl })
            .ilike('image_url', `%${file}%`);

        if (error) {
            console.error(`❌ Failed to update DB for ${file}:`, error.message);
        } else {
            console.log(`✅ Updated records for ${file}`);
        }
    }
    console.log('🏁 Database sync complete!');
}

updateDb();
