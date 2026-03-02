// d:\salem internship\ram aromatics\order-management-frontend\scripts\upload-all-images.js
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import 'dotenv/config';

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

const imagesDir = './public/product-images';

async function uploadImages() {
  console.log('🚀 Starting bulk upload...');
  
  const files = fs.readdirSync(imagesDir);
  
  for (const file of files) {
    if (file.endsWith('.jpg') || file.endsWith('.png')) {
      const filePath = path.join(imagesDir, file);
      const fileBuffer = fs.readFileSync(filePath);
      
      console.log(`📤 Uploading ${file}...`);
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('product-images')
        .upload(`${file}`, fileBuffer, {
          upsert: true,
          contentType: 'image/jpeg'
        });

      if (uploadError) {
        console.error(`❌ Failed to upload ${file}:`, uploadError.message);
        continue;
      }

      const { data: { publicUrl } } = supabase.storage
        .from('product-images')
        .getPublicUrl(file);

      console.log(`✅ Success! Updating database for ${file}...`);

      // Update the product in the DB that uses this image
      const { error: dbError } = await supabase
        .from('products')
        .update({ image_url: publicUrl })
        .ilike('image_url', `%${file}%`);

      if (dbError) console.error(`⚠️ DB Update failed for ${file}:`, dbError.message);
    }
  }
  console.log('🏁 All done!');
}

uploadImages();
