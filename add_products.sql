-- Paste this into your Supabase SQL Editor and run it.

-- Add missing columns if they don't exist
ALTER TABLE products ADD COLUMN IF NOT EXISTS image_url TEXT;
ALTER TABLE products ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'Materials';

-- Ensure item_name is unique for upsert (wrapped to avoid "already exists" error)
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'products_item_name_key') THEN
        ALTER TABLE products ADD CONSTRAINT products_item_name_key UNIQUE (item_name);
    END IF;
END $$;

INSERT INTO products (item_name, image_url, description, unit, is_active, category)
VALUES
  -- Materials (Previously added)
  ('weightless charcoal', '/product-images/257.jpg', 'Premium weightless charcoal.', 'kg', true, 'Materials'),
  ('Coconut shell charcoal', '/product-images/257.jpg', 'Organic coconut shell charcoal.', 'kg', true, 'Materials'),
  ('Black cup premix', '/product-images/257.jpg', 'Professional grade black cup premix.', 'kg', true, 'Materials'),
  ('White cup premix', '/product-images/6001.jpg', 'Professional grade white cup premix.', 'kg', true, 'Materials'),
  ('White saw dust', '/product-images/6001.jpg', 'Refined white saw dust.', 'kg', true, 'Materials'),
  ('T1 wood powder', '/product-images/6001.jpg', 'Premium wood powder T1 grade.', 'kg', true, 'Materials'),
  ('Raw bathi premix', '/product-images/6001.jpg', 'Base agarbatti premix.', 'kg', true, 'Materials'),
  ('Brown saw dust', '/product-images/64.jpg', 'Natural brown saw dust.', 'kg', true, 'Materials'),
  ('Loban premix', '/product-images/279.jpg', 'High-grade Loban premix for incense.', 'kg', true, 'Materials'),
  ('Damar battu powder', '/product-images/279.jpg', 'Damar battu in powder form.', 'kg', true, 'Materials'),
  ('Joss powder', '/product-images/9984.jpg', 'Natural bonding joss powder.', 'kg', true, 'Materials'),
  ('Stone powder', '/product-images/207.jpg', 'Premium stone powder.', 'kg', true, 'Materials'),
  ('Potassium nitrate', '/product-images/207.jpg', 'Industrial grade Potassium nitrate.', 'kg', true, 'Materials'),
  ('Guar gum(2000 cps)', '/product-images/207.jpg', 'Guar gum 2000 viscosity.', 'kg', true, 'Materials'),
  ('Guar gum(8000 cps)', '/product-images/207.jpg', 'Guar gum 8000 high viscosity.', 'kg', true, 'Materials'),
  ('Modified starch', '/product-images/207.jpg', 'Industrial modified starch.', 'kg', true, 'Materials'),
  ('Acrylic polimer', '/product-images/207.jpg', 'Industrial acrylic polymer base.', 'kg', true, 'Materials'),
  ('Gum rosin barrel', '/product-images/144.jpg', 'Bulk gum rosin in barrels.', 'kg', true, 'Materials'),
  ('Gum rosin broken', '/product-images/144.jpg', 'Natural broken gum rosin bits.', 'kg', true, 'Materials'),
  ('9 inch bamboo stick', '/product-images/244.jpg', 'Premium 9 inch bamboo sticks.', 'kg', true, 'Materials'),
  ('8 inch bamboo stick', '/product-images/236.jpg', 'Premium 8 inch bamboo sticks.', 'kg', true, 'Materials'),
  ('Damar battu crumbs', '/product-images/268.jpg', 'Damar battu in crumb form.', 'kg', true, 'Materials'),
  ('Gum damar dust', '/product-images/104.jpg', 'Natural gum damar dust.', 'kg', true, 'Materials'),
  ('Gum damar AC', '/product-images/159.jpg', 'Industrial AC grade gum damar.', 'kg', true, 'Materials'),
  ('Gum Benzoin BX', '/product-images/134.jpg', 'High fragrance BX grade gum benzoin.', 'kg', true, 'Materials'),
  ('Cup Sambrani (144 box)', '/product-images/5969.jpg', 'Premium cup sambrani multi-pack.', 'box', true, 'Materials'),
  ('Loban Incense sticks (3mm/ 25kg)', '/product-images/527.jpg', 'Bulk supply of Loban scented incense.', 'kg', true, 'Materials'),
  ('Dasangam Incense sticks (3mm/25kg)', '/product-images/527.jpg', 'Bulk supply of Dasangam scented incense.', 'kg', true, 'Materials'),
  ('Floral sambrani Incense sticks (3mm/25kg)', '/product-images/527.jpg', 'Bulk supply of Floral sambrani scented incense.', 'kg', true, 'Materials'),
  ('Rose Incense sticks (3mm/25kg)', '/product-images/5350.jpg', 'Bulk supply of Rose scented incense.', 'kg', true, 'Materials'),

  -- Agarbatti Scents
  ('Arabian Sandal', 'https://images.unsplash.com/photo-1615485290382-441e4d0c9cb5?q=80&w=2670&auto=format&fit=crop', 'Premium Arabian Sandalwood fragrance.', 'kg', true, 'Agarbatti'),
  ('Cold water', 'https://images.unsplash.com/photo-1615485290382-441e4d0c9cb5?q=80&w=2670&auto=format&fit=crop', 'Refreshing cool aquatic fragrance.', 'kg', true, 'Agarbatti'),
  ('Divya', 'https://images.unsplash.com/photo-1615485290382-441e4d0c9cb5?q=80&w=2670&auto=format&fit=crop', 'Divine traditional fragrance.', 'kg', true, 'Agarbatti'),
  ('Fancy fruit', 'https://images.unsplash.com/photo-1615485290382-441e4d0c9cb5?q=80&w=2670&auto=format&fit=crop', 'Sweet fruity blend fragrance.', 'kg', true, 'Agarbatti'),
  ('Gullistan Rose', 'https://images.unsplash.com/photo-1615485290382-441e4d0c9cb5?q=80&w=2670&auto=format&fit=crop', 'Premium garden rose fragrance.', 'kg', true, 'Agarbatti'),
  ('Jasmine king', 'https://images.unsplash.com/photo-1615485290382-441e4d0c9cb5?q=80&w=2670&auto=format&fit=crop', 'Strong royal jasmine fragrance.', 'kg', true, 'Agarbatti'),
  ('Javadhu', 'https://images.unsplash.com/photo-1615485290382-441e4d0c9cb5?q=80&w=2670&auto=format&fit=crop', 'Traditional herbal javadhu fragrance.', 'kg', true, 'Agarbatti'),
  ('Kewda base', 'https://images.unsplash.com/photo-1615485290382-441e4d0c9cb5?q=80&w=2670&auto=format&fit=crop', 'Strong kewda floral base.', 'kg', true, 'Agarbatti'),
  ('Sugandh swarna', 'https://images.unsplash.com/photo-1615485290382-441e4d0c9cb5?q=80&w=2670&auto=format&fit=crop', 'Golden sweet fragrance.', 'kg', true, 'Agarbatti'),
  ('Lavender Amritha', 'https://images.unsplash.com/photo-1615485290382-441e4d0c9cb5?q=80&w=2670&auto=format&fit=crop', 'Soothing Lavender blend.', 'kg', true, 'Agarbatti'),
  ('Trident Lavender', 'https://images.unsplash.com/photo-1615485290382-441e4d0c9cb5?q=80&w=2670&auto=format&fit=crop', 'Sharp fresh lavender.', 'kg', true, 'Agarbatti'),
  ('Mist', 'https://images.unsplash.com/photo-1615485290382-441e4d0c9cb5?q=80&w=2670&auto=format&fit=crop', 'Light morning mist fragrance.', 'kg', true, 'Agarbatti'),
  ('Mogra', 'https://images.unsplash.com/photo-1615485290382-441e4d0c9cb5?q=80&w=2670&auto=format&fit=crop', 'Natural night-blooming jasmine.', 'kg', true, 'Agarbatti'),
  ('PC Sandal', 'https://images.unsplash.com/photo-1615485290382-441e4d0c9cb5?q=80&w=2670&auto=format&fit=crop', 'Classic Sandalwood fragrance.', 'kg', true, 'Agarbatti'),
  ('Pineapple king', 'https://images.unsplash.com/photo-1615485290382-441e4d0c9cb5?q=80&w=2670&auto=format&fit=crop', 'Sweet tropical pineapple.', 'kg', true, 'Agarbatti'),
  ('Trident Rose', 'https://images.unsplash.com/photo-1615485290382-441e4d0c9cb5?q=80&w=2670&auto=format&fit=crop', 'Sharp rose fragrance.', 'kg', true, 'Agarbatti'),
  ('Trident Pineapple', 'https://images.unsplash.com/photo-1615485290382-441e4d0c9cb5?q=80&w=2670&auto=format&fit=crop', 'Zesty pineapple blend.', 'kg', true, 'Agarbatti'),
  ('Trident Sandal', 'https://images.unsplash.com/photo-1615485290382-441e4d0c9cb5?q=80&w=2670&auto=format&fit=crop', 'Heavy sandalwood base.', 'kg', true, 'Agarbatti'),
  ('Rudhramala', 'https://images.unsplash.com/photo-1615485290382-441e4d0c9cb5?q=80&w=2670&auto=format&fit=crop', 'Intense spiritual fragrance.', 'kg', true, 'Agarbatti'),
  ('Sandal King', 'https://images.unsplash.com/photo-1615485290382-441e4d0c9cb5?q=80&w=2670&auto=format&fit=crop', 'Strongest sandal blend.', 'kg', true, 'Agarbatti'),
  ('Sandal King ACN', 'https://images.unsplash.com/photo-1615485290382-441e4d0c9cb5?q=80&w=2670&auto=format&fit=crop', 'ACN grade premium sandal.', 'kg', true, 'Agarbatti'),
  ('Dhunamala', 'https://images.unsplash.com/photo-1615485290382-441e4d0c9cb5?q=80&w=2670&auto=format&fit=crop', 'Rich smoky fragrance.', 'kg', true, 'Agarbatti'),
  ('Queen rose', 'https://images.unsplash.com/photo-1615485290382-441e4d0c9cb5?q=80&w=2670&auto=format&fit=crop', 'Elegant queen rose fragrance.', 'kg', true, 'Agarbatti'),
  ('Silver diamond', 'https://images.unsplash.com/photo-1615485290382-441e4d0c9cb5?q=80&w=2670&auto=format&fit=crop', 'Bright modern fragrance.', 'kg', true, 'Agarbatti'),
  ('Nine flower', 'https://images.unsplash.com/photo-1615485290382-441e4d0c9cb5?q=80&w=2670&auto=format&fit=crop', 'Complex nine-floral blend.', 'kg', true, 'Agarbatti'),
  ('A night in Dubai', 'https://images.unsplash.com/photo-1615485290382-441e4d0c9cb5?q=80&w=2670&auto=format&fit=crop', 'Luxurious Arabian night scent.', 'kg', true, 'Agarbatti'),
  ('Aarthi', 'https://images.unsplash.com/photo-1615485290382-441e4d0c9cb5?q=80&w=2670&auto=format&fit=crop', 'Devotional prayer fragrance.', 'kg', true, 'Agarbatti'),
  ('Champa', 'https://images.unsplash.com/photo-1615485290382-441e4d0c9cb5?q=80&w=2670&auto=format&fit=crop', 'Magnolia / Champa fragrance.', 'kg', true, 'Agarbatti'),
  ('Musk and crystal', 'https://images.unsplash.com/photo-1615485290382-441e4d0c9cb5?q=80&w=2670&auto=format&fit=crop', 'Clean musk and mineral notes.', 'kg', true, 'Agarbatti'),
  ('Amber sandal', 'https://images.unsplash.com/photo-1615485290382-441e4d0c9cb5?q=80&w=2670&auto=format&fit=crop', 'Warm amber and sandalwood.', 'kg', true, 'Agarbatti'),
  ('Loban rudhraksh', 'https://images.unsplash.com/photo-1615485290382-441e4d0c9cb5?q=80&w=2670&auto=format&fit=crop', 'Loban and sacred wood notes.', 'kg', true, 'Agarbatti'),
  ('Guggal', 'https://images.unsplash.com/photo-1615485290382-441e4d0c9cb5?q=80&w=2670&auto=format&fit=crop', 'Pure Guggal resin fragrance.', 'kg', true, 'Agarbatti'),
  ('Sambrani new', 'https://images.unsplash.com/photo-1615485290382-441e4d0c9cb5?q=80&w=2670&auto=format&fit=crop', 'Fresh Sambrani blend.', 'kg', true, 'Agarbatti'),
  ('Ruby sandal', 'https://images.unsplash.com/photo-1615485290382-441e4d0c9cb5?q=80&w=2670&auto=format&fit=crop', 'Sweet Ruby grade Sandalwood.', 'kg', true, 'Agarbatti'),
  ('Vinayak Loban', 'https://images.unsplash.com/photo-1615485290382-441e4d0c9cb5?q=80&w=2670&auto=format&fit=crop', 'Devotional Loban fragrance.', 'kg', true, 'Agarbatti'),
  ('Sandal flower', 'https://images.unsplash.com/photo-1615485290382-441e4d0c9cb5?q=80&w=2670&auto=format&fit=crop', 'Floral Sandalwood blend.', 'kg', true, 'Agarbatti'),
  ('Camphor compound', 'https://images.unsplash.com/photo-1615485290382-441e4d0c9cb5?q=80&w=2670&auto=format&fit=crop', 'Sharp Camphorated notes.', 'kg', true, 'Agarbatti'),
  ('Surya', 'https://images.unsplash.com/photo-1615485290382-441e4d0c9cb5?q=80&w=2670&auto=format&fit=crop', 'Bright solar fragrance.', 'kg', true, 'Agarbatti'),
  ('Rose water', 'https://images.unsplash.com/photo-1615485290382-441e4d0c9cb5?q=80&w=2670&auto=format&fit=crop', 'Distilled rose water essence.', 'kg', true, 'Agarbatti'),
  ('Sambrani 1', 'https://images.unsplash.com/photo-1615485290382-441e4d0c9cb5?q=80&w=2670&auto=format&fit=crop', 'Classic Sambrani grade 1.', 'kg', true, 'Agarbatti'),
  ('Chandanmala', 'https://images.unsplash.com/photo-1615485290382-441e4d0c9cb5?q=80&w=2670&auto=format&fit=crop', 'Pure Sandalwood garland scent.', 'kg', true, 'Agarbatti'),
  ('Rudhviksha', 'https://images.unsplash.com/photo-1615485290382-441e4d0c9cb5?q=80&w=2670&auto=format&fit=crop', 'Spiritual seed fragrance.', 'kg', true, 'Agarbatti'),
 
   -- Sambrani Scents
  ('Bruno', 'https://images.unsplash.com/photo-1615485290382-441e4d0c9cb5?q=80&w=2670&auto=format&fit=crop', 'Robust industrial fragrance.', 'kg', true, 'Sambrani'),
  ('Darbar', 'https://images.unsplash.com/photo-1615485290382-441e4d0c9cb5?q=80&w=2670&auto=format&fit=crop', 'Royal court fragrance.', 'kg', true, 'Sambrani'),
  ('Dasangam', 'https://images.unsplash.com/photo-1615485290382-441e4d0c9cb5?q=80&w=2670&auto=format&fit=crop', 'Traditional Dasangam blend.', 'kg', true, 'Sambrani'),
  ('Kodi loban super', 'https://images.unsplash.com/photo-1615485290382-441e4d0c9cb5?q=80&w=2670&auto=format&fit=crop', 'Extra strong Kodi Loban.', 'kg', true, 'Sambrani'),
  ('Loban sweet', 'https://images.unsplash.com/photo-1615485290382-441e4d0c9cb5?q=80&w=2670&auto=format&fit=crop', 'Sweet honey-like Loban.', 'kg', true, 'Sambrani'),
  ('Loban base', 'https://images.unsplash.com/photo-1615485290382-441e4d0c9cb5?q=80&w=2670&auto=format&fit=crop', 'Fundamental Loban base.', 'kg', true, 'Sambrani'),
  ('Loban cinnamon', 'https://images.unsplash.com/photo-1615485290382-441e4d0c9cb5?q=80&w=2670&auto=format&fit=crop', 'Spicy Cinnamon Loban fragrance.', 'kg', true, 'Sambrani'),
  ('Loban southern spice', 'https://images.unsplash.com/photo-1615485290382-441e4d0c9cb5?q=80&w=2670&auto=format&fit=crop', 'Spicy southern blend Loban.', 'kg', true, 'Sambrani'),
  ('Mr Loban', 'https://images.unsplash.com/photo-1615485290382-441e4d0c9cb5?q=80&w=2670&auto=format&fit=crop', 'Professional grade Mr Loban.', 'kg', true, 'Sambrani'),
  ('Pakiza(Bharatham)', 'https://images.unsplash.com/photo-1615485290382-441e4d0c9cb5?q=80&w=2670&auto=format&fit=crop', 'Traditional Pakiza Bharatham scent.', 'kg', true, 'Sambrani'),
  ('Trident loban', 'https://images.unsplash.com/photo-1615485290382-441e4d0c9cb5?q=80&w=2670&auto=format&fit=crop', 'High intensity Trident Loban.', 'kg', true, 'Sambrani'),
  ('T T loban', 'https://images.unsplash.com/photo-1615485290382-441e4d0c9cb5?q=80&w=2670&auto=format&fit=crop', 'TT grade industrial Loban.', 'kg', true, 'Sambrani')
 
 ON CONFLICT (item_name) DO UPDATE 
 SET image_url = EXCLUDED.image_url, 
     description = EXCLUDED.description, 
     unit = EXCLUDED.unit, 
     is_active = EXCLUDED.is_active,
     category = EXCLUDED.category;
