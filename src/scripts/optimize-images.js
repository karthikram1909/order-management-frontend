import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const __dirname = path.resolve();
const inputDir = path.join(__dirname, 'IMAGES');
const outputDir = path.join(__dirname, 'public', 'product-images');

if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
}

async function optimizeImages() {
    console.log('🖼️  Starting Image Optimization...');
    console.log(`📂 Input: ${inputDir}`);
    console.log(`📂 Output: ${outputDir}`);

    if (!fs.existsSync(inputDir)) {
        console.error('❌ Input directory not found!');
        return;
    }

    const files = fs.readdirSync(inputDir);
    let count = 0;

    for (const file of files) {
        if (file.toLowerCase().endsWith('.jpg') || file.toLowerCase().endsWith('.jpeg') || file.toLowerCase().endsWith('.png')) {
            const inputPath = path.join(inputDir, file);
            const outputPath = path.join(outputDir, file);

            process.stdout.write(`⏳ Optimizing ${file}... `);

            try {
                await sharp(inputPath)
                    .resize(1000, 1000, { // Standard product image size
                        fit: 'inside',
                        withoutEnlargement: true
                    })
                    .jpeg({
                        quality: 75, // Good balance between quality and size
                        progressive: true,
                        mozjpeg: true
                    })
                    .toFile(outputPath);

                const stats = fs.statSync(outputPath);
                const originalStats = fs.statSync(inputPath);
                console.log(`✅ ${(originalStats.size / 1024 / 1024).toFixed(2)}MB -> ${(stats.size / 1024).toFixed(2)}KB`);
                count++;
            } catch (error) {
                console.log(`❌ Error: ${error.message}`);
            }
        }
    }
    console.log(`\n🏁 Done! Optimized ${count} images.`);
}

optimizeImages();
