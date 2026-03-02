import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

// Parse .env manually
const envPath = path.resolve(process.cwd(), '.env');
const envContent = fs.readFileSync(envPath, 'utf8');
const env = {};
envContent.split('\n').forEach(line => {
    const [key, ...value] = line.split('=');
    if (key && value) {
        env[key.trim()] = value.join('=').trim();
    }
});

const supabaseUrl = env.VITE_SUPABASE_URL;
const supabaseKey = env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase credentials in .env');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const products = [
    { "item_name": "weightless charcoal", "image_url": "1mcVGF5NDjoQpool8spig7kxXpWfZtC9x", "unit": "kg" },
    { "item_name": "Coconut shell charcoal", "image_url": "1mcVGF5NDjoQpool8spig7kxXpWfZtC9x", "unit": "kg" },
    { "item_name": "Black cup premix", "image_url": "1mcVGF5NDjoQpool8spig7kxXpWfZtC9x", "unit": "kg" },
    { "item_name": "White cup premix", "image_url": "1Blk14NBsCqZK6SiclSqTUhloKQPyhxFq", "unit": "kg" },
    { "item_name": "White saw dust", "image_url": "1Blk14NBsCqZK6SiclSqTUhloKQPyhxFq", "unit": "kg" },
    { "item_name": "Brown saw dust", "image_url": "1Zzn7Stm25pDZmpZ5siaHtbwkwvmf535r", "unit": "kg" },
    { "item_name": "T1 wood powder", "image_url": "1Blk14NBsCqZK6SiclSqTUhloKQPyhxFq", "unit": "kg" },
    { "item_name": "Loban premix", "image_url": "1V30-FdGKHoHLoux7soUsLNqt2ot6F21", "unit": "kg" },
    { "item_name": "Joss powder", "image_url": "1EjlwKp7n3AaEp3QDchyps-qQDRB4Pnac", "unit": "kg" },
    { "item_name": "Kuppam dust", "image_url": null, "unit": "kg" },
    { "item_name": "Raw bathi premix", "image_url": "1Blk14NBsCqZK6SiclSqTUhloKQPyhxFq", "unit": "kg" },
    { "item_name": "Stone powder", "image_url": "1DozOf49nr-1HD_2Ib3o31Pe0W9AIP22H", "unit": "kg" },
    { "item_name": "Potassium nitrate", "image_url": "1DozOf49nr-1HD_2Ib3o31Pe0W9AIP22H", "unit": "kg" },
    { "item_name": "Guar gum(2000 cps)", "image_url": "1DozOf49nr-1HD_2Ib3o31Pe0W9AIP22H", "unit": "kg" },
    { "item_name": "Guar gum(8000 cps)", "image_url": "1DozOf49nr-1HD_2Ib3o31Pe0W9AIP22H", "unit": "kg" },
    { "item_name": "Modified starch", "image_url": "1DozOf49nr-1HD_2Ib3o31Pe0W9AIP22H", "unit": "kg" },
    { "item_name": "Gum rosin barrel", "image_url": "1A0DWND9t66CI-rSocd4Aw40BP6BzulU", "unit": "kg" },
    { "item_name": "Gum rosin broken", "image_url": "1A0DWND9t66CI-rSocd4Aw40BP6BzulU", "unit": "kg" },
    { "item_name": "Acrylic polimer", "image_url": "1DozOf49nr-1HD_2Ib3o31Pe0W9AIP22H", "unit": "kg" },
    { "item_name": "9 inch bamboo stick", "image_url": "1G-U1G1rqCQByoXsp3SQ7G-Ijr-p-1bzr", "unit": "kg" },
    { "item_name": "8 inch bamboo stick", "image_url": "eO2FLXYmnKI-5_ir6DQZYAeQ_5PloQ", "unit": "kg" },
    { "item_name": "Damar battu lumps", "image_url": "1sac3v5_vIM1_PmmnFCpQ5DwBcQLIKIcQaw", "unit": "kg" },
    { "item_name": "Damar battu crumbs", "image_url": "1sac3v5_vIM1_PmmnFCpQ5DwBcQLIKIcQaw", "unit": "kg" },
    { "item_name": "Damar battu powder", "image_url": "1V30-FdGKHoHLoux7soUsLNqt2ot6F21", "unit": "kg" },
    { "item_name": "Gum damar dust", "image_url": "1ES7Y-3YaBC-YCAR-f7WSTW1n1qIrFAEu", "unit": "kg" },
    { "item_name": "Gum damar ABX", "image_url": "1H-YamUZZSB-yCVizIjpW0ihyvel-FDp87o", "unit": "kg" },
    { "item_name": "Gum damar AC", "image_url": "1H-YamUZZSB-yCVizIjpW0ihyvel-FDp87o", "unit": "kg" },
    { "item_name": "Gum Benzoin BX", "image_url": "mc3LBMeanmCTLDq5RC7uqoNkbHCkyLD", "unit": "kg" },
    { "item_name": "Yara Yara", "image_url": null, "unit": "kg" },
    { "item_name": "Vanillin", "image_url": null, "unit": "kg" },
    { "item_name": "Rose crystal", "image_url": null, "unit": "kg" },
    { "item_name": "Jasmine powder", "image_url": null, "unit": "kg" },
    { "item_name": "IBF", "image_url": null, "unit": "kg" },
    { "item_name": "DEP Barrel (225kg)", "image_url": null, "unit": "kg" },
    { "item_name": "DEP Carboy (35kg)", "image_url": null, "unit": "kg" },
    { "item_name": "Cup Sambrani (144 box)", "image_url": "1Aze8rnCnK2rqRpgJEXsqk01XWpkVYT0U", "unit": "box" },
    { "item_name": "Loban Incense sticks (5 mm/ 25kg)", "image_url": null, "unit": "kg" },
    { "item_name": "Loban Incense sticks (3mm/ 25kg)", "image_url": "17yGSyhsraCURDN8S8ZOI-CH58AgBt", "unit": "kg" },
    { "item_name": "Dasangam Incense sticks (3mm/25kg)", "image_url": "17yGSyhsraCURDN8S8ZOI-CH58AgBt", "unit": "kg" },
    { "item_name": "Floral sambrani Incense sticks (3mm/25kg)", "image_url": "17yGSyhsraCURDN8S8ZOI-CH58AgBt", "unit": "kg" },
    { "item_name": "Rose Incense sticks (3mm/25kg)", "image_url": "1bp-BoHbT2p53yWpFqB1BDa79IUI2", "unit": "kg" }
].map(p => ({
    ...p,
    image_url: p.image_url ? `https://drive.google.com/thumbnail?id=${p.image_url}&sz=w800` : null,
    description: `Product: ${p.item_name}. Premium quality ram aromatics choice.`,
    is_active: true
}));

async function seed() {
    console.log(`Starting to seed ${products.length} products...`);
    const { data, error } = await supabase
        .from('products')
        .upsert(products, { onConflict: 'item_name' });

    if (error) {
        console.error('Error seeding products:', error);
    } else {
        console.log('Successfully seeded products!');
    }
}

seed();
